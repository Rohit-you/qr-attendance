
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { generateQRCode } from "@/services/QRCodeService";
import { QRData, Subject } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabaseAttendanceService } from "@/services/SupabaseAttendanceService";
import QRGeneratorForm from "@/components/qr/QRGeneratorForm";
import QRCodeDisplay from "@/components/qr/QRCodeDisplay";

const GenerateQRPage = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    const fetchedSubjects = await supabaseAttendanceService.getSubjects();
    setSubjects(fetchedSubjects);
  };

  const handleGenerateQR = async (selectedSubjectId: string, date: string, time: string) => {
    console.log("Generate QR clicked");
    console.log("Selected Subject ID:", selectedSubjectId);
    console.log("Date:", date);
    console.log("Time:", time);

    // Check if subject is selected (either by ID or by exact match)
    let finalSubjectId = selectedSubjectId;
    
    if (!finalSubjectId) {
      toast.error("Please select a subject");
      return;
    }

    if (!finalSubjectId || !date || !time) {
      toast.error("Please fill all fields");
      console.log("Validation failed:", { finalSubjectId, date, time });
      return;
    }

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);
    try {
      const selectedSubject = subjects.find(s => s.id === finalSubjectId);
      if (!selectedSubject) {
        toast.error("Subject not found");
        return;
      }

      // Set expiration to 2 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      console.log("Creating QR code with data:", {
        subject_id: finalSubjectId,
        faculty_id: user.id,
        class_date: date,
        class_time: time,
        expires_at: expiresAt.toISOString()
      });

      // Create QR code in database
      const qrCode = await supabaseAttendanceService.createQRCode({
        subject_id: finalSubjectId,
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
        subjectId: finalSubjectId,
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
              subjects={subjects}
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
