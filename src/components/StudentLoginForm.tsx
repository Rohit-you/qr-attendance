
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/CustomButton";

interface StudentLoginFormProps {
  onSubmit: (prn: string, name: string) => void;
}

const StudentLoginForm: React.FC<StudentLoginFormProps> = ({ onSubmit }) => {
  const [prn, setPrn] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(prn, name);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prn">PRN Number (13 digits)</Label>
        <Input
          id="prn"
          type="text"
          placeholder="Enter your 13-digit PRN"
          value={prn}
          onChange={(e) => setPrn(e.target.value)}
          maxLength={13}
          required
          pattern="[0-9]{13}"
          title="PRN must be 13 digits"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <CustomButton
        type="submit"
        fullWidth
        isLoading={isLoading}
      >
        Login
      </CustomButton>
    </form>
  );
};

export default StudentLoginForm;
