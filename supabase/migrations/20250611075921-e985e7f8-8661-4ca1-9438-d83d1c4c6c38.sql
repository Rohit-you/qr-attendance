
-- Create users table for storing user profiles (students, faculty, HOD)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'hod')),
  prn TEXT, -- For students
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  department TEXT,
  faculty_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create QR codes table for generated QR codes
CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) NOT NULL,
  faculty_id UUID REFERENCES public.users(id) NOT NULL,
  class_date DATE NOT NULL,
  class_time TIME NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update the existing attendance table to store proper attendance records
ALTER TABLE public.attendance 
ADD COLUMN student_id UUID REFERENCES public.users(id),
ADD COLUMN qr_code_id UUID REFERENCES public.qr_codes(id),
ADD COLUMN subject_id UUID REFERENCES public.subjects(id),
ADD COLUMN marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD CONSTRAINT unique_student_qr UNIQUE(student_id, qr_code_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Create RLS policies for subjects table
CREATE POLICY "Everyone can view subjects" ON public.subjects
  FOR SELECT USING (true);

CREATE POLICY "Faculty can manage their subjects" ON public.subjects
  FOR ALL USING (faculty_id = auth.uid());

-- Create RLS policies for QR codes table
CREATE POLICY "Faculty can manage their QR codes" ON public.qr_codes
  FOR ALL USING (faculty_id = auth.uid());

CREATE POLICY "Students can view active QR codes" ON public.qr_codes
  FOR SELECT USING (is_active = true AND expires_at > NOW());

-- Create RLS policies for attendance table
CREATE POLICY "Students can view their own attendance" ON public.attendance
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can mark their own attendance" ON public.attendance
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Faculty can view attendance for their subjects" ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.qr_codes qr 
      WHERE qr.id = qr_code_id AND qr.faculty_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX idx_attendance_qr_code_id ON public.attendance(qr_code_id);
CREATE INDEX idx_attendance_subject_id ON public.attendance(subject_id);
CREATE INDEX idx_qr_codes_faculty_id ON public.qr_codes(faculty_id);
CREATE INDEX idx_qr_codes_active ON public.qr_codes(is_active, expires_at);
