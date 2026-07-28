import React from "react";
// 1. Import gambar dari folder assets (Sudah aman)
import logo2 from "../assets/logo2.png";
import sidebarIllustration from "../assets/banner2.jpeg";
import { NavLink, Link } from "react-router-dom";

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
  TruckIcon, // Import ikon Truck untuk menu baru
  UserIcon,
  TagIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon, // Icon baru untuk Transaksi
  UserGroupIcon // Icon baru untuk User Management
} from "@heroicons/react/24/outline";
import { useNavigate, useLocation } from "react-router-dom";

const SidebarArea = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // DAFTAR MENU
  const menuItems = [
    { name: "Dashboard", icon: <PresentationChartBarIcon className="h-5 w-5" />, path: "/AdminArea/dashboard" },
    { name: "User Management", icon: <UserGroupIcon className="h-5 w-5" />, path: "/AdminArea/users" },
    { name: "Machine Management", icon: <CpuChipIcon className="h-5 w-5" />, path: "/AdminArea/machine" },
    { name: "Smart Truck", icon: <TruckIcon className="h-5 w-5" />, path: "/AdminArea/smart-truck" }, // Menu Baru
    { name: "Operator Management", icon: <UserIcon className="h-5 w-5" />, path: "/AdminArea/operator" },
    { name: "Store", icon: <UserGroupIcon className="h-5 w-5" />, path: "/AdminArea/store" }, 
    { name: "Data Lokasi", icon: <ClipboardDocumentListIcon className="h-5 w-5" />, path: "/AdminArea/locations" }, 
    { name: "Local Waste Price", icon: <TagIcon className="h-5 w-5" />, path: "/AdminArea/local-waste" },
    { name: "System Setting", icon: <Cog6ToothIcon className="h-5 w-5" />, path: "/AdminArea/settings" },
  ];

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div 
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menggunakan h-screen, overflow-hidden agar membekukan ukuran layar, dan p-5 agar pas */}
      <Card className={`fixed md:static inset-y-0 left-0 z-30 h-screen w-full max-w-[280px] rounded-none p-5 shadow-xl transition-transform duration-300 bg-white border-r border-gray-100 flex flex-col justify-between overflow-hidden ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        
        {/* KONTEN BAGIAN ATAS (Logo + List Menu) - flex-1 otomatis mengambil sisa ruang */}
        <div className="flex flex-col flex-1 overflow-hidden">
          
          {/* HEADER AREA */}
          <div className="mb-2 p-2 flex items-center justify-between border-b border-gray-50 pb-4 shrink-0">
            <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src={logo2} alt="EcoCash" className="h-12 w-12 object-contain" />
              <div>
                <Typography variant="h5" className="text-[#2b6cb0] font-black leading-tight text-lg">
                  EcoCash
                </Typography>
                <Typography variant="small" className="text-green-500 font-bold text-[10px] uppercase tracking-widest">
                  Admin Area
                </Typography>
              </div>
            </Link>
            
            <button onClick={() => setOpen(false)} className="md:hidden">
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* LIST MENU (Dibuat overflow-y-auto murni untuk proteksi, tetapi menyembunyikan scrollbar default) */}
          <div className="flex-1 overflow-y-auto py-2 pr-1 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <List className="p-0 space-y-1"> 
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItem
                    key={item.name}
                    onClick={() => { navigate(item.path); setOpen(false); }}
                    className={`rounded-xl py-2.5 px-3 transition-all duration-300 group ${
                      isActive 
                        ? "bg-blue-50 text-[#2b6cb0] shadow-sm" 
                        : "hover:bg-gray-50 text-gray-500"
                    }`}
                  >
                    <ListItemPrefix className="mr-3">
                      <div className={`${isActive ? "text-[#2b6cb0]" : "text-gray-400 group-hover:text-gray-600"}`}>
                        {item.icon}
                      </div>
                    </ListItemPrefix>
                    <Typography className={`mr-auto text-sm font-semibold ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                      {item.name}
                    </Typography>
                  </ListItem>
                );
              })}
            </List>
          </div>
        </div>

        {/* --- KONTEN BAGIAN BAWAH --- */}
        <div className="pt-3 border-t border-gray-100 flex flex-col items-center justify-center shrink-0 w-full mt-2">
          <img 
            src={sidebarIllustration}
            alt="Admin Panel Illustration" 
            className="w-full h-[110px] object-cover opacity-90 hover:opacity-100 transition-opacity duration-300 rounded-xl shadow-sm"
          />
        </div>

      </Card>
    </>
  );
};

export default SidebarArea;