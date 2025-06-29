import {
  UserService,
  CommentService,
  BookRepository,
  BookLikerService,
} from "..";
import { Clearance } from "../user/enums";
import { Genre } from "./enums";
import { SaveBookDTO, EditBookDTO } from "./schema";
import { Service, GetManyDTO } from "@/global/classes";

export class BookService extends Service {
  userService: UserService;
  bookRepository: BookRepository;
  commentService: CommentService;
  bookLikerService: BookLikerService;

  setUserService(userService: UserService) {
    this.userService = userService;
  }

  setBookRepository(bookRepository: BookRepository) {
    this.bookRepository = bookRepository;
  }

  setBookLikerService(bookLikerService: BookLikerService) {
    this.bookLikerService = bookLikerService;
  }

  setCommentService(commentService: CommentService) {
    this.commentService = commentService;
  }

  async saveBooks(saveBooksDTO: SaveBookDTO[]) {
    for (const saveBookDTO of saveBooksDTO) await this.saveBook(saveBookDTO);
  }

  async saveBook(saveBookDTO: SaveBookDTO) {
    const { title } = saveBookDTO;
    const book = await this.getBookByTitle(title);
    if (book) throw new Error(`Book with title ${title} already exists.`);
    await this.bookRepository.saveBook(saveBookDTO);
  }

  async checkBook(title: string) {
    return await this.bookRepository.checkBook(title);
  }

  async countBooks() {
    return await this.bookRepository.countBooks();
  }

  async countBooksByAuthorId(authorId: string) {
    return await this.bookRepository.countBooksByAuthorId(authorId);
  }

  async getBookById(id: string, auth?: any) {
    let book = await this.bookRepository.getBookById(id);

    if (auth && Clearance.LevelTwo.includes(auth.role)) {
      const exists = await this.bookLikerService.checkBookLiker({
        bookId: book.id,
        likerId: auth.id,
      });

      book = { ...book, like: exists };
    }

    if (!book) throw new Error(`Book not found.`);
    return book;
  }

  async getBookByTitle(title: string, session?: any) {
    return await this.bookRepository.getBookByTitle(title, session);
  }

  async getBookByIndex(index: number) {
    return await this.bookRepository.getBookByIndex(index);
  }

  async getAllBookIdsByAuthorId(authorId: string, session?: any) {
    return await this.bookRepository.getAllBookIdsByAuthorId(authorId, session);
  }

  async getBooks(getManyDTO: GetManyDTO, auth?: any) {
    const booksPage = await this.bookRepository.getBooks(getManyDTO);

    if (!booksPage.content) return booksPage;

    if (auth && Clearance.LevelTwo.includes(auth.role)) {
      const existsArray = await this.bookLikerService.checkBookLikers(
        booksPage.content.map((book: any) => ({
          bookId: book.id,
          likerId: auth.id,
        }))
      );

      return {
        ...booksPage,
        content: booksPage.content.map((book: any, index: number) => ({
          ...book,
          like: existsArray[index],
        })),
      };
    }

    return booksPage;
  }

  async getRandomBooks(getManyDTO: GetManyDTO) {
    return await this.bookRepository.getRandomBooks(getManyDTO);
  }

  async editBookById(id: string, editBookDTO: EditBookDTO) {
    await this.bookRepository.editBookById(id, editBookDTO);
  }

  async editBookByTitle(title: string, editBookDTO: EditBookDTO) {
    await this.bookRepository.editBookByTitle(title, editBookDTO);
  }

  async editBooksByGenre(genre: Genre, editBookDTO: EditBookDTO) {
    await this.bookRepository.editBooksByGenre(genre, editBookDTO);
  }

  async likeBook(id: string, session?: any) {
    await this.bookRepository.likeBook(id, session);
  }

  async unlikeBook(id: string, session?: any) {
    await this.bookRepository.unlikeBook(id, session);
  }

  async addTag(id: string, tag: string) {
    await this.bookRepository.addTag(id, tag);
  }

  async removeTag(id: string, tag: string) {
    await this.bookRepository.removeTag(id, tag);
  }

  async upvoteBook(id: string, voterId: string) {
    await this.bookRepository.upvoteBook(id, voterId);
  }

  async downvoteBook(id: string, voterId: string) {
    await this.bookRepository.downvoteBook(id, voterId);
  }

  async downvoteBooksByVoterId(voterId: string, session?: any) {
    await this.bookRepository.downvoteBooksByVoterId(voterId, session);
  }

  async dropBookById(id: string) {
    await this.runAtomic(async (session) => {
      await this.bookRepository.dropBookById(id, session);
      await this.commentService.dropCommentsByBookId(id, session);
      await this.userService.unsetFavBookIdByFavBookId(id, session);
      await this.bookLikerService.dropBookLikersByBookId(id, session);
    });
  }

  async dropBookByTitle(title: string) {
    await this.runAtomic(async (session) => {
      const book = await this.getBookByTitle(title, session);
      if (!book) return;
      await this.bookRepository.dropBookByTitle(title, session);
      await this.commentService.dropCommentsByBookId(book.id, session);
      await this.userService.unsetFavBookIdByFavBookId(book.id, session);
      await this.bookLikerService.dropBookLikersByBookId(book.id, session);
    });
  }

  async dropBooksByAuthorId(authorId: string, session?: any) {
    const bookIdsPage = await this.getAllBookIdsByAuthorId(authorId, session);
    if (!bookIdsPage.content) return;
    await this.bookRepository.dropBooksByAuthorId(authorId, session);
    for (const book of bookIdsPage.content) {
      await this.commentService.dropCommentsByBookId(book.id, session);
      await this.userService.unsetFavBookIdByFavBookId(book.id, session);
      await this.bookLikerService.dropBookLikersByBookId(book.id, session);
    }
  }

  async dropBooks() {
    await this.runAtomic(async (session) => {
      await this.bookRepository.dropBooks(session);
      await this.commentService.dropComments(session);
      await this.bookLikerService.dropBookLikers(session);
      await this.userService.unsetFavBookIdFromAll(session);
    });
  }
}
