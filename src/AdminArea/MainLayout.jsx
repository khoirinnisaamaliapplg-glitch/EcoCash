import React, { useState } from "react"; 
import Sidebar from "./sidebar"; 
import Footer from "./Footer";
import { 
  Input, IconButton, Typography, Menu, MenuHandler, MenuList, MenuItem 
} from "@material-tailwind/react";
import { 
  MagnifyingGlassIcon, BellIcon, ChevronDownIcon, UserCircleIcon, PowerIcon, Bars3Icon 
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
// 1. IMPORT TOASTER
import { Toaster } from "react-hot-toast";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const [openSidebar, setOpenSidebar] = useState(false);
  
  const [userProfile] = useState(() => {
    const storedUser = localStorage.getItem("userData");
    const storedRole = localStorage.getItem("userRole");
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const fixName = parsedUser.name || parsedUser.username || parsedUser.user?.name || "User";
        
        let currentRole = storedRole || parsedUser.role || "AREA_ADMIN";
        if (currentRole.includes("SUPER")) {
          currentRole = "AREA_ADMIN";
        }

        return {
          name: fixName,
          role: currentRole
        };
      } catch (e) {
        console.error("Error parsing data", e);
      }
    }
    return { name: "Guest", role: "AREA_ADMIN" };
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); 
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans">
      {/* 2. TAMBAHKAN TOASTER DI SINI */}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
          },
        }}
      />

      <Sidebar open={openSidebar} setOpen={setOpenSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <IconButton variant="text" color="blue-gray" className="md:hidden" onClick={() => setOpenSidebar(true)}>
              <Bars3Icon className="h-6 w-6" />
            </IconButton>
            <div className="hidden sm:block w-48 md:w-72">
              <Input label="Search" icon={<MagnifyingGlassIcon className="h-5 w-5" />} className="bg-gray-50" />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <IconButton variant="text" color="blue-gray" className="hidden sm:inline-block">
              <BellIcon className="h-6 w-6" />
            </IconButton>
            
            <div className="flex items-center gap-3 border-l pl-4 md:pl-6 border-gray-100">
              <Menu>
                <MenuHandler>
                  <div className="flex items-center gap-2 md:gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-all">
                    <div className="text-right hidden lg:block">
                      <Typography className="text-sm font-bold text-gray-800 capitalize leading-tight">
                        {userProfile.name.replace(/_/g, " ")}
                      </Typography>
                      <Typography className="text-[10px] font-bold text-green-500 uppercase tracking-widest leading-tight">
                        {userProfile.role.replace(/_/g, " ")} • Online
                      </Typography>
                    </div>
                    
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#2b6cb0] rounded-full flex items-center justify-center text-white text-xs md:text-base font-bold shadow-sm uppercase">
                      {userProfile.name.charAt(0)}
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </MenuHandler>
                
                <MenuList className="p-1 border-none shadow-lg">
                  <MenuItem 
                    onClick={() => navigate("/AdminArea/profile")} 
                    className="flex items-center gap-3 rounded-md"
                  >
                    <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                    <Typography variant="small" className="font-bold text-blue-gray-800">
                      Profil Area Admin
                    </Typography>
                  </MenuItem>
                  
                  <hr className="my-1 border-blue-gray-50" />
                  
                  <MenuItem onClick={handleLogout} className="flex items-center gap-3 rounded-md hover:bg-red-50 group">
                    <PowerIcon className="h-5 w-5 text-red-500" />
                    <Typography variant="small" className="font-bold text-red-500">Keluar</Typography>
                  </MenuItem>
                </MenuList>
              </Menu>
            </div>
          </div>
        </header>
        
        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="min-h-[calc(100vh-64px)] flex flex-col">
            <div className="flex-1 p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;