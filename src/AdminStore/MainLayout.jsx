import React, { useState } from "react"; 
import SidebarAdminStore from "./sidebar"; // Sesuaikan dengan nama file asli
import Footer from "./Footer";
import { 
  Input, 
  IconButton, 
  Typography, 
  Menu, 
  MenuHandler, 
  MenuList, 
  MenuItem 
} from "@material-tailwind/react";
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  ChevronDownIcon, 
  UserCircleIcon, 
  PowerIcon,
  Bars3Icon 
} from "@heroicons/react/24/outline";
import { useNavigate, useLocation } from "react-router-dom";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSidebar, setOpenSidebar] = useState(false);

  // Deteksi Role berdasarkan URL
  const isAreaAdmin = location.pathname.startsWith("/area");
  const isOperator = location.pathname.startsWith("/operator");
  const isStoreAdmin = location.pathname.startsWith("/store"); 

  const handleLogout = () => {
    navigate("/"); 
  };

  // Label & Warna Dinamis (Green Theme untuk Store)
  const getRoleLabel = () => {
    if (isOperator) return "Operator EcoCash";
    if (isAreaAdmin) return "Admin Area";
    if (isStoreAdmin) return "Admin Store";
    return "Super Admin";
  };

  const getSubLabel = () => {
    if (isOperator) return "Staff Lapangan";
    if (isAreaAdmin) return "Otoritas Wilayah";
    if (isStoreAdmin) return "Pengelola Marketplace";
    return "Master Control";
  };

  const getThemeColor = () => {
    if (isOperator) return "text-orange-600";
    if (isAreaAdmin) return "text-blue-500";
    if (isStoreAdmin) return "text-green-600"; 
    return "text-blue-500";
  };

  const getAvatarBg = () => {
    if (isOperator) return "bg-orange-600 shadow-orange-100";
    if (isAreaAdmin) return "bg-[#2b6cb0] shadow-blue-100";
    if (isStoreAdmin) return "bg-green-600 shadow-green-100"; 
    return "bg-[#2b6cb0] shadow-blue-100";
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      {/* Sidebar khusus Admin Store */}
      <SidebarAdminStore 
        open={openSidebar} 
        setOpen={setOpenSidebar} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-10 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <IconButton
              variant="text"
              color="blue-gray"
              className="md:hidden"
              onClick={() => setOpenSidebar(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </IconButton>

            <div className="hidden sm:block w-48 md:w-80">
              <Input
                label="Search data..."
                icon={<MagnifyingGlassIcon className="h-5 w-5 text-blue-gray-300" />}
                className={`!border-t-blue-gray-100 ${isStoreAdmin ? "focus:!border-green-500" : "focus:!border-blue-500"} bg-gray-50/50 rounded-2xl`}
                labelProps={{ className: "hidden" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <IconButton variant="text" color="blue-gray" className="hidden sm:inline-block relative">
              <BellIcon className="h-6 w-6 text-gray-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </IconButton>
            
            <div className="flex items-center gap-3 border-l pl-4 md:pl-8 border-gray-100">
              <Menu transition={{ mount: { y: 0 }, unmount: { y: 25 } }}>
                <MenuHandler>
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-all group">
                    <div className="text-right hidden lg:block">
                      <Typography className="text-sm font-black text-gray-800 leading-tight">
                        {getRoleLabel()}
                      </Typography>
                      <Typography className={`text-[10px] font-bold uppercase tracking-widest ${getThemeColor()}`}>
                        {getSubLabel()}
                      </Typography>
                    </div>
                    
                    <div className={`w-10 h-10 ${getAvatarBg()} rounded-2xl flex items-center justify-center text-white font-black shadow-lg group-hover:scale-105 transition-transform`}>
                      {isOperator ? "O" : isAreaAdmin ? "A" : isStoreAdmin ? "T" : "S"}
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </MenuHandler>
                
                <MenuList className="p-2 border-none shadow-2xl rounded-2xl min-w-[180px]">
                  <MenuItem 
                    onClick={() => navigate(isStoreAdmin ? "/store/profile" : "/profile")} 
                    className="flex items-center gap-3 rounded-xl py-3"
                  >
                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                    <Typography className="font-bold text-gray-700">Profil Toko</Typography>
                  </MenuItem>

                  <hr className="my-2 border-gray-50" />
                  
                  <MenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-xl py-3 hover:bg-red-50 group"
                  >
                    <PowerIcon className="h-5 w-5 text-red-400 group-hover:text-red-600" />
                    <Typography className="font-bold text-red-400 group-hover:text-red-600">Keluar</Typography>
                  </MenuItem>
                </MenuList>
              </Menu>
            </div>
          </div>
        </header>
        
        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <div className="min-h-[calc(100vh-80px)] flex flex-col">
            <div className="flex-1 p-6 md:p-10">
              <div className="max-w-[1400px] mx-auto">
                {children}
              </div>
            </div>
            {/* Pastikan file Footer.jsx ada, atau komentari baris ini jika belum ada */}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;