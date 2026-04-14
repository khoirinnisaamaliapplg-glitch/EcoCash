import React, { useState } from "react";
import MainLayout from "../MainLayout";
import { 
  Card, 
  Typography, 
  Button, 
  Avatar, 
  Chip, 
  Tooltip 
} from "@material-tailwind/react";
import { 
  EnvelopeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  IdentificationIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  CameraIcon
} from "@heroicons/react/24/outline";

import EditProfileModal from "./EditProfileModal";

const ProfileIndex = () => {
  const [profileData, setProfileData] = useState({
    nama: "Khoirin Nisa Amalia",
    role: "Admin Area",
    wilayah: "Cikini 1 - Jakarta Pusat",
    email: "amalia.nisa@ecocash.id",
    phone: "+62 812 3456 7890",
    ktp: "327310xxxxxxxxxx",
    joinDate: "Maret 2026",
    bio: "Bertanggung jawab atas pengelolaan operasional unit AIoT EcoCash dan koordinasi operator di wilayah Cikini."
  });

  const [openEdit, setOpenEdit] = useState(false);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* --- HERO SECTION --- */}
        <div className="relative mt-6">
          {/* Cover Image dengan Gradient Premium */}
          <div className="h-56 w-full bg-gradient-to-br from-[#1e40af] via-[#3b82f6] to-[#60a5fa] rounded-[3rem] shadow-2xl shadow-blue-200 overflow-hidden relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>
            <div className="absolute top-6 right-8">
              <Chip 
                value="System Active" 
                className="bg-white/20 backdrop-blur-md text-white border-none normal-case font-bold" 
              />
            </div>
          </div>

          {/* Profile Picture Overlay */}
          <div className="absolute -bottom-16 left-12 flex items-end gap-6">
            <div className="relative group">
              <div className="p-2 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl transition-transform duration-500 hover:scale-105">
                <Avatar
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.nama}`}
                  alt="Profile"
                  className="h-36 w-36 rounded-[2rem] object-cover"
                />
              </div>
              <Tooltip content="Change Photo">
                <div className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-xl border-4 border-white text-white cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                  <CameraIcon className="h-5 w-5" />
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex flex-col lg:flex-row gap-8 pt-16">
          
          {/* LEFT COLUMN: Personal Brand */}
          <div className="lg:w-1/3 space-y-6">
            <Card className="p-8 rounded-[3rem] border-none shadow-xl shadow-blue-900/5 bg-white/70 backdrop-blur-sm">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Typography variant="h3" className="text-blue-900 font-black tracking-tight">
                    {profileData.nama}
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <Chip 
                    value={profileData.role} 
                    className="bg-blue-600 text-white rounded-lg normal-case font-bold px-4"
                  />
                  <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] uppercase tracking-widest bg-green-50 px-2 py-1 rounded-md">
                    <ShieldCheckIcon className="h-4 w-4 stroke-[3]" /> Verified
                  </div>
                </div>
              </div>

              <Typography className="text-gray-600 text-sm leading-relaxed mb-8 font-medium">
                <span className="text-blue-600 font-black text-2xl leading-none italic">"</span>
                {profileData.bio}
                <span className="text-blue-600 font-black text-2xl leading-none italic">"</span>
              </Typography>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 group">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <MapPinIcon className="h-5 w-5" />
                  </div>
                  <Typography className="text-sm font-bold text-gray-700">{profileData.wilayah}</Typography>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <CalendarDaysIcon className="h-5 w-5" />
                  </div>
                  <Typography className="text-sm font-bold text-gray-700">Magang Sejak {profileData.joinDate}</Typography>
                </div>
              </div>

              <Button 
                fullWidth 
                onClick={() => setOpenEdit(true)}
                className="mt-8 bg-blue-600 rounded-2xl normal-case font-black shadow-lg shadow-blue-100 flex items-center justify-center gap-3 py-4 hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                <PencilSquareIcon className="h-5 w-5 stroke-2" /> Update Profil Kamu
              </Button>
            </Card>
          </div>

          {/* RIGHT COLUMN: Detail & Performance */}
          <div className="lg:w-2/3 space-y-6">
            <Card className="p-10 rounded-[3rem] border-none shadow-xl shadow-blue-900/5 bg-white">
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-50">
                <Typography variant="h5" className="text-blue-900 font-black uppercase tracking-tighter">
                  Informasi Akun AIoT
                </Typography>
                <Typography className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Ec-v3.0</Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                {[
                  { label: "Email Kedinasan", value: profileData.email, icon: EnvelopeIcon },
                  { label: "Kontak Personal", value: profileData.phone, icon: PhoneIcon },
                  { label: "Nomor Identitas", value: profileData.ktp, icon: IdentificationIcon },
                  { label: "User ID Intern", value: "#AA-0294-2026-NISA", icon: ShieldCheckIcon },
                ].map((item, index) => (
                  <div key={index} className="space-y-2 group">
                    <Typography className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                      {item.label}
                    </Typography>
                    <div className="flex items-center gap-3 text-blue-900 font-bold text-[15px]">
                      <item.icon className="h-5 w-5 opacity-30 group-hover:opacity-100 transition-opacity" />
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* PERFORMANCE STATS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Unit Dikelola", val: "12", color: "bg-blue-600", shadow: "shadow-blue-200" },
                { label: "Target Sampah", val: "94%", color: "bg-green-500", shadow: "shadow-green-200" },
                { label: "Operator Aktif", val: "05", color: "bg-blue-900", shadow: "shadow-blue-300" }
              ].map((stat, i) => (
                <Card key={i} className={`${stat.color} p-8 rounded-[2.5rem] text-white text-center shadow-2xl ${stat.shadow} hover:-translate-y-2 transition-all duration-500 cursor-default group`}>
                  <Typography className="text-[10px] font-bold uppercase opacity-60 tracking-[0.2em] mb-1 group-hover:opacity-100">
                    {stat.label}
                  </Typography>
                  <Typography variant="h1" className="font-black text-5xl">
                    {stat.val}
                  </Typography>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </div>

      <EditProfileModal 
        open={openEdit} 
        setOpen={setOpenEdit} 
        data={profileData} 
        setProfileData={setProfileData} 
      />
    </MainLayout>
  );
};

export default ProfileIndex;