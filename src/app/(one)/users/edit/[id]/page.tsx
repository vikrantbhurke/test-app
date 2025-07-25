import { Stack } from "@mantine/core";
import { dimensions } from "@/global/constants";
import { getAuth, getUserById } from "@/features";
import { notFound, redirect } from "next/navigation";
import { signInRoute } from "@/global/constants/routes";
import { EditProfileForm } from "@/features/user/views/client";
export { metadata } from "./metadata";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id: uid } = await getAuth();
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) return notFound();
  if (user.id !== uid) redirect(signInRoute);

  return (
    <Stack p="xs" h="100%" w="100%" justify="center" maw={dimensions.mawXs}>
      <EditProfileForm user={user} />
    </Stack>
  );
}
