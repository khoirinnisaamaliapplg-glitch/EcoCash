import React from "react";
// 1. Import gambar dari folder assets
import logo2 from "../assets/logo2.png"; 

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

  // DAFTAR MENU (Tambahkan item baru di sini)
  const menuItems = [
    { name: "Dashboard", icon: <PresentationChartBarIcon className="h-5 w-5" />, path: "/AdminArea/dashboard" },
    { name: "Machine Management", icon: <CpuChipIcon className="h-5 w-5" />, path: "/AdminArea/machine" },
    { name: "Operator Management", icon: <UserIcon className="h-5 w-5" />, path: "/AdminArea/operator" },
    { name: "User Management", icon: <UserGroupIcon className="h-5 w-5" />, path: "/AdminArea/users" }, // Area Baru
    { name: "Data Lokasi", icon: <ClipboardDocumentListIcon className="h-5 w-5" />, path: "/AdminArea/locations" }, // Area Baru
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

      <Card className={`fixed md:static inset-y-0 left-0 z-30 h-screen w-full max-w-[280px] rounded-none p-6 shadow-xl transition-transform duration-300 bg-white border-r border-gray-100 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        
        {/* HEADER AREA */}
        <div className="mb-6 p-4 flex items-center justify-between border-b border-gray-50 pb-6">
          <div className="flex items-center gap-4">
            <img src={logo2} alt="EcoCash" className="h-14 w-14 object-contain" />
            <div>
              <Typography variant="h5" className="text-[#2b6cb0] font-black leading-tight">
                EcoCash
              </Typography>
              <Typography variant="small" className="text-[#2b6cb0] font-bold text-[10px] uppercase tracking-widest">
                Area Admin
              </Typography>
            </div>
          </div>
          
          <button onClick={() => setOpen(false)} className="md:hidden">
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* LIST MENU */}
        <List className="p-0 space-y-1.5 overflow-y-auto"> {/* Tambahkan overflow jika menu terlalu banyak */}
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem
                key={item.name}
                onClick={() => { navigate(item.path); setOpen(false); }}
                className={`rounded-2xl py-3.5 px-4 transition-all duration-300 group ${
                  isActive 
                    ? "bg-blue-50 text-[#2b6cb0] shadow-sm" 
                    : "hover:bg-gray-50 text-gray-500"
                }`}
              >
                <ListItemPrefix>
                  <div className={`${isActive ? "text-[#2b6cb0]" : "text-gray-400 group-hover:text-gray-600"}`}>
                    {item.icon}
                  </div>
                </ListItemPrefix>
                <Typography className={`mr-auto text-sm font-bold ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                  {item.name}
                </Typography>
              </ListItem>
            );
          })}
        </List>
      </Card>
    </>
  );
};

export default SidebarArea;