
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/CustomButton";
import SubjectSelector from "./SubjectSelector";
import { QRData } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface QRGeneratorFormProps {
  onGenerateQR: (payload: Omit<QRData, "id">) => void;
  isLoading: boolean;
}

const QRGeneratorForm = ({ onGenerateQR, isLoading }: QRGeneratorFormProps) => {
  const { user } = useAuth();
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });

  // Calculate expiresAt, increased to 30 minutes
  const expiresAt = new Date(new Date(date + "T" + (time || "00:00")).getTime() + 30 * 60000).toISOString();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id) {
      toast.error("Could not find faculty user information. Please log in again.");
      return;
    }
    if (!selectedSubjectId || !subjectName) {
      toast.error("Please select a subject");
      return;
    }
    // Compose payload, make sure you update with real facultyId and subject name/codes as per your app logic
    onGenerateQR({
      subject: subjectName,
      subjectId: selectedSubjectId,
      date,
      time,
      facultyId: user.id,
      expiresAt,
    });
  };

  const handleSubjectSelect = (subjectId: string, subjectName: string) => {
    setSelectedSubjectId(subjectId);
    setSubjectName(subjectName);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <SubjectSelector
        selectedSubjectId={selectedSubjectId}
        onSubjectSelect={handleSubjectSelect}
      />

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
        <CustomButton type="submit" fullWidth isLoading={isLoading}>
          Generate QR Code
        </CustomButton>
      </div>
    </form>
  );
};

export default QRGeneratorForm;
