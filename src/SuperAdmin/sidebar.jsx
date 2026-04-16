import React from "react";
import { NavLink } from "react-router-dom";
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
  MapIcon // <-- IMPORT ICON MAP UNTUK AREA
} from "@heroicons/react/24/outline";
import logo2 from "../assets/logo2.png";

const Sidebar = ({ open, setOpen }) => {
  // Menu yang sudah ditambahkan Data Wilayah
  const menu = [
    { name: "Dashboard", icon: <Square2StackIcon className="h-5 w-5" />, path: "/dashboard" },
    { name: "Smart Container", icon: <CubeIcon className="h-5 w-5" />, path: "/smart-container" },
    { name: "Smart Truck", icon: <TruckIcon className="h-5 w-5" />, path: "/smart-truck" },
    { name: "Data Wilayah", icon: <MapIcon className="h-5 w-5" />, path: "/areas" }, // <-- MENU BARU
    { name: "Users", icon: <UserGroupIcon className="h-5 w-5" />, path: "/users" },
    { name: "Waste Prices", icon: <TagIcon className="h-5 w-5" />, path: "/waste-prices" },
    { name: "MarketPlace", icon: <ShoppingBagIcon className="h-5 w-5" />, path: "/marketplace" },
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

      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30
        h-screen w-full max-w-[18rem] p-4 
        shadow-xl shadow-blue-gray-900/5 bg-white 
        overflow-y-auto border-r border-gray-100
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        
        {/* Logo Section */}
        <div className="mb-6 p-4 flex items-center justify-between border-b border-gray-50 pb-6">
          <div className="flex items-center gap-4">
            <img src={logo2} alt="EcoCash" className="h-14 w-14 object-contain" />
            <div>
              <Typography variant="h5" className="text-[#2b6cb0] font-black leading-tight">
                EcoCash
              </Typography>
              <Typography variant="small" className="text-green-500 font-bold text-[10px] uppercase tracking-widest">
                Super Admin
              </Typography>
            </div>
          </div>
          
          <button onClick={() => setOpen(false)} className="md:hidden">
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Menu List */}
        <List className="gap-1">
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
    </>
  );
};

export default Sidebar;