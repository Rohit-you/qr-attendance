
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import CustomButton from "@/components/CustomButton";
import AttendanceService from "@/services/AttendanceService";
import { QrCode, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { AttendanceRecord } from "@/types";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (user) {
      if (user.role === "student") {
        const records = AttendanceService.getStudentAttendance(user.id);
        setRecentAttendance(records.slice(0, 3));
      } else if (user.role === "faculty") {
        const records = AttendanceService.getFacultyAttendance(user.id);
        setRecentAttendance(records.slice(0, 3));
      }
    }
  }, [user]);

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
        {recentAttendance.length > 0 ? (
          <div className="space-y-2">
            {recentAttendance.map((record) => (
              <div
                key={record.id}
                className="p-3 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{record.qrData.subject}</span>
                  <span className="text-gray-500 text-sm">
                    {new Date(record.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-500">
                    {record.qrData.time}
                  </span>
                  {user?.role === "faculty" && (
                    <span className="text-sm">{record.studentName}</span>
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
