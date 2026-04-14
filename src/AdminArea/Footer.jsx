import React from "react";
import { Typography } from "@material-tailwind/react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white/80 backdrop-blur-md p-6 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-y-3 px-2">
        
        {/* Bagian Kiri: Copyright - Center on Mobile, Left on Desktop */}
        <Typography color="blue-gray" className="text-xs md:text-sm font-medium text-center md:text-left">
          &copy; {currentYear} <span className="text-[#2b6cb0] font-bold">EcoCash</span>. 
          <span className="hidden sm:inline"> All Rights Reserved.</span>
        </Typography>

        {/* Bagian Kanan: Identitas Tim - Center on Mobile, Right on Desktop */}
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <Typography color="blue-gray" className="text-[10px] md:text-xs font-normal opacity-70">
            Designed & Developed by
          </Typography>
          <Typography 
            variant="small" 
            className="text-[#66bb6a] font-bold hover:text-green-700 transition-colors text-[11px] md:text-sm cursor-default"
          >
            Tim PT. Ideas Edvolution Technology
          </Typography>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;