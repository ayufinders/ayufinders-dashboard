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
import { TagType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Trash } from "lucide-react";
import Spinner from "@/components/Spinner";
import { useUserContext } from "@/context";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import TagsMenu from "@/components/TagsMenu";
import { SubTopicType } from "@/types";

const SubTopics = () => {
  const [subTopics, setSubTopics] = useState<SubTopicType[]>([]);
  const [filteredSubTopics, setFilteredSubTopics] = useState<SubTopicType[]>(
    []
  );
  const [search, setSearch] = useState("");

  const router = useRouter()
  const params = useParams();
  const subjectTopicId = params.subjectTopicId;
  const subjectTopicName = decodeURIComponent(
    params.subjectTopicName as string
  );

  const fetchTopics = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic/topics/${subjectTopicId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      const topics = response.data.data;
      setSubTopics(topics);
      setFilteredSubTopics(topics);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const filteredSubTopics = subTopics.filter((topic) =>
      topic.name.toLowerCase().includes(search)
    );

    setFilteredSubTopics(filteredSubTopics);
  }, [search, subTopics]);

  useEffect(() => {
    fetchTopics();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-4 min-w-[80vw]">
      <div className="sticky top-0 bg-white">
        <div className="flex flex-row justify-between items-center p-4">
          <p className="font-bold text-3xl">{subjectTopicName}</p>
          <div className="flex flex-row gap-2">
            <div>
              <Input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="p-2"
                placeholder="Search for topics..."
              ></Input>
            </div>
            <AddSubTopic
              fetchTopics={fetchTopics}
              subjectTopicId={subjectTopicId as string}
            />
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

      <section className="max-h-[80vh] min-w-[80vw] border">
        <SubTopicList topics={filteredSubTopics} fetchTopics={fetchTopics} />
      </section>
    </main>
  );
};

