
import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import AttendanceService from "@/services/AttendanceService";
import { QRData } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCapacitorDetection } from "@/hooks/useCapacitorDetection";
import QRScanner from "@/components/qr/QRScanner";
import QRDataDisplay from "@/components/qr/QRDataDisplay";
import SuccessDisplay from "@/components/qr/SuccessDisplay";

const ScanQRPage = () => {
  const { user } = useAuth();
  const [scannedData, setScannedData] = useState<QRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const isMobile = useCapacitorDetection();

  const handleScanSuccess = (data: QRData) => {
    setScannedData(data);
    setError(null);
  };

  const handleScanError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleMarkAttendance = () => {
    if (user && scannedData && user.role === "student") {
      try {
        // Ensure we're explicitly casting to Student type with role: "student"
        const studentUser = {
          ...user,
          role: "student" as const, // Use const assertion to specify exact type
          prn: (user as any).prn || "1234567890123" // Default PRN if not available
        };
        
        AttendanceService.markAttendance(studentUser, scannedData);
        setSuccess(true);
        toast.success("Attendance marked successfully!");
      } catch (err: any) {
        setError(err.message || "Failed to mark attendance");
        toast.error(err.message || "Failed to mark attendance");
      }
    }
  };

  const handleScanAgain = () => {
    setScannedData(null);
    setError(null);
    setSuccess(false);
  };

  return (
    <DashboardLayout title="Scan QR Code">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success ? (
              <SuccessDisplay qrData={scannedData} onScanAgain={handleScanAgain} />
            ) : scannedData ? (
              <QRDataDisplay 
                data={scannedData} 
                onMarkAttendance={handleMarkAttendance} 
                onScanAgain={handleScanAgain}
              />
            ) : (
              <QRScanner 
                onScanSuccess={handleScanSuccess} 
                onScanError={handleScanError} 
                isMobile={isMobile} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ScanQRPage;
