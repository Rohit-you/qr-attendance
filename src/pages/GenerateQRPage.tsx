
import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { generateQRCode } from "@/services/QRCodeService";
import { QRData } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabaseAttendanceService } from "@/services/SupabaseAttendanceService";
import QRGeneratorForm from "@/components/qr/QRGeneratorForm";
import QRCodeDisplay from "@/components/qr/QRCodeDisplay";

const predefinedSubjects = [
  { id: "550e8400-e29b-41d4-a716-446655440001", name: "DBMS", code: "DBMS" },
  { id: "550e8400-e29b-41d4-a716-446655440002", name: "DSA", code: "DSA" },
  { id: "550e8400-e29b-41d4-a716-446655440003", name: "CAO", code: "CAO" },
  { id: "550e8400-e29b-41d4-a716-446655440004", name: "DLDM", code: "DLDM" },
  { id: "550e8400-e29b-41d4-a716-446655440005", name: "DAA", code: "DAA" },
  { id: "550e8400-e29b-41d4-a716-446655440006", name: "Math 1", code: "MATH1" },
  { id: "550e8400-e29b-41d4-a716-446655440007", name: "Math 2", code: "MATH2" },
  { id: "550e8400-e29b-41d4-a716-446655440008", name: "Math 3", code: "MATH3" },
  { id: "550e8400-e29b-41d4-a716-446655440009", name: "ML", code: "ML" },
  { id: "550e8400-e29b-41d4-a716-446655440010", name: "SQL", code: "SQL" },
];

const GenerateQRPage = () => {
  const { user } = useAuth();
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);

  const handleGenerateQR = async (selectedSubjectId: string, date: string, time: string) => {
    console.log("Generate QR clicked");
    console.log("Selected Subject ID:", selectedSubjectId);
    console.log("Date:", date);
    console.log("Time:", time);

    if (!selectedSubjectId || !date || !time) {
      toast.error("Please fill all fields");
      console.log("Validation failed:", { selectedSubjectId, date, time });
      return;
    }

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);
    try {
      const selectedSubject = predefinedSubjects.find(s => s.id === selectedSubjectId);
      if (!selectedSubject) {
        toast.error("Subject not found");
        console.log("Subject not found for ID:", selectedSubjectId);
        return;
      }

      console.log("Found subject:", selectedSubject);

      // Set expiration to 2 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      console.log("Creating QR code with data:", {
        subject_id: selectedSubjectId,
        faculty_id: user.id,
        class_date: date,
        class_time: time,
        expires_at: expiresAt.toISOString()
      });

      // Create QR code in database
      const qrCode = await supabaseAttendanceService.createQRCode({
        subject_id: selectedSubjectId,
        faculty_id: user.id,
        class_date: date,
        class_time: time,
        expires_at: expiresAt.toISOString()
      });

      if (!qrCode) {
        toast.error("Failed to create QR code");
        return;
      }

      const qrDataObj: QRData = {
        id: qrCode.id,
        subject: selectedSubject.name,
        subjectId: selectedSubjectId,
        date,
        time,
        facultyId: user.id,
        expiresAt: expiresAt.toISOString()
      };

      const qrString = generateQRCode(qrDataObj);
      setGeneratedQR(qrString);
      setQrData(qrDataObj);
      toast.success("QR code generated successfully!");
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setGeneratedQR(null);
    setQrData(null);
  };

  return (
    <DashboardLayout title="Generate QR Code">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <QRGeneratorForm
              onGenerateQR={handleGenerateQR}
              isLoading={isLoading}
            />

            {generatedQR && qrData && (
              <QRCodeDisplay
                qrString={generatedQR}
                qrData={qrData}
                onReset={handleResetForm}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GenerateQRPage;
