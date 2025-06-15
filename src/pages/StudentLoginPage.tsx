
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import StudentLoginForm from "@/components/StudentLoginForm";
import Logo from "@/components/Logo";

const StudentLoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, isLoading } = useAuth();

  // DEBUG: log auth state on mount
  useEffect(() => {
    console.log("StudentLoginPage: user =", user, "isLoading =", isLoading);
  }, [user, isLoading]);

  // Redirect authenticated users to student dashboard
  useEffect(() => {
    if (user && user.role === "student" && !isLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Loading spinner
  if ((user && user.role === "student" && !isLoading) || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-college-50 to-college-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-college-600 mx-auto mb-4"></div>
          <p className="text-college-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleStudentLogin = async (prn: string, name: string) => {
    try {
      console.log("Attempting student login with:", { prn, name });
      const studentEmail = `student${prn}@college.edu`;
      const studentPassword = prn;
      let { error } = await signIn(studentEmail, studentPassword);

      if (error && error.message === "Invalid login credentials") {
        console.log("Student not found, creating new account");
        const signUpResult = await signUp(studentEmail, studentPassword, {
          name: name,
          role: "student",
          prn: prn,
        });
        if (signUpResult.error) {
          if (signUpResult.error.message?.includes("User already registered")) {
            toast.info("Account exists. Please verify your email before logging in.");
          } else {
            toast.error("Failed to create account. Please try again.");
          }
          return;
        }
        toast.success("Account created! Verify your email, then log in.");
        console.log("Student account created. Awaiting email verification.");
      } else if (!error) {
        toast.success("Student login successful!");
        console.log("Student login successful, redirecting...");
        // Navigation triggered by useEffect on user update
      } else {
        toast.error("Student login failed. Check your details and try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-college-50 to-college-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <Logo />
          <h1 className="text-2xl font-bold text-college-900 mt-4">Student Login</h1>
          <p className="text-gray-600 text-center">Sign in to access your attendance</p>
        </div>
        <Card className="p-6 shadow-lg">
          <StudentLoginForm onSubmit={handleStudentLogin} />
        </Card>
        <p className="text-sm text-center text-gray-500 mt-8">
          © {new Date().getFullYear()} CampusQR Attendance System
        </p>
      </div>
    </div>
  );
};

export default StudentLoginPage;
