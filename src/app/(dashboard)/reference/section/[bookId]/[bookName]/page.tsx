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
import { useParams, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Trash } from "lucide-react";
import Spinner from "@/components/Spinner";
import { useUserContext } from "@/context";
import { BookSectionType } from "@/types";

const BookSection = () => {
  const [sections, setSections] = useState<BookSectionType[]>([]);
  const [filteredSections, setFilteredSections] = useState<BookSectionType[]>([]);
  const [search, setSearch] = useState("");

  const router = useRouter()

  const params = useParams();
  const {bookId, bookName} = params;

  const fetchSections = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/bookSections`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      const sections = response.data.data;
      setSections(sections);
      setFilteredSections(sections);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const filteredSections = sections.filter((section) =>
      section.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredSections(filteredSections);
  }, [search, sections]);

  useEffect(() => {
    fetchSections();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-4 sm:w-[90vw] md:w-[80vw] lg:min-w-[80vw] mx-auto">
      <div className="sticky top-0">
        <div className="flex flex-row justify-between items-center p-4">
          <p className="font-bold text-3xl">{decodeURIComponent(bookName as string)}</p>
          <div className="flex flex-row gap-2">
            <div className="w-full sm:w-auto">
              <Input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="p-2 w-full"
                placeholder="Search for book sections..."
              />
            </div>
            <AddBookSection fetchBookSections={fetchSections} bookId={bookId as string} />
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
        <BookSectionsList sections={filteredSections} fetchBookSections={fetchSections} />
      </section>
    </main>
  );
};


const BookSectionsList = ({
  sections,
  fetchBookSections,
}: {
  sections: BookSectionType[];
  fetchBookSections: () => void;
}) => {

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
        {sections.map((section: BookSectionType, index: number) => (
          <TableRow key={index} className="cursor-pointer hover:bg-gray-50">
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-semibold">{section.name}</TableCell>
            <TableCell>{section.description}</TableCell>
            <TableCell className="flex gap-2">

              <EditBookSection
                fetchBookSections={fetchBookSections}
                bookSection={section}
              />
              <DeleteModalButton
                bookSectionId={section._id}
                bookSectionName={section.name}
                fetchBookSections={fetchBookSections}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const AddBookSection = ({
  fetchBookSections,
  bookId
}: {
  fetchBookSections: () => void;
  bookId?: string;
}) => {
  const [bookSectionName, setBookSectionName] = useState("");
  const [bookSectionDesc, setBookSectionDesc] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const addBookSectionHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/bookSections`,
        {
          name: bookSectionName,
          description: bookSectionDesc,
          bookId
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
          title: "Book Section not created.",
          description: `${bookSectionName} already exists.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Book Section created.",
          description: `${bookSectionName} has been successfully created.`,
        });
        fetchBookSections();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setBookSectionName("");
      setBookSectionDesc("");
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-gray-600 to-gray-800 font-semibold text-white rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all">
        Create Book Section
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Book Section</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={bookSectionName}
            onChange={(e) => {
              setBookSectionName(e.target.value);
            }}
            type="text"
            placeholder="Book Section Name"
          />
          <Textarea
            value={bookSectionDesc}
            onChange={(e) => {
              setBookSectionDesc(e.target.value);
            }}
            rows={2}
            placeholder="Book Section Description (optional)"
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={addBookSectionHandler}
            className="bg-gradient-to-b from-gray-600 to-gray-800 font-semibold text-white rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all"
            disabled={loading}
          >
            {loading ? <Spinner /> : "Add Book Section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditBookSection = ({
  fetchBookSections,
  bookSection,
}: {
  fetchBookSections: () => void;
  bookSection: BookSectionType;
}) => {
  const [bookSectionName, setBookSectionName] = useState(bookSection.name);
  const [bookSectionDesc, setBookSectionDesc] = useState(bookSection.description);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const updateBookSectionHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/bookSections/${bookSection._id}`,
        {
          name: bookSectionName,
          description: bookSectionDesc,
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
          title: "Book Section not updated.",
          description: `${bookSectionName} does not exist.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Book Section updated.",
          description: `${bookSectionName} has been successfully updated.`,
        });
        fetchBookSections();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setBookSectionName("");
      setBookSectionDesc("");
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
          <DialogTitle>Update Book Section</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            defaultValue={bookSectionName}
            onChange={(e) => {
              setBookSectionName(e.target.value);
            }}
            type="text"
            placeholder="Book Section Name"
          />
          <Textarea
            defaultValue={bookSectionDesc}
            onChange={(e) => {
              setBookSectionDesc(e.target.value);
            }}
            rows={2}
            placeholder="Book Section Description (optional)"
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={updateBookSectionHandler}
            className="bg-gradient-to-b from-gray-600 to-gray-900 rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all"
          >
            {loading ? <Spinner /> : "Update Book Section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteModalButton = ({
  bookSectionId,
  bookSectionName,
  fetchBookSections,
}: {
  bookSectionId: string;
  bookSectionName: string;
  fetchBookSections: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user } = useUserContext();

  const deleteBookSectionHandler = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/bookSections/${bookSectionId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      toast({
        title: "Book Section deleted.",
        description: `${bookSectionName} has been successfully deleted.`,
      });
      fetchBookSections();
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
            book section.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={deleteBookSectionHandler}
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

export default BookSection;
