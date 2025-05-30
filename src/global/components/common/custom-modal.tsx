"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { modalProps } from "@/global/constants";
import { Button, Modal, Stack, Text } from "@mantine/core";
import { Action } from "@/global/classes";
import { useToast } from "@/global/hooks/use-toast";
import { useNotification } from "@/global/hooks";
import { useSelector } from "react-redux";
import { RootState } from "@/global/states/store";

type CustomModalProps = {
  action: any;
  route?: string; // Pass route if routeType is push or replace
  routeType?: "push" | "replace" | "back" | "refresh";
  opened: boolean;
  message?: string;
  buttonColor?: string;
  close: () => void;
  loaderType?: "dots" | "bars" | "oval" | "default" | "tailSpin";
  fullWidth?: boolean;
  buttonLabel?: string;
  loaderLabel?: string;
  buttonProps?: any;
};

export default function CustomModal({
  route,
  routeType,
  close,
  opened,
  action,
  message,
  buttonLabel,
  loaderLabel,
  buttonProps,
}: CustomModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { showNotification } = useNotification();
  const [isMutating, setIsMutating] = useState(false);
  const { isMobile } = useSelector((state: RootState) => state.global);

  const handleClick = async () => {
    try {
      if (isMutating) return;
      setIsMutating(true);
      const response = await action();

      if (Action.isSuccess(response)) {
        const alert = { message: response.message, status: "success" as const };
        if (isMobile) showToast(alert);
        else showNotification(alert);
        if (routeType === "push" && route) router.push(route);
        if (routeType === "replace" && route) router.replace(route);
        if (routeType === "back") router.back();
        if (routeType === "refresh") router.refresh();
      } else {
        const alert = { message: response.error, status: "error" as const };
        if (isMobile) showToast(alert);
        else showNotification(alert);
      }
      close();
    } catch (error: any) {
      const alert = { message: error.message, status: "error" as const };
      if (isMobile) showToast(alert);
      else showNotification(alert);
    } finally {
      setIsMutating(false);
    }
  };

  const { loaderProps, ...rest } = buttonProps || {};

  return (
    <Modal
      centered
      opened={opened}
      onClose={close}
      overlayProps={modalProps.overlayProps}>
      <Stack gap="lg">
        <Text fz="sm" ta="center">
          {message}
        </Text>

        {/* Either pass loaderProps or loaderLabel */}

        {loaderProps && (
          <Button
            {...rest}
            loading={isMutating}
            disabled={isMutating}
            onClick={handleClick}
            loaderProps={loaderProps}>
            {buttonLabel}
          </Button>
        )}

        {loaderLabel && (
          <Button {...rest} onClick={handleClick}>
            {isMutating ? buttonLabel : loaderLabel}
          </Button>
        )}
      </Stack>
    </Modal>
  );
}
