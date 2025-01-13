"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { useRouter, useParams } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import Spinner from '@/components/Spinner'
import { ChevronRight, Trash } from 'lucide-react'

const Papers = () => {
  const [papers, setPapers] = useState<PaperType[]>([])
  const [filteredPapers, setFilteredPapers] = useState<PaperType[]>([])
  const [search, setSearch] = useState("")

  const params = useParams();
  const subjectId = params.subjectId;
  const subjectName = decodeURIComponent(params.subjectName as string);

  const fetchPapers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/paper/${subjectId}`)
      const papers = response.data.data
      setPapers(papers)
      setFilteredPapers(papers)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const filteredPapers = papers.filter(
      topic => topic.name.toLowerCase().includes(search)
    )
    setFilteredPapers(filteredPapers)
  }, [search, papers])

  useEffect(() => {
    fetchPapers()
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className='p-4 sm:w-[90vw] md:w-[80vw] lg:min-w-[80vw] mx-auto'>
      <div className='sticky z-50 top-0 bg-white'>
        <div className='flex flex-row justify-between items-center p-4'>
          <p className='font-bold text-3xl'>{subjectName}</p>
          <div className='flex flex-row gap-2'>
            <div className='w-full sm:w-auto'>
              <Input
                onChange={(e) => { setSearch(e.target.value) }}
                className='p-2 w-full'
                placeholder="Search for topics..."
              />
            </div>
            <AddPaper fetchTopics={fetchPapers} subjectId={subjectId as string} />
          </div>
        </div>
      </div>

      <section className='min-w-[80vw] max-h-[75vh] overflow-y-scroll border'>
        <PaperList papers={filteredPapers} fetchTopics={fetchPapers} />
      </section>
    </main>
  )
}

type PaperType = {
  _id: string
  name: string,
  description: string
  createdAt: string,
  updatedAt: string,
}

const PaperList = ({ papers, fetchTopics }: { papers: PaperType[], fetchTopics: () => void }) => {

  const router = useRouter()

  return (
    <Table className='w-full'>
      <TableHeader className='bg-gray-50'>
        <TableRow>
          <TableHead className="w-[100px]">S. No.</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {papers.map((sub: PaperType, index: number) => (
          <TableRow key={index} className='cursor-pointer hover:bg-gray-50'>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className='font-semibold'>{sub.name}</TableCell>
            <TableCell>{sub.description}</TableCell>
            <TableCell className='flex gap-2'>
              <Button
                onClick={() => {
                  router.push(`subjectTopic/${sub._id}/${sub.name}`)
                }}
                className='bg-gradient-to-b from-gray-600 to-gray-900 rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all'
              >
                View <ChevronRight />
              </Button>
              <EditPaper fetchTopics={fetchTopics} paper={sub} />
              <DeleteModalButton paperId={sub._id} paperName={sub.name} fetchTopics={fetchTopics} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const AddPaper = ({ fetchTopics, subjectId }: { fetchTopics: () => void, subjectId: string }) => {

  const [paperName, setPaperName] = useState("");
  const [paperDesc, setPaperDesc] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false)

  const addPaperHandler = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/paper`,
        {
          name: paperName,
          description: paperDesc,
          subjectId: subjectId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.data.success) {
        toast({
          title: "Paper not created.",
          description: `${paperName} already exists.`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Paper created.",
          description: `${paperName} has been successfully created.`
        })
        fetchTopics()
      }

    } catch (error) {
      console.log(error)
    } finally {
      setPaperName("")
      setPaperDesc("")
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger className='bg-gradient-to-b from-gray-600 to-gray-800 font-semibold text-white rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all'>
        Add Paper
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Paper</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-2'>
          <Input value={paperName} onChange={(e) => { setPaperName(e.target.value) }} type="text" placeholder="Paper Name" />
          <Textarea value={paperDesc} onChange={(e) => { setPaperDesc(e.target.value) }} rows={2} placeholder="Paper Description (optional)" />
        </div>
        <DialogFooter>
          <Button type='submit' onClick={addPaperHandler}
            className='bg-gradient-to-b from-gray-600 to-gray-800 font-semibold text-white rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all'
            disabled={loading}
          >
            {
              loading ? <Spinner /> : "Add Paper"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const EditPaper = ({ fetchTopics, paper }: { fetchTopics: () => void, paper: PaperType }) => {

  const [paperName, setPaperName] = useState(paper.name)
  const [paperDesc, setPaperDesc] = useState(paper.description)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const params = useParams();
  const subjectId = params.subjectId;

  const updatePaperHandler = async () => {
    try {
      setLoading(true)
      const response = await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/paper/${paper._id}`,
        {
          name: paperName,
          description: paperDesc,
          subjectId: subjectId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.data.success) {
        toast({
          title: "Paper not updated.",
          description: `${paperName} does not exist.`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Paper updated.",
          description: `${paperDesc} has been successfully updated.`
        })
        fetchTopics()
      }

    } catch (error) {
      console.log(error)
    } finally {
      setPaperName("")
      setPaperDesc("")
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger className='flex flex-row gap-2 items-center bg-gradient-to-b from-gray-600 to-gray-900 text-white font-medium rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all'>
        <span>Edit</span> 
        <ChevronRight size={16}/>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit the Paper Details</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-2'>
          <Input value={paperName} onChange={(e) => { setPaperName(e.target.value) }} type="text" placeholder="Paper Name" />
          <Textarea value={paperDesc} onChange={(e) => { setPaperDesc(e.target.value) }} rows={2} placeholder="Paper Description (optional)" />
        </div>
        <DialogFooter>
          <Button type='submit' onClick={updatePaperHandler}
            className='bg-gradient-to-b from-gray-600 to-gray-800 font-semibold text-white rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all'
          >
            {
              loading ? <Spinner /> : "Update"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const DeleteModalButton = ({ paperId, paperName, fetchTopics }: { paperId: string, paperName: string, fetchTopics: () => void }) => {

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const deletePaperHandler = async (paperId: string, paperName: string) => {
    try {
      setLoading(true)
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/paper/${paperId}`)
      toast({
        title: "Paper deleted.",
        description: `${paperName} has been successfully deleted.`
      })
      fetchTopics()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger className='bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 text-sm hover:scale-105 duration-300 transition-all'>
        <Trash size={16}/>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action is permanent. You cannot undo this.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => deletePaperHandler(paperId, paperName)} 
            className='bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all'
            disabled={loading}
            >
            {
              loading? <Spinner /> : "Delete"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Papers;
