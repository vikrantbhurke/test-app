import { Stack } from "@mantine/core";
import { notFound } from "next/navigation";
import { dimensions } from "@/global/constants";
import { getAuth } from "@/features/user/action";
import { getBooks } from "@/features/book/action";
import { listGridDefaults } from "@/global/constants/client";
import { ListGridOuter } from "@/global/components/list-grid/client";
import { BooksItem, BooksDetails } from "@/features/book/views/client";

type PageProps = {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ [key: string]: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id, role } = await getAuth();
  const { page } = await params;
  const sp = await searchParams;
  const dbPage = Number(page) - 1;
  const auth = { id, role };

  const getBooksDTO = {
    ...sp,
    page: dbPage,
    filter: sp?.genre === "All" ? {} : { genre: sp?.genre },
  };

  const booksPage = await getBooks(getBooksDTO, auth);
  if (!booksPage) return notFound();

  const {
    buttonProps,
    scrollButtonsProps,
    scrollWrapperProps,
    listGridInnerProps,
  } = listGridDefaults;

  return (
    <Stack h="100%" w="100%" justify="center" maw={dimensions.mawLg}>
      <ListGridOuter
        more="scroll"
        getData={getBooks}
        initialDataPage={booksPage}
        DataDetails={BooksDetails}
        getDataArgs={{
          sort: booksPage.sort,
          order: booksPage.order,
          filter: booksPage.filter,
          search: booksPage.search,
        }}
        buttonProps={buttonProps}
        scrollButtonsProps={scrollButtonsProps}
        scrollWrapperProps={scrollWrapperProps}
        listGridInnerProps={{
          ...listGridInnerProps,
          auth,
          content: booksPage.content,
          DataItem: BooksItem,
        }}
      />
    </Stack>
  );
}
