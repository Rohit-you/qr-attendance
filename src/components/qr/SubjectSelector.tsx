
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SubjectSelectorProps {
  selectedSubjectId: string;
  onSubjectSelect: (subjectId: string) => void;
}

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

const SubjectSelector = ({ selectedSubjectId, onSubjectSelect }: SubjectSelectorProps) => {
  console.log("Current selected subject ID in selector:", selectedSubjectId);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="subject">Subject</Label>
      <Select value={selectedSubjectId} onValueChange={onSubjectSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a subject" />
        </SelectTrigger>
        <SelectContent>
          {predefinedSubjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SubjectSelector;
