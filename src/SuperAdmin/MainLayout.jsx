import React, { useState } from "react"; // Tambahkan useState
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
  Bars3Icon // Tambahkan icon menu hamburger
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  // State untuk mengontrol sidebar di mobile
  const [openSidebar, setOpenSidebar] = useState(false);

  const handleLogout = () => {
    navigate("/"); 
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      {/* SIDEBAR: Kirim props open dan setOpen ke komponen Sidebar */}
      <Sidebar open={openSidebar} setOpen={setOpenSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shadow-sm z-10">
          
          <div className="flex items-center gap-3">
            {/* Tombol Hamburger: Hanya muncul di layar kecil (mobile) */}
            <IconButton
              variant="text"
              color="blue-gray"
              className="md:hidden"
              onClick={() => setOpenSidebar(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </IconButton>

            {/* Input Search: Disembunyikan di layar sangat kecil jika perlu, atau lebarnya fleksibel */}
            <div className="hidden sm:block w-48 md:w-72">
              <Input
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                className="bg-gray-50"
              />
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
                    {/* Nama Admin: Disembunyikan di mobile agar tidak sempit */}
                    <div className="text-right hidden lg:block">
                      <Typography className="text-sm font-bold text-gray-800">Admin Amell</Typography>
                      <Typography className="text-[10px] font-bold text-green-500 uppercase">Online</Typography>
                    </div>
                    
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#2b6cb0] rounded-full flex items-center justify-center text-white text-xs md:text-base font-bold shadow-sm">
                      A
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </MenuHandler>
                
                <MenuList className="p-1 border-none shadow-lg">
                  <MenuItem className="flex items-center gap-3 rounded-md">
                    <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                    <Typography variant="small" className="font-bold text-blue-gray-800">
                      Profil Saya
                    </Typography>
                  </MenuItem>
                  <hr className="my-1 border-blue-gray-50" />
                  <MenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-md hover:bg-red-50 focus:bg-red-50 group"
                  >
                    <PowerIcon className="h-5 w-5 text-red-500 group-hover:text-red-700" />
                    <Typography variant="small" className="font-bold text-red-500 group-hover:text-red-700">
                      Keluar
                    </Typography>
                  </MenuItem>
                </MenuList>
              </Menu>
            </div>
          </div>
        </header>
        
        {/* Area Konten Dashboard */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="min-h-[calc(100vh-64px)] flex flex-col">
            {/* Konten Dashboard Utama */}
            <div className="flex-1 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
            </div>

            {/* Footer ditempel di sini */}
            <Footer />
        </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;