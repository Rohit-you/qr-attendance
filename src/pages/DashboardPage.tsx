
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import CustomButton from "@/components/CustomButton";
import { QrCode, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { AttendanceRecordWithDetails } from "@/types";
import { supabaseAttendanceService } from "@/services/SupabaseAttendanceService";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecordWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentAttendance();
    }
  }, [user]);

  const loadRecentAttendance = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let records: AttendanceRecordWithDetails[] = [];
      
      if (user.role === "student") {
        records = await supabaseAttendanceService.getStudentAttendance(user.id);
      } else if (user.role === "faculty") {
        records = await supabaseAttendanceService.getFacultyAttendance(user.id);
      }
      
      setRecentAttendance(records.slice(0, 3));
    } catch (error) {
      console.error("Error loading recent attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderWelcomeCard = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          Welcome, {user?.name}{" "}
          <span className="text-gray-500 text-base">({user?.role})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          {user?.role === "student"
            ? "Track your attendance and scan QR codes for classes."
            : "Generate QR codes for your classes and view attendance records."}
        </p>
        {user?.role === "student" ? (
          <CustomButton onClick={() => navigate("/scan-qr")}>
            <ScanLine size={16} className="mr-2" />
            Scan QR Code
          </CustomButton>
        ) : (
          <CustomButton onClick={() => navigate("/generate-qr")}>
            <QrCode size={16} className="mr-2" />
            Generate QR Code
          </CustomButton>
        )}
      </CardContent>
    </Card>
  );

  const renderRecentAttendance = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading recent attendance...</div>
        ) : recentAttendance.length > 0 ? (
          <div className="space-y-2">
            {recentAttendance.map((record) => (
              <div
                key={record.id}
                className="p-3 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    {record.qr_codes?.subjects?.name || 'Unknown Subject'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {record.qr_codes?.class_date ? new Date(record.qr_codes.class_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-500">
                    {record.qr_codes?.class_time || 'N/A'}
                  </span>
                  {user?.role === "faculty" && (
                    <span className="text-sm">{record.users?.name || 'Unknown Student'}</span>
                  )}
                </div>
              </div>
            ))}
            <div className="mt-4 text-center">
              <CustomButton
                variant="outline"
                onClick={() => navigate("/attendance")}
              >
                View All Attendance
              </CustomButton>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-4">No recent attendance records found.</p>
            {user?.role === "student" ? (
              <CustomButton onClick={() => navigate("/scan-qr")}>
                <ScanLine size={16} className="mr-2" />
                Scan QR Code
              </CustomButton>
            ) : (
              <CustomButton onClick={() => navigate("/generate-qr")}>
                <QrCode size={16} className="mr-2" />
                Generate QR Code
              </CustomButton>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid gap-6">
        {renderWelcomeCard()}
        {renderRecentAttendance()}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
