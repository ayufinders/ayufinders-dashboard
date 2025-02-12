"use client"
import React, { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from './ui/input';
import { TagType } from '@/types';
import axios from 'axios';
import { Button } from './ui/button';
import { RefreshCcwIcon } from 'lucide-react';

const TagsMenu = ({
  questionTags,
  selectedTags,
  setSelectedTags,
}: {
  questionTags?: TagType[];
  selectedTags: TagType[];
  setSelectedTags: (tags: TagType[]) => void;
}) => {
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState<TagType[]>([])

  const addTag = (id: TagType) => {
    if (!selectedTags.includes(id) && !questionTags?.includes(id)) {
      setSelectedTags([...selectedTags, id]);
    }
  };

  const filteredTags = tags.filter((tag: TagType) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  const fetchTags = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/tag`,
      {
        withCredentials: true,
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem("token")
        }
      }
    );
    const tags = response.data.tags;
    setTags(tags);
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && fetchTags()}>
      <DropdownMenuTrigger 
      className="border p-2 px-4 w-[100px] rounded-md text-sm">
        Select
      </DropdownMenuTrigger>
      <DropdownMenuContent className="overflow-y-auto min-h-[300px] w-[500px] p-2">
        <DropdownMenuLabel>Tags</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className='flex flex-row gap-2'>
          <Button variant={"outline"} onClick={fetchTags}>
            <RefreshCcwIcon />
          </Button>
          <Input
            placeholder="Search tags..."
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            className="mb-2 p-1 text-sm"
          />
        </div>
        
        <div className="max-h-[300px] border overflow-y-auto">
          {filteredTags.length > 0 ? (
            filteredTags.map((item: TagType) => (
              <DropdownMenuItem
                key={item.name}
                onClick={() => addTag(item)}
                className="border-b rounded-none"
              >
                {item.name}
              </DropdownMenuItem>
            ))
          ) : (
            <p className="p-2 text-sm text-gray-500">No tags found</p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TagsMenu;