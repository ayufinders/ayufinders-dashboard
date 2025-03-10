"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChevronRight, Trash } from "lucide-react";
import Spinner from "@/components/Spinner";
import { useUserContext } from "@/context";
import { QuestionType, TagType } from "@/types";
import TagsMenu from "@/components/TagsMenu";

const TopicQuestions = () => {
  const params = useParams();
  const categoryId = params.categoryId;
  const categoryNameEncoded = params.categoryName;
  const categoryName = decodeURIComponent(categoryNameEncoded as string);

  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [filteredQues, setFilteredQues] = useState<QuestionType[]>([]);
  useEffect(() => {
    const filteredQues = questions.filter((ques: QuestionType) =>
      ques.text.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredQues(filteredQues);
  }, [search, questions]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/quiz/${categoryId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      const questions = response.data.quiz;
      setQuestions(questions);
      setFilteredQues(questions);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const router = useRouter()

  if (!categoryId) return <>No quiz found.</>;

  return (
    <main className="p-4">
      <div className="sticky top-0">
        <div className="flex flex-row items-center p-4 justify-between bg-white">
          <div>
            <p className="text-3xl font-bold">{categoryName}</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div>
              <Input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                placeholder="Search Question..."
              ></Input>
            </div>
            <CreateQuestionDialog
              fetchQues={fetchQuestions}
              categoryId={categoryId as string}
            />
            <Button
            onClick={()=>{
              router.back()
            }}
            >Back</Button>
          </div>
        </div>
      </div>

      <section className="max-h-[80vh] min-w-[80vw] overflow-y-scroll border">
        <QuestionsList
          questions={filteredQues}
          fetchQuestions={fetchQuestions}
        />
      </section>
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
                {question.correctOption + 1}
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
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz/${quesId}`, {
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
  categoryId,
  fetchQues,
}: {
  categoryId: string;
  fetchQues: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);

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

  const { user } = useUserContext();

  const createQuestion = async () => {
    try {
      setLoading(true);
      if (!quesText || !op1 || !op2 || !op3 || !op4 || !correctOp) {
        toast({
          title: "Invalid Question Data",
          variant: "destructive",
        });
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/quiz/${categoryId}`,
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
          correctOption: (correctOp as number) - 1,
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
          categoryId: categoryId,
          tagId: selectedTags,
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

      toast({
        title: "Question created.",
        description: "The new question has been successfully created.",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setQuesText("");
      setQuesTextHindi("");
      setOp1("");
      setOp2("");
      setOp3("");
      setOp4("");
      setOp1Hindi("");
      setOp2Hindi("");
      setOp3Hindi("");
      setOp4Hindi("");
      setCorrectOp(null);
      setExplanation("");
      setExplanationHindi("");
      setLink("");
      setLinkHindi("");
      setRefTitle("");
      setRefTitleHindi("");
      setSelectedTags([]);
      fetchQues();
    }
  };

  const handleToggle = (value: string) => {
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
              <ToggleGroupItem value="1" aria-label="Toggle 1">
                1
              </ToggleGroupItem>
              <ToggleGroupItem value="2" aria-label="Toggle 2">
                2
              </ToggleGroupItem>
              <ToggleGroupItem value="3" aria-label="Toggle 3">
                3
              </ToggleGroupItem>
              <ToggleGroupItem value="4" aria-label="Toggle 4">
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
            ? (correctOp as number) - 1
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
              <ToggleGroupItem value="1" aria-label="Toggle 1">
                1
              </ToggleGroupItem>
              <ToggleGroupItem value="2" aria-label="Toggle 2">
                2
              </ToggleGroupItem>
              <ToggleGroupItem value="3" aria-label="Toggle 3">
                3
              </ToggleGroupItem>
              <ToggleGroupItem value="4" aria-label="Toggle 4">
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

export default TopicQuestions;
