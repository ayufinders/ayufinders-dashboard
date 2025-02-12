"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Trash } from "lucide-react";
import Spinner from "@/components/Spinner";
import { useUserContext } from "@/context";
import { useRouter } from "next/navigation";
import { UniversityType } from "@/types";

const Universities = () => {
  const [unis, setUnis] = useState<UniversityType[]>([]);
  const [search, setSearch] = useState("");
  const [filteredUnis, setFilteredTags] = useState<UniversityType[]>([]);

  useEffect(() => {
    const searchedUnis = unis.filter((uni) =>
      uni.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredTags(searchedUnis);
  }, [search, unis]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/universities`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      const unis = response.data.universities;
      setUnis(unis);
      setFilteredTags(unis);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const router = useRouter()

  return (
    <main className="p-4 relative">
      <div className="sticky top-0 p-4">
        <div className="flex flex-row justify-between items-center gap-2">
          <p className="font-bold text-4xl text-gray-900">Universities</p>
          <div className="flex flex-row gap-2 items-center">
            <div>
              <Input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="p-4"
                placeholder="Search for tags..."
              ></Input>
            </div>
            <AddUniversity fetchData={fetchData} />
            <Button
            onClick={()=>{
              router.replace('/')
            }}
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      <section className="max-h-[80vh] min-w-[80vw] overflow-y-scroll border mt-2">
        <UniversityList unis={filteredUnis} fetchData={fetchData} />
      </section>
    </main>
  );
};

const AddUniversity = ({ fetchData }: { fetchData: () => void }) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUserContext();

  const addUniHandler = async () => {
    try {
      setLoading(true);
      if (name == "") {
        toast({
          title: "No Name.",
          description: "Enter name to create a new tag.",
          variant: "destructive",
        });
      }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/universities/`,
        {
          name: name,
          description: desc,
          createdBy: user.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          },
          withCredentials: true,
        }
      );

      if (response.status!==200) {
        toast({
          title: "University not created.",
          description: `${name} already exists.`,
        });
      } else {
        toast({
          title: "University created.",
          description: `${name} has been successfully created.`,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setName("");
      setDesc("");
      setLoading(false);
      fetchData();
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-gray-500 to-gray-800 text-white font-semibold border rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 transition-all duration-300">
        Create University
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="my-2">Create a New University</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            type="text"
            placeholder="University Name"
          ></Input>
          <Textarea
            value={desc}
            onChange={(e) => {
              setDesc(e.target.value);
            }}
            rows={2}
            placeholder="University Description (optional)"
          ></Textarea>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={loading}
            onClick={addUniHandler}
            className="bg-gradient-to-b from-gray-500 to-gray-800 hover:scale-105 font-semibold transition-all duration-300"
          >
            {loading ? <Spinner /> : "Create University"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditUniversity = ({
  fetchData,
  uni,
}: {
  fetchData: () => void;
  uni: UniversityType;
}) => {
  const [name, setName] = useState(uni.name);
  const [desc, setDesc] = useState(uni.description);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const editUniHandler = async () => {
    try {
      setLoading(true);
      if (name == "") {
        toast({
          title: "No Name.",
          description: "Enter name to edit a new tag.",
          variant: "destructive",
        });
      }
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/universities/${uni._id}`,
        {
          name: name,
          description: desc,
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          },
          withCredentials: true,
        }
      );

      if (!response.data.tag) {
        toast({
          title: "University not updated.",
          description: `${name} does not exists.`,
        });
      } else {
        toast({
          title: "University updated.",
          description: `${name} has been successfully edited.`,
        });
        fetchData();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setName("");
      setDesc("");
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="flex flex-row gap-2 items-center bg-gradient-to-b from-gray-600 to-gray-900 text-white font-medium rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all">
        <span>Edit</span>
        <ChevronRight size={16} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="my-2">Edit University</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            type="text"
            placeholder="University Name"
          ></Input>
          <Textarea
            value={desc}
            onChange={(e) => {
              setDesc(e.target.value);
            }}
            rows={2}
            placeholder="University Description (optional)"
          ></Textarea>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={loading}
            onClick={editUniHandler}
            className="bg-gradient-to-b from-gray-500 to-gray-800 hover:scale-105 font-semibold transition-all duration-300"
          >
            {loading ? <Spinner /> : "Update University"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const UniversityList = ({
  unis,
  fetchData,
}: {
  unis: UniversityType[];
  fetchData: () => void;
}) => {
  return (
    <Table>
      <TableHeader className="bg-gray-50 max-h-[80vh]">
        <TableRow>
          <TableHead className="w-[100px]">S. No.</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {unis.map((uni: UniversityType, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-medium">{uni.name}</TableCell>
            <TableCell>{uni.description}</TableCell>
            <TableCell>
              <div className="bg-gray-100 p-1 rounded-lg w-fit">
                {uni.createdBy?.name || ""}
              </div>
            </TableCell>
            <TableCell className="flex flex-row gap-2 items-center">
              <EditUniversity fetchData={fetchData} uni={uni} />
              <DeleteModalButton
                fetchData={fetchData}
                uniId={uni._id}
                uniName={uni.name}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const DeleteModalButton = ({
  uniId,
  uniName,
  fetchData,
}: {
  uniId: string;
  uniName: string;
  fetchData: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user } = useUserContext();

  const deleteUniHandler = async () => {
    try {
      setLoading(true);
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/universities/${uniId}`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem("token"),
        },
        withCredentials: true
      });
      toast({
        title: "University deleted.",
        description: `${uniName} has been successfully deleted.`,
      });
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-red-500 to-red-700 rounded-md shadow-sm p-2 hover:scale-105 transition-all">
        <Trash size={16} color="white" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the tag
            and remove your data from the servers.
          </DialogDescription>
          <DialogFooter>
            <Button
              onClick={deleteUniHandler}
              disabled={loading || user.access == "limited"}
              className="from-red-500 to-red-700 bg-gradient-to-b hover:scale-105 transition-all duration-300"
            >
              {user.access == "limited" ? (
                "Access Denied"
              ) : loading ? (
                <Spinner />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default Universities;
