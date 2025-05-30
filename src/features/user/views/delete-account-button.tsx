"use client";
import { Button, Group, Text } from "@mantine/core";
import { dropUserById } from "../action";
import { useDisclosure } from "@mantine/hooks";
import { CustomModal } from "@/global/components/common";
import { signUpRoute } from "@/global/constants/routes";
import classes from "@/global/styles/app.module.css";
import { IconTrash } from "@tabler/icons-react";
import { stillButtonProps } from "@/global/constants";

type DeleteAccountButtonProps = {
  id: string;
};

export default function DeleteAccountButton({ id }: DeleteAccountButtonProps) {
  const [opened, { open, close }] = useDisclosure();

  return (
    <>
      <CustomModal
        buttonProps={{
          color: "red",
          fullWidth: true,
          loaderProps: { type: "dots" },
        }}
        close={close}
        opened={opened}
        buttonLabel="Delete Account"
        route={signUpRoute}
        routeType="replace"
        action={async () => await dropUserById(id)}
        message="Are you sure you want to delete your account?"
      />

      <Button
        p={4}
        h={40}
        onClick={open}
        visibleFrom="sm"
        style={stillButtonProps.style}
        onFocus={stillButtonProps.onFocus}
        onMouseDown={stillButtonProps.onMouseDown}
        className={`${classes.themeOneWithHover}`}>
        <Group align="center" justify="center" gap="xs">
          <IconTrash size={16} />
          <Text size="sm">Delete Account</Text>
        </Group>
      </Button>

      <Button
        p={4}
        h={60}
        onClick={open}
        hiddenFrom="sm"
        style={stillButtonProps.style}
        onFocus={stillButtonProps.onFocus}
        onMouseDown={stillButtonProps.onMouseDown}
        className={`${classes.themeOneWithHover}`}>
        <Group align="center" justify="center" gap="xs">
          <IconTrash size={16} />
          <Text size="sm">Delete Account</Text>
        </Group>
      </Button>
    </>
  );
}
