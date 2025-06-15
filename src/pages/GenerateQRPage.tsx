
import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import QRCodeDisplay from "@/components/qr/QRCodeDisplay";
import QRGeneratorForm from "@/components/qr/QRGeneratorForm";
import { QRData } from "@/types";
import { toast } from "sonner";
import { generateQRCode } from "@/services/QRCodeService";
import { supabaseAttendanceService } from "@/services/SupabaseAttendanceService";

// The main page component
const GenerateQRPage = () => {
  const [qrString, setQrString] = useState<string | null>(null);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (payload: Omit<QRData, "id">) => {
    setLoading(true);
    setQrString(null);
    setQrData(null);

    try {
      // Store the QR code in the database and only use the returned "id"
      const qr = await supabaseAttendanceService.createQRCode({
        subject_id: payload.subjectId,
        faculty_id: payload.facultyId,
        class_date: payload.date,
        class_time: payload.time,
        expires_at: payload.expiresAt,
      });

      if (!qr) {
        toast.error("Could not create QR code in database.");
        setLoading(false);
        return;
      }

      // Construct the QRData from db row (using db-provided id)
      const qrPayload: QRData = {
        id: qr.id,
        subject: payload.subject,
        subjectId: payload.subjectId,
        date: payload.date,
        time: payload.time,
        facultyId: payload.facultyId,
        expiresAt: payload.expiresAt,
      };

      // Generate the QR string to display from the actual DB record
      const qrStr = generateQRCode(qrPayload);

      // Log for debugging
      console.log("[GenerateQRPage] Generated QRData for display:", qrPayload);

      setQrData(qrPayload);
      setQrString(qrStr);
    } catch (error: any) {
      toast.error("Failed to generate QR code.");
      console.error("[GenerateQRPage] QR code generation error:", error);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setQrData(null);
    setQrString(null);
    setLoading(false);
  };

  return (
    <DashboardLayout title="Generate QR Code">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            {!qrData || !qrString ? (
              <QRGeneratorForm
                onGenerateQR={handleGenerate}
                isLoading={loading}
              />
            ) : (
              <QRCodeDisplay
                qrString={qrString}
                qrData={qrData}
                onReset={handleReset}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GenerateQRPage;

