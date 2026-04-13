import React from "react";
import { Typography } from "@material-tailwind/react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white p-6 border-t border-gray-100">
      <div className="flex flex-col md:flex-row items-center justify-between gap-y-4 px-4">
        {/* Bagian Kiri: Copyright */}
        <Typography color="blue-gray" className="text-sm font-medium">
          &copy; {currentYear} <span className="text-[#2b6cb0] font-bold">EcoCash</span>. All Rights Reserved.
        </Typography>

        {/* Bagian Kanan: Identitas Tim */}
        <div className="flex items-center gap-2">
          <Typography color="blue-gray" className="text-xs md:text-sm font-normal">
            Designed & Developed by
          </Typography>
          <Typography 
            variant="small" 
            className="text-green-600 font-bold hover:text-green-700 transition-colors"
          >
            Tim PT. Ideas Edvolution Technology
          </Typography>
        </div>
      </div>
    </footer>
  );
};

export default Footer;