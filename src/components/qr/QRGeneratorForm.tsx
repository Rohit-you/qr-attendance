
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/CustomButton";
import SubjectSelector from "./SubjectSelector";

interface QRGeneratorFormProps {
  onGenerateQR: (selectedSubjectId: string, date: string, time: string) => void;
  isLoading: boolean;
}

const QRGeneratorForm = ({ onGenerateQR, isLoading }: QRGeneratorFormProps) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateQR(selectedSubjectId, date, time);
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
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
        <CustomButton
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Generate QR Code
        </CustomButton>
      </div>
    </form>
  );
};

export default QRGeneratorForm;
