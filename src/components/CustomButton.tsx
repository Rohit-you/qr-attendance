
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  variant = "default",
  size = "default",
  isLoading = false,
  fullWidth = false,
  children,
  className,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={isLoading || props.disabled}
      className={cn(
        fullWidth && "w-full",
        "font-medium",
        "transition-all",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

export default CustomButton;
