
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Subject } from "@/types";

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSubjectSelect: (subjectId: string) => void;
}

const SubjectSelector = ({ subjects, selectedSubjectId, onSubjectSelect }: SubjectSelectorProps) => {
  const [subjectQuery, setSubjectQuery] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (subjectQuery.trim() === "") {
      setFilteredSubjects([]);
      onSubjectSelect("");
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
      onSubjectSelect(exactMatch.id);
    } else {
      // Check if current query matches the display format of selected subject
      const currentSubject = subjects.find(s => s.id === selectedSubjectId);
      if (currentSubject && subjectQuery !== `${currentSubject.name} (${currentSubject.code})`) {
        onSubjectSelect("");
      }
    }
  }, [subjectQuery, subjects, selectedSubjectId, onSubjectSelect]);

  const handleSubjectSelect = (subject: Subject) => {
    onSubjectSelect(subject.id);
    setSubjectQuery(`${subject.name} (${subject.code})`);
    setShowSuggestions(false);
    setFilteredSubjects([]);
  };

  const handleSubjectInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSubjectQuery(value);
    setShowSuggestions(true);
  };

  return (
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
  );
};

export default SubjectSelector;
