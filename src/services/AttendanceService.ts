
import { AttendanceRecord, QRData, Student } from "@/types";

// In a real app, these would be API calls to a backend
class AttendanceService {
  private static instance: AttendanceService;
  private attendanceRecords: AttendanceRecord[];

  private constructor() {
    // Load from localStorage if available
    const storedRecords = localStorage.getItem("attendanceRecords");
    this.attendanceRecords = storedRecords ? JSON.parse(storedRecords) : [];
  }

  public static getInstance(): AttendanceService {
    if (!AttendanceService.instance) {
      AttendanceService.instance = new AttendanceService();
    }
    return AttendanceService.instance;
  }

  private saveRecords(): void {
    localStorage.setItem(
      "attendanceRecords",
      JSON.stringify(this.attendanceRecords)
    );
  }

  public markAttendance(student: Student, qrData: QRData): AttendanceRecord {
    // Check if student already marked attendance for this class
    const existingRecord = this.attendanceRecords.find(
      (record) =>
        record.studentId === student.id &&
        record.qrData.id === qrData.id
    );

    if (existingRecord) {
      throw new Error("Attendance already marked for this class");
    }

    const record: AttendanceRecord = {
      id: `${Date.now()}-${student.id}`,
      studentId: student.id,
      studentName: student.name,
      qrData,
      timestamp: new Date().toISOString(),
    };

    this.attendanceRecords.push(record);
    this.saveRecords();
    return record;
  }

  public getStudentAttendance(studentId: string): AttendanceRecord[] {
    return this.attendanceRecords.filter(
      (record) => record.studentId === studentId
    );
  }

  public getFacultyAttendance(facultyId: string): AttendanceRecord[] {
    return this.attendanceRecords.filter(
      (record) => record.qrData.facultyId === facultyId
    );
  }

  public getAttendanceBySubject(subject: string): AttendanceRecord[] {
    return this.attendanceRecords.filter(
      (record) => record.qrData.subject === subject
    );
  }

  public getAttendanceByDateRange(startDate: Date, endDate: Date): AttendanceRecord[] {
    return this.attendanceRecords.filter((record) => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  public getFacultyAttendanceByDateRange(facultyId: string, startDate: Date, endDate: Date): AttendanceRecord[] {
    return this.attendanceRecords.filter((record) => {
      const recordDate = new Date(record.timestamp);
      return record.qrData.facultyId === facultyId && 
             recordDate >= startDate && 
             recordDate <= endDate;
    });
  }
}

export default AttendanceService.getInstance();
