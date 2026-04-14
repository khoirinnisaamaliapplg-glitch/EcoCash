import React, { useState } from "react"; 
import Sidebar from "./sidebar"; 
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

  // Cek apakah user sedang di area admin berdasarkan URL path
  const isAreaAdmin = location.pathname.startsWith("/area");

  const handleLogout = () => {
    navigate("/"); 
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      {/* Sidebar: Mengatur navigasi berdasarkan role */}
      <Sidebar open={openSidebar} setOpen={setOpenSidebar} isArea={isAreaAdmin} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
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

            {/* Bar Pencarian Modern */}
            <div className="hidden sm:block w-48 md:w-80">
              <Input
                label="Search everything..."
                icon={<MagnifyingGlassIcon className="h-5 w-5 text-blue-gray-300" />}
                className="!border-t-blue-gray-100 focus:!border-blue-500 bg-gray-50/50 rounded-2xl"
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
                        {isAreaAdmin ? "Admin Area" : "Admin Amell"}
                      </Typography>
                      {/* Ganti text-green-500 ke text-blue-500 */}
                      <Typography className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
                        {isAreaAdmin ? "Otoritas Wilayah" : "Super Admin"}
                      </Typography>
                    </div>
                    
                    {/* Ganti bg-green-600 ke bg-[#2b6cb0] */}
                    <div className="w-10 h-10 bg-[#2b6cb0] rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                      {isAreaAdmin ? "A" : "S"}
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </MenuHandler>
                
                <MenuList className="p-2 border-none shadow-2xl rounded-2xl min-w-[180px]">
                  <MenuItem 
                    onClick={() => navigate(isAreaAdmin ? "/area/profile" : "/profile")} 
                    className="flex items-center gap-3 rounded-xl py-3"
                  >
                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                    <Typography className="font-bold text-gray-700">Profil Saya</Typography>
                  </MenuItem>

                  <hr className="my-2 border-gray-50" />
                  
                  <MenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-xl py-3 hover:bg-red-50 focus:bg-red-50 group"
                  >
                    <PowerIcon className="h-5 w-5 text-red-400 group-hover:text-red-600" />
                    <Typography className="font-bold text-red-400 group-hover:text-red-600">Keluar</Typography>
                  </MenuItem>
                </MenuList>
              </Menu>
            </div>
          </div>
        </header>
        
        {/* Konten Utama */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <div className="min-h-[calc(100vh-80px)] flex flex-col">
            <div className="flex-1 p-6 md:p-10">
              <div className="max-w-[1400px] mx-auto">
                {children}
              </div>
            </div>
            {/* Footer EcoCash */}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;