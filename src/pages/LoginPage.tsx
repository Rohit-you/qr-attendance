import { useState, useEffect } from "react";
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
  const { signIn, signUp, user, isLoading } = useAuth();

  useEffect(() => {
    if (user && !isLoading) {
      console.log("User logged in, redirecting to dashboard:", user);
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleStudentLogin = async (prn: string, name: string) => {
    try {
      console.log("Attempting student login with:", { prn, name });
      
      const studentEmail = `student${prn}@college.edu`;
      const studentPassword = prn;
      
      console.log("Using email format for student:", studentEmail);
      
      let { error } = await signIn(studentEmail, studentPassword);
      
      if (error && error.message === "Invalid login credentials") {
        console.log("Student not found, proceeding to create a new account.");
        
        const signUpResult = await signUp(studentEmail, studentPassword, {
          name: name,
          role: 'student',
          prn: prn
        });
        
        if (signUpResult.error) {
          if (signUpResult.error.message.includes("User already registered")) {
            toast.info("This account already exists. Please check your email to verify your account before logging in.");
          } else {
            console.error("Student signup error:", signUpResult.error);
            toast.error("Failed to create student account. Please try again.");
          }
          return;
        }
        
        toast.success("Account created! Please check your email to verify your account, then you can log in.");
        console.log("Student account created. Awaiting email verification.");

      } else if (!error) {
        toast.success("Student login successful!");
        console.log("Student login successful, redirecting to dashboard...");
      } else {
        console.error("An unexpected student login error occurred:", error);
        toast.error("Student login failed. Please check your details and try again.");
      }
    } catch (error) {
      console.error("Caught an error during student login:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleFacultyLogin = async (email: string, password: string) => {
    try {
      console.log("Attempting faculty login with:", { email, password });
      const { error } = await signIn(email, password);
      if (!error) {
        toast.success("Faculty login successful!");
        console.log("Faculty login successful, should redirect to dashboard");
      } else {
        console.error("Faculty login error:", error);
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Faculty login error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-college-50 to-college-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-college-600 mx-auto mb-4"></div>
          <p className="text-college-600">Loading...</p>
        </div>
      </div>
    );
  }

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
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700 font-medium">Test Student Login:</p>
                <p className="text-xs text-blue-600">PRN: 1234567890123</p>
                <p className="text-xs text-blue-600">Name: John Doe</p>
                <p className="text-xs text-blue-500 mt-1">Note: Student accounts are created automatically on first login</p>
              </div>
            </TabsContent>
            <TabsContent value="faculty">
              <FacultyLoginForm onSubmit={handleFacultyLogin} />
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-700 font-medium">Test Faculty Login:</p>
                <p className="text-xs text-green-600">Email: faculty@college.edu</p>
                <p className="text-xs text-green-600">Password: faculty123</p>
              </div>
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
