"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Trash } from "lucide-react"; // Importing icons

const SubjectTopicData = () => {
  const [mcqQuestions, setMcqQuestions] = useState<QuestionType[]>([]);
  const [filteredMcqQuestions, setFilteredMcqQuestions] = useState<QuestionType[]>([]);
  const [search, setSearch] = useState("");

  const params = useParams();
  const subjectTopicId = params.subjectTopicId;
  const subjectTopicName = decodeURIComponent(params.subjectTopicName as string);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subjectTopic/${subjectTopicId}`
      );
      const data = response.data.data;
      setMcqQuestions(data.questions);
      setFilteredMcqQuestions(data.questions);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const filteredQuestions = mcqQuestions.filter((ques) =>
      ques.text.toLowerCase().includes(search)
    );
    setFilteredMcqQuestions(filteredQuestions);
  }, [search, mcqQuestions]);

  useEffect(() => {
    fetchQuestions();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-4 w-[80vw]">
      <div className="sticky z-50 top-0 bg-white">
        <div className="flex flex-row justify-between items-center p-4">
          <p className="font-bold text-3xl">{subjectTopicName}</p>
          <div className="flex flex-row gap-2">
            <div>
              <Input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="p-2 w-[200px]"
                placeholder="Search for Questions..."
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>MCQ Questions</AccordionTrigger>
            <AccordionContent>
              <QuestionsList questions={filteredMcqQuestions} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Notes</AccordionTrigger>
            <AccordionContent>Notes</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Video Lectures</AccordionTrigger>
            <AccordionContent>Video Lectures</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
};

const QuestionsList = ({ questions }: { questions: any }) => {
  const router = useRouter();

  return (
    <Table className="w-full">
      <TableCaption>A list of your created questions by topic.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">S. No.</TableHead>
          <TableHead>Text</TableHead>
          <TableHead>Option 1</TableHead>
          <TableHead>Option 2</TableHead>
          <TableHead>Option 3</TableHead>
          <TableHead>Option 4</TableHead>
          <TableHead>Correct</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map((ques: QuestionType, index: number) => (
          <TableRow key={index} className="cursor-pointer">
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-semibold">{ques.text}</TableCell>
            <TableCell>{ques.options[0].text}</TableCell>
            <TableCell>{ques.options[1].text}</TableCell>
            <TableCell>{ques.options[2].text}</TableCell>
            <TableCell>{ques.options[3].text}</TableCell>
            <TableCell>{ques.correctOption}</TableCell>
            
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

type QuestionType = {
  _id: string;
  text: string;
  options: OptionType[];
  correctOption: number;
  explanation?: string;
  reference: {
    title?: string;
    link?: string;
  };
  categoryId: string;
  tagId: string[];
};

type OptionType = {
  text: string;
};

export default SubjectTopicData;
