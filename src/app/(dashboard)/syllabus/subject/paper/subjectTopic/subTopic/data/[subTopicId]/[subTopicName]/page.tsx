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
  DialogClose,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUserContext } from "@/context";
import { ChevronRight, Copy, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionType, DocType, VideoType, FileUpload, TagType, BookType, BookSectionType } from "@/types";
import { ToggleGroup } from "@radix-ui/react-toggle-group";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import TagsMenu from "@/components/TagsMenu";

const SubTopicData = () => {
  const [mcqQuestions, setMcqQuestions] = useState<QuestionType[]>([]);
  const [filteredMcqQuestions, setFilteredMcqQuestions] = useState<
    QuestionType[]
  >([]);
  const [search, setSearch] = useState("");

  const [videos, setVideos] = useState<VideoType[]>([]);
  const [docs, setDocs] = useState<DocType[]>([]);

  const router = useRouter();
  const params = useParams();
  const subTopicId = params.subTopicId;
  const subTopicName = decodeURIComponent(params.subTopicName as string);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic/${subTopicId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      const data = response.data.data;
      setMcqQuestions(data.questions);
      setFilteredMcqQuestions(data.questions);

      setVideos(data.subTopic.videos);
      setDocs(data.subTopic.notes);
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
    fetchData();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-4 w-[80vw]">
      <div className="sticky z-50 top-0 bg-white">
        <div className="flex flex-row justify-between items-center p-4">
          <p className="font-bold text-3xl">{subTopicName}</p>
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
            <Button
              onClick={() => {
                router.back();
              }}
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-bold text-gray-600 text-lg no-underline hover:no-underline">
              MCQ Questions
          </AccordionTrigger>
          <AccordionContent className="border p-4 place-items-end">
              <CreateQuestionDialog subTopicId={subTopicId as string} fetchQues={fetchData}/>
              <QuestionsList fetchQuestions={fetchData} questions={filteredMcqQuestions}/>
          </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="font-bold text-gray-600 text-lg no-underline hover:no-underline">
              Notes
            </AccordionTrigger>
            <AccordionContent className="border p-4">
              <div>
                <UploadDocFile fetchData={fetchData} />
                <div>
                  <DocsList docs={docs} fetchData={fetchData} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="font-bold text-gray-600 text-lg no-underline hover:no-underline">
              Video Lectures
            </AccordionTrigger>
            <AccordionContent className="border p-4">
              <div>
                <UploadVideoFile fetchData={fetchData} />
                <div>
                  <VideoList videos={videos} fetchData={fetchData} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          
        </Accordion>
      </div>
    </main>
  );
};

