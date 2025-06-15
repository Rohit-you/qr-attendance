
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
    console.log("[ScanQRPage] QR scanned:", data);
  };

  const handleScanError = (errorMessage: string) => {
    setError(errorMessage);
    console.warn("[ScanQRPage] Scan error:", errorMessage);
  };

  const handleMarkAttendance = async () => {
    if (!user || !scannedData || user.role !== "student") {
      toast.error("Not authorized to mark attendance");
      return;
    }

    // Prevent mock/demo scans from attempting real DB checks
    if (scannedData.id === "mock-qr-id-123") {
      toast.error("This is a demo QR scan and cannot mark attendance in the database.");
      setError("Demo mode: Attendance cannot be marked with mock QR codes.");
      return;
    }

    try {
      // Fetch QR code from DB and log the ID
      console.log("[ScanQRPage] Checking QR code with id:", scannedData.id);
      const qrCode = await supabaseAttendanceService.getQRCode(scannedData.id);

      if (!qrCode) {
        const message =
          "QR code is invalid or expired [id: " + scannedData.id + "]";
        setError(message);
        toast.error(message);
        return;
      }

      // Mark attendance and log info
      await supabaseAttendanceService.markAttendance({
        student_id: user.id,
        qr_code_id: scannedData.id,
        subject_id: scannedData.subjectId,
      });

      setSuccess(true);
      setError(null);
      toast.success("Attendance marked successfully!");
      console.log(
        "[ScanQRPage] Attendance marked for student:",
        user.id,
        "qr:",
        scannedData.id
      );
    } catch (err: any) {
      const errorMessage =
        (err.message || "Failed to mark attendance") +
        " (QR: " +
        (scannedData?.id || "n/a") +
        ")";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("[ScanQRPage] Mark attendance error:", err);
    }
  };

  const handleScanAgain = () => {
    setScannedData(null);
    setError(null);
    setSuccess(false);
    console.log("[ScanQRPage] Reset scan.");
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
              <SuccessDisplay
                qrData={scannedData}
                onScanAgain={handleScanAgain}
              />
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

