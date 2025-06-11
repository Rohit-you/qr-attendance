
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type User = Database['public']['Tables']['users']['Row'];
type Subject = Database['public']['Tables']['subjects']['Row'];
type QRCode = Database['public']['Tables']['qr_codes']['Row'];
type AttendanceRecord = Database['public']['Tables']['attendance']['Row'];

export class SupabaseAttendanceService {
  // User management
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  async createUser(userData: {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'faculty' | 'hod';
    prn?: string;
    department?: string;
  }): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  }

  // Subject management
  async getSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }

    return data || [];
  }

  async createSubject(subjectData: {
    name: string;
    code: string;
    department?: string;
    faculty_id: string;
  }): Promise<Subject | null> {
    const { data, error } = await supabase
      .from('subjects')
      .insert([subjectData])
      .select()
      .single();

    if (error) {
      console.error('Error creating subject:', error);
      return null;
    }

    return data;
  }

  // QR Code management
  async createQRCode(qrData: {
    subject_id: string;
    faculty_id: string;
    class_date: string;
    class_time: string;
    expires_at: string;
  }): Promise<QRCode | null> {
    const { data, error } = await supabase
      .from('qr_codes')
      .insert([qrData])
      .select()
      .single();

    if (error) {
      console.error('Error creating QR code:', error);
      return null;
    }

    return data;
  }

  async getQRCode(qrCodeId: string): Promise<QRCode | null> {
    const { data, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        subjects (name, code),
        users!faculty_id (name)
      `)
      .eq('id', qrCodeId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching QR code:', error);
      return null;
    }

    return data;
  }

  // Attendance management
  async markAttendance(attendanceData: {
    student_id: string;
    qr_code_id: string;
    subject_id: string;
  }): Promise<AttendanceRecord | null> {
    // Check if attendance already marked
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', attendanceData.student_id)
      .eq('qr_code_id', attendanceData.qr_code_id)
      .single();

    if (existing) {
      throw new Error('Attendance already marked for this class');
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert([attendanceData])
      .select()
      .single();

    if (error) {
      console.error('Error marking attendance:', error);
      throw new Error('Failed to mark attendance');
    }

    return data;
  }

  async getStudentAttendance(studentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        qr_codes (
          class_date,
          class_time,
          subjects (name, code)
        )
      `)
      .eq('student_id', studentId)
      .order('marked_at', { ascending: false });

    if (error) {
      console.error('Error fetching student attendance:', error);
      return [];
    }

    return data || [];
  }

  async getFacultyAttendance(facultyId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        users!student_id (name, prn),
        qr_codes!inner (
          class_date,
          class_time,
          subjects (name, code)
        )
      `)
      .eq('qr_codes.faculty_id', facultyId)
      .order('marked_at', { ascending: false });

    if (error) {
      console.error('Error fetching faculty attendance:', error);
      return [];
    }

    return data || [];
  }

  async getAttendanceByDateRange(startDate: Date, endDate: Date, facultyId?: string): Promise<any[]> {
    let query = supabase
      .from('attendance')
      .select(`
        *,
        users!student_id (name, prn),
        qr_codes (
          class_date,
          class_time,
          faculty_id,
          subjects (name, code)
        )
      `)
      .gte('marked_at', startDate.toISOString())
      .lte('marked_at', endDate.toISOString());

    if (facultyId) {
      query = query.eq('qr_codes.faculty_id', facultyId);
    }

    const { data, error } = await query.order('marked_at', { ascending: false });

    if (error) {
      console.error('Error fetching attendance by date range:', error);
      return [];
    }

    return data || [];
  }
}

export const supabaseAttendanceService = new SupabaseAttendanceService();
