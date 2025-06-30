"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Trash } from "lucide-react";
import Spinner from "@/components/Spinner";
import { useUserContext } from "@/context";
import { BookType } from "@/types";

const Books = () => {
  const [books, setBooks] = useState<BookType[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookType[]>([]);
  const [search, setSearch] = useState("");

  const router = useRouter()

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/books`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      const books = response.data.data;
      setBooks(books);
      setFilteredBooks(books);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const filteredBooks = books.filter((book) =>
      book.nameEng.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredBooks(filteredBooks);
  }, [search, books]);

  useEffect(() => {
    fetchBooks();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-4 sm:w-[90vw] md:w-[80vw] lg:min-w-[80vw] mx-auto">
      <div className="sticky top-0">
        <div className="flex flex-row justify-between items-center p-4">
          <p className="font-bold text-3xl">Books</p>
          <div className="flex flex-row gap-2">
            <div className="w-full sm:w-auto">
              <Input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="p-2 w-full"
                placeholder="Search for books..."
              />
            </div>
            <AddBook fetchBooks={fetchBooks} />
            <Button
            onClick={()=>{
              router.back()
            }}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
      <section className="min-w-[80vw] max-h-[80vh] overflow-y-scroll border">
        <BooksList books={filteredBooks} fetchBooks={fetchBooks} />
      </section>
    </main>
  );
};


const BooksList = ({
  books,
  fetchBooks,
}: {
  books: BookType[];
  fetchBooks: () => void;
}) => {
  const router = useRouter();

  return (
    <Table className="w-full">
      <TableHeader className="bg-gray-50 max-h-[80vh]">
        <TableRow>
          <TableHead className="w-[100px]">S. No.</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {books.map((book: BookType, index: number) => (
          <TableRow key={index} className="cursor-pointer hover:bg-gray-50">
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-semibold">{book.nameEng}/{book.nameHindi}</TableCell>
            <TableCell>{book.description}</TableCell>
            <TableCell className="flex gap-2">
              <Button
                onClick={() => {
                  router.push(`/reference/section/${book._id}/${encodeURIComponent(book.nameEng)}`);
                }}
                className="bg-gradient-to-b from-gray-600 to-gray-900 rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all"
              >
                View <ChevronRight size={16} />
              </Button>
              <EditBook
                fetchBooks={fetchBooks}
                book={book}
              />
              <DeleteModalButton
                bookId={book._id}
                bookName={book.nameEng}
                fetchBooks={fetchBooks}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const AddBook = ({
  fetchBooks,
}: {
  fetchBooks: () => void;
}) => {
  const [bookNameEng, setBookNameEng] = useState("");
  const [bookNameHindi, setBookNameHindi] = useState("");
  const [bookDesc, setBookDesc] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const addBookHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/books`,
        {
          nameEng: bookNameEng,
          nameHindi: bookNameHindi,
          description: bookDesc,
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          },
          withCredentials: true,
        }
      );

      if (!response.data.success) {
        toast({
          title: "Book not created.",
          description: `${bookNameEng} already exists.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Book created.",
          description: `${bookNameEng} has been successfully created.`,
        });
        fetchBooks();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setBookNameEng("");
      setBookNameHindi("");
      setBookDesc("");
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-gray-600 to-gray-800 font-semibold text-white rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all">
        Create Book
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Book</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={bookNameEng}
            onChange={(e) => {
              setBookNameEng(e.target.value);
            }}
            type="text"
            placeholder="Book Name (English)"
          />
          <Input
            value={bookNameHindi}
            onChange={(e) => {
              setBookNameHindi(e.target.value);
            }}
            type="text"
            placeholder="Book Name (Hindi)"
          />
          <Textarea
            value={bookDesc}
            onChange={(e) => {
              setBookDesc(e.target.value);
            }}
            rows={2}
            placeholder="Book Description (optional)"
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={addBookHandler}
            className="bg-gradient-to-b from-gray-600 to-gray-800 font-semibold text-white rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all"
            disabled={loading}
          >
            {loading ? <Spinner /> : "Add Book"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditBook = ({
  fetchBooks,
  book,
}: {
  fetchBooks: () => void;
  book: BookType;
}) => {
  const [bookNameEng, setBookNameEng] = useState(book.nameEng);
  const [bookNameHindi, setBookNameHindi] = useState(book.nameHindi);
  const [bookDesc, setBookDesc] = useState(book.description);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const updateBookHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/books/${book._id}`,
        {
          nameEng: bookNameEng,
          nameHindi: bookNameHindi,
          description: bookDesc,        
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          },
          withCredentials: true,
        }
      );

      if (!response.data.success) {
        toast({
          title: "Book not updated.",
          description: `${bookNameEng} does not exist.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Book updated.",
          description: `${bookNameEng} has been successfully updated.`,
        });
        fetchBooks();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setBookNameEng("");
      setBookNameHindi("");
      setBookDesc("");
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b flex flex-row gap-2 items-center from-gray-600 to-gray-900 text-white font-medium rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all">
        <span>Edit</span>
        <ChevronRight size={16} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Book</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            defaultValue={bookNameEng}
            onChange={(e) => {
              setBookNameEng(e.target.value);
            }}
            type="text"
            placeholder="Book Name (English)"
          />
          <Input
            defaultValue={bookNameHindi}
            onChange={(e) => {
              setBookNameHindi(e.target.value);
            }}
            type="text"
            placeholder="Book Name (Hindi)"
          />
          <Textarea
            defaultValue={bookDesc}
            onChange={(e) => {
              setBookDesc(e.target.value);
            }}
            rows={2}
            placeholder="Book Description (optional)"
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={updateBookHandler}
            className="bg-gradient-to-b from-gray-600 to-gray-900 rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all"
          >
            {loading ? <Spinner /> : "Update Book"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteModalButton = ({
  bookId,
  bookName,
  fetchBooks,
}: {
  bookId: string;
  bookName: string;
  fetchBooks: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user } = useUserContext();

  const deleteBookHandler = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/books/${bookId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      toast({
        title: "Book deleted.",
        description: `${bookName} has been successfully deleted.`,
      });
      fetchBooks();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-red-500 to-red-800 rounded-md shadow-sm p-2 hover:scale-105 transition-all duration-300">
        <Trash size={16} color="white" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. It will permanently delete this
            book.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={deleteBookHandler}
            disabled={loading || user.access === "limited"}
            className="font-semibold bg-gradient-to-b from-red-500 to-red-800 rounded-md shadow-sm p-2 hover:scale-105 transition-all duration-300"
          >
            {user.access === "limited" ? (
              "Access Denied"
            ) : loading ? (
              <Spinner />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Books;
