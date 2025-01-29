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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUserContext } from "@/context";
import { Copy, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@/components/ui/select";

const SubTopicData = () => {
  const [mcqQuestions, setMcqQuestions] = useState<QuestionType[]>([]);
  const [filteredMcqQuestions, setFilteredMcqQuestions] = useState<
    QuestionType[]
  >([]);
  const [search, setSearch] = useState("");

  const [videos, setVideos] = useState<VideoType[]>([]);
  const [docs, setDocs] = useState<DocType[]>([]);

  const params = useParams();
  const subTopicId = params.subTopicId;
  const subTopicName = decodeURIComponent(params.subTopicName as string);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic/${subTopicId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      const data = response.data.data;
      setMcqQuestions(data.questions);
      setFilteredMcqQuestions(data.questions);

      setVideos(data.subTopic.videos);
      setDocs(data.subTopic.notes);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const filteredQuestions = mcqQuestions.filter((ques) =>
      ques.text.toLowerCase().includes(search)
    );
    setFilteredMcqQuestions(filteredQuestions);
  }, [search, mcqQuestions]);

  useEffect(() => {
    fetchData();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-4 w-[80vw]">
      <div className="sticky z-50 top-0 bg-white">
        <div className="flex flex-row justify-between items-center p-4">
          <p className="font-bold text-3xl">{subTopicName}</p>
          <div className="flex flex-row gap-2">
            <div>
              <Input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="p-2 w-[200px]"
                placeholder="Search for Questions..."
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-bold text-gray-600 text-lg no-underline hover:no-underline">
              MCQ Questions
            </AccordionTrigger>
            <AccordionContent className="border">
              <QuestionsList questions={filteredMcqQuestions} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="font-bold text-gray-600 text-lg no-underline hover:no-underline">
              Notes
            </AccordionTrigger>
            <AccordionContent className="border p-4">
              <div>
                <UploadDocFile fetchData={fetchData} />
                <div>
                  <DocsList docs={docs} fetchData={fetchData} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="font-bold text-gray-600 text-lg no-underline hover:no-underline">
              Video Lectures
            </AccordionTrigger>
            <AccordionContent className="border p-4">
              <div>
                <UploadVideoFile fetchData={fetchData} />
                <div>
                  <VideoList videos={videos} fetchData={fetchData} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
};

const QuestionsList = ({ questions }: { questions: QuestionType[] }) => {
  const router = useRouter();
  return (
    <Table className="w-full">
      <TableHeader className="bg-gray-100">
        <TableRow>
          <TableHead className="w-[100px]">S. No.</TableHead>
          <TableHead>Text</TableHead>
          <TableHead>Created By</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map((ques: QuestionType, index: number) => (
          <TableRow key={index} className="cursor-pointer">
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-semibold">
              <div
                className="hover:text-blue-800 hover:underline"
                onClick={() => {
                  router.push(`/quiz/${ques.categoryId}/Questions`);
                }}
              >
                {ques.text}
              </div>
            </TableCell>
            <TableCell>
              <div className="text-xs p-1 bg-gray-100 rounded-full w-fit">
                {ques.createdBy.name}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const UploadVideoFile = ({ fetchData }: { fetchData: () => void }) => {
  const [fileData, setFileData] = useState<FileUpload | null>(null);
  const [thumbnailData, setThumbnailData] = useState<FileUpload | null>(null);
  const [videoName, setVideoName] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<string>("eng")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileData({
        fileName: file.name,
        fileType: file.type,
        fileDesc: videoDesc,
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
        fileDesc: videoDesc,
        file,
      });
    }
  };

  const { user } = useUserContext();
  const params = useParams();
  const subTopicId = params.subTopicId;

  const handleUpload = async () => {
    if (!fileData || !videoDesc || !videoName)
      return alert("File and video details are required");

    try {
      setLoading(true);
      const res = await axios.post(
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

      const { url, key } = res.data;

      // Upload the file to S3
      await axios.put(url, fileData.file, {
        headers: {
          "Content-Type": fileData.fileType,
        },
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
          headers: { 
            "Content-Type": thumbnailData.fileType,
          },
        });

        thumbnailKey = thumbKey;
      }

      toast({
        title: "File uploaded",
        description: `File uploaded with key: ${key}`,
      });

      // Save key and topic in the backend
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic/video/upload/${subTopicId}`,
        {
          name: videoName,
          description: videoDesc,
          createdBy: user.id,
          thumbnailKey: thumbnailKey,
          key: key,
          language: lang
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
        title: "Video stored",
      });

      fetchData();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm text-nowrap font-semibold hover:scale-105 duration-300 transition-all">
        Upload Video Lecture
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Video Lecture {"(mp4)"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={videoName}
            onChange={(e) => {
              setVideoName(e.target.value);
            }}
            type="text"
            placeholder="Video Name"
          ></Input>
          <Textarea
            value={videoDesc}
            onChange={(e) => {
              setVideoDesc(e.target.value);
            }}
            rows={2}
            placeholder="Video Description"
          ></Textarea>
          <Label>Video File</Label>
          <Input type="file" onChange={handleFileChange}></Input>
          <Label>Thumbnail Image</Label>
          <Input type="file" onChange={handleThumbnailChange}></Input>

          <Label>Language</Label>
          <Select onValueChange={setLang} value={lang}>
            <SelectGroup>
              <SelectTrigger>{lang=="eng" ? "English" : "Hindi"}</SelectTrigger>
              <SelectContent>
                <SelectItem value="hi">English</SelectItem>
                <SelectItem value="eng">Hindi</SelectItem>
              </SelectContent>
            </SelectGroup>
          </Select>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleUpload}
            className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm font-semibold hover:scale-105 duration-300 transition-all"
          >
            {loading ? <Spinner /> : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const VideoList = ({
  videos,
  fetchData,
}: {
  videos: VideoType[];
  fetchData: () => void;
}) => {
  const [show, setShow] = useState(false);
  return (
    <Table className="w-full mt-4">
      <TableHeader className="bg-gray-100">
        <TableRow>
          <TableHead className="w-[100px]">S. No.</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>URL</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {videos.map((video: VideoType, index: number) => (
          <TableRow key={index} className="cursor-pointer">
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-semibold">{video.name}</TableCell>
            <TableCell>{video.description}</TableCell>
            <TableCell>
              <div className="text-xs p-1 bg-gray-100 rounded-full w-fit">
                {video.createdBy.name}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-row gap-2 items-center">
                <div
                  className="hover:scale-105 transition-all duration-300 bg-gray-200 p-2 rounded"
                  onClick={() => navigator.clipboard.writeText(video.url)}
                >
                  <Copy size={16} className="text-gray-700" />
                </div>
                <div
                  onClick={() => {
                    setShow(!show);
                  }}
                  className="hover:scale-105 transition-all duration-300 bg-gray-200 p-2 rounded"
                >
                  Preview
                  <VideoPreview show={show} setShow={setShow} url={video.url} />
                </div>
                <div className="hover:scale-105 transition-all duration-300">
                  <DeleteVideoModalButton
                    fetchData={fetchData}
                    videoId={video._id}
                    vidKey={video.key}
                  />
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const UploadDocFile = ({ fetchData }: { fetchData: () => void }) => {
  const [fileData, setFileData] = useState<FileUpload | null>(null);
  const [thumbnailData, setThumbnailData] = useState<FileUpload | null>(null);
  const [docName, setDocName] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("eng")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileData({
        fileName: file.name,
        fileType: file.type,
        fileDesc: docDesc,
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
        fileDesc: docDesc,
        file,
      });
    }
  };

  const { user } = useUserContext();
  const params = useParams();
  const subTopicId = params.subTopicId;

  const handleUpload = async () => {
    if (!fileData || !docDesc || !docName)
      return alert("File and document details are required");

    try {
      setLoading(true);
      const res = await axios.post(
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

      const { url, key } = res.data;

      // Upload the file to S3
      await axios.put(url, fileData.file, {
        headers: {
          "Content-Type": fileData.fileType,
        },
      });

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

      toast({
        title: "File uploaded",
        description: `File uploaded with key: ${key}`,
      });

      // Save key and topic in the backend
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic/docs/upload/${subTopicId}`,
        {
          name: docName,
          description: docDesc,
          createdBy: user.id,
          key: key,
          thumbnailKey: thumbnailKey,
          subTopicId: subTopicId,
          language: lang
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
        title: "Video stored",
      });

      fetchData();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm text-nowrap font-semibold hover:scale-105 duration-300 transition-all">
        Upload Notes File
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Notes File {"(pdf)"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            value={docName}
            onChange={(e) => {
              setDocName(e.target.value);
            }}
            type="text"
            placeholder="Doc Name"
          ></Input>
          <Textarea
            value={docDesc}
            onChange={(e) => {
              setDocDesc(e.target.value);
            }}
            rows={2}
            placeholder="Doc Description"
          ></Textarea>
          <Label>Notes PDF</Label>
          <Input type="file" onChange={handleFileChange}></Input>
          <Label>Thumbnail Image</Label>
          <Input type="file" onChange={handleThumbnailChange} />

          <Label>Language</Label>
          <Select onValueChange={setLang} value={lang}>
            <SelectGroup>
              <SelectTrigger value={lang}>Choose language</SelectTrigger>
              <SelectContent>
                <SelectItem value="hi">English</SelectItem>
                <SelectItem value="eng">Hindi</SelectItem>
              </SelectContent>
            </SelectGroup>
          </Select>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleUpload}
            className="bg-gradient-to-b from-gray-600 to-gray-900 text-white rounded-md shadow-sm p-2 px-4 text-sm font-semibold hover:scale-105 duration-300 transition-all"
          >
            {loading ? <Spinner /> : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DocsList = ({
  docs,
  fetchData,
}: {
  docs: DocType[];
  fetchData: () => void;
}) => {
  const [show, setShow] = useState(false);
  return (
    <Table className="w-full mt-4">
      <TableHeader className="bg-gray-100">
        <TableRow>
          <TableHead className="w-[100px]">S. No.</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>URL</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {docs.map((doc: DocType, index: number) => (
          <TableRow key={index} className="cursor-pointer">
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-semibold">{doc.name}</TableCell>
            <TableCell>{doc.description}</TableCell>
            <TableCell>
              <div className="text-xs p-1 bg-gray-100 rounded-full w-fit">
                {doc.createdBy.name}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-row gap-2 items-center">
                <div
                  className="hover:scale-105 transition-all duration-300 bg-gray-200 p-2 rounded"
                  onClick={() => navigator.clipboard.writeText(doc.url)}
                >
                  <Copy size={16} className="text-gray-700" />
                </div>
                <div
                  onClick={() => {
                    setShow(!show);
                  }}
                  className="hover:scale-105 transition-all duration-300 bg-gray-200 p-2 rounded"
                >
                  Preview
                  <VideoPreview url={doc.url} show={show} setShow={setShow} />
                </div>
                <div className="hover:scale-105 transition-all duration-300">
                  <DeleteDocModalButton
                    docId={doc._id}
                    docKey={doc.key}
                    fetchData={fetchData}
                  />
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const DeleteVideoModalButton = ({
  vidKey,
  videoId,
  fetchData,
}: {
  vidKey: string;
  videoId: string;
  fetchData: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const subTopicId = params.subTopicId;
  const { user } = useUserContext();

  const deleteHandler = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/aws/delete-resource/${vidKey}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic/video/delete/${subTopicId}/${videoId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );

      toast({
        title: "Video lecture deleted.",
        description: vidKey,
      });
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 text-sm">
        <Trash size={16} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the topic
            and remove your data from the servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              deleteHandler();
            }}
            disabled={loading || user.access === "limited"}
            className="bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 text-sm hover:scale-105 duration-300 transition-all flex items-center gap-2"
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

const DeleteDocModalButton = ({
  docKey,
  docId,
  fetchData,
}: {
  docKey: string;
  docId: string;
  fetchData: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const subTopicId = params.subTopicId;
  const { user } = useUserContext();

  const deleteHandler = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/aws/delete-resource/${docKey}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subTopic/docs/delete/${subTopicId}/${docId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          }
        }
      );

      toast({
        title: "Document deleted.",
        description: docKey,
      });
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 text-sm">
        <Trash size={16} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the topic
            and remove your data from the servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              deleteHandler();
            }}
            disabled={loading || user.access === "limited"}
            className="bg-gradient-to-b from-red-500 to-red-800 text-white font-medium rounded-md shadow-sm p-2 text-sm hover:scale-105 duration-300 transition-all flex items-center gap-2"
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

const VideoPreview = ({
  url,
  show,
  setShow,
}: {
  url: string;
  show: boolean;
  setShow: (x: boolean) => void;
}) => {
  return (
    <div className={cn("hidden bg-transparent", { block: show })}>
      <iframe src={url} />
      <Button
        onClick={() => setShow(!show)}
        className="mt-2 bg-gradient-to-b from-gray-500 to-gray-900 font-semibold"
      >
        Close
      </Button>
    </div>
  );
};

interface FileUpload {
  fileName: string;
  fileDesc: string;
  fileType: string;
  file: File;
}

type VideoType = {
  _id: string;
  name: string;
  description: string;
  createdBy: Admin;
  url: string;
  key: string;
};

type DocType = {
  _id: string;
  name: string;
  description: string;
  createdBy: Admin;
  url: string;
  key: string;
};

type QuestionType = {
  _id: string;
  text: string;
  options: OptionType[];
  correctOption: number;
  explanation?: string;
  reference: {
    title?: string;
    link?: string;
  };
  categoryId: string;
  tagId: string[];
  createdBy: Admin;
};

type Admin = {
  name: string;
  _id: string;
};

type OptionType = {
  text: string;
};

export default SubTopicData;
