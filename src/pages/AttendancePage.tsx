
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { AttendanceRecordWithDetails } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseAttendanceService } from "@/services/SupabaseAttendanceService";

const AttendancePage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecordWithDetails[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecordWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAttendanceRecords();
    }
  }, [user]);

  const loadAttendanceRecords = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let attendanceRecords: AttendanceRecordWithDetails[] = [];
      
      if (user.role === "student") {
        attendanceRecords = await supabaseAttendanceService.getStudentAttendance(user.id);
      } else if (user.role === "faculty") {
        attendanceRecords = await supabaseAttendanceService.getFacultyAttendance(user.id);
      }
      
      setRecords(attendanceRecords);
      setFilteredRecords(attendanceRecords);
      
      // Extract unique subjects
      const uniqueSubjects = [...new Set(
        attendanceRecords.map(record => record.qr_codes?.subjects?.name).filter(Boolean)
      )] as string[];
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error("Error loading attendance records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...records];
    
    if (selectedSubject) {
      filtered = filtered.filter(
        (record) => record.qr_codes?.subjects?.name === selectedSubject
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.qr_codes?.subjects?.name?.toLowerCase().includes(term) ||
          record.users?.name?.toLowerCase().includes(term) ||
          new Date(record.qr_codes?.class_date || '').toLocaleDateString().includes(term)
      );
    }
    
    setFilteredRecords(filtered);
  }, [searchTerm, selectedSubject, records]);

  if (isLoading) {
    return (
      <DashboardLayout title="Attendance Records">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">Loading attendance records...</div>
        </div>
      </DashboardLayout>
    );
  }

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marked At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.qr_codes?.subjects?.name} ({record.qr_codes?.subjects?.code})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.qr_codes?.class_date ? new Date(record.qr_codes.class_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.qr_codes?.class_time || 'N/A'}
                      </td>
                      {user?.role !== "student" && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.users?.name} ({record.users?.prn})
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.marked_at ? new Date(record.marked_at).toLocaleString() : 'N/A'}
                      </td>
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
