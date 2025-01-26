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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

const Subject = () => {
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<SubjectType[]>([]);
  const [search, setSearch] = useState("");

  const params = useParams();
  const year = params.year;

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
          </div>
        </div>
      </div>
      <section className="min-w-[80vw] max-h-[80vh] overflow-y-scroll border">
        <SubjectList subjects={filteredSubjects} fetchTopics={fetchSubjects} />
      </section>
    </main>
  );
};

type SubjectType = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

const SubjectList = ({
  subjects,
}: {
  subjects: SubjectType[];
  fetchTopics: () => void;
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default Subject;
