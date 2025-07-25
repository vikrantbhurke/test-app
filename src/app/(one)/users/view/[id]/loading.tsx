import { NewSkeleton } from "@/global/components/common/server";
import { dimensions } from "@/global/constants";
import { Stack } from "@mantine/core";

export default function Loading() {
  return (
    <Stack p="xs" h="100%" w="100%" justify="center" maw={dimensions.mawXs}>
      <NewSkeleton h={150} w="100%" a="pulse" v="rounded" r="xs" />
    </Stack>
  );
}
