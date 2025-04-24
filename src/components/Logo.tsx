
import React from "react";

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-college-700 text-white font-bold">
        QA
      </div>
      <span className="font-bold text-xl text-college-800">CampusQR</span>
    </div>
  );
};

export default Logo;
