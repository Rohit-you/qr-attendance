
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QRData } from "@/types";
import { parseQRCode } from "@/services/QRCodeService";

interface QRScannerProps {
  onScanSuccess: (data: QRData) => void;
  onScanError: (errorMessage: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError }) => {

  useEffect(() => {
    // This function will create a new scanner instance
    const createScanner = () => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 5,
          aspectRatio: 1.0,
        },
        /* verbose= */ false
      );

      let hasScanned = false;
      const onScanSuccessCallback = (decodedText: string) => {
        if (!hasScanned) {
          hasScanned = true;
          if (scanner && scanner.getState() === 2) { // 2 === SCANNING
            scanner.clear().catch(err => console.error("Failed to clear scanner on success.", err));
          }
          try {
            const parsedData = parseQRCode(decodedText);
            onScanSuccess(parsedData);
          } catch (err) {
            console.error("QR parsing error:", err);
            onScanError((err as Error).message || "Invalid QR code format");
          }
        }
      };

      const onScanErrorCallback = (error: string) => {
        // This callback is called frequently, we can ignore most errors.
      };

      scanner.render(onScanSuccessCallback, onScanErrorCallback);
      
      return scanner;
    };

    const scanner = createScanner();

    return () => {
      if (scanner && scanner.getState() === 2) { // 2 === SCANNING
        scanner.clear().catch(err => console.error("Failed to clear scanner on unmount.", err));
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="text-center py-2">
      <h3 className="text-xl font-medium mb-4">Scan QR Code</h3>
      <p className="text-gray-500 mb-6">
        Place the QR code in front of your camera, or select an image file.
      </p>
      <div id="qr-reader" className="w-full max-w-sm mx-auto border rounded-md"></div>
    </div>
  );
};

export default QRScanner;
