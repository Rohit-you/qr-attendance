
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import AttendanceService from "@/services/AttendanceService";
import { AttendanceRecord } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AttendancePage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      let attendanceRecords: AttendanceRecord[] = [];
      
      if (user.role === "student") {
        attendanceRecords = AttendanceService.getStudentAttendance(user.id);
      } else if (user.role === "faculty") {
        attendanceRecords = AttendanceService.getFacultyAttendance(user.id);
      } else if (user.role === "hod") {
        // For HOD, get all records (not implemented in this demo)
        attendanceRecords = [];
      }
      
      setRecords(attendanceRecords);
      setFilteredRecords(attendanceRecords);
      
      // Extract unique subjects
      const uniqueSubjects = [...new Set(attendanceRecords.map(record => record.qrData.subject))];
      setSubjects(uniqueSubjects);
    }
  }, [user]);

  useEffect(() => {
    let filtered = [...records];
    
    if (selectedSubject) {
      filtered = filtered.filter(
        (record) => record.qrData.subject === selectedSubject
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.qrData.subject.toLowerCase().includes(term) ||
          record.studentName.toLowerCase().includes(term) ||
          new Date(record.qrData.date).toLocaleDateString().includes(term)
      );
    }
    
    setFilteredRecords(filtered);
  }, [searchTerm, selectedSubject, records]);

  return (
    <DashboardLayout title="Attendance Records">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by subject, name, or date"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === "student" ? "My Attendance" : "Student Attendance"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    {user?.role !== "student" && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.qrData.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.qrData.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.qrData.time}
                      </td>
                      {user?.role !== "student" && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.studentName}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No attendance records found.
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AttendancePage;