const SubTopicList = ({
  topics,
  fetchTopics,
}: {
  topics: SubTopicType[];
  fetchTopics: () => void;
}) => {
  const router = useRouter();

  return (
    <Table className="w-[80vw]">
      <TableHeader className="bg-gray-50">
        <TableRow>
          <TableHead className="w-[100px]">S. No.</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topics.map((sub: SubTopicType, index: number) => (
          <TableRow key={index} className="cursor-pointer">
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-semibold">{sub.name}</TableCell>
            <TableCell>{sub.description}</TableCell>
            <TableCell className="flex flex-row gap-2">
              <Button
                onClick={() => {
                  router.push(
                    `/syllabus/subject/paper/subjectTopic/subTopic/data/${sub._id}/${encodeURIComponent(sub.name)}`
                  );
                }}
                className="flex items-center gap-2 bg-gradient-to-b from-gray-600 to-gray-900 hover:scale-105 transition-all duration-300"
              >
                View
                <ChevronRight size={16} />
              </Button>
              <UpdateSubTopicDialog fetchTopics={fetchTopics} subTopic={sub} />
              <DeleteSubTopicModalButton
                topicId={sub._id}
                topicName={sub.name}
                fetchTopics={fetchTopics}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const AddSubTopic = ({
  fetchTopics,
  subjectTopicId,
}: {
  fetchTopics: () => void;
  subjectTopicId: string;
}) => {
  const [subTopicName, setSubTopicName] = useState("");
  const [subTopicDesc, setSubTopicDesc] = useState("");
  const [type, setType] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const {user, selectedYear} = useUserContext()

  const addSubTopicHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic`,
        {
          name: subTopicName,
          description: subTopicDesc,
          subjectTopicId: subjectTopicId,
          tagId: selectedTags,
          year: selectedYear,
          type,
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          },
          withCredentials: true,
        }
      );

      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/quiz/`,
        {
          name: subTopicName,
          description: subTopicDesc,
          year: selectedYear,
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          },
          withCredentials: true,
        }
      );

      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/tag/`,
        {
          name: subTopicName,
          description: subTopicDesc,
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

      if (!response.data.success) {
        toast({
          title: "Sub Topic not created.",
          description: `${subTopicName} already exists.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sub Topic created.",
          description: `${subTopicName} has been successfully created.`,
        });
        
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubTopicName("");
      setSubTopicDesc("");
      setType("");
      setLoading(false);
      fetchTopics();
    }
  };

  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);

  
  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm text-nowrap font-semibold hover:scale-105 duration-300 transition-all">
        Create Sub Topic
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Sub Topic</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={subTopicName}
            onChange={(e) => {
              setSubTopicName(e.target.value);
            }}
            type="text"
            placeholder="Sub Topic Name"
          ></Input>
          <Textarea
            value={subTopicDesc}
            onChange={(e) => {
              setSubTopicDesc(e.target.value);
            }}
            rows={2}
            placeholder="Sub Topic Description (optional)"
          ></Textarea>

          <Label className="mt-4">Select Type</Label>
          <ToggleGroup
            type="single"
            value={type}
            onValueChange={setType}
            className="justify-start"
          >
            <ToggleGroupItem value="MK">MK</ToggleGroupItem>
            <ToggleGroupItem value="DK">DK</ToggleGroupItem>
            <ToggleGroupItem value="NK">NK</ToggleGroupItem>
          </ToggleGroup>

          

          <div className="flex flex-row gap-4 mt-4">
            <div>
              <TagsMenu
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
            </div>
            
            <div className="w-80 flex-wrap max-h-52 overflow-x-scroll p-1 border flex-row flex gap-1">
              {selectedTags.map((tag) => {
                return (
                  <div
                    key={tag._id}
                    className="bg-gray-100 h-fit py-1 px-2 rounded-md text-nowrap"
                  >
                    {tag.name}
                    <button className="text-red-600 ml-2 cursor-pointer"
                    onClick={()=>{
                      const tagsArray = selectedTags.filter((t: TagType) => t._id != tag._id)
                      setSelectedTags(tagsArray)
                    }}
                    >
                      x
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={addSubTopicHandler}
            className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm font-semibold hover:scale-105 duration-300 transition-all"
          >
            {loading ? <Spinner /> : "Add Sub Topic"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UpdateSubTopicDialog = ({
  fetchTopics,
  subTopic,
}: {
  fetchTopics: () => void;
  subTopic: SubTopicType;
}) => {
  const [subTopicName, setSubTopicName] = useState(subTopic.name);
  const [subTopicDesc, setSubTopicDesc] = useState(subTopic.description);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const subjectTopicId = params.subjectTopicId;

  const updateSubTopicHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic/${subTopic._id}`,
        {
          name: subTopicName,
          description: subTopicDesc,
          subjectTopicId: subjectTopicId,
          tagId: selectedTags,
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
          title: "Sub Topic not updated.",
          description: `${subTopicName} does not exists.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sub Topic created.",
          description: `${subTopicDesc} has been successfully updated.`,
        });
        fetchTopics();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubTopicName("");
      setSubTopicDesc("");
      setLoading(false);
    }
  };

  const [selectedTags, setSelectedTags] = useState<TagType[]>(subTopic.tagId);

  return (
    <Dialog>
      <DialogTrigger className="flex flex-row gap-2 items-center bg-gradient-to-b from-gray-600 to-gray-900 text-white font-medium rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all">
        <span>Edit</span>
        <ChevronRight size={16} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update the Sub Topic Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            defaultValue={subTopicName}
            onChange={(e) => {
              setSubTopicName(e.target.value);
            }}
            type="text"
            placeholder="Sub Topic Name"
          ></Input>
          <Textarea
            defaultValue={subTopicDesc}
            onChange={(e) => {
              setSubTopicDesc(e.target.value);
            }}
            rows={2}
            placeholder="Sub Topic Description (optional)"
          ></Textarea>
          <div className="flex flex-row gap-4">
            <div>
              <TagsMenu
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
            </div>
            
            <div className="w-80 max-h-52 flex-wrap overflow-scroll p-1 border flex-row flex gap-1">
              {selectedTags.map((tag) => {
                return (
                  <div
                    key={tag._id}
                    className="bg-gray-100 text-sm py-1 px-2 rounded text-nowrap"
                  >
                    {tag.name}
                    <button className="ml-2 text-red-600"
                    onClick={()=>{
                      const tagsArray = selectedTags.filter((t: TagType) => t._id !== tag._id)
                      setSelectedTags(tagsArray)
                    }}
                    >
                      x
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={loading}
            onClick={updateSubTopicHandler}
          >
            {loading ? <Spinner /> : "Update Sub Topic"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteSubTopicModalButton = ({
  topicId,
  topicName,
  fetchTopics,
}: {
  topicId: string;
  topicName: string;
  fetchTopics: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user } = useUserContext();

  const deleteTopicHandler = async (topicId: string, topicName: string) => {
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic/${topicId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      toast({
        title: "Sub Topic deleted.",
        description: `${topicName} has been successfully deleted.`,
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
      <DialogTrigger className="bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 text-sm hover:scale-105 duration-300 transition-all flex items-center gap-2">
        <Trash size={16} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the topic
            and remove your data from the servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              deleteTopicHandler(topicId, topicName);
            }}
            disabled={loading || user.access === "limited"}
            className="bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 text-sm hover:scale-105 duration-300 transition-all flex items-center gap-2"
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

export default SubTopics;
