import React, { useState } from "react";
import MainLayout from "../MainLayout"; // Sesuaikan jika MainLayout ada di folder yang sama (./MainLayout)
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
  CameraIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline";

// Pastikan file EditProfileModal.jsx sudah kamu buat di folder yang sama
import EditProfileModal from "./EditProfileModal";

const ProfileIndex = () => {
  const [profileData, setProfileData] = useState({
    nama: "Khoirin Nisa Amalia",
    role: "Operator Field Unit",
    wilayah: "Tasikmalaya - Jawa Barat",
    email: "amalia.nisa@ecocash.id",
    phone: "+62 812-xxxx-xxxx",
    ktp: "3278xxxxxxxxxxxx",
    joinDate: "April 2026",
    bio: "Bertanggung jawab atas pemantauan real-time unit AIoT EcoCash dan sinkronisasi data container di wilayah operasional Tasikmalaya."
  });

  const [openEdit, setOpenEdit] = useState(false);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 md:px-0">
        
        {/* --- HERO SECTION --- */}
        <div className="relative mt-6">
          {/* Cover Image dengan Blue Gradient EcoCash */}
          <div className="h-56 w-full bg-gradient-to-br from-[#1e5ea8] via-[#3b82f6] to-[#60a5fa] rounded-[3rem] shadow-2xl shadow-blue-100 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="absolute top-6 right-8">
              <Chip 
                value="System Active" 
                className="bg-white/20 backdrop-blur-md text-white border-none normal-case font-bold" 
              />
            </div>
          </div>

          {/* Profile Picture Overlay */}
          <div className="absolute -bottom-16 left-6 md:left-12 flex items-end gap-6">
            <div className="relative group">
              <div className="p-2 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl transition-transform duration-500 hover:scale-105">
                <Avatar
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.nama}`}
                  alt="Profile"
                  className="h-32 w-32 md:h-40 md:w-40 rounded-[2rem] object-cover bg-blue-50"
                />
              </div>
              <Tooltip content="Change Photo">
                <div className="absolute bottom-2 right-2 p-2 bg-[#1e5ea8] rounded-xl border-4 border-white text-white cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                  <CameraIcon className="h-5 w-5" />
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex flex-col lg:flex-row gap-8 pt-16">
          
          {/* LEFT COLUMN: Personal Info */}
          <div className="lg:w-1/3 space-y-6">
            <Card className="p-8 rounded-[3rem] border-none shadow-xl shadow-blue-900/5 bg-white">
              <div className="mb-6">
                <Typography variant="h3" className="text-blue-900 font-black tracking-tight mb-2">
                  {profileData.nama}
                </Typography>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip 
                    value={profileData.role} 
                    className="bg-[#1e5ea8] text-white rounded-lg normal-case font-bold px-4"
                  />
                  <div className="flex items-center gap-1 text-green-600 font-bold text-[10px] uppercase tracking-widest bg-green-50 px-2 py-1 rounded-md">
                    <ShieldCheckIcon className="h-4 w-4 stroke-[3]" /> Verified Opr
                  </div>
                </div>
              </div>

              <Typography className="text-gray-600 text-sm leading-relaxed mb-8 font-medium italic">
                "{profileData.bio}"
              </Typography>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-[#1e5ea8]">
                    <MapPinIcon className="h-5 w-5" />
                  </div>
                  <Typography className="text-sm font-bold text-gray-700">{profileData.wilayah}</Typography>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-[#1e5ea8]">
                    <CalendarDaysIcon className="h-5 w-5" />
                  </div>
                  <Typography className="text-sm font-bold text-gray-700">Aktif Sejak {profileData.joinDate}</Typography>
                </div>
              </div>

              <Button 
                fullWidth 
                onClick={() => setOpenEdit(true)}
                className="mt-8 bg-[#1e5ea8] rounded-2xl normal-case font-black shadow-lg shadow-blue-100 flex items-center justify-center gap-3 py-4 hover:scale-[1.02] transition-all"
              >
                <PencilSquareIcon className="h-5 w-5" /> Edit Profil
              </Button>
            </Card>
          </div>

          {/* RIGHT COLUMN: Account & Stats */}
          <div className="lg:w-2/3 space-y-6">
            <Card className="p-10 rounded-[3rem] border-none shadow-xl shadow-blue-900/5 bg-white">
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-50">
                <Typography variant="h5" className="text-blue-900 font-black uppercase tracking-tighter flex items-center gap-2">
                  <CpuChipIcon className="h-6 w-6 text-blue-500" /> Informasi Operator AIoT
                </Typography>
                <Typography className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Unit-TAS01</Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                {[
                  { label: "Email Kedinasan", value: profileData.email, icon: EnvelopeIcon },
                  { label: "Kontak Personal", value: profileData.phone, icon: PhoneIcon },
                  { label: "Nomor KTP", value: profileData.ktp, icon: IdentificationIcon },
                  { label: "ID Sertifikasi AIoT", value: "OPR-2026-X01-TAS", icon: ShieldCheckIcon },
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

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Unit AIoT", val: "03", color: "bg-[#1e5ea8]" },
                { label: "Uptime Mesin", val: "98%", color: "bg-green-500" },
                { label: "Output (Kg)", val: "125", color: "bg-blue-900" }
              ].map((stat, i) => (
                <Card key={i} className={`${stat.color} p-8 rounded-[2.5rem] text-white text-center shadow-xl hover:-translate-y-1 transition-transform cursor-default`}>
                  <Typography className="text-[10px] font-bold uppercase opacity-70 tracking-widest mb-1">
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

      {/* Modal ini harus ada di folder yang sama */}
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