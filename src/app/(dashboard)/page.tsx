"use client";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context";
import { Book, Tags, Files } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Dashboard = () => {
  const items = [
    {
      title: "Tags",
      icon: Tags,
      path: "/tags",
    },
    {
      title: "Syllabus",
      icon: Book,
      path: "/syllabus",
    },
    {
      title: "Quiz",
      icon: Files,
      path: "/quiz",
    },
    {
      title: "PYQs",
      icon: Files,
      path: "/pyqs",
    },
  ];

  const router = useRouter();
  const {user} = useUserContext()
  useEffect(()=>{
    if(user.access === "limited") {
      router.push(`/syllabus/subject/paper/${user.subjectId}/${user.subjectName}`)
    }
  }, [user, router])

  return (
    <main className="p-4">
      <div className="font-bold text-2xl">Dashboard</div>
      <div className="flex flex-row gap-2 mt-4">
        {items.map((item) => (
          <div key={item.title}>
            <Button
              onClick={() => {
                router.push(`${item.path}`);
              }}
              className="bg-gradient-to-b from-gray-500 to-gray-900 px-6 py-2 font-semibold cursor-pointer hover:scale-105 transition-all duration-300"
            >
              {item.title}
              <item.icon></item.icon>
            </Button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Dashboard;
