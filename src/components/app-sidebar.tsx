"use client"
import { Tags, Files, Settings, Book, UserCircle2, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useUserContext } from "@/context"
import { Button } from "./ui/button"
import axios from "axios"

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
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const {user, setUser} = useUserContext()

  async function deleteCookie() {
    await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/user/admin-logout`, {
      withCredentials: true
    })
  }
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div 
        onClick={()=>{
          router.replace('/')
        }}
        className="font-extrabold text-2xl border-b px-2 py-4 text-gray-700">AyuFinders</div>

        
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="cursor-pointer">
                  <SidebarMenuButton asChild>
                    <div onClick={()=>{
                      router.replace(`/${item.url}`)
                    }}>
                      <item.icon />
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2 border-b p-4 rounded-xl bg-gradient-to-b from-gray-200 to-gray-400 text-gray-700">
            <p className="text-lg font-semibold">Admin</p>
            <div className="flex flex-row gap-2 items-center">
              <div><UserCircle2 className="h-6 w-6"/></div>
              <div className="font-normal">
                <div>{user.name}</div>
              </div>
            </div>
            <div className="font-light text-sm flex flex-col gap-1 text-gray-700">
              <p><strong>Email</strong></p>
              <p className="w-52 overflow-x-scroll rounded-lg bg-gray-100 font-semibold p-2 text-xs">{user.email}</p>
              <p><strong>ID</strong></p>
              <p className="w-52 overflow-x-scroll rounded-lg bg-gray-100 font-semibold p-2 text-xs">{user.id}</p>
            </div>
          </div>
        <Button
        className="font-semibold w-full bg-gradient-to-b from-red-500 to-red-800 text-white hover:scale-105 transition-all duration-300"
        onClick={()=>{
          router.replace('/signin')
          deleteCookie()
          setUser({
            name: null,
            email: null,
            id: null,
            access: null,
            loggedIn: false
          })
          localStorage.removeItem('user')
        }}
        >
          Logout <LogOut />
        </Button>
        </SidebarFooter>
    </Sidebar>
  )
}
