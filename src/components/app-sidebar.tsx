"use client"
import { Tags, Files, Settings, Book } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import AdminDetail from "./AdminDetail"
import { cn } from "@/lib/utils"

// Menu items.
const items = [
  {
    title: "Tags",
    url: "tags",
    icon: Tags,
  },
  {
    title: "Quiz",
    url: "quiz",
    icon: Files,
  },
  {
    title: "Syllabus",
    url: "syllabus",
    icon: Book,
  },
  {
    title: "PYQs",
    url: "pyqs",
    icon: Book,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const path = pathname.split('/')[1]
  
  return (
    <Sidebar>
      <SidebarHeader className="border-b bg-gray-300">
        <div 
        onClick={()=>{
          router.replace('/')
        }}
        className="font-extrabold text-3xl pt-4 text-center">AyuFinders</div>
        <AdminDetail />
        
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-md">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="cursor-pointer">
                  <SidebarMenuButton asChild>
                    <div onClick={()=>{
                      router.replace(`/${item.url}`)
                    }}
                    className={cn("hover:bg-gray-200 mb-1 text-gray-500 hover:text-gray-500", {
                      "bg-gray-300 font-semibold hover:bg-gray-300 hover:font-semibold": path===item.url,
                    })}
                    >
                      <item.icon className="h-6 w-6"/>
                      <span className="text-md">{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
      </SidebarContent>
      
    </Sidebar>
  )
}