const QuestionsList = ({
  fetchQuestions,
  questions,
}: {
  fetchQuestions: () => void;
  questions: QuestionType[];
}) => {
  return (
    <Table>
      <TableHeader className="bg-gray-50 max-h-[80vh]">
        <TableRow>
          <TableHead className="w-[80px]">S. No.</TableHead>
          <TableHead>Question Text</TableHead>
          <TableHead>A</TableHead>
          <TableHead>B</TableHead>
          <TableHead>C</TableHead>
          <TableHead>D</TableHead>
          <TableHead>Correct</TableHead>
          <TableHead className="text-center">Added</TableHead>
          <TableHead></TableHead>
          <TableHead></TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map((question: QuestionType, index: number) => {
          return (
            <TableRow key={question._id} className="cursor-pointer">
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{question.text}</TableCell>
              <TableCell>{question.options[0].text}</TableCell>
              <TableCell>{question.options[1].text}</TableCell>
              <TableCell>{question.options[2].text}</TableCell>
              <TableCell>{question.options[3].text}</TableCell>
              <TableCell className="text-center">
                {question.correctOption}
              </TableCell>
              <TableCell className="text-xs">
                <div className="bg-gray-100 rounded-lg p-1">
                  {question.createdBy?.name || ""}
                </div>
              </TableCell>
              <TableCell>
                <UpdateQuestionDialog
                  question={question}
                  fetchQues={fetchQuestions}
                />
              </TableCell>
              <TableCell>
                <ViewQuestionDialog question={question} />
              </TableCell>
              <TableCell>
                <DeleteModalButton
                  quesId={question._id}
                  fetchQues={fetchQuestions}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const DeleteModalButton = ({
  quesId,
  fetchQues,
}: {
  quesId: string;
  fetchQues: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user } = useUserContext();

  const deleteTopicHandler = async (quesId: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/question/${quesId}`, {
        withCredentials: true,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem("token")
        }
      });
      toast({
        title: "Question deleted.",
      });
      fetchQues();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-red-500 to-red-700 rounded-md shadow-sm p-2 hover:scale-105 duration-300 transition-all">
        <Trash size={16} color="white" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            question and remove your data from the servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              deleteTopicHandler(quesId);
            }}
            className="bg-gradient-to-b from-red-500 to-red-800 hover:scale-105 transition-all duration-300 font-semibold"
            disabled={loading || user.access == "limited"}
          >
            {user.access == "full" ? (
              loading ? (
                <Spinner />
              ) : (
                "Delete"
              )
            ) : (
              "Access Denied"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CreateQuestionDialog = ({
  fetchQues,
  subTopicId
}: {
  fetchQues: () => void;
  subTopicId: string
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const {user} = useUserContext();


  const [quesText, setQuesText] = useState("");
  const [op1, setOp1] = useState("");
  const [op2, setOp2] = useState("");
  const [op3, setOp3] = useState("");
  const [op4, setOp4] = useState("");
  const [correctOp, setCorrectOp] = useState<number | null>(null);
  const [explanation, setExplanation] = useState("");
  const [refTitle, setRefTitle] = useState("");
  const [link, setLink] = useState("");

  const [quesTextHindi, setQuesTextHindi] = useState("");
  const [op1Hindi, setOp1Hindi] = useState("");
  const [op2Hindi, setOp2Hindi] = useState("");
  const [op3Hindi, setOp3Hindi] = useState("");
  const [op4Hindi, setOp4Hindi] = useState("");
  const [explanationHindi, setExplanationHindi] = useState("");
  const [refTitleHindi, setRefTitleHindi] = useState("");
  const [linkHindi, setLinkHindi] = useState("");

  const { toast } = useToast();

  const removeTag = (id: string) => {
    const updatedTags = selectedTags.filter((tag) => tag._id !== id);
    setSelectedTags(updatedTags);
  };

  const createQuestion = async () => {
    try {
      setLoading(true);
      if (!quesText || !op1 || !op2 || !op3 || !op4 || !correctOp) {
        toast({
          title: "Missing Question Data",
          variant: "destructive",
        });
        return;
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/question/${subTopicId}`,
        {
          text: quesText,
          textHindi: quesTextHindi,
          options: [
            {
              text: op1,
            },
            {
              text: op2,
            },
            {
              text: op3,
            },
            {
              text: op4,
            },
          ],
          optionsHindi: [
            {
              text: op1Hindi,
            },
            {
              text: op2Hindi,
            },
            {
              text: op3Hindi,
            },
            {
              text: op4Hindi,
            },
          ],
          correctOption: (correctOp as number),
          explanation: explanation,
          explanationHindi: explanationHindi,
          reference: {
            title: refTitle,
            link: link,
          },
          referenceHindi: {
            title: refTitleHindi,
            link: linkHindi,
          },
          tagId: selectedTags,
          createdBy: user.id,
          subjectId: user.subjectId,
          subTopicId: subTopicId
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          },
          withCredentials: true,
        }
      );

      toast({
        title: "Question created.",
        description: "The new question has been successfully created.",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      fetchQues();
    }
  };

  const handleClearData = () => {
    setQuesText("");
    setOp1("");
    setOp2("");
    setOp3("");
    setOp4("");
    setCorrectOp(null);
    setExplanation("");
    setRefTitle("");
    setLink("");

    setQuesTextHindi("");
    setOp1Hindi("");
    setOp2Hindi("");
    setOp3Hindi("");
    setOp4Hindi("");
    setExplanationHindi("");
    setRefTitleHindi("");
    setLinkHindi("");

    setSelectedTags([]);
  }

  const handleToggle = (value: string) => {
    console.log(value)
    setCorrectOp(Number(value));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-b from-gray-600 to-gray-900 font-semibold hover:scale-105 transition-all duration-300">
          Create Question
        </Button>
      </DialogTrigger>
      <DialogContent className="md:min-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Create Question</DialogTitle>
          <DialogDescription>
            Enter question details to create a new question.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row gap-4 justify-evenly w-full">
          <div className="w-full">
            <div className="font-semibold bg-gradient-to-b from-gray-400 to-gray-600 text-white p-2">
              English
            </div>
            <QuestionForm
              quesText={quesText}
              op1={op1}
              op2={op2}
              op3={op3}
              op4={op4}
              explanation={explanation}
              refTitle={refTitle}
              link={link}
              setQuesText={setQuesText}
              setOp1={setOp1}
              setOp2={setOp2}
              setOp3={setOp3}
              setOp4={setOp4}
              setExplanation={setExplanation}
              setRefTitle={setRefTitle}
              setLink={setLink}
              fetchQues={fetchQues}
              setLoading={setLoading}
            />
          </div>

          <div className="w-full">
            <div className="font-semibold bg-gradient-to-b from-gray-400 to-gray-600 text-white p-2">
              Hindi
            </div>
            <QuestionFormHindi
              quesText={quesTextHindi}
              op1={op1Hindi}
              op2={op2Hindi}
              op3={op3Hindi}
              op4={op4Hindi}
              explanation={explanationHindi}
              refTitle={refTitleHindi}
              link={linkHindi}
              setQuesText={setQuesTextHindi}
              setOp1={setOp1Hindi}
              setOp2={setOp2Hindi}
              setOp3={setOp3Hindi}
              setOp4={setOp4Hindi}
              setExplanation={setExplanationHindi}
              setRefTitle={setRefTitleHindi}
              setLink={setLinkHindi}
              fetchQues={fetchQues}
              setLoading={setLoading}
            />
          </div>
        </div>

        <div className="flex flex-row gap-2">
          {/* Correct Option */}
          <div className="flex flex-row gap-8 items-center border p-2">
            <Label htmlFor="correct" className="text-nowrap">
              Correct Option*
            </Label>

            <ToggleGroup type="single" onValueChange={handleToggle}>
              <ToggleGroupItem className="data-[state=on]:bg-black data-[state=on]:text-white" value="1" aria-label="Toggle 1">
                1
              </ToggleGroupItem>
              <ToggleGroupItem className="data-[state=on]:bg-black data-[state=on]:text-white" value="2" aria-label="Toggle 2">
                2
              </ToggleGroupItem>
              <ToggleGroupItem className="data-[state=on]:bg-black data-[state=on]:text-white" value="3" aria-label="Toggle 3">
                3
              </ToggleGroupItem>
              <ToggleGroupItem className="data-[state=on]:bg-black data-[state=on]:text-white" value="4" aria-label="Toggle 4">
                4
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Tag Menu */}
          <div className="flex flex-row gap-4 p-2 w-full items-center border">
            <Label htmlFor="tags" className="text-center grid-cols-1">
              Tags
            </Label>
            
            <div className="w-full flex flex-row gap-2 items-center">
              <TagsMenu
                questionTags={[]}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
              <div className="border rounded-md w-full flex flex-row h-12 gap-2 p-1 overflow-x-scroll">
                {selectedTags.map((tag: TagType) => {
                  return (
                    <div
                      key={tag._id}
                      className="bg-gray-100 w-fit text-nowrap p-2 text-sm flex flex-row items-center gap-4 justify-between rounded-md"
                    >
                      <div className="text-right">{tag.name}</div>
                      <div
                        onClick={() => {
                          removeTag(tag._id);
                        }}
                        className="cursor-pointer"
                      >
                        x
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="font-semibold bg-gradient-to-b from-gray-500 to-gray-900 hover:scale-105 transition-all duration-300 text-white p-2"
            type="submit"
            onClick={createQuestion}
            disabled={loading}
          >
            {loading ? <Spinner /> : "Create Question"}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleClearData} variant="outline">
              Clear Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const QuestionForm = ({
  quesText,
  op1,
  op2,
  op3,
  op4,
  explanation,
  refTitle,
  link,
  setQuesText,
  setOp1,
  setOp2,
  setOp3,
  setOp4,
  setExplanation,
  setRefTitle,
  setLink,
}: {
  quesText: string;
  op1: string;
  op2: string;
  op3: string;
  op4: string;
  explanation: string;
  refTitle: string;
  link: string;
  fetchQues: () => void;
  setLoading: (x: boolean) => void;
  setQuesText: (x: string) => void;
  setOp1: (x: string) => void;
  setOp2: (x: string) => void;
  setOp3: (x: string) => void;
  setOp4: (x: string) => void;
  setExplanation: (x: string) => void;
  setRefTitle: (x: string) => void;
  setLink: (x: string) => void;
}) => {

  const [books, setBooks] = useState<BookType[]>([]);
  const [sections, setSections] = useState<BookSectionType[]>([]);

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [chapter, setChapter] = useState<string>("");
  const [shloka, setShloka] = useState<string>("");

  useEffect(()=>{
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/books`,
          {
            withCredentials: true,
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        setBooks(response.data.data);
      } catch (error) {
        console.log("Error fetching books:", error);
      }
    };

    const fetchSections = async (bookId: string) => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/bookSections/book/${bookId}`,
          {
            withCredentials: true,
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        setSections(response.data.data);
      } catch (error) {
        console.log("Error fetching sections:", error);
      }
    };

    fetchBooks();
    fetchSections(selectedBookId || '');
  }, [selectedBookId]);
  

  useEffect(()=>{
    const bookName = books.find((book) => book._id === selectedBookId)?.name || "";
    const sectionName = sections.find((section) => section._id === selectedSectionId)?.name || "";
    const ref = `${bookName} - ${sectionName} - ${chapter} - ${shloka}`;
    setRefTitle(ref);
  }, [selectedSectionId, selectedBookId, chapter, shloka, setRefTitle, books, sections]);

  return (
    <div className="flex flex-col gap-2 w-full p-4 border">
      <div className="grid grid-cols-5 items-center gap-4">
        <Label htmlFor="name" className="text-center">
          Question*
        </Label>
        <Textarea
          id="name"
          value={quesText}
          className="col-span-4"
          onChange={(e) => {
            setQuesText(e.target.value);
          }}
        />
      </div>
      <div className="grid grid-cols-1 gap-1">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="option1" className="text-center">
            Option 1*
          </Label>
          <Input
            id="option1"
            value={op1}
            className="col-span-3"
            onChange={(e) => {
              setOp1(e.target.value);
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="option2" className="text-center">
            Option 2*
          </Label>
          <Input
            id="option2"
            className="col-span-3"
            value={op2}
            onChange={(e) => {
              setOp2(e.target.value);
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="option3" className="text-center">
            Option 3*
          </Label>
          <Input
            id="option3"
            className="col-span-3"
            value={op3}
            onChange={(e) => {
              setOp3(e.target.value);
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="option4" className="text-center">
            Option 4*
          </Label>
          <Input
            id="option4"
            value={op4}
            className="col-span-3"
            onChange={(e) => {
              setOp4(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-5 items-center gap-4">
        <Label htmlFor="explanation" className="text-center">
          Explanation <span className="text-xs text-gray-500">Optional</span>
        </Label>
        <Textarea
          id="explanation"
          value={explanation}
          className="col-span-4"
          onChange={(e) => {
            setExplanation(e.target.value);
          }}
        />
      </div>
      <div className="grid grid-cols-5 items-center gap-4">
        <Label htmlFor="reference-title" className="text-center">
          Reference <span className="text-xs text-gray-500">Optional</span>
        </Label>
        <div className="col-span-4 flex flex-row gap-2 items-center">
          <Select value={selectedBookId || ""} onValueChange={(value) => {
            setSelectedBookId(value);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Book" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {books.map((book) => (
                  <SelectItem
                    key={book._id}
                    value={book._id}
                  >
                    {book.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={selectedSectionId || ""} onValueChange={(value) => {
            setSelectedSectionId(value);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {sections.map((section) => (
                  <SelectItem
                    key={section._id}
                    value={section._id}
                  >
                    {section.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Input
            placeholder="Chapter"
            value={chapter}
            onChange={(e) => {
              setChapter(e.target.value);
            }}
            className="w-full"
          />

          <Input
            placeholder="Shloka"
            value={shloka}
            onChange={(e) => {
              setShloka(e.target.value);
            }}
            className="w-full"
          />

        </div>
        <Input
          id="reference-title"
          className="col-span-4"
          value={refTitle}
          onChange={(e) => {
            setRefTitle(e.target.value);
          }}
        />
      </div>
      <div className="grid grid-cols-5 items-center gap-4">
        <Label htmlFor="reference-link" className="text-center">
          Link <span className="text-xs block text-gray-500">Optional</span>
        </Label>
        <Input
          id="reference-link"
          className="col-span-4"
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
          }}
        />
      </div>
    </div>
  );
};

const QuestionFormHindi = ({
  quesText,
  op1,
  op2,
  op3,
  op4,
  explanation,
  refTitle,
  link,
  setQuesText,
  setOp1,
  setOp2,
  setOp3,
  setOp4,
  setExplanation,
  setRefTitle,
  setLink,
}: {
  quesText: string;
  op1: string;
  op2: string;
  op3: string;
  op4: string;
  explanation: string;
  refTitle: string;
  link: string;
  fetchQues: () => void;
  setLoading: (x: boolean) => void;
  setQuesText: (x: string) => void;
  setOp1: (x: string) => void;
  setOp2: (x: string) => void;
  setOp3: (x: string) => void;
  setOp4: (x: string) => void;
  setExplanation: (x: string) => void;
  setRefTitle: (x: string) => void;
  setLink: (x: string) => void;
}) => {

const [books, setBooks] = useState<BookType[]>([]);
  const [sections, setSections] = useState<BookSectionType[]>([]);

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [chapter, setChapter] = useState<string>("");
  const [shloka, setShloka] = useState<string>("");

  useEffect(()=>{
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/books`,
          {
            withCredentials: true,
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        setBooks(response.data.data);
      } catch (error) {
        console.log("Error fetching books:", error);
      }
    };

    const fetchSections = async (bookId: string) => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/bookSections/book/${bookId}`,
          {
            withCredentials: true,
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        setSections(response.data.data);
      } catch (error) {
        console.log("Error fetching sections:", error);
      }
    };

    fetchBooks();
    fetchSections(selectedBookId || '');
  }, [selectedBookId]);
  

  useEffect(()=>{
    const bookName = books.find((book) => book._id === selectedBookId)?.name || "";
    const sectionName = sections.find((section) => section._id === selectedSectionId)?.name || "";
    const ref = `${bookName} - ${sectionName} - ${chapter} - ${shloka}`;
    setRefTitle(ref);
  }, [selectedSectionId, selectedBookId, chapter, shloka, setRefTitle, books, sections]);


  return (
    <div className="flex flex-col gap-2 w-full p-4 border">
      <div className="grid grid-cols-5 items-center gap-4">
        <Label htmlFor="name" className="text-center">
          Question*
        </Label>
        <Textarea
          id="name"
          value={quesText}
          className="col-span-4"
          onChange={(e) => {
            setQuesText(e.target.value);
          }}
        />
      </div>
      <div className="grid grid-cols-1 gap-1">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="option1" className="text-center">
            Option 1*
          </Label>
          <Input
            id="option1"
            value={op1}
            className="col-span-3"
            onChange={(e) => {
              setOp1(e.target.value);
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="option2" className="text-center">
            Option 2*
          </Label>
          <Input
            id="option2"
            className="col-span-3"
            value={op2}
            onChange={(e) => {
              setOp2(e.target.value);
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="option3" className="text-center">
            Option 3*
          </Label>
          <Input
            id="option3"
            className="col-span-3"
            value={op3}
            onChange={(e) => {
              setOp3(e.target.value);
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="option4" className="text-center">
            Option 4*
          </Label>
          <Input
            id="option4"
            value={op4}
            className="col-span-3"
            onChange={(e) => {
              setOp4(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-5 items-center gap-4">
        <Label htmlFor="explanation" className="text-center">
          Explanation <span className="text-xs text-gray-500">Optional</span>
        </Label>
        <Textarea
          id="explanation"
          value={explanation}
          className="col-span-4"
          onChange={(e) => {
            setExplanation(e.target.value);
          }}
        />
      </div>
      <div className="grid grid-cols-5 items-center gap-4">
        <Label htmlFor="reference-title" className="text-center">
          Reference <span className="text-xs text-gray-500">Optional</span>
        </Label>
        <div className="col-span-4 flex flex-row gap-2 items-center">
          <Select value={selectedBookId || ""} onValueChange={(value) => {
            setSelectedBookId(value);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Book" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {books.map((book) => (
                  <SelectItem
                    key={book._id}
                    value={book._id}
                  >
                    {book.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={selectedSectionId || ""} onValueChange={(value) => {
            setSelectedSectionId(value);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {sections.map((section) => (
                  <SelectItem
                    key={section._id}
                    value={section._id}
                  >
                    {section.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Input
            placeholder="Chapter"
            value={chapter}
            onChange={(e) => {
              setChapter(e.target.value);
            }}
            className="w-full"
          />

          <Input
            placeholder="Shloka"
            value={shloka}
            onChange={(e) => {
              setShloka(e.target.value);
            }}
            className="w-full"
          />

        </div>
        <Input
          id="reference-title"
          className="col-span-4"
          value={refTitle}
          onChange={(e) => {
            setRefTitle(e.target.value);
          }}
        />
      </div>
      <div className="grid grid-cols-5 items-center gap-4">
        <Label htmlFor="reference-link" className="text-center">
          Link <span className="text-xs block text-gray-500">Optional</span>
        </Label>
        <Input
          id="reference-link"
          className="col-span-4"
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
          }}
        />
      </div>
    </div>
  );
};

const UpdateQuestionDialog = ({
  question,
  fetchQues,
}: {
  question: QuestionType;
  fetchQues: () => void;
}) => {
  const [selectedTags, setSelectedTags] = useState<TagType[]>(question.tagId);

  const [quesText, setQuesText] = useState(question.text);
  const [op1, setOp1] = useState(question.options[0].text);
  const [op2, setOp2] = useState(question.options[1].text);
  const [op3, setOp3] = useState(question.options[2].text);
  const [op4, setOp4] = useState(question.options[3].text);
  const [correctOp, setCorrectOp] = useState<number | null>(null);
  const [explanation, setExplanation] = useState(question.explanation);
  const [refTitle, setRefTitle] = useState(question.reference.title);
  const [link, setLink] = useState(question.reference.link);

  const [quesTextHindi, setQuesTextHindi] = useState(question.textHindi);
  const [op1Hindi, setOp1Hindi] = useState(question.optionsHindi[0]?.text);
  const [op2Hindi, setOp2Hindi] = useState(question.optionsHindi[1]?.text);
  const [op3Hindi, setOp3Hindi] = useState(question.optionsHindi[2]?.text);
  const [op4Hindi, setOp4Hindi] = useState(question.optionsHindi[3]?.text);

  const [explanationHindi, setExplanationHindi] = useState(
    question.explanationHindi
  );
  const [refTitleHindi, setRefTitleHindi] = useState(
    question.referenceHindi?.title
  );
  const [linkHindi, setLinkHindi] = useState(question.referenceHindi?.link);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);


  const removeTag = (id: string) => {
    const updatedTags = selectedTags.filter((tag) => tag._id != id);
    setSelectedTags(updatedTags);
  };

  const updateQuestion = async () => {
    try {
      setLoading(true);
      if (!quesText || !op1 || !op2 || !op3 || !op4 || !correctOp) {
        toast({
          title: "Invalid Question Data",
          variant: "destructive",
        });
      }
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/quiz/question/${question._id}`,
        {
          text: quesText,
          textHindi: quesTextHindi,
          options: [
            {
              text: op1,
            },
            {
              text: op2,
            },
            {
              text: op3,
            },
            {
              text: op4,
            },
          ],
          optionsHindi: [
            {
              text: op1Hindi,
            },
            {
              text: op2Hindi,
            },
            {
              text: op3Hindi,
            },
            {
              text: op4Hindi,
            },
          ],
          correctOption: correctOp
            ? (correctOp as number)
            : question.correctOption,
          explanation: explanation,
          explanationHindi: explanationHindi,
          reference: {
            title: refTitle,
            link: link,
          },
          referencHindi: {
            title: refTitleHindi,
            link: linkHindi,
          },
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

      toast({
        title: "Question updated.",
        description: "The question has been successfully updated.",
      });
    } catch (error) {
      console.log(error);
    } finally {
      fetchQues();
      setLoading(false);
    }
  };

  const handleToggle = (value: string) => {
    setCorrectOp(Number(value) === correctOp ? null : Number(value));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-b from-gray-600 to-gray-900 px-4 py-1 hover:scale-105 transition-all duration-300">
          Edit <ChevronRight size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription className="">
              Update question
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row gap-4 justify-evenly w-full">
          <div className="w-full">
            <div className="font-semibold bg-gradient-to-b from-gray-400 to-gray-600 text-white p-2">
              English
            </div>
            <QuestionForm
              quesText={quesText}
              op1={op1}
              op2={op2}
              op3={op3}
              op4={op4}
              explanation={explanation as string}
              refTitle={refTitle as string}
              link={link as string}
              setQuesText={setQuesText}
              setOp1={setOp1}
              setOp2={setOp2}
              setOp3={setOp3}
              setOp4={setOp4}
              setExplanation={setExplanation}
              setRefTitle={setRefTitle}
              setLink={setLink}
              fetchQues={fetchQues}
              setLoading={setLoading}
            />
          </div>

          <div className="w-full">
            <div className="font-semibold bg-gradient-to-b from-gray-400 to-gray-600 text-white p-2">
              Hindi
            </div>
            <QuestionFormHindi
              quesText={quesTextHindi}
              op1={op1Hindi}
              op2={op2Hindi}
              op3={op3Hindi}
              op4={op4Hindi}
              explanation={explanationHindi as string}
              refTitle={refTitleHindi as string}
              link={linkHindi as string}
              setQuesText={setQuesTextHindi}
              setOp1={setOp1Hindi}
              setOp2={setOp2Hindi}
              setOp3={setOp3Hindi}
              setOp4={setOp4Hindi}
              setExplanation={setExplanationHindi}
              setRefTitle={setRefTitleHindi}
              setLink={setLinkHindi}
              fetchQues={fetchQues}
              setLoading={setLoading}
            />
          </div>
        </div>

        <div className="flex flex-row gap-2">
          {/* Correct Option */}
          <div className="flex flex-row gap-8 items-center border p-2">
            <Label htmlFor="correct" className="text-nowrap">
              Correct Option*
            </Label>

            <ToggleGroup type="single" onValueChange={handleToggle}>
              <ToggleGroupItem className="data-[state=on]:bg-black data-[state=on]:text-white" value="1" aria-label="Toggle 1">
                1
              </ToggleGroupItem>
              <ToggleGroupItem className="data-[state=on]:bg-black data-[state=on]:text-white" value="2" aria-label="Toggle 2">
                2
              </ToggleGroupItem>
              <ToggleGroupItem className="data-[state=on]:bg-black data-[state=on]:text-white" value="3" aria-label="Toggle 3">
                3
              </ToggleGroupItem>
              <ToggleGroupItem className="data-[state=on]:bg-black data-[state=on]:text-white" value="4" aria-label="Toggle 4">
                4
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Tag Menu */}
          <div className="flex flex-row gap-4 p-2 w-full items-center border">
            <Label htmlFor="tags" className="text-center grid-cols-1">
              Tags
            </Label>

            <div className="w-full flex flex-row gap-2 items-center">
              <TagsMenu
                questionTags={[]}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
              <div className="border rounded-md w-full flex flex-row h-12 gap-2 p-1 overflow-x-scroll">
                {
                  selectedTags.map((tag: TagType) => {
                    return (
                      <div
                        key={tag._id}
                        className="bg-gray-100 w-fit text-nowrap p-2 text-sm flex flex-row items-center gap-4 justify-between rounded-md"
                      >
                        <div className="text-right">{tag.name}</div>
                        <div
                          onClick={() => {
                            removeTag(tag._id);
                          }}
                          className="cursor-pointer"
                        >
                          x
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" onClick={updateQuestion} disabled={loading}>
            {loading ? <Spinner /> : "Update Question"}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ViewQuestionDialog = ({ question }: { question: QuestionType }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Info</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Question Card</DialogTitle>
          <DialogDescription>View the question details here.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="font-semibold">English: {question.text}</div>
          <div>
            {question.options.map((option, index) => (
              <div key={index}>
                {index + 1}. {option.text}
              </div>
            ))}
            <div className="font-semibold">
              Hindi: {question.textHindi || "N/A"}
            </div>
            {question.optionsHindi.map((option, index) => (
              <div key={index}>
                {index + 1}. {option.text}
              </div>
            ))}
          </div>
          <div>
            Correct:{" "}
            <span className="text-green-600">
              {question.options[question.correctOption]?.text || "N/A"}
            </span>
          </div>
          <div className="flex flex-col bg-gray-50 rounded-lg p-4">
            <p className="font-semibold">Explanation</p>
            <div>- {question.explanation || "N/A"}</div>
            <div>- {question.explanationHindi || "N/A"}</div>
          </div>
          <div className="flex flex-col bg-gray-50 rounded-lg p-4">
            <p className="font-semibold">Reference</p>
            <div>{question.reference.title || "N/A"}</div>
            <div className="text-blue-800">
              - {question.reference.link || "N/A"}
            </div>
            <div>{question.referenceHindi?.title || "N/A"}</div>
            <div className="text-blue-800">
              - {question.referenceHindi?.link || "N/A"}
            </div>
          </div>
          <div className="flex flex-col bg-gray-50 rounded-lg">
            <p className="font-semibold">Tags</p>
            <div className="flex flex-row overflow-x-scroll w-84 p-1 gap-2 rounded-lg border">
              {question.tagId.map((tag: TagType) => (
                <div
                  className="bg-gray-100 rounded-lg p-2 text-nowrap"
                  key={tag._id}
                >
                  {tag.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


const UploadVideoFile = ({ fetchData }: { fetchData: () => void }) => {
  const [fileData, setFileData] = useState<FileUpload | null>(null);
  const [thumbnailData, setThumbnailData] = useState<FileUpload | null>(null);
  const [videoName, setVideoName] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<string>("eng");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileData({
        fileName: file.name,
        fileType: file.type,
        fileDesc: videoDesc,
        file,
      });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailData({
        fileName: file.name,
        fileType: file.type,
        fileDesc: videoDesc,
        file,
      });
    }
  };

  const { user } = useUserContext();
  const params = useParams();
  const subTopicId = params.subTopicId;

  const handleUpload = async () => {
    if (!fileData || !videoDesc || !videoName)
      return alert("File and video details are required");

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/aws/generate-presigned-url`,
        {
          fileName: fileData.fileName,
          fileType: fileData.fileType,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          withCredentials: true,
        }
      );

      const { url, key } = res.data;

      // Upload the file to S3
      await axios.put(url, fileData.file, {
        headers: {
          "Content-Type": fileData.fileType,
        },
      });

      // Upload the thumbnail if provided
      let thumbnailKey = null;
      if (thumbnailData) {
        const thumbRes = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/aws/generate-presigned-url`,
          {
            fileName: thumbnailData.fileName,
            fileType: thumbnailData.fileType,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
            withCredentials: true,
          }
        );

        const { url: thumbUrl, key: thumbKey } = thumbRes.data;

        // Upload the thumbnail to S3
        await axios.put(thumbUrl, thumbnailData.file, {
          headers: {
            "Content-Type": thumbnailData.fileType,
          },
        });

        thumbnailKey = thumbKey;
      }

      toast({
        title: "File uploaded",
        description: `File uploaded with key: ${key}`,
      });

      // Save key and topic in the backend
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic/video/upload/${subTopicId}`,
        {
          name: videoName,
          description: videoDesc,
          createdBy: user.id,
          thumbnailKey: thumbnailKey,
          key: key,
          language: lang,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          withCredentials: true,
        }
      );

      toast({
        title: "Video stored",
      });

      fetchData();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm text-nowrap font-semibold hover:scale-105 duration-300 transition-all">
        Upload Video Lecture
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Video Lecture {"(mp4)"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={videoName}
            onChange={(e) => {
              setVideoName(e.target.value);
            }}
            type="text"
            placeholder="Video Name"
          ></Input>
          <Textarea
            value={videoDesc}
            onChange={(e) => {
              setVideoDesc(e.target.value);
            }}
            rows={2}
            placeholder="Video Description"
          ></Textarea>
          <Label>Video File</Label>
          <Input type="file" onChange={handleFileChange}></Input>
          <Label>Thumbnail Image</Label>
          <Input type="file" onChange={handleThumbnailChange}></Input>

          <Label>Language</Label>
          <Select onValueChange={setLang} value={lang}>
            <SelectGroup>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hi">English</SelectItem>
                <SelectItem value="eng">Hindi</SelectItem>
              </SelectContent>
            </SelectGroup>
          </Select>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleUpload}
            className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm font-semibold hover:scale-105 duration-300 transition-all"
          >
            {loading ? <Spinner /> : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const VideoList = ({
  videos,
  fetchData,
}: {
  videos: VideoType[];
  fetchData: () => void;
}) => {
  const [show, setShow] = useState(false);
  return (
    <Table className="w-full mt-4">
      <TableHeader className="bg-gray-100">
        <TableRow>
          <TableHead className="w-[100px]">S. No.</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>URL</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {videos.map((video: VideoType, index: number) => (
          <TableRow key={index} className="cursor-pointer">
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-semibold">{video.name}</TableCell>
            <TableCell>{video.description}</TableCell>
            <TableCell>
              <div className="text-xs p-1 bg-gray-100 rounded-full w-fit">
                {video.createdBy.name}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-row gap-2 items-center">
                <div
                  className="hover:scale-105 transition-all duration-300 bg-gray-200 p-2 rounded"
                  onClick={() => navigator.clipboard.writeText(video.url)}
                >
                  <Copy size={16} className="text-gray-700" />
                </div>
                <div
                  onClick={() => {
                    setShow(!show);
                  }}
                  className="hover:scale-105 transition-all duration-300 bg-gray-200 p-2 rounded"
                >
                  Preview
                  <VideoPreview show={show} setShow={setShow} url={video.url} />
                </div>
                <div className="hover:scale-105 transition-all duration-300">
                  <DeleteVideoModalButton
                    fetchData={fetchData}
                    videoId={video._id}
                    vidKey={video.key}
                  />
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const UploadDocFile = ({ fetchData }: { fetchData: () => void }) => {
  const [fileData, setFileData] = useState<FileUpload | null>(null);
  const [thumbnailData, setThumbnailData] = useState<FileUpload | null>(null);
  const [docName, setDocName] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("eng");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileData({
        fileName: file.name,
        fileType: file.type,
        fileDesc: docDesc,
        file,
      });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailData({
        fileName: file.name,
        fileType: file.type,
        fileDesc: docDesc,
        file,
      });
    }
  };

  const { user } = useUserContext();
  const params = useParams();
  const subTopicId = params.subTopicId;

  const handleUpload = async () => {
    if (!fileData || !docDesc || !docName)
      return alert("File and document details are required");

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/aws/generate-presigned-url`,
        {
          fileName: fileData.fileName,
          fileType: fileData.fileType,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          withCredentials: true,
        }
      );

      const { url, key } = res.data;

      // Upload the file to S3
      await axios.put(url, fileData.file, {
        headers: {
          "Content-Type": fileData.fileType,
        },
      });

      let thumbnailKey = null;
      if (thumbnailData) {
        const thumbRes = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/aws/generate-presigned-url`,
          {
            fileName: thumbnailData.fileName,
            fileType: thumbnailData.fileType,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
            withCredentials: true,
          }
        );

        const { url: thumbUrl, key: thumbKey } = thumbRes.data;

        // Upload the thumbnail to S3
        await axios.put(thumbUrl, thumbnailData.file, {
          headers: { "Content-Type": thumbnailData.fileType },
        });

        thumbnailKey = thumbKey;
      }

      toast({
        title: "File uploaded",
        description: `File uploaded with key: ${key}`,
      });

      // Save key and topic in the backend
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic/docs/upload/${subTopicId}`,
        {
          name: docName,
          description: docDesc,
          createdBy: user.id,
          key: key,
          thumbnailKey: thumbnailKey,
          subTopicId: subTopicId,
          language: lang,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          withCredentials: true,
        }
      );

      toast({
        title: "Video stored",
      });

      fetchData();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    }

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm text-nowrap font-semibold hover:scale-105 duration-300 transition-all">
        Upload Notes File
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Notes File {"(pdf)"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={docName}
            onChange={(e) => {
              setDocName(e.target.value);
            }}
            type="text"
            placeholder="Doc Name"
          ></Input>
          <Textarea
            value={docDesc}
            onChange={(e) => {
              setDocDesc(e.target.value);
            }}
            rows={2}
            placeholder="Doc Description"
          ></Textarea>
          <Label>Notes PDF</Label>
          <Input type="file" onChange={handleFileChange}></Input>
          <Label>Thumbnail Image</Label>
          <Input type="file" onChange={handleThumbnailChange} />

          <Label>Language</Label>
          <Select onValueChange={setLang} value={lang}>
            <SelectGroup>
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hi">English</SelectItem>
                <SelectItem value="eng">Hindi</SelectItem>
              </SelectContent>
            </SelectGroup>
          </Select>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleUpload}
            className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm font-semibold hover:scale-105 duration-300 transition-all"
          >
            {loading ? <Spinner /> : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DocsList = ({
  docs,
  fetchData,
}: {
  docs: DocType[];
  fetchData: () => void;
}) => {
  const [show, setShow] = useState(false);
  return (
    <Table className="w-full mt-4">
      <TableHeader className="bg-gray-100">
        <TableRow>
          <TableHead className="w-[100px]">S. No.</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>URL</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {docs.map((doc: DocType, index: number) => (
          <TableRow key={index} className="cursor-pointer">
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-semibold">{doc.name}</TableCell>
            <TableCell>{doc.description}</TableCell>
            <TableCell>
              <div className="text-xs p-1 bg-gray-100 rounded-full w-fit">
                {doc.createdBy.name}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-row gap-2 items-center">
                <div
                  className="hover:scale-105 transition-all duration-300 bg-gray-200 p-2 rounded"
                  onClick={() => navigator.clipboard.writeText(doc.url)}
                >
                  <Copy size={16} className="text-gray-700" />
                </div>
                <div
                  onClick={() => {
                    setShow(!show);
                  }}
                  className="hover:scale-105 transition-all duration-300 bg-gray-200 p-2 rounded"
                >
                  Preview
                  <VideoPreview url={doc.url} show={show} setShow={setShow} />
                </div>
                <div className="hover:scale-105 transition-all duration-300">
                  <DeleteDocModalButton
                    docId={doc._id}
                    docKey={doc.key}
                    fetchData={fetchData}
                  />
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const DeleteVideoModalButton = ({
  vidKey,
  videoId,
  fetchData,
}: {
  vidKey: string;
  videoId: string;
  fetchData: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const subTopicId = params.subTopicId;
  const { user } = useUserContext();

  const deleteHandler = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/aws/delete-resource/${vidKey}`,
        {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic/video/delete/${subTopicId}/${videoId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      toast({
        title: "Video lecture deleted.",
        description: vidKey,
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
      <DialogTrigger className="bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 text-sm">
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
              deleteHandler();
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

const DeleteDocModalButton = ({
  docKey,
  docId,
  fetchData,
}: {
  docKey: string;
  docId: string;
  fetchData: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const subTopicId = params.subTopicId;
  const { user } = useUserContext();

  const deleteHandler = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/aws/delete-resource/${docKey}`,
        {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic/docs/delete/${subTopicId}/${docId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      toast({
        title: "Document deleted.",
        description: docKey,
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
      <DialogTrigger className="bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 text-sm">
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
              deleteHandler();
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

const VideoPreview = ({
  url,
  show,
  setShow,
}: {
  url: string;
  show: boolean;
  setShow: (x: boolean) => void;
}) => {
  return (
    <div className={cn("hidden bg-transparent", { block: show })}>
      <iframe src={url} />
      <Button
        onClick={() => setShow(!show)}
        className="mt-2 bg-gradient-to-b from-gray-500 to-gray-900 font-semibold"
      >
        Close
      </Button>
    </div>
  );
};

export default SubTopicData;
