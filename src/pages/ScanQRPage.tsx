
import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { QRData } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCapacitorDetection } from "@/hooks/useCapacitorDetection";
import QRScanner from "@/components/qr/QRScanner";
import QRDataDisplay from "@/components/qr/QRDataDisplay";
import SuccessDisplay from "@/components/qr/SuccessDisplay";
import { parseQRCode } from "@/services/QRCodeService";
import { supabaseAttendanceService } from "@/services/SupabaseAttendanceService";

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

  const handleMarkAttendance = async () => {
    if (!user || !scannedData || user.role !== "student") {
      toast.error("Not authorized to mark attendance");
      return;
    }

    try {
      // Verify QR code is still valid in database
      const qrCode = await supabaseAttendanceService.getQRCode(scannedData.id);
      if (!qrCode) {
        setError("QR code is invalid or expired");
        toast.error("QR code is invalid or expired");
        return;
      }

      // Mark attendance
      await supabaseAttendanceService.markAttendance({
        student_id: user.id,
        qr_code_id: scannedData.id,
        subject_id: scannedData.subjectId
      });

      setSuccess(true);
      toast.success("Attendance marked successfully!");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to mark attendance";
      setError(errorMessage);
      toast.error(errorMessage);
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
