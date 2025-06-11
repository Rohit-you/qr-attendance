
import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FileText, Printer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AttendanceRecordWithDetails } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { supabaseAttendanceService } from "@/services/SupabaseAttendanceService";

const ReportsPage = () => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordWithDetails[]>([]);
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const [subjectStats, setSubjectStats] = useState<Record<string, { total: number, students: string[] }>>({});
  const [isLoading, setIsLoading] = useState(false);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (startDate > endDate) {
      toast.error("Start date cannot be after end date");
      return;
    }

    setIsLoading(true);
    try {
      // Set end date to end of day for inclusive results
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);

      const records = await supabaseAttendanceService.getAttendanceByDateRange(
        startDate, 
        adjustedEndDate, 
        user?.role === "faculty" ? user.id : undefined
      );

      setAttendanceRecords(records);

      // Generate subject statistics
      const stats: Record<string, { total: number, students: string[] }> = {};
      
      records.forEach(record => {
        const subject = record.qr_codes?.subjects?.name || 'Unknown Subject';
        const studentName = record.users?.name || 'Unknown Student';
        
        if (!stats[subject]) {
          stats[subject] = { total: 0, students: [] };
        }
        stats[subject].total++;
        if (!stats[subject].students.includes(studentName)) {
          stats[subject].students.push(studentName);
        }
      });

      setSubjectStats(stats);
      setIsReportGenerated(true);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <DashboardLayout title="Attendance Reports">
      <div className="print:hidden">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Generate Attendance Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button onClick={generateReport} disabled={isLoading}>
                <FileText className="mr-2 h-4 w-4" />
                {isLoading ? "Generating..." : "Generate Report"}
              </Button>
              {isReportGenerated && (
                <Button variant="outline" onClick={printReport}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Report
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isReportGenerated && (
        <div className="print:pt-0">
          <Card className="print:shadow-none print:border-0">
            <CardHeader className="print:py-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  Attendance Report
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {startDate && endDate
                    ? `${format(startDate, "PPP")} - ${format(endDate, "PPP")}`
                    : "No date range selected"}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 print:mb-2">
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">Total Records</div>
                    <div className="text-2xl font-bold">{attendanceRecords.length}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">Total Subjects</div>
                    <div className="text-2xl font-bold">{Object.keys(subjectStats).length}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">Total Students</div>
                    <div className="text-2xl font-bold">
                      {new Set(attendanceRecords.map(r => r.student_id)).size}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Subject-wise Attendance</h3>
                <div className="space-y-2">
                  {Object.entries(subjectStats).map(([subject, data]) => (
                    <Collapsible key={subject} className="border rounded-md">
                      <CollapsibleTrigger className="flex justify-between w-full p-3 hover:bg-muted/50">
                        <span className="font-medium">{subject}</span>
                        <span className="text-sm bg-muted px-2 py-0.5 rounded-full">
                          {data.total} records ({data.students.length} students)
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 pt-0 border-t">
                        <div className="text-sm text-muted-foreground">Students:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {data.students.map(student => (
                            <span key={student} className="bg-muted/80 text-sm px-2 py-0.5 rounded-full">
                              {student}
                            </span>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Detailed Records</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Marked At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.length > 0 ? (
                        attendanceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              {record.qr_codes?.class_date ? format(new Date(record.qr_codes.class_date), "PP") : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {record.qr_codes?.class_time || 'N/A'}
                            </TableCell>
                            <TableCell>{record.qr_codes?.subjects?.name || 'Unknown'}</TableCell>
                            <TableCell>{record.users?.name || 'Unknown'}</TableCell>
                            <TableCell>
                              {record.marked_at ? format(new Date(record.marked_at), "PPp") : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No records found for the selected date range
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReportsPage;
