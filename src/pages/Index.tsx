
import { Navigate } from "react-router-dom";

const Index = () => {
  console.log("Index page loaded, redirecting to /");
  return <Navigate to="/" replace />;
};

export default Index;
