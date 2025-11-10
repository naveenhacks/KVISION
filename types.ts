
export enum UserRole {
  Admin = 'admin',
  Teacher = 'teacher',
  Student = 'student',
}

export interface StudentData {
  courses: string[];
  attendance: number; // percentage
  overallGrade: number; // percentage
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  blocked?: boolean;
  studentData?: StudentData;
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  dataUrl: string; // Base64 encoded file
}

export interface Homework {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  description: string;
  uploadDate: string;
  teacherId: string;
  teacherName: string;
  file?: UploadedFile;
  completed?: boolean;
}

export interface Announcement {
  id:string;
  title: string;
  content: string;
  date: string;
  teacherName: string;
}

export interface StudentPerformance {
  name: string;
  attendance: number;
  grade: number;
}

export interface Message {
  id: string;
  content: {
    type: 'text';
    value: string;
  } | {
    type: 'file';
    value: UploadedFile;
  };
  timestamp: string; // ISO String
  senderId: string;
  receiverId: string;
  status: 'sent' | 'delivered' | 'read';
}

// A new type for the admin-sent notifications system.
export interface Notification {
  id: string;
  title: string;
  content: string;
  date: string; // ISO String
  target: 'all' | UserRole;
  readBy: string[]; // Array of user IDs who have read the notification
}

// --- Homepage Content Types ---

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface TextBlock {
  title: string;
  content: string;
}

export interface Stat {
  id: string;
  value: number;
  label: string;
}

export interface PrincipalInfo {
  name: string;
  title: string;
  message: string;
  imageUrl: string;
}

export interface HomepageAnnouncement {
  id: string;
  title: string;
  date: string;
  content: string;
  status: SubmissionStatus;
  submittedBy: string; // user ID
  authorName?: string; // user name
}

export interface GalleryImage {
  id: string;
  src: string; // dataUrl
  alt: string;
  status: SubmissionStatus;
  submittedBy: string; // user ID
  authorName?: string; // user name
}

export interface ContactInfo {
  schoolName: string;
  address: string;
  email: string;
  phone: string;
  website: string;
}

export interface HomepageContent {
  principalInfo: PrincipalInfo;
  vision: TextBlock;
  mission: TextBlock;
  coreValues: TextBlock;
  stats: Stat[];
  announcements: HomepageAnnouncement[];
  galleryImages: GalleryImage[];
  contactInfo: ContactInfo;
}