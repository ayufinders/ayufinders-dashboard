"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// ---------- Types ----------
type AdminActivity = {
  adminId: string;
  adminName: string;
  totalNotes: number;
  totalMcqs: number;
  totalVideos: number;
  totalPapers: number;
};

type Summary = {
  totalNotes: number;
  totalMcqs: number;
  totalVideos: number;
  totalPapers: number;
};

type ReportResponse = {
  admins: AdminActivity[];
  summary: Summary;
};

// ---------- Component ----------
const Progress = () => {
  const [range, setRange] = useState("today");
  const [customDays, setCustomDays] = useState("7");
  const [date, setDate] = useState("");
  const [data, setData] = useState<AdminActivity[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: Record<string, string> = { range };

        if (range === "custom") params.days = customDays;
        if (range === "date" && date) params.date = date;

        const res = await axios.get<ReportResponse>(`${process.env.NEXT_PUBLIC_BASE_URL}/adminActivity`, { 
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }, 
          withCredentials: true
        });
        setData(res.data.admins);
        setSummary(res.data.summary);
      } catch (err) {
        console.log("Error fetching report", err);
      }
    };

    fetchData();
  }, [range, customDays, date]);

  return (
    <main className="p-6 sm:w-[90vw] md:w-[80vw] lg:min-w-[80vw] mx-auto">
      <div className="sticky top-0 bg-white p-4 z-10">
        <div className="flex flex-row justify-between items-center">
          <p className="font-bold text-3xl text-gray-800">Progress Monitor</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <Select onValueChange={setRange} value={range}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="custom">Last X Days</SelectItem>
              <SelectItem value="date">Specific Date</SelectItem>
            </SelectContent>
          </Select>

          {range === "custom" && (
            <Input
              type="number"
              placeholder="Enter number of days"
              className="w-[160px]"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
            />
          )}

          {range === "date" && (
            <Input
              type="date"
              className="w-[200px]"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}
        </div>
      </div>

      {summary && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Overall Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><strong>Notes:</strong> {summary.totalNotes}</div>
            <div><strong>MCQs:</strong> {summary.totalMcqs}</div>
            <div><strong>Videos:</strong> {summary.totalVideos}</div>
            <div><strong>Papers:</strong> {summary.totalPapers}</div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Admin Contribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>MCQs</TableHead>
                <TableHead>Videos</TableHead>
                <TableHead>Papers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((admin) => (
                  <TableRow key={admin.adminId}>
                    <TableCell>{admin.adminName}</TableCell>
                    <TableCell>{admin.totalNotes}</TableCell>
                    <TableCell>{admin.totalMcqs}</TableCell>
                    <TableCell>{admin.totalVideos}</TableCell>
                    <TableCell>{admin.totalPapers}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
};

export default Progress;
