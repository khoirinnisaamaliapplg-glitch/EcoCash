import React, { useState } from "react";
import MainLayout from "../MainLayout"; 
import { Card, Typography, Button, Avatar, Tooltip } from "@material-tailwind/react";
import { 
  PencilSquareIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  IdentificationIcon,
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";
import EditProfileModal from "./EditProfileModal";

const ProfileIndex = () => {
  const [openEdit, setOpenEdit] = useState(false);
  
  const [userData, setUserData] = useState({
    name: "Khoirin Nisa Amalia",
    username: "nisa_amalia",
    email: "nisa@gmail.com",
    role: "Super Admin",
    location: "Tasikmalaya, Jawa Barat",
    bio: "Student at SMK YPC Tasikmalaya & Prospective Informatics Student. Focusing on AIoT waste management systems."
  });

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto pb-10">
        {/* Header Section */}
        <div className="flex flex-col gap-1 mb-8">
          <Typography variant="h3" className="text-[#2b6cb0] font-black tracking-tight">My Profile</Typography>
          <Typography className="text-gray-500 text-sm font-medium">Informasi personal dan otoritas akun EcoCash</Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SISI KIRI: Foto & Badge */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-8 rounded-[35px] border border-blue-50 shadow-sm flex flex-col items-center text-center relative overflow-hidden bg-white">
              <div className="absolute top-0 w-full h-24 bg-gradient-to-br from-blue-600 to-blue-400 opacity-10" />
              
              <div className="relative mt-4">
                <Avatar
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Amel"
                  alt="Profile Photo"
                  className="h-32 w-32 rounded-[30px] border-4 border-white shadow-2xl bg-white"
                />
                <div className="absolute -bottom-2 -right-2 p-2 bg-green-500 rounded-xl border-4 border-white shadow-lg">
                  <ShieldCheckIcon className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="mt-6">
                <Typography variant="h5" className="text-blue-900 font-bold">{userData.name}</Typography>
                <Typography className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 italic">
                   Verified {userData.role}
                </Typography>
              </div>

              <div className="w-full mt-8 pt-8 border-t border-gray-50 space-y-3">
                 <Button 
                   fullWidth
                   onClick={() => setOpenEdit(true)}
                   className="flex items-center justify-center gap-2 bg-[#2b6cb0] normal-case rounded-2xl py-4 shadow-none hover:shadow-lg transition-all"
                 >
                   <PencilSquareIcon className="h-5 w-5" /> Edit Profile Details
                 </Button>
                 <Typography className="text-[10px] text-gray-400 font-medium tracking-tight">Terakhir diperbarui: 14 April 2026</Typography>
              </div>
            </Card>
          </div>

          {/* SISI KANAN: Detail Informasi */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-10 rounded-[35px] border border-blue-50 shadow-sm bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Kolom 1 */}
                <div className="space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <IdentificationIcon className="h-4 w-4 text-blue-400" />
                      <Typography className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Username</Typography>
                    </div>
                    <Typography className="text-md font-bold text-blue-900 pl-6 border-l-2 border-blue-100">@{userData.username}</Typography>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <EnvelopeIcon className="h-4 w-4 text-blue-400" />
                      <Typography className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Email Address</Typography>
                    </div>
                    <Typography className="text-md font-bold text-blue-900 pl-6 border-l-2 border-blue-100">{userData.email}</Typography>
                  </section>
                </div>

                {/* Kolom 2 */}
                <div className="space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <BriefcaseIcon className="h-4 w-4 text-blue-400" />
                      <Typography className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Job Role</Typography>
                    </div>
                    <Typography className="text-md font-bold text-blue-900 pl-6 border-l-2 border-blue-100">{userData.role}</Typography>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPinIcon className="h-4 w-4 text-blue-400" />
                      <Typography className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Location</Typography>
                    </div>
                    <Typography className="text-md font-bold text-blue-900 pl-6 border-l-2 border-blue-100">{userData.location}</Typography>
                  </section>
                </div>

                {/* Full Width Bio */}
                <div className="md:col-span-2 pt-6 border-t border-gray-50">
                  <Typography className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-4">Account Biography</Typography>
                  <div className="bg-blue-50/30 p-6 rounded-[24px] border border-blue-50/50">
                    <Typography className="text-sm text-gray-700 leading-relaxed font-medium">
                      "{userData.bio}"
                    </Typography>
                  </div>
                </div>

              </div>
            </Card>
          </div>

        </div>
      </div>

      <EditProfileModal 
        open={openEdit} 
        handleOpen={() => setOpenEdit(false)} 
        data={userData} 
        setUserData={setUserData}
      />
    </MainLayout>
  );
};

export default ProfileIndex;