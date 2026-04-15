import React from "react";
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
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { useNavigate, useLocation } from "react-router-dom";

const SidebarAdminStore = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Menu Items yang disinkronkan dengan App.js
  const menuItems = [
    { 
      name: "Dashboard", 
      icon: <PresentationChartBarIcon className="h-5 w-5" />, 
      path: "/store/dashboard" 
    },
    { 
      name: "Produk Saya", 
      icon: <ShoppingBagIcon className="h-5 w-5" />, 
      path: "/store/produk" 
    },
    { 
      name: "Pesanan Masuk", 
      icon: <ClipboardDocumentListIcon className="h-5 w-5" />, 
      path: "/store/pesanan" // Sudah sama dengan App.js
    },
    { 
      name: "Pengiriman", 
      icon: <TruckIcon className="h-5 w-5" />, 
      path: "/store/shipping" // Sesuaikan jika ada rute khusus pengiriman
    },
    { 
      name: "System Setting", 
      icon: <Cog6ToothIcon className="h-5 w-5" />, 
      path: "/store/settings" // Mengarah ke setting yang sudah ada di App.js
    },
  ];

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <Card className={`fixed md:static inset-y-0 left-0 z-50 h-screen w-full max-w-[280px] rounded-none p-6 shadow-xl transition-transform duration-300 bg-white border-r border-gray-100 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        
        {/* HEADER: Logo & Nama Aplikasi sesuai branding EcoCash */}
        <div className="mb-8 p-4 flex items-center justify-between border-b border-gray-50 pb-6">
          <div className="flex items-center gap-4">
            <img src={logo2} alt="EcoCash Logo" className="h-12 w-12 object-contain" />
            <div>
              <Typography variant="h5" className="text-blue-700 font-black leading-tight tracking-tighter">
                EcoCash
              </Typography>
              <Typography className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] leading-none">
                Admin Store
              </Typography>
            </div>
          </div>
          
          <button onClick={() => setOpen(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* NAVIGATION LIST */}
        <div className="flex flex-col h-[calc(100%-140px)] justify-between">
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
                  {/* Indikator Titik Biru saat Aktif */}
                  {isActive && <div className="h-2 w-2 rounded-full bg-blue-600 shadow-lg shadow-blue-200"></div>}
                </ListItem>
              );
            })}
          </List>
        </div>
      </Card>
    </>
  );
};

export default SidebarAdminStore;