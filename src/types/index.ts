
import { Database } from "@/integrations/supabase/types";

export type UserRole = "student" | "faculty" | "hod";

export type User = Database['public']['Tables']['users']['Row'];
export type Subject = Database['public']['Tables']['subjects']['Row'];
export type QRCode = Database['public']['Tables']['qr_codes']['Row'];
export type AttendanceRecord = Database['public']['Tables']['attendance']['Row'];

export interface Student extends User {
  role: "student";
  prn: string;
}

export interface Faculty extends User {
  role: "faculty";
}

export interface QRData {
  id: string;
  subject: string;
  subjectId: string;
  date: string;
  time: string;
  facultyId: string;
  expiresAt: string;
}

export interface AttendanceRecordWithDetails extends AttendanceRecord {
  qr_codes?: {
    class_date: string;
    class_time: string;
    subjects: {
      name: string;
      code: string;
    } | null;
  } | null;
  users?: {
    name: string;
    prn: string | null;
  } | null;
}
