
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Student, Faculty } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (credentials: StudentCredentials | FacultyCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface StudentCredentials {
  prn: string;
  name: string;
}

interface FacultyCredentials {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (
    credentials: StudentCredentials | FacultyCredentials
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, we'll have some hardcoded users
      if ("prn" in credentials) {
        // Student login
        const { prn, name } = credentials;
        
        // Check if PRN is 13 digits
        if (prn.length !== 13) {
          throw new Error("PRN must be 13 digits");
        }
        
        // Mock student validation (In a real app, this would be an API call)
        if (prn === "1234567890123" && name.toLowerCase() === "john doe") {
          const student: Student = {
            id: "s1",
            name: "John Doe",
            role: "student",
            prn: "1234567890123",
          };
          setUser(student);
          localStorage.setItem("user", JSON.stringify(student));
          return true;
        }
      } else {
        // Faculty login
        const { email, password } = credentials;
        
        // Mock faculty validation (In a real app, this would be an API call)
        if (email === "faculty@college.edu" && password === "password") {
          const faculty: Faculty = {
            id: "f1",
            name: "Prof. Smith",
            role: "faculty",
            email: "faculty@college.edu",
          };
          setUser(faculty);
          localStorage.setItem("user", JSON.stringify(faculty));
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
