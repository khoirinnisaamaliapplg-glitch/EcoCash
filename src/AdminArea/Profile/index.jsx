import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../MainLayout"; 
import { Card, Typography, Button, Avatar, Spinner } from "@material-tailwind/react";
import { 
  PencilSquareIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  IdentificationIcon,
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";
import EditProfileModal from "./EditProfileModal";
import api from "../../utils/api"; // Pastikan path ke api.js benar

const ProfileIndex = () => {
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    email: "",
    role: "",
    location: "",
    bio: ""
  });

  // 1. Gunakan useCallback agar fetchProfile stabil saat dilempar ke props modal
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      // api.js kita sudah handle token di interceptor, tidak perlu headers manual
      const response = await api.get("/auth/me");
      
      const data = response.data.data || response.data;
      setUserData({
        name: data.name || "User EcoCash",
        username: data.username || "-",
        email: data.email || "-",
        role: data.role || "Member",
        location: data.location || "Belum diatur",
        bio: data.bio || "Tidak ada biografi."
      });
    } catch (error) {
      console.error("Gagal mengambil profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
             <Spinner className="h-10 w-10 text-blue-500" />
             <Typography className="text-[10px] font-black uppercase italic text-gray-400 animate-pulse">
               Syncing Profile...
             </Typography>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto pb-10 px-4">
        <div className="flex flex-col gap-1 mb-8">
          <Typography variant="h3" className="text-[#2b6cb0] font-black tracking-tight uppercase italic">
            My Profile
          </Typography>
          <Typography className="text-gray-500 text-sm font-medium italic">
            Informasi personal dan otoritas akun <span className="text-blue-600 font-bold">EcoCash AIoT</span>
          </Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SISI KIRI: CARD AVATAR */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-8 rounded-[35px] border border-blue-50 shadow-sm flex flex-col items-center text-center relative overflow-hidden bg-white">
              <div className="absolute top-0 w-full h-24 bg-gradient-to-br from-blue-600 to-blue-400 opacity-10" />
              
              <div className="relative mt-4">
                <Avatar
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`}
                  alt="Profile Photo"
                  className="h-32 w-32 rounded-[30px] border-4 border-white shadow-2xl bg-white"
                />
                <div className="absolute -bottom-2 -right-2 p-2 bg-green-500 rounded-xl border-4 border-white shadow-lg">
                  <ShieldCheckIcon className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="mt-6">
                <Typography variant="h5" className="text-blue-900 font-black uppercase leading-tight">
                  {userData.name}
                </Typography>
                <Typography className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] mt-2 italic">
                    Verified {userData.role}
                </Typography>
              </div>

              <div className="w-full mt-8 pt-8 border-t border-gray-50">
                 <Button 
                    fullWidth
                    onClick={() => setOpenEdit(true)}
                    className="flex items-center justify-center gap-2 bg-[#2b6cb0] normal-case rounded-2xl py-4 shadow-none hover:shadow-lg transition-all font-black text-[11px] uppercase italic"
                 >
                   <PencilSquareIcon className="h-5 w-5 stroke-[2]" /> Edit Profile Details
                 </Button>
              </div>
            </Card>
          </div>

          {/* SISI KANAN: DETAIL INFO */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-10 rounded-[35px] border border-blue-50 shadow-sm bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <IdentificationIcon className="h-4 w-4 text-blue-400" />
                      <Typography className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Username</Typography>
                    </div>
                    <Typography className="text-sm font-bold text-blue-900 pl-6 border-l-2 border-blue-100 uppercase">
                       @{userData.username}
                    </Typography>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <EnvelopeIcon className="h-4 w-4 text-blue-400" />
                      <Typography className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Email Address</Typography>
                    </div>
                    <Typography className="text-sm font-bold text-blue-900 pl-6 border-l-2 border-blue-100 lowercase">
                       {userData.email}
                    </Typography>
                  </section>
                </div>

                <div className="space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <BriefcaseIcon className="h-4 w-4 text-blue-400" />
                      <Typography className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Job Role</Typography>
                    </div>
                    <Typography className="text-sm font-bold text-blue-900 pl-6 border-l-2 border-blue-100 uppercase">
                       {userData.role}
                    </Typography>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPinIcon className="h-4 w-4 text-blue-400" />
                      <Typography className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Location</Typography>
                    </div>
                    <Typography className="text-sm font-bold text-blue-900 pl-6 border-l-2 border-blue-100 italic">
                       {userData.location}
                    </Typography>
                  </section>
                </div>

                <div className="md:col-span-2 pt-6 border-t border-gray-50">
                  <Typography className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-4 italic">Account Biography</Typography>
                  <div className="bg-blue-50/30 p-6 rounded-[24px] border border-blue-50/50">
                    <Typography className="text-sm text-gray-700 leading-relaxed font-medium italic">
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
        refreshData={fetchProfile} 
      />
    </MainLayout>
  );
};

export default ProfileIndex;