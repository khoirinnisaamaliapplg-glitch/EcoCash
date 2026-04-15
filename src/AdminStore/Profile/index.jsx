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
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  CameraIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  StarIcon
} from "@heroicons/react/24/outline";

import EditProfileModal from "./EditProfileModal";

const ProfileIndex = () => {
  const [profileData, setProfileData] = useState({
    nama: "Khoirin Nisa Amalia",
    role: "Official Admin Store",
    namaToko: "EcoStore Tasikmalaya",
    wilayah: "Tasikmalaya, Jawa Barat",
    email: "nisa.store@ecocash.id",
    phone: "+62 812-3456-7890",
    joinDate: "Maret 2026",
    bio: "Pengelola gerai resmi produk daur ulang EcoCash wilayah Tasikmalaya. Berfokus pada pemasaran produk circular economy berkualitas tinggi."
  });

  const [openEdit, setOpenEdit] = useState(false);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 md:px-0">
        
        {/* --- HERO SECTION --- */}
        <div className="relative mt-6">
          <div className="h-56 w-full bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 rounded-[3rem] shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="absolute top-6 right-8">
              <Chip 
                value="Verified Merchant" 
                className="bg-green-500 text-white border-none normal-case font-bold px-4" 
              />
            </div>
          </div>

          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-6 md:left-12 flex items-end gap-6">
            <div className="relative group">
              <div className="p-2 bg-white rounded-[2.5rem] shadow-2xl">
                <Avatar
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.nama}`}
                  alt="Profile"
                  className="h-32 w-32 md:h-40 md:w-40 rounded-[2rem] object-cover bg-blue-50"
                />
              </div>
              <Tooltip content="Ubah Foto">
                <div className="absolute bottom-2 right-2 p-2 bg-blue-700 rounded-xl border-4 border-white text-white cursor-pointer shadow-lg hover:bg-blue-800 transition-colors">
                  <CameraIcon className="h-5 w-5" />
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex flex-col lg:flex-row gap-8 pt-16">
          
          {/* LEFT: Info Singkat */}
          <div className="lg:w-1/3 space-y-6">
            <Card className="p-8 rounded-[3rem] border-none shadow-xl bg-white">
              <div className="mb-6">
                <Typography variant="h3" className="text-blue-900 font-black tracking-tight mb-2">
                  {profileData.nama}
                </Typography>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip 
                    value={profileData.role} 
                    className="bg-blue-900 text-white rounded-lg normal-case font-bold"
                  />
                </div>
              </div>

              <Typography className="text-gray-600 text-sm leading-relaxed mb-8 font-medium italic">
                "{profileData.bio}"
              </Typography>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-700">
                    <BuildingStorefrontIcon className="h-5 w-5" />
                  </div>
                  <Typography className="text-sm font-bold text-gray-700">{profileData.namaToko}</Typography>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-700">
                    <MapPinIcon className="h-5 w-5" />
                  </div>
                  <Typography className="text-sm font-bold text-gray-700">{profileData.wilayah}</Typography>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-700">
                    <CalendarDaysIcon className="h-5 w-5" />
                  </div>
                  <Typography className="text-sm font-bold text-gray-700">Partner Sejak {profileData.joinDate}</Typography>
                </div>
              </div>

              <Button 
                fullWidth 
                onClick={() => setOpenEdit(true)}
                className="mt-8 bg-blue-700 rounded-2xl normal-case font-black flex items-center justify-center gap-3 py-4 shadow-lg shadow-blue-100"
              >
                <PencilSquareIcon className="h-5 w-5" /> Edit Profil Toko
              </Button>
            </Card>
          </div>

          {/* RIGHT: Detail & Stats */}
          <div className="lg:w-2/3 space-y-6">
            <Card className="p-10 rounded-[3rem] border-none shadow-xl bg-white">
              <Typography variant="h5" className="text-blue-900 font-black uppercase tracking-tighter mb-8 border-b pb-4">
                Informasi Kontak & Akun
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                {[
                  { label: "Email Bisnis", value: profileData.email, icon: EnvelopeIcon },
                  { label: "WhatsApp Toko", value: profileData.phone, icon: PhoneIcon },
                  { label: "ID Merchant", value: "MERC-ECO-0992", icon: ShieldCheckIcon },
                  { label: "Rating Toko", value: "4.9 / 5.0", icon: StarIcon },
                ].map((item, index) => (
                  <div key={index} className="space-y-2 group">
                    <Typography className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                      {item.label}
                    </Typography>
                    <div className="flex items-center gap-3 text-blue-900 font-bold">
                      <item.icon className="h-5 w-5 text-blue-300 group-hover:text-blue-600" />
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* STORE STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Produk Aktif", val: "24", color: "bg-blue-700", icon: ShoppingBagIcon },
                { label: "Total Pesanan", val: "1.2k", color: "bg-emerald-500", icon: BanknotesIcon },
                { label: "Performa", val: "96%", color: "bg-blue-900", icon: StarIcon }
              ].map((stat, i) => (
                <Card key={i} className={`${stat.color} p-8 rounded-[2.5rem] text-white shadow-xl`}>
                  <div className="flex justify-between items-start mb-4">
                    <stat.icon className="h-6 w-6 opacity-50" />
                    <Typography className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                      {stat.label}
                    </Typography>
                  </div>
                  <Typography variant="h2" className="font-black">{stat.val}</Typography>
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
        setData={setProfileData} 
      />
    </MainLayout>
  );
};

export default ProfileIndex;