
import { useState } from "react";
import { ScanLine, Camera } from "lucide-react";
import { Camera as CapacitorCamera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import CustomButton from "@/components/CustomButton";
import { QRData } from "@/types";
import { parseQRCode } from "@/services/QRCodeService";

interface QRScannerProps {
  onScanSuccess: (data: QRData) => void;
  onScanError: (errorMessage: string) => void;
  isMobile: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError, isMobile }) => {
  const [scanning, setScanning] = useState(false);

  const handleScan = (data: string) => {
    if (data) {
      try {
        const parsedData = parseQRCode(data);
        if (parsedData) {
          onScanSuccess(parsedData);
          setScanning(false);
        } else {
          onScanError("Invalid QR code format");
        }
      } catch (err) {
        console.error("QR parsing error:", err);
        onScanError("Invalid QR code format");
      }
    }
  };

  // Demo/fallback - simulate a successful QR code scan (browser only)
  const simulateQRScan = () => {
    const mockQrData: QRData = {
      id: "mock-qr-id-123",
      subject: "Computer Science 101",
      subjectId: "subject-cs101-id",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      facultyId: "faculty-123",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };
    const qrString = JSON.stringify(mockQrData);
    handleScan(qrString);
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
      onScanError("Camera access failed. Please check your permissions.");
      setScanning(false);
    }
  };

  return (
    <>
      {scanning ? (
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
    </>
  );
};

export default QRScanner;

