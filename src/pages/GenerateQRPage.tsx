
import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/CustomButton";
import { generateQRCode } from "@/services/QRCodeService";
import { QRData } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import QRCode from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

const GenerateQRPage = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [time, setTime] = useState("");
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateQR = () => {
    if (!subject || !date || !time) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      const qrData: QRData = {
        id: uuidv4(),
        subject,
        date,
        time,
        facultyId: user?.id || "",
      };

      const qrString = generateQRCode(qrData);
      setGeneratedQR(qrString);
      toast.success("QR code generated successfully!");
    } catch (error) {
      toast.error("Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setSubject("");
    setDate(new Date().toISOString().split("T")[0]);
    setTime("");
    setGeneratedQR(null);
  };

  return (
    <DashboardLayout title="Generate QR Code">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="e.g., Advanced Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2">
                <CustomButton
                  type="button"
                  fullWidth
                  isLoading={isLoading}
                  onClick={handleGenerateQR}
                >
                  Generate QR Code
                </CustomButton>
              </div>
            </form>

            {generatedQR && (
              <div className="mt-8 text-center">
                <div className="border rounded-lg p-4 inline-block bg-white">
                  <QRCode value={generatedQR} size={200} />
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Subject: {subject}
                  <br />
                  Date: {new Date(date).toLocaleDateString()}
                  <br />
                  Time: {time}
                </p>
                <div className="mt-4">
                  <CustomButton
                    variant="outline"
                    onClick={handleResetForm}
                    className="mr-2"
                  >
                    Generate New QR
                  </CustomButton>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GenerateQRPage;
