
import LoginPage from "./LoginPage";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div>
      <LoginPage />
      <div className="text-center mt-4">
        <Link to="/student-login" className="text-college-700 underline">
          Student? Click here for dedicated login
        </Link>
      </div>
    </div>
  );
};

export default Index;
