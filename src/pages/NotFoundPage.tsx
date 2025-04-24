
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "@/components/CustomButton";
import Logo from "@/components/Logo";

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route"
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mb-4">
          <Logo />
        </div>
        <h1 className="text-5xl font-bold text-college-700">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700">Page not found</h2>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <CustomButton onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </CustomButton>
      </div>
    </div>
  );
};

export default NotFoundPage;
