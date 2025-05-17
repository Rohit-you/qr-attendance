
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import CustomButton from "@/components/CustomButton";
import { parseQRCode } from "@/services/QRCodeService";
import AttendanceService from "@/services/AttendanceService";
import { QRData } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ScanLine, Camera } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera as CapacitorCamera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';

const ScanQRPage = () => {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<QRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in a Capacitor environment (mobile)
    const checkCapacitor = () => {
      return typeof (window as any).Capacitor !== 'undefined';
    };
    setIsMobile(checkCapacitor());
  }, []);

  const handleScan = (data: string) => {
    if (data) {
      try {
        const parsedData = parseQRCode(data);
        setScannedData(parsedData);
        setScanning(false);
        setError(null);
      } catch (err) {
        console.error("QR parsing error:", err);
        setError("Invalid QR code format");
      }
    }
  };

  const takePicture = async () => {
    setScanning(true);
    try {
      // Take a photo using Capacitor Camera
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        promptLabelHeader: 'Scan QR Code',
        promptLabelCancel: 'Cancel',
        // Use correct enum for camera direction
        direction: CameraDirection.Rear
      });

      if (image && image.base64String) {
        // In a real app, you'd use a QR code reader library to decode the image
        // For now, let's simulate a successful scan using mock data
        simulateQRScan();
      } else {
        setScanning(false);
      }
    } catch (e) {
      console.error('Camera error:', e);
      setError("Camera access failed. Please check your permissions.");
      setScanning(false);
    }
  };

  // For demo/fallback purposes only - simulates a successful QR code scan
  const simulateQRScan = () => {
    const mockQrData: QRData = {
      id: "mock-qr-id-123",
      subject: "Computer Science 101",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      facultyId: "f1",
    };

    const qrString = btoa(JSON.stringify(mockQrData));
    handleScan(qrString);
  };

  const handleMarkAttendance = () => {
    if (user && scannedData && user.role === "student") {
      try {
        // Assuming the student user has a PRN property
        // We'll create a typed student object with a default PRN if it doesn't exist
        const studentUser = {
          ...user,
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
    setScanning(false);
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
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ScanLine size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">Attendance Marked!</h3>
                <p className="text-gray-500 mb-6">
                  You've successfully marked your attendance for{" "}
                  <strong>{scannedData?.subject}</strong>
                </p>
                <div className="space-y-2">
                  <CustomButton onClick={handleScanAgain}>
                    Scan Another QR Code
                  </CustomButton>
                </div>
              </div>
            ) : scanning ? (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-sm h-64 bg-gray-100 rounded-md flex items-center justify-center mb-4 animate-pulse">
                  <div className="text-center">
                    <Camera size={48} className="mx-auto mb-2 text-gray-400 animate-bounce" />
                    <p className="text-gray-500">Camera is active...</p>
                  </div>
                </div>
                <CustomButton variant="outline" onClick={() => setScanning(false)}>
                  Cancel Scanning
                </CustomButton>
              </div>
            ) : scannedData ? (
              <div className="text-center py-4">
                <h3 className="text-lg font-medium mb-4">QR Code Scanned</h3>
                <div className="bg-gray-50 rounded-md p-4 mb-6">
                  <p className="mb-2">
                    <span className="font-medium">Subject:</span> {scannedData.subject}
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Date:</span>{" "}
                    {scannedData.date && new Date(scannedData.date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {scannedData.time}
                  </p>
                </div>
                <div className="space-y-2">
                  <CustomButton onClick={handleMarkAttendance}>
                    Confirm Attendance
                  </CustomButton>
                  <CustomButton variant="outline" onClick={handleScanAgain}>
                    Scan Again
                  </CustomButton>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ScanLine size={48} className="text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-4">Scan QR Code</h3>
                <p className="text-gray-500 mb-6">
                  Tap the button below to scan a QR code and mark your attendance.
                </p>
                <CustomButton onClick={takePicture}>
                  Scan QR Code
                </CustomButton>
                
                {/* For demo purposes only - enables testing in web browser */}
                {!isMobile && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">Demo mode (browser only)</p>
                    <CustomButton variant="outline" onClick={simulateQRScan}>
                      Simulate QR Scan
                    </CustomButton>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ScanQRPage;
