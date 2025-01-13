"use client"
import React, {useEffect, useState} from 'react'
import { useParams } from "next/navigation";
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChevronRight, Trash } from 'lucide-react';
import Spinner from '@/components/Spinner';
import { useUserContext } from '@/context';

const TopicQuestions = () => {
  const params = useParams()
  const categoryId = params.categoryId
  const categoryNameEncoded = params.categoryName
  const categoryName = decodeURIComponent(categoryNameEncoded as string);
  
  const [search, setSearch] = useState("")
  const [questions, setQuestions] = useState<QuestionType[]>([])
  const [filteredQues, setFilteredQues] = useState<QuestionType[]>([])
  useEffect(()=>{
    const filteredQues = questions.filter((ques: QuestionType) => ques.text.toLowerCase().includes(search.toLowerCase()))
    setFilteredQues(filteredQues)
  }, [search, questions])

  
  const fetchQuestions = async () => {
    try{
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz/${categoryId}`)
      const questions = response.data.quiz
      setQuestions(questions)
      setFilteredQues(questions)
    } catch(error){
      console.log(error)
    }
  }

  useEffect(()=>{
    fetchQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if(!categoryId) return <>No quiz found.</>

  return (
    <main className='p-4'>
      <div className='sticky top-0 z-50'>
        <div className='flex flex-row items-center p-4 justify-between bg-white'>
            <div>
              <p className='text-3xl font-bold'>{categoryName}</p>
            </div>
            <div className='flex flex-row items-center gap-2'>
              <div>
                <Input onChange={(e)=>{setSearch(e.target.value)}} placeholder='Search Question...'></Input>
              </div>
              <CreateQuestionDialog fetchQues={fetchQuestions} categoryId={categoryId as string}/>
            </div>
          </div>
      </div>
        
      <section className='max-h-[75vh] min-w-[80vw] overflow-y-scroll border'>
        <QuestionsList questions={filteredQues} fetchQuestions={fetchQuestions}/>
      </section>
    </main>
  );
};

const QuestionsList = ({fetchQuestions, questions}: {fetchQuestions: ()=>void, questions: QuestionType[]}) => {
  
  return <Table>
  <TableHeader className='bg-gray-50'>
    <TableRow>
      <TableHead className='w-[80px]'>S. No.</TableHead>
      <TableHead>Question Text</TableHead>
      <TableHead>A</TableHead>
      <TableHead>B</TableHead>
      <TableHead>C</TableHead>
      <TableHead>D</TableHead>
      <TableHead>Correct</TableHead>
      <TableHead className='text-center'>Added</TableHead>
      <TableHead></TableHead>
      <TableHead></TableHead>
      <TableHead></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {
      questions.map((question: QuestionType, index: number) => {
        return <TableRow key={question._id} className='cursor-pointer'>
          <TableCell className='font-medium'>{index + 1}</TableCell>
          <TableCell className='font-medium'>{question.text}</TableCell>
          <TableCell>{question.options[0].text}</TableCell>
          <TableCell>{question.options[1].text}</TableCell>
          <TableCell>{question.options[2].text}</TableCell>
          <TableCell>{question.options[3].text}</TableCell>
          <TableCell className='text-center'>{question.correctOption + 1}</TableCell>
          <TableCell className='text-xs'><div className='bg-gray-100 rounded-lg p-1'>{question.createdBy?.name || ''}</div></TableCell>
          <TableCell>
            <UpdateQuestionDialog question={question} fetchQues={fetchQuestions}/>
          </TableCell>
          <TableCell>
            <ViewQuestionDialog question={question}/>
          </TableCell>
          <TableCell>
            <DeleteModalButton quesId={question._id} fetchQues={fetchQuestions}/>
          </TableCell>
        </TableRow>
      })
    }
  </TableBody>
</Table>

}

const DeleteModalButton = ({quesId, fetchQues}: {quesId: string, fetchQues: ()=>void}) => {

  const {toast} = useToast()
  const [loading, setLoading] = useState(false)
  const {user} = useUserContext()
  
  const deleteTopicHandler = async (quesId: string) => {
    try{
      
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz/${quesId}`)
      toast({
        title: "Question deleted.",
      })
      fetchQues()
    } catch(error){
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return <Dialog>
  <DialogTrigger className='bg-gradient-to-b from-red-500 to-red-700 rounded-md shadow-sm p-2 hover:scale-105 duration-300 transition-all'>
    <Trash size={16} color='white'/>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete the question
        and remove your data from the servers.
      </DialogDescription>
      
    </DialogHeader>
    <DialogFooter>
      <Button onClick={()=>{
          deleteTopicHandler(quesId)
        }}
        className='bg-gradient-to-b from-red-500 to-red-800 hover:scale-105 transition-all duration-300 font-semibold'
        disabled={loading||user.access=='limited'}
        >
          {
            user.access=='full' 
            ? loading? <Spinner /> : "Delete"
            : 'Access Denied'
          }
        </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
}



const TagsMenu = ({tags, questionTags, selectedTags, setSelectedTags}: {tags: TagType[], questionTags: string[], selectedTags: string[], setSelectedTags: (tags: string[])=>void}) => {
  const addTag = (id: string) => {
    if (!selectedTags.includes(id) && !questionTags.includes(id)) {
      setSelectedTags([...selectedTags, id]); 
    }
  }

  return <DropdownMenu>
  <DropdownMenuTrigger className='border p-2 px-4 w-[100px] rounded-md text-sm'>Select</DropdownMenuTrigger>
  <DropdownMenuContent className='w-[300px]'>
    <DropdownMenuLabel>Tags</DropdownMenuLabel>
    <DropdownMenuSeparator />
    {tags.map(item => {
      return <DropdownMenuItem key={item.name}
      onClick={()=>{
        addTag(item._id)
      }}
      >{item.name}</DropdownMenuItem>
    })}
  </DropdownMenuContent>
</DropdownMenu>

}

const CreateQuestionDialog = ({categoryId, fetchQues}: {categoryId: string, fetchQues: ()=>void}) => {
  const [tags, setTags] = useState<TagType[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const [quesText, setQuesText] = useState("")
  const [op1, setOp1] = useState("")
  const [op2, setOp2] = useState("")
  const [op3, setOp3] = useState("")
  const [op4, setOp4] = useState("")
  const [correctOp, setCorrectOp] = useState<number|null>(null)
  const [explanation, setExplanation] = useState("")
  const [refTitle, setRefTitle] = useState("")
  const [link, setLink] = useState("")

  const {toast} = useToast()
  const [loading, setLoading] = useState(false)

  const fetchTags = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/tag`)
    const tags = response.data.tags
    setTags(tags)
  }

  const removeTag = (id: string) => {
    const updatedTags = selectedTags.filter((tagId) => tagId !== id);
    setSelectedTags(updatedTags); 
  }

  const createQuestion = async () => {
    try{
      setLoading(true)
      if (!quesText || !op1 || !op2 || !op3 || !op4 || !correctOp){
        toast({
          title: "Invalid Question Data",
          variant: "destructive"
        })
      }
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz/${categoryId}`, {
        text: quesText,
        options: [
          {
            text: op1
          },
          {
            text: op2
          },
          {
            text: op3
          },
          {
            text: op4
          },
        ],
        correctOption: (correctOp as number) - 1,
        explanation: explanation,
        reference: {
          title: refTitle,
          link: link
        },
        categoryId: categoryId,
        tagId: selectedTags
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      toast({
        title: "Question created.",
        description: "The new question has been successfully created."
      })

    } catch(error){
      console.log(error)
    } finally {
      setLoading(false)
      setQuesText("")
      setOp1("")
      setOp2("")
      setOp3("")
      setOp4("")
      setCorrectOp(null)
      setExplanation("")
      setLink("")
      setRefTitle("")
      setSelectedTags([])
      fetchQues()
    }
  }

  useEffect(()=>{
    fetchTags()
  }, [])

  const handleToggle = (value: string) => {
    setCorrectOp(Number(value))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='bg-gradient-to-b from-gray-600 to-gray-900 font-semibold hover:scale-105 transition-all duration-300'>Create Question</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[850px]">
        <DialogHeader>
          <DialogTitle>Create Question</DialogTitle>
          <DialogDescription>
            Enter question details to create a new question.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="name" className="text-center">
              Question*
            </Label>
            <Textarea
              id="name"
              value={quesText}
              className="col-span-4"
              onChange={(e)=>{setQuesText(e.target.value)}}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="option1" className="text-center">
                Option 1*
              </Label>
              <Input
                id="option1"
                value={op1}
                className="col-span-3"
                onChange={(e)=>{setOp1(e.target.value)}}
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
                onChange={(e)=>{setOp2(e.target.value)}}
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
                onChange={(e)=>{setOp3(e.target.value)}}
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
                onChange={(e)=>{setOp4(e.target.value)}}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="correct" className="text-center">
              Correct Option
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

          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="explanation" className="text-center">
              Explanation 
            </Label>
            <Textarea
              id="explanation"
              value={explanation}
              className="col-span-4"
              onChange={(e)=>{setExplanation(e.target.value)}}
            />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="reference-title" className="text-center">
              Reference 
            </Label>
            <Input
              id="reference-title"
              className="col-span-4"
              value={refTitle}
              onChange={(e)=>{setRefTitle(e.target.value)}}
            />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="reference-link" className="text-center">
              Link 
            </Label>
            <Input
              id="reference-link"
              className="col-span-4"
              value={link}
              onChange={(e)=>{setLink(e.target.value)}}
            />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="tags" className="text-center grid-cols-1">
              Tags 
            </Label>
            
            <div className='col-span-4 w-full flex flex-row gap-2 items-center'> 
              <TagsMenu tags={tags} questionTags={[]} selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>
              <div className='border rounded-md w-full flex flex-row h-12 gap-2 p-1 overflow-x-scroll'>
                {selectedTags.map((tagId: string) => {
                  return tags.map((tag: TagType) => {
                    if(tag._id == tagId){
                      return <div key={tag._id} className='bg-gray-100 text-nowrap p-2 text-sm w-fit flex flex-row items-center gap-4 justify-between rounded-md'>
                        <div className='text-right'>{tag.name}</div>
                        <div 
                        onClick={()=>{
                          removeTag(tag._id)
                        }}
                        className='cursor-pointer'>x</div>
                      </div>
                    }
                  })
                })}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={createQuestion} disabled={loading}>
            {
              loading ? <Spinner/> : "Create Question"
            }
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


const UpdateQuestionDialog = ({question, fetchQues}: {question: QuestionType, fetchQues: () => void}) => {

  const questionTagIds = question.tagId.map((tag) =>  tag._id)
  const [tags, setTags] = useState<TagType[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>(questionTagIds)

  
  const [quesText, setQuesText] = useState(question.text)
  const [op1, setOp1] = useState(question.options[0].text)
  const [op2, setOp2] = useState(question.options[1].text)
  const [op3, setOp3] = useState(question.options[2].text)
  const [op4, setOp4] = useState(question.options[3].text)
  const [correctOp, setCorrectOp] = useState<number|null>(question.correctOption)
  const [explanation, setExplanation] = useState(question.explanation)
  const [refTitle, setRefTitle] = useState(question.reference.title)
  const [link, setLink] = useState(question.reference.link)

  const {toast} = useToast()
  const [loading, setLoading] = useState(false)

  const fetchTags = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/tag`)
    const tags = response.data.tags
    setTags(tags)
  }

  const removeTag = (id: string) => {
    const updatedTags = selectedTags.filter((tagId) => tagId != id);
    setSelectedTags(updatedTags); 
  }

  const updateQuestion = async () => {
    try{
      setLoading(true)
      if (!quesText || !op1 || !op2 || !op3 || !op4 || !correctOp){
        toast({
          title: "Invalid Question Data",
          variant: "destructive"
        })
      }
      await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz/${question._id}`, {
        text: quesText,
        options: [
          {
            text: op1
          },
          {
            text: op2
          },
          {
            text: op3
          },
          {
            text: op4
          },
        ],
        correctOption: correctOp? (correctOp as number) - 1 : question.correctOption,
        explanation: explanation,
        reference: {
          title: refTitle,
          link: link
        },
        tagId: selectedTags
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      toast({
        title: "Question updated.",
        description: "The question has been successfully updated."
      })

    } catch(error){
      console.log(error)
    } finally {
      fetchQues()
      setSelectedTags([])
      setLoading(false)
    }
  }

  const handleToggle = (value: string) => {
    setCorrectOp(Number(value) === correctOp ? null : Number(value)); 
  };

  useEffect(()=>{
    fetchTags()
  }, [])


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='bg-gradient-to-b from-gray-600 to-gray-900 px-4 py-1 hover:scale-105 transition-all duration-300'>
          Edit <ChevronRight size={20}/></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[850px]">
        <DialogHeader>
          <DialogTitle>Create Question</DialogTitle>
          <DialogDescription>
            Enter question details to create a new question.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="name" className="text-center">
              Question*
            </Label>
            <Textarea
              defaultValue={question.text}
              id="name"
              className="col-span-4"
              onChange={(e)=>{setQuesText(e.target.value)}}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="option1" className="text-center">
                Option 1*
              </Label>
              <Input
                defaultValue={question.options[0].text}
                id="option1"
                className="col-span-3"
                onChange={(e)=>{setOp1(e.target.value)}}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="option2" className="text-center">
                Option 2*
              </Label>
              <Input
                defaultValue={question.options[1].text}
                id="option2"
                className="col-span-3"
                onChange={(e)=>{setOp2(e.target.value)}}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="option3" className="text-center">
                Option 3*
              </Label>
              <Input
                defaultValue={question.options[2].text}
                id="option3"
                className="col-span-3"
                onChange={(e)=>{setOp3(e.target.value)}}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="option4" className="text-center">
                Option 4*
              </Label>
              <Input
                defaultValue={question.options[3].text}
                id="option4"
                className="col-span-3"
                onChange={(e)=>{setOp4(e.target.value)}}
              />
            </div>
          </div>
         

          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="correct" className="text-center">
              Correct Option
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

          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="explanation" className="text-center">
              Explanation 
            </Label>
            <Textarea
              defaultValue={question.explanation}
              id="explanation"
              className="col-span-4"
              onChange={(e)=>{setExplanation(e.target.value)}}
            />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="reference-title" className="text-center">
              Reference 
            </Label>
            <Input
              defaultValue={question.reference.title}
              id="reference-title"
              className="col-span-4"
              onChange={(e)=>{setRefTitle(e.target.value)}}
            />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="reference-link" className="text-center">
              Link 
            </Label>
            <Input
              defaultValue={question.reference.link}
              id="reference-link"
              className="col-span-4"
              onChange={(e)=>{setLink(e.target.value)}}
            />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="reference-link" className="text-center">
              Selected Tags 
            </Label>
            <div className='col-span-4 flex flex-row w-full overflow-x-scroll border p-2 rounded gap-1'>
              {
                question.tagId.map((tag) => (
                  <div key={tag._id} className='bg-gray-100 text-sm rounded p-2 text-nowrap'>{tag.name}</div>
                ))
              }
            </div>
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="tags" className="text-center grid-cols-1">
              Update Tags 
            </Label>
            
            <div className='col-span-4 w-full flex flex-row gap-2 items-center'> 
              <TagsMenu tags={tags} questionTags={questionTagIds} selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>
              <div className='border rounded-md w-full flex flex-row h-12 gap-2 p-1 overflow-x-scroll'>
                {selectedTags.map((tagId: string) => {
                  return tags.map((tag: TagType) => {
                    if(tag._id == tagId){
                      return <div key={tag._id} className='bg-gray-100 text-nowrap p-2 text-sm w-fit flex flex-row items-center gap-4 justify-between rounded-md'>
                        <div className='text-right'>{tag.name}</div>
                        <div 
                        onClick={()=>{
                          removeTag(tag._id)
                        }}
                        className='cursor-pointer'>x</div>
                      </div>
                    }
                  })
                })}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={updateQuestion} disabled={loading}>
            {
              loading ? <Spinner /> : "Update Question"
            }
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const ViewQuestionDialog = ({question}: {question: QuestionType}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Info</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Question Card</DialogTitle>
          <DialogDescription>
            View the question details here.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-2'>
          <div className='font-semibold'>{question.text}</div>
          <div>
            {question.options.map((option, index) => (
              <div key={index}>{index+1}. {option.text}</div>
            ))}
          </div>
          <div>Correct: <span className='text-green-600'>{question.options[question.correctOption]?.text || "N/A"}</span></div>
          <div className='flex flex-col bg-gray-50 rounded-lg p-4'>
            <p className='font-semibold'>Explanation</p>
            <div>{question.explanation || 'N/A'}</div>
          </div>
          <div className='flex flex-col bg-gray-50 rounded-lg p-4'>
            <p className='font-semibold'>Reference</p>
            <div>{question.reference.title || 'N/A'}</div>
            <div className='text-blue-800'>{question.reference.link || 'N/A'}</div>
          </div>
          <div className='flex flex-col bg-gray-50 rounded-lg p-4'>
            <p className='font-semibold'>Tags</p>
            <div className='flex flex-row overflow-x-scroll w-84 p-2 gap-2 rounded-lg border'>
            {question.tagId.map((tag) => (
              <div className='bg-gray-100 rounded-lg p-2 text-nowrap' key={tag._id}>{tag.name}</div>
            ))}
          </div>
          </div>
          
          
        </div>
        
      </DialogContent>
    </Dialog>
  )
}


type QuestionType = {
  _id: string,
  text: string,
  options: OptionType[],
  correctOption: number,
  explanation?: string,
  reference: {
    title?: string,
    link?: string
  },
  categoryId: string,
  tagId: TagType[],
  createdBy: AdminType
}

type OptionType = {
  text: string
}
type TagType = {
  _id: string,
  name: string,
  description: string,
  questions: QuestionType[]
}

type AdminType = {
  name: string,
  email: string,
  id: string
}

export default TopicQuestions;