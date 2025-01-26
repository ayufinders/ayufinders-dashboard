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
import { ChevronRight, Trash } from "lucide-react"; // Importing icons
import Spinner from "@/components/Spinner";
import { useUserContext } from "@/context";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const SubjectTopics = () => {
  const [subjectTopics, setSubjectTopics] = useState<SubjectTopicType[]>([]);
  const [filteredSubjectTopics, setFilteredSubjectTopics] = useState<
    SubjectTopicType[]
  >([]);

  const [paperSections, setPaperSections] = useState<PaperSectionType[]>([]);
  const [filteredPaperSections, setFilteredPaperSections] = useState<
    PaperSectionType[]
  >([]);
  const [search, setSearch] = useState("");

  const params = useParams();
  const paperId = params.paperId;
  const paperName = decodeURIComponent(params.paperName as string);

  const fetchTopics = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subjectTopic/topics/${paperId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      const topics = response.data.data;
      setSubjectTopics(topics);
      setFilteredSubjectTopics(topics);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/paperSection/${paperId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      const sections = response.data.data;
      setPaperSections(sections);
      setFilteredPaperSections(sections);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const filteredTopics = subjectTopics.filter((topic) =>
      topic.name.toLowerCase().includes(search)
    );

    const filteredSections = paperSections.filter((section) =>
      section.name.toLowerCase().includes(search)
    );
    setFilteredSubjectTopics(filteredTopics);
    setFilteredPaperSections(filteredSections);
  }, [search, subjectTopics, paperSections]);

  useEffect(() => {
    fetchTopics();
    fetchSections();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-4 min-w-[80vw]">
      <div className="sticky top-0 bg-white">
        <div className="flex flex-row justify-between items-center p-4">
          <p className="font-bold text-3xl">{paperName}</p>
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
            <AddSubjectTopic
              fetchTopics={fetchTopics}
              paperId={paperId as string}
            />
            <AddPaperSection
              fetchSections={fetchSections}
              paperId={paperId as string}
            />
          </div>
        </div>
      </div>

      {subjectTopics.length > 0 && (
        <section className="max-h-[75vh] min-w-[80vw] border">
          <h2 className="font-semibold p-2 bg-gray-50 text-gray-500">
            SUBJECT TOPICS
          </h2>
          <SubjectTopicList
            topics={filteredSubjectTopics}
            fetchTopics={fetchTopics}
          />
        </section>
      )}

      {paperSections.length > 0 && (
        <section className="max-h-[75vh] min-w-[80vw] border">
          <h2 className="font-semibold p-2 bg-gray-50 text-gray-500">PARTS</h2>
          <PaperSectionList
            sections={filteredPaperSections}
            fetchSections={fetchSections}
          />
        </section>
      )}
    </main>
  );
};

type SubjectTopicType = {
  _id: string;
  name: string;
  description: string;
  paperId: string;
  tagId: string[];
  createdAt: string;
  updatedAt: string;
};

const SubjectTopicList = ({
  topics,
  fetchTopics,
}: {
  topics: SubjectTopicType[];
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
        {topics.map((sub: SubjectTopicType, index: number) => (
          <TableRow key={index} className="cursor-pointer">
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-semibold">{sub.name}</TableCell>
            <TableCell>{sub.description}</TableCell>
            <TableCell className="flex flex-row gap-2">
              <Button
                onClick={() => {
                  router.replace(
                    `/syllabus/subject/paper/subjectTopic/subTopic/${sub._id}/${sub.name}`
                  );
                }}
                className="flex items-center gap-2 bg-gradient-to-b from-gray-600 to-gray-900 hover:scale-105 transition-all duration-300"
              >
                View
                <ChevronRight size={16} />
              </Button>
              <UpdateSubjectTopicDialog
                fetchTopics={fetchTopics}
                subjectTopic={sub}
              ></UpdateSubjectTopicDialog>
              <DeleteSubjectTopicModalButton
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

const PaperSectionList = ({
  sections,
  fetchSections,
}: {
  sections: PaperSectionType[];
  fetchSections: () => void;
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
        {sections.map((sub: PaperSectionType, index: number) => (
          <TableRow key={index} className="cursor-pointer">
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-semibold">{sub.name}</TableCell>
            <TableCell>{sub.description}</TableCell>
            <TableCell className="flex flex-row gap-2">
              <Button
                onClick={() => {
                  router.push(
                    `/syllabus/subject/paper/paperSection/${sub._id}/${sub.name}`
                  );
                }}
                className="flex items-center gap-2 bg-gradient-to-b from-gray-600 to-gray-900 hover:scale-105 transition-all duration-300"
              >
                View
                <ChevronRight size={16} />
              </Button>
              <UpdatePaperSectionDialog
                fetchSections={fetchSections}
                paperSection={sub}
              />
              <DeletePaperSectionModalButton
                fetchSections={fetchSections}
                sectionId={sub._id}
                sectionName={sub.name}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const AddSubjectTopic = ({
  fetchTopics,
  paperId,
}: {
  fetchTopics: () => void;
  paperId: string;
}) => {
  const [subjectTopicName, setSubjectTopicName] = useState("");
  const [subjectTopicDesc, setSubjectTopicDesc] = useState("");
  const [year, setYear] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const addSubjectTopicHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subjectTopic`,
        {
          name: subjectTopicName,
          description: subjectTopicDesc,
          paperId: paperId,
          year,
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
          title: "Subject topic not created.",
          description: `${subjectTopicName} already exists.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Topic created.",
          description: `${subjectTopicName} has been successfully created.`,
        });
        fetchTopics();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubjectTopicName("");
      setSubjectTopicDesc("");
      setYear("");
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm text-nowrap font-semibold hover:scale-105 duration-300 transition-all">
        Create Subject Topic
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Subject Topic</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={subjectTopicName}
            onChange={(e) => {
              setSubjectTopicName(e.target.value);
            }}
            type="text"
            placeholder="Subject Name"
          ></Input>
          <Textarea
            value={subjectTopicDesc}
            onChange={(e) => {
              setSubjectTopicDesc(e.target.value);
            }}
            rows={2}
            placeholder="Subject Description (optional)"
          ></Textarea>
          <Label className="mt-4">Select Type</Label>
          <ToggleGroup
            type="single"
            value={year}
            onValueChange={setYear}
            className="justify-start"
          >
            <ToggleGroupItem value="1">1</ToggleGroupItem>
            <ToggleGroupItem value="2">2</ToggleGroupItem>
            <ToggleGroupItem value="3">3</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={addSubjectTopicHandler}
            className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm font-semibold hover:scale-105 duration-300 transition-all"
          >
            {loading ? <Spinner /> : "Add Topic"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddPaperSection = ({
  fetchSections,
  paperId,
}: {
  fetchSections: () => void;
  paperId: string;
}) => {
  const [sectionName, setSectionName] = useState("");
  const [sectionDesc, setSectionDesc] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const AddPaperSectionHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/paperSection`,
        {
          name: sectionName,
          description: sectionDesc,
          paperId: paperId,
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
          title: "Paper Section not created.",
          description: `${sectionName} already exists.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Topic created.",
          description: `${sectionDesc} has been successfully created.`,
        });
        fetchSections();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSectionName("");
      setSectionDesc("");
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm text-nowrap font-semibold hover:scale-105 duration-300 transition-all">
        Create Paper Section
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Paper Section</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={sectionName}
            onChange={(e) => {
              setSectionName(e.target.value);
            }}
            type="text"
            placeholder="Paper Section Name"
          ></Input>
          <Textarea
            value={sectionDesc}
            onChange={(e) => {
              setSectionDesc(e.target.value);
            }}
            rows={2}
            placeholder="Paper Section Description (optional)"
          ></Textarea>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={AddPaperSectionHandler}
            className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm font-semibold hover:scale-105 duration-300 transition-all"
          >
            {loading ? <Spinner /> : "Add Section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UpdateSubjectTopicDialog = ({
  fetchTopics,
  subjectTopic,
}: {
  fetchTopics: () => void;
  subjectTopic: SubjectTopicType;
}) => {
  const [subjectTopicName, setSubjectTopicName] = useState(subjectTopic.name);
  const [subjectTopicDesc, setSubjectTopicDesc] = useState(
    subjectTopic.description
  );
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const paperId = params.paperId;

  const updateSubjectTopicHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subjectTopic/${subjectTopic._id}`,
        {
          name: subjectTopicName,
          description: subjectTopicDesc,
          paperId: paperId,
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
          title: "Subject topic not updated.",
          description: `${subjectTopicName} does not exists.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Topic created.",
          description: `${subjectTopicName} has been successfully updated.`,
        });
        fetchTopics();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubjectTopicName("");
      setSubjectTopicDesc("");
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
          <DialogTitle>Update the Subject Topic Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            defaultValue={subjectTopicName}
            onChange={(e) => {
              setSubjectTopicName(e.target.value);
            }}
            type="text"
            placeholder="Subject Name"
          ></Input>
          <Textarea
            defaultValue={subjectTopicDesc}
            onChange={(e) => {
              setSubjectTopicDesc(e.target.value);
            }}
            rows={2}
            placeholder="Subject Description (optional)"
          ></Textarea>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={loading}
            onClick={updateSubjectTopicHandler}
          >
            {loading ? <Spinner /> : "Update Subject Topic"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UpdatePaperSectionDialog = ({
  fetchSections,
  paperSection,
}: {
  fetchSections: () => void;
  paperSection: PaperSectionType;
}) => {
  const [sectionName, setSectionName] = useState(paperSection.name);
  const [sectionDesc, setSectionDesc] = useState(paperSection.description);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const paperId = params.paperId;

  const updatePaperSectionHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/paperSection/${paperSection._id}`,
        {
          name: sectionName,
          description: sectionDesc,
          paperId: paperId,
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
          title: "Paper section not updated.",
          description: `${sectionName} does not exists.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Paper section created.",
          description: `${sectionName} has been successfully updated.`,
        });
        fetchSections();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSectionName("");
      setSectionDesc("");
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
          <DialogTitle>Update the Subject Topic Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            defaultValue={sectionName}
            onChange={(e) => {
              setSectionName(e.target.value);
            }}
            type="text"
            placeholder="Subject Name"
          ></Input>
          <Textarea
            defaultValue={sectionDesc}
            onChange={(e) => {
              setSectionDesc(e.target.value);
            }}
            rows={2}
            placeholder="Subject Description (optional)"
          ></Textarea>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={loading}
            onClick={updatePaperSectionHandler}
          >
            {loading ? <Spinner /> : "Update Paper Section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteSubjectTopicModalButton = ({
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/subjectTopic/${topicId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      toast({
        title: "Topic deleted.",
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

const DeletePaperSectionModalButton = ({
  sectionId,
  sectionName,
  fetchSections,
}: {
  sectionId: string;
  sectionName: string;
  fetchSections: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user } = useUserContext();

  const deleteSectionHandler = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/paperSection/${sectionId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      toast({
        title: "Section deleted.",
        description: `${sectionName} has been successfully deleted.`,
      });
      fetchSections();
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
              deleteSectionHandler();
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

type PaperSectionType = {
  _id: string;
  name: string;
  description: string;
  paperId: string;
};

export default SubjectTopics;
