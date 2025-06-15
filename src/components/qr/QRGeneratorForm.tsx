
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/CustomButton";
import SubjectSelector from "./SubjectSelector";
import { QRData } from "@/types";

interface QRGeneratorFormProps {
  onGenerateQR: (payload: Omit<QRData, "id">) => void;
  isLoading: boolean;
}

const QRGeneratorForm = ({ onGenerateQR, isLoading }: QRGeneratorFormProps) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  // You might want to get facultyId and expiresAt from context, user, or generate here
  // For now let's use dummy placeholders for illustration
  const dummyFacultyId = "faculty-placeholder";
  const expiresAt = new Date(new Date(date + "T" + (time || "00:00")).getTime() + 15 * 60000).toISOString(); // expire 15min after start

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Compose payload, make sure you update with real facultyId and subject name/codes as per your app logic
    onGenerateQR({
      subject: subjectName,
      subjectId: selectedSubjectId,
      date,
      time,
      facultyId: dummyFacultyId,
      expiresAt,
    });
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    // Optionally set subjectName here depending on how you want to map subjectId to names
    // For now, just set as blank (should be replaced)
    setSubjectName(""); // TODO: Get subject name by id if needed
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
