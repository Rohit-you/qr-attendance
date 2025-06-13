
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SubjectSelectorProps {
  selectedSubjectId: string;
  onSubjectSelect: (subjectId: string) => void;
}

const predefinedSubjects = [
  { id: "dbms", name: "DBMS", code: "DBMS" },
  { id: "dsa", name: "DSA", code: "DSA" },
  { id: "cao", name: "CAO", code: "CAO" },
  { id: "dldm", name: "DLDM", code: "DLDM" },
  { id: "daa", name: "DAA", code: "DAA" },
  { id: "math1", name: "Math 1", code: "MATH1" },
  { id: "math2", name: "Math 2", code: "MATH2" },
  { id: "math3", name: "Math 3", code: "MATH3" },
  { id: "ml", name: "ML", code: "ML" },
  { id: "sql", name: "SQL", code: "SQL" },
];

const SubjectSelector = ({ selectedSubjectId, onSubjectSelect }: SubjectSelectorProps) => {
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
