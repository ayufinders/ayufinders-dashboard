"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { RecoilRoot } from "recoil";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RecoilRoot>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          <Toaster />
          {children}
        </main>
      </SidebarProvider>
    </RecoilRoot>
  );
}
