"use client";

import React from "react";
import { useUserContext } from "@/context";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

const AdminDetail = () => {
  const router = useRouter();
  const { user, setUser } = useUserContext();

  async function deleteCookie() {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/admin-logout`,
      {
        withCredentials: true,
      }
    );
  }

  const handleLogout = async () => {
    await deleteCookie();
    setUser({
      name: null,
      email: null,
      id: null,
      access: null,
      loggedIn: false,
    });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.replace("/signin");
  };

  return (
    <div className="w-full flex items-center justify-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <UserCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">{user.name || "Admin"}</span>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="mx-2">
          <DropdownMenuLabel>Admin Details</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <strong>Email:</strong> {user.email || "N/A"}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <strong>ID:</strong> {user.id || "N/A"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AdminDetail;
