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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table"

import { Input } from '@/components/ui/input'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'

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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/tag/`);
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
    <main className='p-4'>
      <div className='sticky border-b z-50 top-0 bg-white p-4'>
        <div className='flex flex-row justify-between items-center'>
          <p className='font-bold text-4xl'>TAGS</p>
          <div className='flex flex-row gap-2 items-center'>
            <div>            
              <Input onChange={(e)=>{setSearch(e.target.value)}} className="p-4" placeholder='Search for tags...'></Input>
            </div>
            <AddTag fetchTags={fetchTags} />
          </div>
        </div>
      </div>
      
      <section>
        <TagList tags={filteredTags} fetchTags={fetchTags}/>
      </section>
    </main>
  )
}

const AddTag = ({fetchTags}: {fetchTags: ()=>void}) => {

  const [tagName, setTagName] = useState("")
  const [tagDesc, setTagDesc] = useState("")
  const {toast} = useToast()

  const addTagHandler = async () => {
    try{
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
          description: tagDesc
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
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
    }
  }

  return <Dialog>
  <DialogTrigger className='border rounded-md shadow-sm p-2 px-4 text-sm hover:bg-gray-100 transition-all'>
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
        <Button type='submit' onClick={addTagHandler}>Create Tag</Button>
      </DialogFooter>
    </DialogContent>
    
  </Dialog>
}

type tagType = {
  _id: string
  name: string,
  description: string,
  questions: string[]
}

const TagList = ({tags, fetchTags}: {tags: tagType[], fetchTags: ()=>void}) => {


  return <Table>
  <TableCaption>A list of your created tags.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">S. No.</TableHead>
      <TableHead>Name</TableHead>
      <TableHead>Description</TableHead>
      <TableHead>#Questions</TableHead>
      <TableHead></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {tags.map((tag: tagType, index) => (
      <TableRow key={index}>
        <TableCell className="font-medium">{index+1}</TableCell>
        <TableCell>{tag.name}</TableCell>
        <TableCell>{tag.description}</TableCell>
        <TableCell>{tag.questions?.length}</TableCell>
        <TableCell>
          <DeleteModalButton fetchTags={fetchTags} tagId={tag._id} tagName={tag.name}/>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={4}>Total</TableCell>
      <TableCell className="text-right">{tags.length}</TableCell>
    </TableRow>
  </TableFooter>
</Table>

}

const DeleteModalButton = ({tagId, tagName, fetchTags}: {tagId: string, tagName: string, fetchTags: ()=>void}) => {

  const {toast} = useToast()
  
  const deleteTagHandler = async (tagId: string, tagName: string) => {
    try{
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/tag/${tagId}`)
      toast({
        title: "Tag deleted.",
        description: `${tagName} has been successfully deleted.`
      })
      fetchTags()
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
        This action cannot be undone. This will permanently delete the tag
        and remove your data from the servers.
      </DialogDescription>
      <DialogFooter>
        <Button onClick={()=>{
          deleteTagHandler(tagId, tagName)
        }}>Delete</Button>
      </DialogFooter>
    </DialogHeader>
  </DialogContent>
</Dialog>
}

export default Tags