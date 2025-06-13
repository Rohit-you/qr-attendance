
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/CustomButton";
import { generateQRCode } from "@/services/QRCodeService";
import { QRData, Subject } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { supabaseAttendanceService } from "@/services/SupabaseAttendanceService";

const GenerateQRPage = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [subjectQuery, setSubjectQuery] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [time, setTime] = useState("");
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (subjectQuery.trim() === "") {
      setFilteredSubjects([]);
      setSelectedSubjectId("");
      return;
    }

    const filtered = subjects.filter(subject =>
      subject.name.toLowerCase().includes(subjectQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(subjectQuery.toLowerCase())
    );
    setFilteredSubjects(filtered);

    // Check if the typed query exactly matches a subject
    const exactMatch = subjects.find(subject => 
      (subject.name.toLowerCase() === subjectQuery.toLowerCase()) ||
      (subject.code.toLowerCase() === subjectQuery.toLowerCase()) ||
      (`${subject.name} (${subject.code})`.toLowerCase() === subjectQuery.toLowerCase())
    );
    
    if (exactMatch) {
      setSelectedSubjectId(exactMatch.id);
    } else {
      // Check if current query matches the display format of selected subject
      const currentSubject = subjects.find(s => s.id === selectedSubjectId);
      if (currentSubject && subjectQuery !== `${currentSubject.name} (${currentSubject.code})`) {
        setSelectedSubjectId("");
      }
    }
  }, [subjectQuery, subjects, selectedSubjectId]);

  const loadSubjects = async () => {
    const fetchedSubjects = await supabaseAttendanceService.getSubjects();
    setSubjects(fetchedSubjects);
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubjectId(subject.id);
    setSubjectQuery(`${subject.name} (${subject.code})`);
    setShowSuggestions(false);
    setFilteredSubjects([]);
  };

  const handleSubjectInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSubjectQuery(value);
    setShowSuggestions(true);
  };

  const handleGenerateQR = async () => {
    console.log("Generate QR clicked");
    console.log("Selected Subject ID:", selectedSubjectId);
    console.log("Date:", date);
    console.log("Time:", time);
    console.log("Subject Query:", subjectQuery);

    // Check if subject is selected (either by ID or by exact match)
    let finalSubjectId = selectedSubjectId;
    
    if (!finalSubjectId && subjectQuery.trim()) {
      // Try to find exact match if ID is not set
      const exactMatch = subjects.find(subject => 
        (subject.name.toLowerCase() === subjectQuery.toLowerCase()) ||
        (subject.code.toLowerCase() === subjectQuery.toLowerCase()) ||
        (`${subject.name} (${subject.code})`.toLowerCase() === subjectQuery.toLowerCase())
      );
      
      if (exactMatch) {
        finalSubjectId = exactMatch.id;
        setSelectedSubjectId(exactMatch.id);
      }
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
    setSelectedSubjectId("");
    setSubjectQuery("");
    setFilteredSubjects([]);
    setShowSuggestions(false);
    setDate(new Date().toISOString().split("T")[0]);
    setTime("");
    setGeneratedQR(null);
    setQrData(null);
  };

  return (
    <DashboardLayout title="Generate QR Code">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-4">
              <div className="space-y-2 relative">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Type to search subjects..."
                  value={subjectQuery}
                  onChange={handleSubjectInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    // Delay hiding suggestions to allow for clicks
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  required
                />
                
                {showSuggestions && filteredSubjects.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-background border border-input rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredSubjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none"
                        onClick={() => handleSubjectSelect(subject)}
                      >
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-sm text-muted-foreground">{subject.code}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                {showSuggestions && subjectQuery.trim() !== "" && filteredSubjects.length === 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-background border border-input rounded-md shadow-lg p-3">
                    <div className="text-sm text-muted-foreground">No subjects found</div>
                  </div>
                )}
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

            {generatedQR && qrData && (
              <div className="mt-8 text-center">
                <div className="border rounded-lg p-4 inline-block bg-white">
                  <QRCodeCanvas value={generatedQR} size={200} /> 
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
                    onClick={handleResetForm}
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
