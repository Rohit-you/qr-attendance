
import { QRCodeCanvas } from "qrcode.react";
import CustomButton from "@/components/CustomButton";
import { QRData } from "@/types";

interface QRCodeDisplayProps {
  qrString: string;
  qrData: QRData;
  onReset: () => void;
}

const QRCodeDisplay = ({ qrString, qrData, onReset }: QRCodeDisplayProps) => {
  return (
    <div className="mt-8 text-center">
      <div className="border rounded-lg p-4 inline-block bg-white">
        <QRCodeCanvas value={qrString} size={200} /> 
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Subject: {qrData.subject}
        <br />
        Date: {new Date(qrData.date).toLocaleDateString()}
        <br />
        Time: {qrData.time}
        <br />
        Expires: {new Date(qrData.expiresAt).toLocaleString()}
      </p>
      <div className="mt-4">
        <CustomButton
          variant="outline"
          onClick={onReset}
        >
          Generate New QR
        </CustomButton>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
