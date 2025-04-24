
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import StudentLoginForm from "@/components/StudentLoginForm";
import FacultyLoginForm from "@/components/FacultyLoginForm";
import Logo from "@/components/Logo";

const LoginPage = () => {
  const [loginType, setLoginType] = useState<"student" | "faculty">("student");
  const navigate = useNavigate();
  const { login, user } = useAuth();

  if (user) {
    navigate("/dashboard");
  }

  const handleStudentLogin = async (prn: string, name: string) => {
    try {
      console.log("Attempting student login with:", { prn, name });
      const success = await login({ prn, name });
      if (success) {
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    }
  };

  const handleFacultyLogin = async (email: string, password: string) => {
    try {
      console.log("Attempting faculty login with:", { email, password });
      const success = await login({ email, password });
      if (success) {
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-college-50 to-college-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <Logo />
          <h1 className="text-2xl font-bold text-college-900 mt-4">
            Campus Attendance System
          </h1>
          <p className="text-gray-600 text-center">
            Sign in to access the QR attendance system
          </p>
        </div>

        <Card className="p-6 shadow-lg">
          <Tabs
            defaultValue="student"
            value={loginType}
            onValueChange={(value) => setLoginType(value as "student" | "faculty")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-6 w-full">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="faculty">Faculty</TabsTrigger>
            </TabsList>
            <TabsContent value="student">
              <StudentLoginForm onSubmit={handleStudentLogin} />
            </TabsContent>
            <TabsContent value="faculty">
              <FacultyLoginForm onSubmit={handleFacultyLogin} />
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-sm text-center text-gray-500 mt-8">
          © {new Date().getFullYear()} CampusQR Attendance System
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
