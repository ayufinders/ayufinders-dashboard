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

const Quiz = () => {
  const [topics, setTopics] = useState<TopicType[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<TopicType[]>([]);
  const [search, setSearch] = useState("");

  const fetchTopics = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/quiz/`,
        {
          withCredentials: true
        }
      );
      const topics = response.data.quizCategories;
      setTopics(topics);
      setFilteredTopics(topics);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const filteredTopics = topics.filter((topic) =>
      topic.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredTopics(filteredTopics);
  }, [search, topics]);

  useEffect(() => {
    fetchTopics();
  }, []);

  return (
    <main className="p-4 relative">
      <div className="sticky z-50 top-0">
        <div className="flex flex-row justify-between items-center p-4 gap-2">
          <p className="font-bold text-3xl text-gray-900">Quiz Categories</p>
          <div className="flex flex-row gap-2 items-center w-fit">
            <Input
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search for topics..."
            />
            <AddTopic fetchTopics={fetchTopics} />
          </div>
        </div>
      </div>
      <section className="max-h-[75vh] min-w-[80vw] overflow-scroll-y border">
        <QuizCategories topics={filteredTopics} fetchTopics={fetchTopics} />
      </section>
    </main>
  );
};

type TopicType = {
  _id: string;
  name: string;
  description: string;
  questions: string[];
  createdAt: string;
  updatedAt: string;
};

const QuizCategories = ({
  topics,
  fetchTopics,
}: {
  topics: TopicType[];
  fetchTopics: () => void;
}) => {
  
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <Table className="shadow-sm border border-gray-200">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="w-[50px] text-gray-700">#</TableHead>
            <TableHead className="text-gray-700">Name</TableHead>
            <TableHead className="text-gray-700">Description</TableHead>
            <TableHead className="text-gray-700 text-right">Questions</TableHead>
            <TableHead></TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic, index) => (
            <TableRow key={index} className="cursor-pointer">
              <TableCell className="font-medium text-gray-800">
                {index + 1}
              </TableCell>
              <TableCell className="text-gray-800 font-medium">{topic.name}</TableCell>
              <TableCell className="text-gray-600">{topic.description}</TableCell>
              <TableCell className="text-gray-800 text-center">
                {topic.questions.length}
              </TableCell>
              <TableCell>
                <Button
                  className="bg-gradient-to-b from-gray-500 to-gray-800 text-white hover:scale-105 px-4 py-0 transition-all duration-300"
                  onClick={() => router.push(`quiz/${topic._id}/${topic.name}`)}
                > View
                  <ChevronRight size={24} color="white" className="font-bold"/>
                </Button>
              </TableCell>
              <TableCell>
                <DeleteModalButton
                  topicId={topic._id}
                  topicName={topic.name}
                  fetchTopics={fetchTopics}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const AddTopic = ({ fetchTopics }: { fetchTopics: () => void }) => {
  const [topicName, setTopicName] = useState("");
  const [topicDesc, setTopicDesc] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false)

  const addTopicHandler = async () => {
    try {
      setLoading(true)
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/quiz/`,
        {
          name: topicName,
          description: topicDesc,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );
      
      toast({
        title: response.data.success
          ? "Topic created"
          : "Topic not created",
        description: response.data.success
          ? `${topicName} successfully created.`
          : `${topicName} already exists.`,
        variant: response.data.success ? "default" : "destructive",
      });
      fetchTopics();
    } catch (error) {
      console.error(error);
    } finally {
      setTopicName("");
      setTopicDesc("");
      setLoading(false)
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-gray-500 to-gray-800 text-white font-semibold text-sm text-nowrap rounded-md px-4 py-2 shadow-md hover:scale-105 transition-all duration-300">
        Create Topic
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="my-2 text-gray-700">Create a New Topic</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            placeholder="Topic Name"
          />
          <Textarea
            value={topicDesc}
            onChange={(e) => setTopicDesc(e.target.value)}
            rows={3}
            placeholder="Topic Description (optional)"
          />
        </div>
        <DialogFooter>
          <Button
            className="bg-gradient-to-b from-gray-600 to-gray-900 text-white hover:scale-105 font-semibold transition-all duration-300"
            onClick={addTopicHandler}
            disabled={loading}
          >
            {
              loading? <Spinner /> : "Add Topic"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteModalButton = ({
  topicId,
  topicName,
  fetchTopics,
}: {
  topicId: string;
  topicName: string;
  fetchTopics: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false)
  const {user} = useUserContext()

  const deleteTopicHandler = async () => {
    try {
      setLoading(true)
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/quiz/category/${topicId}`,
        {
          withCredentials: true
        }
      );
      toast({
        title: "Topic deleted",
        description: `${topicName} successfully deleted.`,
      });
      fetchTopics();
    } catch (error) {
      console.error(error);
      setLoading(false)
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-red-500 to-red-700 text-white rounded-md p-2 shadow-md hover:scale-105 transition-all duration-300">
        <Trash size={16}/>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the topic.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="bg-gradient-to-b from-red-500 to-red-700 text-white hover:scale-105 transition-all duration-300"
            onClick={deleteTopicHandler}
            disabled={loading||user.access=='limited'}
          >
            { 
              user.access=='limited'
              ? "Access Denied"
              : loading? <Spinner /> : "Delete"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Quiz;
