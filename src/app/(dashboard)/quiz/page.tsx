"use client"
import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'

const Quiz = () => {
  const [topics, setTopics] = useState<TopicType[]>([])
  const [filteredTopics, setFilteredTopics] = useState<TopicType[]>([])
  const [search, setSearch] = useState("")

  const fetchTopics = async () => {
    try{
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz/`)
      const topics = response.data.quizCategories
      setTopics(topics)
      setFilteredTopics(topics)
    } catch(error){
      console.log(error)
    }
  }

  useEffect(()=>{
    const filteredTopics = topics.filter(
      topic => topic.name.toLowerCase().includes(search)
    )
    setFilteredTopics(filteredTopics)
  }, [search, topics])

  useEffect(()=>{
    fetchTopics()
  }, [])
  
  return (
    <main className='p-4'>
      <div className='sticky z-50 top-0 border-b bg-white'>
        <div className='flex flex-row justify-between items-center p-4'>
          <p className='font-bold text-4xl'>QUIZ TOPICS</p>
          <div className='flex flex-row gap-2'>
            <div>
              <Input onChange={(e)=>{setSearch(e.target.value)}} className='p-2' placeholder="Search for topics..."></Input>
            </div>
            <AddTopic fetchTopics={fetchTopics}/>
          </div>
          
        </div>
      </div>
      
      <QuizCategories topics={filteredTopics} fetchTopics={fetchTopics} />
    </main>
  )
}

type TopicType = {
  _id: string
  name: string,
  description: string
  questions: string[],
  createdAt: string,
  updatedAt: string,
}

const QuizCategories = ({topics, fetchTopics}: {topics: TopicType[], fetchTopics: ()=>void}) => {

  let totalQues = 0
  topics.map((topic: TopicType) => {totalQues += topic.questions.length})
  const router = useRouter()

  return <Table>
  <TableCaption>A list of your created quiz topics.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">S. No.</TableHead>
      <TableHead>Name</TableHead>
      <TableHead>Description</TableHead>
      <TableHead>Questions</TableHead>
      <TableHead></TableHead>
      <TableHead></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {topics.map((topic: TopicType, index: number) => (
      <TableRow key={index} className='cursor-pointer'>
        <TableCell className="font-medium">{index+1}</TableCell>
        <TableCell>{topic.name}</TableCell>
        <TableCell>{topic.description}</TableCell>
        <TableCell>{topic.questions.length}</TableCell>
        <TableCell>
          <Button 
          onClick={()=>{
            router.push(`quiz/${topic._id}/${topic.name}`)
          }}
          variant={"outline"}>View</Button>
        </TableCell>
        <TableCell>
          <DeleteModalButton topicId={topic._id} topicName={topic.name} fetchTopics={fetchTopics}/>
        </TableCell> 
      </TableRow>
    ))}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={5}>Total Questions</TableCell>
      <TableCell className="text-right">{totalQues}</TableCell>
    </TableRow>
  </TableFooter>
</Table>
}

const AddTopic = ({fetchTopics}: {fetchTopics: ()=>void}) => {

  const [topicName, setTopicName] = useState("")
  const [topicDesc, setTopicDesc] = useState("")
  const {toast} = useToast()

  const addTopicHandler = async () => {
    try{
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz/`, 
        {
          name: topicName,
          description: topicDesc
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      if(!response.data.success){
        toast({
          title: "Topic not created.",
          description: `${topicName} already exists.`,
          variant: "destructive"
        })
      }
      else {
        toast({
          title: "Topic created.",
          description: `${topicName} has been successfully created.`
        })
        fetchTopics()
      }
        
    } catch (error){
      console.error(error)
    } finally {
      setTopicName("")
      setTopicDesc("")
    }
  }


  return <Dialog>
      <DialogTrigger className='border rounded-md shadow-sm p-2 px-4 text-sm hover:bg-gray-100 transition-all'>
        Create Topic
      </DialogTrigger>   
      <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a New Topic</DialogTitle>
      </DialogHeader>
      <div className='flex flex-col gap-2'>
        <Input value={topicName} onChange={(e)=>{setTopicName(e.target.value)}} type="text" placeholder="Topic Name"></Input>
        <Textarea value={topicDesc} onChange={(e)=>{setTopicDesc(e.target.value)}} rows={2} placeholder="Topic Description (optional)"></Textarea>
      </div>
      <DialogFooter>
        <Button type='submit' onClick={addTopicHandler}>Add Topic</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

const DeleteModalButton = ({topicId, topicName, fetchTopics}: {topicId: string, topicName: string, fetchTopics: ()=>void}) => {

  const {toast} = useToast()
  
  const deleteTopicHandler = async (topicId: string, topicName: string) => {
    try{
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz/category/${topicId}`)
      toast({
        title: "Topic deleted.",
        description: `${topicName} has been successfully deleted.`
      })
      fetchTopics()
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
        This action cannot be undone. This will permanently delete the topic
        and remove your data from the servers.
      </DialogDescription>
      
    </DialogHeader>
    <DialogFooter>
      <Button onClick={()=>{
          deleteTopicHandler(topicId, topicName)
        }}>Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
}



export default Quiz