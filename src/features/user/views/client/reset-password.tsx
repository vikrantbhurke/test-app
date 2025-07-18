"use client";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { IconLogin } from "@tabler/icons-react";
import { useNotification } from "@/global/hooks";
import { RootState } from "@/global/states/store";
import { useToast } from "@/global/hooks";
import { resetPassword } from "@/features";
import { zodResolver } from "mantine-form-zod-resolver";
import { signInRoute } from "@/global/constants/routes";
import { lightBgOneDarkBgTwo } from "@/global/constants";
import { ResetPasswordSchema } from "@/features/user/schema";
import { FloatingInput } from "@/global/components/common/client";
import { Button, Stack, Text, useMantineColorScheme } from "@mantine/core";

type ResetPasswordProps = {
  token: string;
};

export function ResetPassword({ token }: ResetPasswordProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { showNotification } = useNotification();
  const { colorScheme } = useMantineColorScheme();
  const [isMutating, setIsMutating] = useState(false);
  const { isMobile } = useSelector((state: RootState) => state.global);

  const form = useForm({
    mode: "controlled",
    initialValues: {
      password: "",
      confirmPassword: "",
    },

    validate: zodResolver(ResetPasswordSchema),
  });

  const handleResetPassword = async (values: any) => {
    try {
      if (isMutating) return;
      setIsMutating(true);
      const message = await resetPassword(token, values);
      const alert = { message, status: "success" as const };
      if (isMobile) showToast(alert);
      else showNotification(alert);
      router.push(signInRoute);
    } catch (error: any) {
      const alert = { message: error.message, status: "error" as const };
      if (isMobile) showToast(alert);
      else showNotification(alert);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleResetPassword)}>
      <Stack gap="md">
        <FloatingInput
          styles={lightBgOneDarkBgTwo(colorScheme)}
          name="password"
          label="New Password"
          type="password-input"
          key={form.key("password")}
          {...form.getInputProps("password")}
        />

        <FloatingInput
          styles={lightBgOneDarkBgTwo(colorScheme)}
          name="confirmPassword"
          label="Confirm Password"
          type="password-input"
          key={form.key("confirmPassword")}
          {...form.getInputProps("confirmPassword")}
        />

        <Text c="gray" fz="xs">
          Password must be at least 8 characters long and include uppercase,
          lowercase, number, and symbol.
        </Text>

        <Button
          leftSection={<IconLogin size={20} />}
          c="var(--bg-one)"
          color="var(--tx-one)"
          type="submit"
          aria-label="Save Password"
          disabled={isMutating}
          loading={isMutating}
          loaderProps={{ type: "dots", color: "var(--bg-one)" }}>
          Save Password
        </Button>
      </Stack>
    </form>
  );
}
