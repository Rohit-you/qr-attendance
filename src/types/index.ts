
export type UserRole = "student" | "faculty" | "hod";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Student extends User {
  role: "student";
  prn: string;
}

export interface Faculty extends User {
  role: "faculty";
  email: string;
}

export interface QRData {
  id: string;
  subject: string;
  date: string;
  time: string;
  facultyId: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  qrData: QRData;
  timestamp: string;
}
