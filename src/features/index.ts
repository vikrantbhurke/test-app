import { PaymentService } from "./payment/service";
import { UserService } from "./user/service";
import { UserRepository } from "./user/repository";
import { BookService } from "./book/service";
import { BookRepository } from "./book/repository";
import { CommentService } from "./comment/service";
import { CommentRepository } from "./comment/repository";
import { BookLikerService } from "./book-liker/service";
import { BookLikerRepository } from "./book-liker/repository";

const paymentService = new PaymentService();
const userService = new UserService();
const userRepository = new UserRepository();
const bookService = new BookService();
const bookRepository = new BookRepository();
const commentService = new CommentService();
const commentRepository = new CommentRepository();
const bookLikerService = new BookLikerService();
const bookLikerRepository = new BookLikerRepository();

userService.setUserRepository(userRepository);
userService.setBookService(bookService);
userService.setCommentService(commentService);
userService.setBookLikerService(bookLikerService);
bookService.setBookRepository(bookRepository);
bookService.setUserService(userService);
bookService.setCommentService(commentService);
bookService.setBookLikerService(bookLikerService);
commentService.setCommentRepository(commentRepository);
bookLikerService.setBookLikerRepository(bookLikerRepository);
bookLikerService.setBookService(bookService);

export {
  paymentService,
  userService,
  bookService,
  commentService,
  bookLikerService,
  UserService,
  BookService,
  CommentService,
  BookLikerService,
  UserRepository,
  BookRepository,
  CommentRepository,
  BookLikerRepository,
};
