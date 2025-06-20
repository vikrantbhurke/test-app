"use client";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { SaveCommentSchema } from "@/features/comment/schema";
import { Button, Stack } from "@mantine/core";
import { saveComment } from "@/features/comment/action";
import { zodResolver } from "mantine-form-zod-resolver";
import { FloatingInput } from "@/global/components/common/client";
import { useToast } from "@/global/hooks";
import { useNotification } from "@/global/hooks";
import { RootState } from "@/global/states/store";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

type AddCommentFormProps = {
  bookId: string;
  close: () => void;
  auth: {
    id: string;
  };
};

export default function AddCommentForm({
  bookId,
  close,
  auth,
}: AddCommentFormProps) {
  const router = useRouter();
  const [isMutating, setIsMutating] = useState(false);
  const { showToast } = useToast();
  const { showNotification } = useNotification();
  const { isMobile } = useSelector((state: RootState) => state.global);

  const form = useForm({
    mode: "controlled",
    initialValues: {
      body: "",
      bookId: bookId,
      commenterId: auth.id,
    },

    validate: zodResolver(SaveCommentSchema),
  });

  const handleSaveComment = async (values: any) => {
    try {
      if (isMutating) return;
      setIsMutating(true);
      const message = await saveComment(values);
      const alert = { message, status: "success" as const };
      if (isMobile) showToast(alert);
      else showNotification(alert);
      close();
      router.refresh();
    } catch (error: any) {
      const alert = { message: error.message, status: "error" as const };
      if (isMobile) showToast(alert);
      else showNotification(alert);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSaveComment)}>
      <Stack pt={4} gap="md" p="sm">
        <FloatingInput
          name="body"
          label="Body"
          key={form.key("body")}
          {...form.getInputProps("body")}
        />

        <Button type="submit" disabled={isMutating} aria-label="Save Comment">
          {isMutating ? "Saving..." : "Save"}
        </Button>
      </Stack>
    </form>
  );
}
