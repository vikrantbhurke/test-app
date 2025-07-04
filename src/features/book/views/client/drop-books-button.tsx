"use client";
import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { dropBooksByAuthorId } from "@/features";
import { NewModal } from "@/global/components/common/client";
import { booksServerWindowRoute } from "@/global/constants/routes";

type DropBooksButtonProps = {
  authorId: string;
};

export function DropBooksButton({ authorId }: DropBooksButtonProps) {
  const [opened, { open, close }] = useDisclosure();

  return (
    <>
      <NewModal
        buttonProps={{
          color: "red",
          fullWidth: true,
          loaderProps: { type: "dots" },
        }}
        close={close}
        opened={opened}
        buttonLabel="Delete All"
        route={booksServerWindowRoute}
        routeType="push"
        action={async () => await dropBooksByAuthorId(authorId)}
        message="Are you sure you want to delete all your books?"
      />

      <Button
        color="red"
        onClick={open}
        size="xs"
        fz="xs"
        aria-label="Delete Books">
        Delete Books
      </Button>
    </>
  );
}
