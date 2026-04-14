import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Input, 
  Button, 
  Typography, 
  Textarea 
} from "@material-tailwind/react";
import { 
  XMarkIcon, 
  PhotoIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from "@heroicons/react/24/outline";

const EditProfileModal = ({ open, handleOpen, data, setUserData }) => {
  const [form, setForm] = useState(data);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setForm(data);
  }, [data]);

  const handleSubmit = () => {
    setUserData(form);
    handleOpen();
  };

  return (
    <Dialog open={open} handler={handleOpen} size="sm" className="rounded-[35px] shadow-2xl bg-white">
      <DialogHeader className="flex justify-between px-10 pt-10 pb-4">
        <div className="flex flex-col">
          <Typography variant="h5" className="text-blue-900 font-black">Pembaruan Profil</Typography>
          <Typography className="text-xs text-gray-400 font-medium">Ubah informasi akun EcoCash Anda di sini</Typography>
        </div>
        <div 
          className="p-2 hover:bg-gray-100 rounded-2xl cursor-pointer transition-colors"
          onClick={handleOpen}
        >
          <XMarkIcon className="h-6 w-6 text-gray-400" />
        </div>
      </DialogHeader>

      <DialogBody className="px-10 py-2 space-y-5 overflow-y-auto max-h-[70vh]">
        {/* Bagian Foto Profil */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative group">
            <div className="h-28 w-28 rounded-[30px] bg-blue-50/50 flex items-center justify-center border-2 border-dashed border-blue-100 overflow-hidden shadow-inner">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Amel" alt="Preview" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]">
                  <PhotoIcon className="h-7 w-7 text-white mb-1" />
                  <Typography className="text-[9px] text-white font-black uppercase tracking-tighter">Ganti Foto</Typography>
               </div>
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-1">
            <Typography className="text-[11px] font-black text-blue-900 ml-1 uppercase tracking-wider opacity-60">Nama Lengkap</Typography>
            <Input 
              value={form.name} 
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="Contoh: Admin Amell"
              className="!border-t-blue-gray-100 focus:!border-[#2b6cb0] rounded-2xl bg-gray-50/30"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="space-y-1">
            <Typography className="text-[11px] font-black text-blue-900 ml-1 uppercase tracking-wider opacity-60">Username</Typography>
            <Input 
              value={form.username} 
              onChange={(e) => setForm({...form, username: e.target.value})}
              placeholder="mell123"
              className="!border-t-blue-gray-100 focus:!border-[#2b6cb0] rounded-2xl bg-gray-50/30"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="space-y-1">
            <Typography className="text-[11px] font-black text-blue-900 ml-1 uppercase tracking-wider opacity-60">Email</Typography>
            <Input 
              value={form.email} 
              disabled
              className="!border-t-blue-gray-100 rounded-2xl bg-gray-100/50 italic opacity-60"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="space-y-1">
            <Typography className="text-[11px] font-black text-blue-900 ml-1 uppercase tracking-wider opacity-60">Password</Typography>
            <Input 
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              icon={
                <div className="cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </div>
              }
              className="!border-t-blue-gray-100 focus:!border-[#2b6cb0] rounded-2xl bg-gray-50/30"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="space-y-1">
            <Typography className="text-[11px] font-black text-blue-900 ml-1 uppercase tracking-wider opacity-60">Lokasi</Typography>
            <Input 
              value={form.location} 
              onChange={(e) => setForm({...form, location: e.target.value})}
              className="!border-t-blue-gray-100 focus:!border-[#2b6cb0] rounded-2xl bg-gray-50/30"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="space-y-1">
            <Typography className="text-[11px] font-black text-blue-900 ml-1 uppercase tracking-wider opacity-60">Bio</Typography>
            <Textarea 
              value={form.bio} 
              onChange={(e) => setForm({...form, bio: e.target.value})}
              className="!border-t-blue-gray-100 focus:!border-[#2b6cb0] rounded-2xl bg-gray-50/30"
              labelProps={{ className: "hidden" }}
            />
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="px-10 pb-10 pt-4 gap-3">
        <Button 
          variant="text" 
          color="red" 
          onClick={handleOpen} 
          className="normal-case font-bold px-6 rounded-2xl"
        >
          Batal
        </Button>
        <Button 
          className="bg-[#2b6cb0] rounded-2xl normal-case px-10 font-black shadow-none hover:shadow-lg transition-all" 
          onClick={handleSubmit}
        >
          Simpan Profil
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditProfileModal;