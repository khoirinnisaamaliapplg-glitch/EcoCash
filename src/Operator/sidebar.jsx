import React from "react";
// 1. Pastikan logo2.png dan banner2.jpeg ada di folder assets kamu
import logo2 from "../assets/logo2.png"; 
import sidebarIllustration from "../assets/banner2.jpeg";
// Kamu bisa import gambar atau ilustrasi baru di sini untuk bagian bawah jika ada, Mel

import { NavLink, Link } from "react-router-dom"; // Pastikan Link sudah di-import

import { 
  Card, 
  Typography, 
  List, 
  ListItem, 
  ListItemPrefix, 
} from "@material-tailwind/react";
import {
  PresentationChartBarIcon,
  XMarkIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon
} from "@heroicons/react/24/outline";
import { useNavigate, useLocation } from "react-router-dom";

const SidebarOperator = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Menu Items - Disesuaikan dengan Route di App.js
  const menuItems = [
    { 
      name: "Dashboard", 
      icon: <PresentationChartBarIcon className="h-5 w-5" />, 
      path: "/operator/dashboard" 
    },
    { 
      name: "Smart Container", 
      icon: <CpuChipIcon className="h-5 w-5" />, 
      path: "/operator/smart-container" 
    },
    { 
      name: "System Setting", 
      icon: <Cog6ToothIcon className="h-5 w-5" />, 
      path: "/operator/settings" 
    },
  ];

  return (
    <>
      {/* Overlay mobile: Muncul saat sidebar dibuka di layar kecil */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <Card className={`fixed md:static inset-y-0 left-0 z-50 h-screen w-full max-w-[280px] rounded-none p-6 shadow-xl transition-transform duration-300 bg-white border-r border-gray-100 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        
        {/* HEADER: Logo & Nama Aplikasi */}
        <div className="mb-8 p-4 flex items-center justify-between border-b border-gray-50 pb-6">
          <Link to="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <img src={logo2} alt="EcoCash" className="h-14 w-14 object-contain" />
              <div>
                <Typography variant="h5" className="text-[#2b6cb0] font-black leading-tight">
                  EcoCash
                </Typography>
                <Typography variant="small" className="text-green-500 font-bold text-[10px] uppercase tracking-widest">
                  Operator
                </Typography>
              </div>
            </Link>
          {/* Tombol Close (Mobile Only) */}
          <button onClick={() => setOpen(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* NAVIGATION LIST & BOTTOM IMAGE */}
        <div className="flex flex-col h-[calc(100%-140px)] justify-between">
          {/* Bagian Atas: Menu Navigasi */}
          <List className="p-0 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem
                  key={item.name}
                  onClick={() => { navigate(item.path); setOpen(false); }}
                  className={`rounded-2xl py-4 px-5 transition-all duration-300 group ${
                    isActive 
                      ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100" 
                      : "hover:bg-gray-50 text-gray-500 hover:text-blue-600"
                  }`}
                >
                  <ListItemPrefix>
                    <div className={`${isActive ? "text-blue-700" : "text-gray-400 group-hover:text-blue-500"} transition-colors`}>
                      {item.icon}
                    </div>
                  </ListItemPrefix>
                  <Typography className={`mr-auto text-sm font-black tracking-tight ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                    {item.name}
                  </Typography>
                  {isActive && <div className="h-2 w-2 rounded-full bg-blue-600 shadow-lg shadow-blue-200"></div>}
                </ListItem>
              );
            })}
          </List>

          {/* --- SECTION: GAMBAR DI PALING BAWAH --- */}
          <div className="mt-auto pt-6 w-full">
            <div className="overflow-hidden rounded-none w-full">
              <img 
                src={sidebarIllustration}
                alt="Sidebar Illustration" 
                className="w-full h-[170px] object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default SidebarOperator;