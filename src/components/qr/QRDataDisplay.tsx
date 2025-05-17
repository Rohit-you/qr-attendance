
import { QRData } from "@/types";
import CustomButton from "@/components/CustomButton";

interface QRDataDisplayProps {
  data: QRData;
  onMarkAttendance: () => void;
  onScanAgain: () => void;
}

const QRDataDisplay: React.FC<QRDataDisplayProps> = ({ 
  data, 
  onMarkAttendance, 
  onScanAgain 
}) => {
  return (
    <div className="text-center py-4">
      <h3 className="text-lg font-medium mb-4">QR Code Scanned</h3>
      <div className="bg-gray-50 rounded-md p-4 mb-6">
        <p className="mb-2">
          <span className="font-medium">Subject:</span> {data.subject}
        </p>
        <p className="mb-2">
          <span className="font-medium">Date:</span>{" "}
          {data.date && new Date(data.date).toLocaleDateString()}
        </p>
        <p>
          <span className="font-medium">Time:</span> {data.time}
        </p>
      </div>
      <div className="space-y-2">
        <CustomButton onClick={onMarkAttendance}>
          Confirm Attendance
        </CustomButton>
        <CustomButton variant="outline" onClick={onScanAgain}>
          Scan Again
        </CustomButton>
      </div>
    </div>
  );
};

export default QRDataDisplay;
