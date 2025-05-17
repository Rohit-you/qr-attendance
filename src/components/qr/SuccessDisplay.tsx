
import { ScanLine } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import { QRData } from "@/types";

interface SuccessDisplayProps {
  qrData: QRData | null;
  onScanAgain: () => void;
}

const SuccessDisplay: React.FC<SuccessDisplayProps> = ({ qrData, onScanAgain }) => {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ScanLine size={32} className="text-green-600" />
      </div>
      <h3 className="text-xl font-medium mb-2">Attendance Marked!</h3>
      <p className="text-gray-500 mb-6">
        You've successfully marked your attendance for{" "}
        <strong>{qrData?.subject}</strong>
      </p>
      <div className="space-y-2">
        <CustomButton onClick={onScanAgain}>
          Scan Another QR Code
        </CustomButton>
      </div>
    </div>
  );
};

export default SuccessDisplay;
