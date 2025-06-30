export interface QuestionType {
  _id: string;
  text: string;
  textHindi: string;
  options: OptionType[];
  optionsHindi: OptionType[];
  correctOption: number;
  explanation?: string;
  explanationHindi?: string;
  reference: {
    title?: string;
    link?: string;
  };
  referenceHindi: {
    title?: string;
    link?: string;
  };
  categoryId: string;
  tagId: TagType[];
  bookId: string;
  sectionId: string;
  createdBy: AdminType;
};

export interface OptionType {
  text: string;
};

export interface TagType {
  _id: string;
  name: string;
  description: string;
  questions: QuestionType[];
  createdBy: AdminType
};

export interface AdminType {
  name: string;
  email: string;
  id: string;
};

export interface SubjectType {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export interface SubjectTopicType {
  _id: string;
  name: string;
  description: string;
  paperId: string;
  tagId: string[];
  createdAt: string;
  updatedAt: string;
};

export interface PaperSectionType {
  _id: string;
  name: string;
  description: string;
  paperId: string;
};

export interface SubTopicType {
  _id: string;
  name: string;
  description: string;
  subjectTopicId: string;
  tagId: TagType[];
  createdAt: string;
  updatedAt: string;
};

export interface FileUpload {
  fileName: string;
  fileDesc: string;
  fileType: string;
  file: File;
}

export interface VideoType {
  _id: string;
  name: string;
  description: string;
  createdBy: AdminType;
  url: string;
  key: string;
};

export interface DocType {
  _id: string;
  name: string;
  description: string;
  createdBy: AdminType;
  url: string;
  key: string;
};

export interface UniversityType {
  _id: string;
  name: string;
  description: string;
  createdBy: AdminType;
};

export interface QuestionPaperType {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: AdminType;
  url: string;
  year: string;
  month: string;
  key: string;
  university: UniversityType
};

export interface BookType {
  _id: string;
  nameEng: string;
  nameHindi: string;
  description: string;
  createdBy: AdminType;
}

export interface BookSectionType {
  _id: string;
  nameEng: string;
  nameHindi: string;
  description: string;
  createdBy: AdminType;
}