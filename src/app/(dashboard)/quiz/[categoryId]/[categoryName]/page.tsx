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
        <div className='flex flex-row items-center p-4 border-b justify-between bg-white'>
            <div>
              <p className='text-4xl font-bold'>{categoryName}</p>
            </div>
            <div className='flex flex-row items-center gap-2'>
              <div>
                <Input onChange={(e)=>{setSearch(e.target.value)}} placeholder='Search Question...'></Input>
              </div>
              <CreateQuestionDialog fetchQues={fetchQuestions} categoryId={categoryId as string}/>
            </div>
          </div>
      </div>
        
      <section>
        <QuestionsList questions={filteredQues} fetchQuestions={fetchQuestions}/>
      </section>
    </main>
  );
};

const QuestionsList = ({fetchQuestions, questions}: {fetchQuestions: ()=>void, questions: QuestionType[]}) => {
  
  return <Table>
  <TableHeader>
    <TableRow>
      <TableHead>S. No.</TableHead>
      <TableHead>Question Text</TableHead>
      <TableHead>Option 1</TableHead>
      <TableHead>Option 2</TableHead>
      <TableHead>Option 3</TableHead>
      <TableHead>Option 4</TableHead>
      <TableHead>Correct Option</TableHead>
      <TableHead></TableHead>
      <TableHead></TableHead>
      <TableHead></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {
      questions.map((question: QuestionType, index: number) => {
        return <TableRow key={index} className='cursor-pointer'>
          <TableCell>{index + 1}</TableCell>
          <TableCell>{question.text}</TableCell>
          <TableCell>{question.options[0].text}</TableCell>
          <TableCell>{question.options[1].text}</TableCell>
          <TableCell>{question.options[2].text}</TableCell>
          <TableCell>{question.options[3].text}</TableCell>
          <TableCell>{question.correctOption + 1}</TableCell>
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
  
  const deleteTopicHandler = async (quesId: string) => {
    try{
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz/${quesId}`)
      toast({
        title: "Question deleted.",
      })
      fetchQues()
    } catch(error){
      console.error(error)
    }
  }

  return <Dialog>
  <DialogTrigger className='border rounded-md shadow-sm p-2 py-[7px] hover:bg-gray-100 transition-all'>
    Delete
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
        }}>Delete</Button>
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
  <DropdownMenuTrigger className='border p-2 px-4 rounded-md text-sm'>Select</DropdownMenuTrigger>
  <DropdownMenuContent>
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
        <Button variant="outline">Create Question</Button>
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
          <Button type="submit" onClick={createQuestion}>Create Question</Button>
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
        <Button variant="outline">Edit</Button>
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
          <Button type="submit" onClick={updateQuestion}>Update Question</Button>
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
        <Button variant="outline">More</Button>
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
          <div>Correct: <span className='font-semibold text-green-600'>{question.options[question.correctOption].text}</span></div>
          <div className='flex flex-col bg-gray-100 rounded-lg p-4'>
            <p className='font-semibold'>Reference</p>
            <div>{question.reference.title || 'N/A'}</div>
            <div className='text-blue-800'>{question.reference.link || 'N/A'}</div>
          </div>
          <div className='flex flex-row overflow-x-scroll w-96 p-2 gap-2 rounded-lg border'>
            {question.tagId.map((tag) => (
              <div className='bg-gray-100 rounded-lg p-2 text-nowrap' key={tag.name}>{tag.name}</div>
            ))}
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
  tagId: TagType[]
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

export default TopicQuestions;