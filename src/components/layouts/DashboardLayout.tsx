
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User, QrCode, Calendar, FileText, List } from "lucide-react";
import CustomButton from "../CustomButton";
import Logo from "../Logo";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <User size={16} />,
      roles: ["student", "faculty", "hod"],
    },
    {
      name: "Generate QR",
      href: "/generate-qr",
      icon: <QrCode size={16} />,
      roles: ["faculty"],
    },
    {
      name: "Scan QR",
      href: "/scan-qr",
      icon: <QrCode size={16} />,
      roles: ["student"],
    },
    {
      name: "Attendance",
      href: "/attendance",
      icon: <Calendar size={16} />,
      roles: ["student", "faculty", "hod"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: <FileText size={16} />,
      roles: ["faculty", "hod"],
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r">
        <div className="p-4 border-b">
          <Logo />
        </div>
        <div className="flex flex-col justify-between h-full">
          <nav className="p-4 space-y-1">
            {navigation
              .filter((item) => item.roles.includes(user?.role || ""))
              .map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm rounded-md",
                    window.location.pathname === item.href
                      ? "bg-college-50 text-college-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </a>
              ))}
          </nav>
          <div className="p-4">
            <div className="flex items-center mb-4 space-x-3 p-4 bg-gray-50 rounded-md">
              <div className="h-8 w-8 rounded-full bg-college-200 text-college-700 flex items-center justify-center uppercase font-medium">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  {user?.role}
                </p>
              </div>
            </div>
            <CustomButton
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-white border-b md:hidden">
          <div className="flex items-center justify-between p-4">
            <Logo />
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-700">{user?.name}</span>
              <CustomButton variant="outline" size="sm" onClick={handleLogout}>
                <LogOut size={16} />
              </CustomButton>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </header>
          {children}
        </main>

        {/* Mobile navigation */}
        <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
          <nav className="flex justify-between p-2">
            {navigation
              .filter((item) => item.roles.includes(user?.role || ""))
              .slice(0, 5)
              .map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center p-2 text-xs rounded-md",
                    window.location.pathname === item.href
                      ? "text-college-700"
                      : "text-gray-600"
                  )}
                >
                  {item.icon}
                  <span className="mt-1">{item.name}</span>
                </a>
              ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
