"use client"
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Input } from '@/components/ui/input'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'
import { ChevronRight, Trash } from 'lucide-react'
import Spinner from '@/components/Spinner'
import { useUserContext } from '@/context'

const Tags = () => {

  const [tags, setTags] = useState<tagType[]>([])
  const [search, setSearch] = useState("")
  const [filteredTags, setFilteredTags] = useState<tagType[]>([])

  useEffect(() => {
    const searchedTags = tags.filter(tag => 
      tag.name.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredTags(searchedTags)
  }, [search, tags])

  const fetchTags = async () => {
    try{
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/tag`, {
        withCredentials: true
      });
      const tags = response.data.tags
      setTags(tags)
      setFilteredTags(tags)
    } catch(error){
      console.error(error)
    }
  }
  useEffect(()=>{
    fetchTags()
  }, [])

  return (
    <main className='p-4 relative'>
      <div className='sticky top-0 p-4'>
        <div className='flex flex-row justify-between items-center gap-2'>
          <p className='font-bold text-4xl text-gray-900'>Tags</p>
          <div className='flex flex-row gap-2 items-center'>
            <div>            
              <Input onChange={(e)=>{setSearch(e.target.value)}} className="p-4" placeholder='Search for tags...'></Input>
            </div>
            <AddTag fetchTags={fetchTags} />
          </div>
        </div>
      </div>
      
      <section className='max-h-[80vh] min-w-[80vw] overflow-y-scroll border mt-2'>
        <TagList tags={filteredTags} fetchTags={fetchTags}/>
      </section>
    </main>
  )
}

const AddTag = ({fetchTags}: {fetchTags: ()=>void}) => {

  const [tagName, setTagName] = useState("")
  const [tagDesc, setTagDesc] = useState("")
  const [loading, setLoading] = useState(false)
  const {toast} = useToast()
  const {user} = useUserContext()

  const addTagHandler = async () => {
    try{
      setLoading(true)
      if(tagName==""){
        toast({
          title: "No Tag Name.",
          description: "Enter tag name to create a new tag.",
          variant: "destructive"
        })
      }
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/tag/`, 
        {
          name: tagName,
          description: tagDesc,
          createdBy: user.id
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )
      
      if(!response.data.tag){
        toast({
          title: "Tag not created.",
          description: `${tagName} already exists.`,
        })}
        
      else {
        toast({
          title: "Tag created.",
          description: `${tagName} has been successfully created.`,
        })
        fetchTags()
      }
        
    } catch (error){
      console.log(error)
    } finally {
      setTagName("")
      setTagDesc("")
      setLoading(false)
    }
  }

  return <Dialog>
  <DialogTrigger className='bg-gradient-to-b from-gray-500 to-gray-800 text-white font-semibold border rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 transition-all duration-300'>
    Create Tag
  </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className='my-2'>Create a New Tag</DialogTitle>
      </DialogHeader>
      <div className='flex flex-col gap-2'>
        <Input value={tagName} onChange={(e)=>{setTagName(e.target.value)}} type="text" placeholder="Tag Name"></Input>
        <Textarea value={tagDesc} onChange={(e)=>{setTagDesc(e.target.value)}} rows={2} placeholder="Tag Description (optional)"></Textarea>
      </div>
      <DialogFooter>
        <Button type='submit' disabled={loading} onClick={addTagHandler} className='bg-gradient-to-b from-gray-500 to-gray-800 hover:scale-105 font-semibold transition-all duration-300'>
          {loading 
          ? <Spinner />
          : "Create Tag"
          }
        </Button>
      </DialogFooter>
    </DialogContent>
    
  </Dialog>
}

const EditTag = ({fetchTags, tag}: {fetchTags: ()=>void, tag: tagType}) => {

  const [tagName, setTagName] = useState("")
  const [tagDesc, setTagDesc] = useState("")
  const [loading, setLoading] = useState(false)
  const {toast} = useToast()

  const editTagHandler = async () => {
    try{
      setLoading(true)
      if(tagName==""){
        toast({
          title: "No Tag Name.",
          description: "Enter tag name to edit a new tag.",
          variant: "destructive"
        })
      }
      const response = await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/tag/${tag._id}`, 
        {
          name: tagName,
          description: tagDesc
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )
      
      if(!response.data.tag){
        toast({
          title: "Tag not updated.",
          description: `${tagName} does not exists.`,
        })}
        
      else {
        toast({
          title: "Tag updated.",
          description: `${tagName} has been successfully edited.`,
        })
        fetchTags()
      }
        
    } catch (error){
      console.log(error)
    } finally {
      setTagName("")
      setTagDesc("")
      setLoading(false)
    }
  }

  return <Dialog>
    <DialogTrigger className='flex flex-row gap-2 items-center bg-gradient-to-b from-gray-600 to-gray-900 text-white font-medium rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all'>
      <span>Edit</span> 
      <ChevronRight size={16}/>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className='my-2'>Edit Tag</DialogTitle>
      </DialogHeader>
      <div className='flex flex-col gap-2'>
        <Input value={tagName} onChange={(e)=>{setTagName(e.target.value)}} type="text" placeholder="Tag Name"></Input>
        <Textarea value={tagDesc} onChange={(e)=>{setTagDesc(e.target.value)}} rows={2} placeholder="Tag Description (optional)"></Textarea>
      </div>
      <DialogFooter>
        <Button type='submit' disabled={loading} onClick={editTagHandler} className='bg-gradient-to-b from-gray-500 to-gray-800 hover:scale-105 font-semibold transition-all duration-300'>
          {loading 
          ? <Spinner />
          : "Update Tag"
          }
        </Button>
      </DialogFooter>
    </DialogContent>
    
  </Dialog>
}


type tagType = {
  _id: string
  name: string,
  description: string,
  questions: string[],
  createdBy: Admin
}

type Admin = {
  _id: string
  name: string,
  email: string
}

const TagList = ({tags, fetchTags}: {tags: tagType[], fetchTags: ()=>void}) => {


  return <Table>
  <TableHeader className='bg-gray-50 max-h-[80vh]'>
    <TableRow>
      <TableHead className="w-[100px]">S. No.</TableHead>
      <TableHead>Name</TableHead>
      <TableHead>Description</TableHead>
      <TableHead>Created</TableHead>
      <TableHead>#Questions</TableHead>
      <TableHead></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {tags.map((tag: tagType, index) => (
      <TableRow key={index}>
        <TableCell className="font-medium">{index+1}</TableCell>
        <TableCell className='font-medium'>{tag.name}</TableCell>
        <TableCell>{tag.description}</TableCell>
        <TableCell><div className='bg-gray-100 p-1 rounded-lg w-fit'>{tag.createdBy?.name || ''}</div></TableCell>
        <TableCell>{tag.questions?.length}</TableCell>
        <TableCell className='flex flex-row gap-2 items-center'>
          <EditTag fetchTags={fetchTags} tag={tag}/>
          <DeleteModalButton fetchTags={fetchTags} tagId={tag._id} tagName={tag.name}/>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
  
</Table>

}

const DeleteModalButton = ({tagId, tagName, fetchTags}: {tagId: string, tagName: string, fetchTags: ()=>void}) => {

  const {toast} = useToast()
  const [loading, setLoading] = useState(false)
  const {user} = useUserContext()
  
  const deleteTagHandler = async (tagId: string, tagName: string) => {
    try{
      setLoading(true)
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/tag/${tagId}`)
      toast({
        title: "Tag deleted.",
        description: `${tagName} has been successfully deleted.`
      })
      fetchTags()
    } catch(error){
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return <Dialog>
  <DialogTrigger className='bg-gradient-to-b from-red-500 to-red-700 rounded-md shadow-sm p-2 hover:scale-105 transition-all'>
    <Trash size={16} color='white'/>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete the tag
        and remove your data from the servers.
      </DialogDescription>
      <DialogFooter>
        <Button onClick={()=>{
          deleteTagHandler(tagId, tagName)
        }}
        disabled={loading||user.access=='limited'}
        className='from-red-500 to-red-700 bg-gradient-to-b hover:scale-105 transition-all duration-300'
        >
          { 
            user.access=='limited'
            ? "Access Denied"
            : loading ? <Spinner /> : "Delete"
            
          }

        </Button>
      </DialogFooter>
    </DialogHeader>
  </DialogContent>
</Dialog>
}

export default Tags