
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

      if ("prn" in credentials) {
        // Student login - accept any PRN and name
        const student: Student = {
          id: `s${Date.now()}`,
          name: credentials.name,
          role: "student",
          prn: credentials.prn,
        };
        setUser(student);
        localStorage.setItem("user", JSON.stringify(student));
        return true;
      } else {
        // Faculty login - accept any email and password
        const faculty: Faculty = {
          id: `f${Date.now()}`,
          name: credentials.email.split("@")[0], // Use email username as display name
          role: "faculty",
          email: credentials.email,
        };
        setUser(faculty);
        localStorage.setItem("user", JSON.stringify(faculty));
        return true;
      }
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
