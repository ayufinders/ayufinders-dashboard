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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useRouter, useParams } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { ChevronRight, Trash } from 'lucide-react' // Importing icons
import Spinner from '@/components/Spinner'

const SubjectTopics = () => {
  const [subjectTopics, setSubjectTopics] = useState<SubjectTopicType[]>([])
  const [filteredSubjectTopics, setFilteredSubjectTopics] = useState<SubjectTopicType[]>([])
  const [search, setSearch] = useState("")

  const params = useParams();
  const paperId = params.paperId;
  const paperName = decodeURIComponent(params.paperName as string);

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/subjectTopic/topics/${paperId}`)
      const topics = response.data.data
      setSubjectTopics(topics)
      setFilteredSubjectTopics(topics)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const filteredTopics = subjectTopics.filter(
      topic => topic.name.toLowerCase().includes(search)
    )
    setFilteredSubjectTopics(filteredTopics)
  }, [search, subjectTopics])

  useEffect(() => {
    fetchTopics()
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className='p-4 min-w-[80vw]'>
      <div className='sticky z-50 top-0 bg-white'>
        <div className='flex flex-row justify-between items-center p-4'>
          <p className='font-bold text-3xl'>{paperName}</p>
          <div className='flex flex-row gap-2'>
            <div>
              <Input onChange={(e) => { setSearch(e.target.value) }} className='p-2' placeholder="Search for topics..."></Input>
            </div>
            <AddSubjectTopic fetchTopics={fetchTopics} paperId={paperId as string} />
          </div>
        </div>
      </div>

      <section className='max-h-[75vh] min-w-[80vw] border'>
      <SubjectTopicList topics={filteredSubjectTopics} fetchTopics={fetchTopics} />
      </section>
    </main>
  )
}

type SubjectTopicType = {
  _id: string
  name: string,
  description: string,
  paperId: string,
  tagId: string[],
  createdAt: string,
  updatedAt: string,
}

const SubjectTopicList = ({ topics, fetchTopics }: { topics: SubjectTopicType[], fetchTopics: () => void }) => {

  const router = useRouter()

  return <Table className='w-[80vw]'>
    <TableHeader className='bg-gray-50'>
      <TableRow>
        <TableHead className="w-[100px]">S. No.</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Description</TableHead>
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {topics.map((sub: SubjectTopicType, index: number) => (
        <TableRow key={index} className='cursor-pointer'>
          <TableCell className="font-medium">{index + 1}</TableCell>
          <TableCell className='font-semibold'>{sub.name}</TableCell>
          <TableCell>{sub.description}</TableCell>
          <TableCell className='flex flex-row gap-2'>
            <Button
              onClick={() => {
                router.push(`data/${sub._id}/${sub.name}`)
              }}
              className='flex items-center gap-2 bg-gradient-to-b from-gray-600 to-gray-900 hover:scale-105 transition-all duration-300'
            >
              View
              <ChevronRight size={16} />
            </Button>
            <UpdateSubjectTopicDialog fetchTopics={fetchTopics} subjectTopic={sub}></UpdateSubjectTopicDialog>
            <DeleteModalButton topicId={sub._id} topicName={sub.name} fetchTopics={fetchTopics} />

          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
}

const AddSubjectTopic = ({ fetchTopics, paperId }: { fetchTopics: () => void, paperId: string }) => {

  const [subjectTopicName, setSubjectTopicName] = useState("");
  const [subjectTopicDesc, setSubjectTopicDesc] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false)

  const addSubjectTopicHandler = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/subjectTopic`,
        {
          name: subjectTopicName,
          description: subjectTopicDesc,
          paperId: paperId,
          tagId: selectedTags
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.data.success) {
        toast({
          title: "Subject topic not created.",
          description: `${subjectTopicName} already exists.`,
          variant: "destructive"
        })
      }
      else {
        toast({
          title: "Topic created.",
          description: `${subjectTopicName} has been successfully created.`
        })
        fetchTopics()
      }

    } catch (error) {
      console.error(error)
    } finally {
      setSubjectTopicName("")
      setSubjectTopicDesc("")
      setLoading(false)
    }
  }

  const [tags, setTags] = useState<TagType[]>([])
  const [selectedTags, setSelectedTags] = useState<TagType[]>([])

  useEffect(() => {
    async function fetchTags() {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/tag`)
      const tags = response.data.tags
      setTags(tags)
    }

    fetchTags()
  }, [])

  return <Dialog>
    <DialogTrigger className='bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm text-nowrap font-semibold hover:scale-105 duration-300 transition-all'>
      Create Subject Topic
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a New Subject Topic</DialogTitle>
      </DialogHeader>
      <div className='flex flex-col gap-2'>
        <Input value={subjectTopicName} onChange={(e) => { setSubjectTopicName(e.target.value) }} type="text" placeholder="Subject Name"></Input>
        <Textarea value={subjectTopicDesc} onChange={(e) => { setSubjectTopicDesc(e.target.value) }} rows={2} placeholder="Subject Description (optional)"></Textarea>
        <div className='flex flex-row gap-4'>
          <TagsMenu selectedTags={selectedTags} tags={tags} setSelectedTags={setSelectedTags} />
          <div className='w-[350px] overflow-x-scroll p-1 border flex-row flex gap-1'>
            {selectedTags.map(tag => {
              return <div key={tag._id} className='bg-gray-100 py-1 px-2 rounded-md text-nowrap'>
                {tag.name}
              </div>
            })}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type='submit' onClick={addSubjectTopicHandler}
        className='bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm font-semibold hover:scale-105 duration-300 transition-all'
        >
          {
            loading ? <Spinner /> : "Add Topic"
          }
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

const UpdateSubjectTopicDialog = ({ fetchTopics, subjectTopic }: { fetchTopics: () => void, subjectTopic: SubjectTopicType }) => {

  const [subjectTopicName, setSubjectTopicName] = useState(subjectTopic.name);
  const [subjectTopicDesc, setSubjectTopicDesc] = useState(subjectTopic.description);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false)

  const params = useParams();
  const paperId = params.paperId;

  const updateSubjectTopicHandler = async () => {
    try {
      setLoading(true)
      const response = await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/subjectTopic/${subjectTopic._id}`,
        {
          name: subjectTopicName,
          description: subjectTopicDesc,
          paperId: paperId,
          tagId: selectedTags
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.data.success) {
        toast({
          title: "Subject topic not updated.",
          description: `${subjectTopicName} does not exists.`,
          variant: "destructive"
        })
      }
      else {
        toast({
          title: "Topic created.",
          description: `${subjectTopicName} has been successfully updated.`
        })
        fetchTopics()
      }

    } catch (error) {
      console.log(error)
    } finally {
      setSubjectTopicName("")
      setSubjectTopicDesc("")
      setLoading(false)
    }
  }

  const [tags, setTags] = useState<TagType[]>([])
  const [selectedTags, setSelectedTags] = useState<TagType[]>([])

  useEffect(() => {
    async function fetchTags() {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/tag`)
      const tags = response.data.tags
      setTags(tags)
    }

    fetchTags()
  }, [])

  return <Dialog>
    <DialogTrigger className='flex flex-row gap-2 items-center bg-gradient-to-b from-gray-600 to-gray-900 text-white font-medium rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all'>
      <span>Edit</span>
      <ChevronRight size={16}/>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Update the Subject Topic Details</DialogTitle>
      </DialogHeader>
      <div className='flex flex-col gap-2'>
        <Input defaultValue={subjectTopicName} onChange={(e) => { setSubjectTopicName(e.target.value) }} type="text" placeholder="Subject Name"></Input>
        <Textarea defaultValue={subjectTopicDesc} onChange={(e) => { setSubjectTopicDesc(e.target.value) }} rows={2} placeholder="Subject Description (optional)"></Textarea>
        <div className='flex flex-row gap-4'>
          <TagsMenu selectedTags={selectedTags} tags={tags} setSelectedTags={setSelectedTags} />
          <div className='w-80 overflow-x-scroll p-1 border flex-row flex gap-1'>
            {selectedTags.map(tag => {
              return <div key={tag._id} className='bg-gray-100 py-1 px-2 rounded-md text-nowrap'>
                {tag.name}
              </div>
            })}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type='submit' disabled={loading} onClick={updateSubjectTopicHandler}>
        {
          loading ? <Spinner /> : "Update Subject Topic"
        }
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

const DeleteModalButton = ({ topicId, topicName, fetchTopics }: { topicId: string, topicName: string, fetchTopics: () => void }) => {

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const deleteTopicHandler = async (topicId: string, topicName: string) => {
    try {
      setLoading(true)
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/subjectTopic/${topicId}`)
      toast({
        title: "Topic deleted.",
        description: `${topicName} has been successfully deleted.`
      })
      fetchTopics()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return <Dialog>
    <DialogTrigger className='bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 text-sm hover:scale-105 duration-300 transition-all flex items-center gap-2'>
      <Trash size={16} />
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete the topic and remove your data from the servers.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button onClick={() => { deleteTopicHandler(topicId, topicName) }}
        disabled={loading}
        className='bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 text-sm hover:scale-105 duration-300 transition-all flex items-center gap-2'
        >
          {
            loading ? <Spinner /> : "Delete"
          }
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

const TagsMenu = ({ tags, selectedTags, setSelectedTags }: { tags: TagType[], selectedTags: TagType[], setSelectedTags: (x: TagType[]) => void }) => {
  const addTag = (tag: TagType) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  return <DropdownMenu>
    <DropdownMenuTrigger className='border p-2 px-4 rounded-md text-sm'>Select</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>Tags</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {tags.map(item => {
        return <DropdownMenuItem key={item.name}
          onClick={() => {
            addTag(item)
          }}
        >{item.name}</DropdownMenuItem>
      })}
    </DropdownMenuContent>
  </DropdownMenu>
}

type TagType = {
  _id: string,
  name: string,
  description: string
}

export default SubjectTopics;
