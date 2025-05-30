import {
  signUpUser,
  getUserByEmail,
  pushProviderById,
  validatePassword,
  getUserByUsername,
} from "./features/user/action";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { Gender, Provider } from "./features/user/enums";

export const config = {
  providers: [
    GitHub,
    Google,
    Credentials({
      authorize: async (credentials) => {
        if (!credentials) return null;

        const response1 = await getUserByUsername(
          credentials.username as string
        );

        if (!response1.data)
          throw new Error("Account with this username not found.");

        const user = response1.data;

        if (user.provider[0] !== "credentials") {
          const provider =
            user.provider[0].charAt(0).toUpperCase() +
            user.provider[0].slice(1);

          const errorMessage = `Account associated with ${provider} found. Sign in with ${provider} instead.`;
          throw new Error(errorMessage);
        }

        const response2 = await validatePassword(
          credentials.password as string,
          user.hashedPassword
        );

        if (!response2.data) throw new Error("Invalid password.");
        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account.provider === "credentials") return true;
      const response = await getUserByEmail(user.email);
      const dbUser = response.data;

      if (!dbUser) {
        let provider;
        if (account.provider === "google") provider = Provider.google;
        else if (account.provider === "github") provider = Provider.github;
        else provider = Provider.credentials;

        await signUpUser(provider, {
          firstname: user.name.split(" ")[0] || "",
          lastname: user.name.split(" ")[1] || "",
          username: user.email.split("@")[0],
          email: user.email,
          gender: Gender.Other,
          password: "Passw0rd!",
          confirmPassword: "Passw0rd!",
        });
      } else {
        if (!dbUser.provider.includes(account.provider))
          await pushProviderById(dbUser.id, account.provider);
      }

      return true;
    },
    async redirect({ baseUrl }: any) {
      return baseUrl;
    },
    async session({ session }: any) {
      const response = await getUserByEmail(session.user.email);
      const user = response.data;
      session.user.id = user.id;
      session.user.name =
        session.user.name || user.firstname + " " + user.lastname;
      session.user.username = user.username;
      session.user.email = user.email;
      session.user.role = user.role;
      session.user.provider = user.provider;
      session.user.image = session.user.image || user.avatar;
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
