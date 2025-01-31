"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import Spinner from "@/components/Spinner";
import { ChevronRight, SquareArrowOutUpRightIcon, Trash } from "lucide-react";
import { useUserContext } from "@/context";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Papers = () => {
  const [papers, setPapers] = useState<PaperType[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<PaperType[]>([]);
  const [search, setSearch] = useState("");

  const params = useParams();
  const subjectId = params.subjectId;
  const subjectName = decodeURIComponent(params.subjectName as string);

  const fetchPapers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/questionPaper/${subjectId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      const papers = response.data.data;
      setPapers(papers);
      setFilteredPapers(papers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const filteredPapers = papers.filter((topic) =>
      topic.name.toLowerCase().includes(search.toLowerCase()) 
      || topic.university.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPapers(filteredPapers);
  }, [search, papers]);

  useEffect(() => {
    fetchPapers();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-4 sm:w-[90vw] md:w-[80vw] lg:min-w-[80vw] mx-auto">
      <div className="sticky top-0 bg-white">
        <div className="flex flex-row justify-between items-center p-4">
          <p className="font-bold text-3xl">{subjectName}</p>
          <div className="flex flex-row gap-2">
            <div className="w-full sm:w-auto">
              <Input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="p-2 w-full"
                placeholder="Search"
              />
            </div>
            
            <AddPaper
              fetchTopics={fetchPapers}
              subjectId={subjectId as string}
            />
          </div>
        </div>
      </div>

      <section className="min-w-[80vw] max-h-[80vh] overflow-y-scroll border">
        <PaperList papers={filteredPapers} fetchTopics={fetchPapers} />
      </section>
    </main>
  );
};

type PaperType = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: Admin;
  url: string;
  year: string;
  month: string;
  key: string;
  university: UniversityType
};

type Admin = {
  name: string;
};

const PaperList = ({
  papers,
  fetchTopics,
}: {
  papers: PaperType[];
  fetchTopics: () => void;
}) => {
  return (
    <Table className="w-full">
      <TableHeader className="bg-gray-50">
        <TableRow>
          <TableHead className="w-[100px]">S. No.</TableHead>
          <TableHead>Month</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>University</TableHead>
          <TableHead>Added By</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {papers.map((sub: PaperType, index: number) => (
          <TableRow key={index} className="cursor-pointer hover:bg-gray-50">
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-medium">{sub.month}</TableCell>
            <TableCell className="font-medium">{sub.year}</TableCell>
            <TableCell className="font-semibold">{sub.name}</TableCell>
            <TableCell>{sub.description? "Added":"Not Added"}</TableCell>
            <TableCell>{sub.university.name}</TableCell>
            <TableCell>{sub.createdBy?.name}</TableCell>
            <TableCell className="flex gap-4 items-center">
              <EditPaper
                paper={sub}
                fetchData={fetchTopics}
              />
              <DeleteModalButton
                paperId={sub._id}
                paperName={sub.name}
                fetchTopics={fetchTopics}
              />
              <a href={sub.url} target="_blank">
                <SquareArrowOutUpRightIcon className="h-6 w-6 text-gray-500 font-thin" />
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const AddPaper = ({
  fetchTopics,
  subjectId,
}: {
  fetchTopics: () => void;
  subjectId: string;
}) => {
  const [paperName, setPaperName] = useState("");
  const [paperDesc, setPaperDesc] = useState("");
  const [fileData, setFileData] = useState<FileUpload | null>(null);
  const [thumbnailData, setThumbnailData] = useState<FileUpload | null>(null);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [uniId, setUniId] = useState<string>()
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileData({
        fileName: file.name,
        fileType: file.type,
        fileDesc: paperDesc,
        file,
      });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailData({
        fileName: file.name,
        fileType: file.type,
        fileDesc: paperDesc,
        file,
      });
    }
  };


  const { user } = useUserContext();

  const addPaperHandler = async () => {
    if (!fileData || !paperName)
      return alert("File and document details are required");

    try {
      setLoading(true);

      const docRes = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/aws/generate-presigned-url`,
        {
          fileName: fileData.fileName,
          fileType: fileData.fileType,
        },
        {
          headers: { 
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          },
          withCredentials: true,
        }
      );

      const { url: docUrl, key: docKey } = docRes.data;

      // Upload the file to S3
      await axios.put(docUrl, fileData.file, {
        headers: { "Content-Type": fileData.fileType },
      });

      // Upload the thumbnail if provided
      let thumbnailKey = null;
      if (thumbnailData) {
        const thumbRes = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/aws/generate-presigned-url`,
          {
            fileName: thumbnailData.fileName,
            fileType: thumbnailData.fileType,
          },
          {
            headers: { 
              "Content-Type": "application/json",
              'Authorization': 'Bearer ' + localStorage.getItem("token")
            },
            withCredentials: true,
          }
        );

        const { url: thumbUrl, key: thumbKey } = thumbRes.data;

        // Upload the thumbnail to S3
        await axios.put(thumbUrl, thumbnailData.file, {
          headers: { "Content-Type": thumbnailData.fileType },
        });

        thumbnailKey = thumbKey;
      }

      // save the urls to database
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/questionPaper/${subjectId}`,
        {
          name: paperName,
          description: paperDesc,
          subjectId: subjectId,
          createdBy: user.id,
          key: docKey,
          thumbnailKey,
          year: year,
          month: month,
          university: uniId
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          },
          withCredentials: true,
        }
      );

      if (!response.data.success) {
        toast({
          title: "Paper not created.",
          description: `${paperName} already exists.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Paper created.",
          description: `${paperName} has been successfully created.`,
        });
        fetchTopics();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPaperName("");
      setPaperDesc("");
      setYear("");
      setMonth("");
      setUniId("");
      setFileData(null);
      setThumbnailData(null);
      setLoading(false);
    }
  };

  const [unis, setUnis] = useState<UniversityType[]>([])

  const fetchUnis = async () => {
    try{
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/universities`, {
        withCredentials: true,
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token")
        }
      })
      const universities = response.data.universities
      setUnis(universities)
    }
    catch(error){
      console.log(error)
    }
  }


  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-gray-600 to-gray-800 font-semibold text-white rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all">
        Add Paper
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Paper</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={paperName}
            onChange={(e) => {
              setPaperName(e.target.value);
            }}
            type="text"
            placeholder="Paper Name"
            required
          />
          <Textarea
            value={paperDesc}
            onChange={(e) => {
              setPaperDesc(e.target.value);
            }}
            rows={2}
            placeholder="Paper Description (optional)"
            required
          />

          <Label className="mt-4">College</Label>
          <Select onValueChange={setUniId}>
            <SelectTrigger className="w-full" onClick={fetchUnis}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {unis.map((uni: UniversityType)=>{
                return <SelectItem key={uni._id} value={uni._id}>{uni.name}</SelectItem>
              })}
            </SelectContent>
          </Select>

          <Label className="mt-4">Month</Label>
          <Select onValueChange={setMonth}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month: string)=>{
                return <SelectItem key={month} value={month}>{month}</SelectItem>
              })}
            </SelectContent>
          </Select>

          <Label className="mt-2">Year</Label>
          <Input
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
            }}
            type="text"
            placeholder="20XX"
            required={true}
          />

          <Label className="mt-2">Thumbnail Image</Label>
          <Input type="file" onChange={handleThumbnailChange} />

          <Label className="mt-2">Question Paper Pdf</Label>
          <Input type="file" onChange={handleFileChange} />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={addPaperHandler}
            className="bg-gradient-to-b from-gray-600 to-gray-800 font-semibold text-white rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all"
            disabled={loading}
          >
            {loading ? <Spinner /> : "Add Paper"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditPaper = ({
  fetchData,
  paper,
}: {
  fetchData: () => void;
  paper: PaperType;
}) => {
  const [name, setName] = useState(paper.name);
  const [desc, setDesc] = useState(paper.description);
  const [month, setMonth] = useState(paper.month);
  const [year, setYear] = useState(paper.year);
  const [uniId, setUniId] = useState(paper.university?._id);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [unis, setUnis] = useState<UniversityType[]>([])

  const fetchUnis = async () => {
    try{
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/universities`, {
        withCredentials: true,
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token")
        }
      })
      const universities = response.data.universities
      setUnis(universities)
    }
    catch(error){
      console.log(error)
    }
  }

  const editTopicHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/questionPaper/${paper._id}`,
        {
          name: name,
          description: desc,
          month: month,
          year: year,
          university: uniId
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          },
          withCredentials: true,
        }
      );

      toast({
        title: response.data.success ? "Paper updated" : "Paper not updated",
        description: response.data.success
          ? `${name} successfully updated.`
          : `${name} does not exist.`,
        variant: response.data.success ? "default" : "destructive",
      });
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setName("");
      setDesc("");
      setYear("");
      setMonth("");
      setUniId("");
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-b from-gray-500 to-gray-800 px-4 py-1 hover:scale-105 transition-all duration-300">
          Edit <ChevronRight size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="my-2 text-gray-700">Edit Paper</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
        <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            type="text"
            placeholder="Paper Name"
            required
          />
          <Textarea
            value={desc}
            onChange={(e) => {
              setDesc(e.target.value);
            }}
            rows={2}
            placeholder="Paper Description (optional)"
            required
          />

          <Label className="mt-4">College</Label>
          <Select onValueChange={setUniId}>
            <SelectTrigger className="w-full" onClick={fetchUnis}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {unis.map((uni: UniversityType)=>{
                return <SelectItem key={uni._id} value={uni._id}>{uni.name}</SelectItem>
              })}
            </SelectContent>
          </Select>

          <Label className="mt-4">Month</Label>
          <Select onValueChange={setMonth}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month: string)=>{
                return <SelectItem key={month} value={month}>{month}</SelectItem>
              })}
            </SelectContent>
          </Select>

          <Label className="mt-2">Year</Label>
          <Input
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
            }}
            type="text"
            placeholder="20XX"
            required={true}
          />
        </div>
        <DialogFooter>
          <Button
            className="bg-gradient-to-b from-gray-600 to-gray-900 text-white hover:scale-105 font-semibold transition-all duration-300"
            onClick={editTopicHandler}
            disabled={loading}
          >
            {loading ? <Spinner /> : "Edit Topic"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteModalButton = ({
  paperId,
  paperName,
  fetchTopics,
}: {
  paperId: string;
  paperName: string;
  fetchTopics: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user } = useUserContext();

  const params = useParams();
  const subjectId = params.subjectId;

  const deletePaperHandler = async (paperId: string, paperName: string) => {
    try {
      setLoading(true);

      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/questionPaper/${subjectId}/${paperId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      toast({
        title: "Paper deleted.",
        description: `${paperName} has been successfully deleted.`,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      fetchTopics();
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 text-sm hover:scale-105 duration-300 transition-all">
        <Trash size={16} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action is permanent. You cannot undo this.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => deletePaperHandler(paperId, paperName)}
            className="bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 px-4 text-sm hover:scale-105 duration-300 transition-all"
            disabled={loading || user.access === "limited"}
          >
            {user.access === "limited" ? (
              "Access Denied"
            ) : loading ? (
              <Spinner />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface FileUpload {
  fileName: string;
  fileDesc: string;
  fileType: string;
  file: File;
}

type UniversityType = {
  _id: string;
  name: string;
  description: string;
  createdBy: Admin;
};

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

export default Papers;
