import React from "react";
import { NavLink, Link } from "react-router-dom";
import { 
  List, 
  ListItem, 
  ListItemPrefix, 
  Typography,
} from "@material-tailwind/react";
import { 
  Square2StackIcon, 
  UserGroupIcon, 
  TruckIcon, 
  CubeIcon, 
  TagIcon, 
  ShoppingBagIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  XMarkIcon,
  MapIcon,
  TrashIcon 
} from "@heroicons/react/24/outline";
import logo2 from "../assets/logo2.png";
import sidebarIllustration from "../assets/banner2.jpeg";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ open, setOpen }) => {
  const menu = [
    { name: "Dashboard", icon: <Square2StackIcon className="h-5 w-5" />, path: "/dashboard" },
    { name: "Smart Container", icon: <CubeIcon className="h-5 w-5" />, path: "/smart-container" },
    { name: "Smart Truck", icon: <TruckIcon className="h-5 w-5" />, path: "/smart-truck" },
    { name: "Data Wilayah", icon: <MapIcon className="h-5 w-5" />, path: "/areas" },
    { name: "Waste Management", icon: <TrashIcon className="h-5 w-5" />, path: "/waste-management" },
    { name: "Users", icon: <UserGroupIcon className="h-5 w-5" />, path: "/users" },
    { name: "Waste Prices", icon: <TagIcon className="h-5 w-5" />, path: "/waste-prices" },
    { name: "Store", icon: <ShoppingBagIcon className="h-5 w-5" />, path: "/marketplace" },
    { name: "Financial Reports", icon: <ChartBarIcon className="h-5 w-5" />, path: "/finansial-reports" },
    { name: "System Setting", icon: <Cog6ToothIcon className="h-5 w-5" />, path: "/settings" },
  ];

  return (
    <>
      {/* Overlay untuk Mobile */}
      {open && (
        <div 
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Container (Diubah menjadi flex flex-col) */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30
        h-screen w-full max-w-[18rem] p-4 
        shadow-xl shadow-blue-gray-900/5 bg-white 
        border-r border-gray-100
        transition-transform duration-300 ease-in-out
        flex flex-col justify-between
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        
        {/* BAGIAN ATAS: Logo & Menu List */}
        <div className="flex flex-col h-[calc(100%-130px)]">
          {/* Logo Section */}
          <div className="mb-4 p-4 flex items-center justify-between border-b border-gray-50 pb-6 shrink-0">
            <Link to="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <img src={logo2} alt="EcoCash" className="h-14 w-14 object-contain" />
              <div>
                <Typography variant="h5" className="text-[#2b6cb0] font-black leading-tight">
                  EcoCash
                </Typography>
                <Typography variant="small" className="text-green-500 font-bold text-[10px] uppercase tracking-widest">
                  Super Admin
                </Typography>
              </div>
            </Link>
            
            <button onClick={() => setOpen(false)} className="md:hidden">
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Menu List (Ditambahkan overflow-y-auto agar aman jika menu panjang) */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <List className="gap-1 p-0">
              {menu.map((item, idx) => (
                <NavLink 
                  to={item.path} 
                  key={idx}
                  onClick={() => setOpen(false)} 
                >
                  {({ isActive }) => (
                    <ListItem 
                      className={`
                        ${isActive ? "bg-blue-50 text-[#2b6cb0]" : "text-gray-600 hover:text-[#2b6cb0]"} 
                        font-semibold text-sm py-3 transition-all rounded-xl
                      `}
                    >
                      <ListItemPrefix>{item.icon}</ListItemPrefix>
                      {item.name}
                    </ListItem>
                  )}
                </NavLink>
              ))}
            </List>
          </div>
        </div>

        {/* --- BAGIAN BAWAH: GAMBAR FOTO ILUSTRASI --- */}
        <div className="pt-4 border-t border-gray-50 flex flex-col items-center justify-center shrink-0 w-full">
          <img 
            src={sidebarIllustration}
            alt="Admin Panel Illustration" 
            className="w-full h-[140px] object-cover opacity-90 hover:opacity-100 transition-opacity duration-300 rounded-xl"
          />
        </div>

      </div>
    </>
  );
};

export default Sidebar;