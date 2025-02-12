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
import { useRouter, useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Trash } from "lucide-react";
import Spinner from "@/components/Spinner";
import { useUserContext } from "@/context";
import { SubjectType } from "@/types";

const Subject = () => {
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<SubjectType[]>([]);
  const [search, setSearch] = useState("");

  const params = useParams();
  const year = params.year;

  const router = useRouter()

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subject/${year}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      const subjects = response.data.data;
      setSubjects(subjects);
      setFilteredSubjects(subjects);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const filteredSubjects = subjects.filter((topic) =>
      topic.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredSubjects(filteredSubjects);
  }, [search, subjects]);

  useEffect(() => {
    fetchSubjects();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-4 sm:w-[90vw] md:w-[80vw] lg:min-w-[80vw] mx-auto">
      <div className="sticky top-0">
        <div className="flex flex-row justify-between items-center p-4">
          <p className="font-bold text-3xl">Year {year}</p>
          <div className="flex flex-row gap-2">
            <div className="w-full sm:w-auto">
              <Input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="p-2 w-full"
                placeholder="Search for subjects..."
              />
            </div>
            <AddSubject fetchTopics={fetchSubjects} year={year as string} />
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
        <SubjectList subjects={filteredSubjects} fetchTopics={fetchSubjects} />
      </section>
    </main>
  );
};


const SubjectList = ({
  subjects,
  fetchTopics,
}: {
  subjects: SubjectType[];
  fetchTopics: () => void;
}) => {
  const router = useRouter();
  const params = useParams();
  const year = params.year;

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
        {subjects.map((sub: SubjectType, index: number) => (
          <TableRow key={index} className="cursor-pointer hover:bg-gray-50">
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-semibold">{sub.name}</TableCell>
            <TableCell>{sub.description}</TableCell>
            <TableCell className="flex gap-2">
              <Button
                onClick={() => {
                  router.push(`paper/${sub._id}/${sub.name}`);
                }}
                className="bg-gradient-to-b from-gray-600 to-gray-900 rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all"
              >
                View <ChevronRight size={16} />
              </Button>
              <EditSubject
                year={year as string}
                fetchTopics={fetchTopics}
                sub={sub}
              />
              <DeleteModalButton
                subId={sub._id}
                subName={sub.name}
                fetchTopics={fetchTopics}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const AddSubject = ({
  fetchTopics,
  year,
}: {
  fetchTopics: () => void;
  year: string;
}) => {
  const [subName, setSubName] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const addSubjectHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subject`,
        {
          name: subName,
          description: subDesc,
          year: Number(year),
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
          title: "Subject not created.",
          description: `${subName} already exists.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subject created.",
          description: `${subName} has been successfully created.`,
        });
        fetchTopics();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubName("");
      setSubDesc("");
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-gray-600 to-gray-800 font-semibold text-white rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all">
        Create Subject
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Subject</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={subName}
            onChange={(e) => {
              setSubName(e.target.value);
            }}
            type="text"
            placeholder="Subject Name"
          />
          <Textarea
            value={subDesc}
            onChange={(e) => {
              setSubDesc(e.target.value);
            }}
            rows={2}
            placeholder="Subject Description (optional)"
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={addSubjectHandler}
            className="bg-gradient-to-b from-gray-600 to-gray-800 font-semibold text-white rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all"
            disabled={loading}
          >
            {loading ? <Spinner /> : "Add Subject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditSubject = ({
  fetchTopics,
  year,
  sub,
}: {
  fetchTopics: () => void;
  year: string;
  sub: SubjectType;
}) => {
  const [subName, setSubName] = useState(sub.name);
  const [subDesc, setSubDesc] = useState(sub.description);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const updateSubjectHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subject/${sub._id}`,
        {
          name: subName,
          description: subDesc,
          year: Number(year),
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
          title: "Subject not updated.",
          description: `${subName} does not exist.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subject updated.",
          description: `${subName} has been successfully updated.`,
        });
        fetchTopics();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubName("");
      setSubDesc("");
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
          <DialogTitle>Update Subject Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            defaultValue={subName}
            onChange={(e) => {
              setSubName(e.target.value);
            }}
            type="text"
            placeholder="Subject Name"
          />
          <Textarea
            defaultValue={subDesc}
            onChange={(e) => {
              setSubDesc(e.target.value);
            }}
            rows={2}
            placeholder="Subject Description (optional)"
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={updateSubjectHandler}
            className="bg-gradient-to-b from-gray-600 to-gray-900 rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all"
          >
            {loading ? <Spinner /> : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteModalButton = ({
  subId,
  subName,
  fetchTopics,
}: {
  subId: string;
  subName: string;
  fetchTopics: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user } = useUserContext();

  const deleteSubjectHandler = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subject/${subId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      toast({
        title: "Subject deleted.",
        description: `${subName} has been successfully deleted.`,
      });
      fetchTopics();
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
            subject.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={deleteSubjectHandler}
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

export default Subject;
