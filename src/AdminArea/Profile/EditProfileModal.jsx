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
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import api from "../../utils/api"; 

const EditProfileModal = ({ open, handleOpen, data, refreshData }) => {
  // Inisialisasi form dengan data yang aman
  const [form, setForm] = useState({
    name: "",
    username: "",
    location: "",
    bio: "",
    password: "" // Tambahkan field password kosong
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); 
  const [errorMessage, setErrorMessage] = useState("");

  // Sync form state ketika modal dibuka atau data dari props berubah
  useEffect(() => {
    if (open && data) {
      setForm({
        name: data.name || "",
        username: data.username || "",
        location: data.location || "",
        bio: data.bio || "",
        password: "" 
      });
    }
  }, [open, data]);

  const handleSubmit = async () => {
    setLoading(true);
    setStatus(null);
    try {
      // 1. Gunakan instance api.js (token sudah otomatis ditangani interceptor)
      // Gunakan endpoint yang sesuai dengan backend EcoCash
      await api.put("/auth/update-profile", form);

      setStatus("success");

      // Tunggu sebentar agar user bisa melihat status sukses
      setTimeout(() => {
        handleClose();
        if (refreshData) refreshData();
      }, 1500);

    } catch (error) {
      console.error("Gagal update profil:", error);
      setErrorMessage(error.response?.data?.message || "Gagal memperbarui profil.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    handleOpen();
    // Reset status modal setelah animasi penutupan selesai
    setTimeout(() => {
      setStatus(null);
      setErrorMessage("");
      setShowPassword(false);
    }, 300);
  };

  return (
    <Dialog 
      open={open} 
      handler={handleClose} 
      size="sm" 
      className="rounded-[35px] shadow-2xl bg-white overflow-hidden"
    >
      {status === "success" ? (
        <div className="flex flex-col items-center py-16 px-10 text-center">
          <div className="bg-green-50 p-5 rounded-full mb-4">
            <CheckCircleIcon className="h-20 w-20 text-green-500 animate-bounce" />
          </div>
          <Typography variant="h4" className="text-blue-900 font-black uppercase italic">Berhasil!</Typography>
          <Typography className="text-gray-500 font-medium italic mt-2">Data profil EcoCash Anda telah diperbarui.</Typography>
        </div>
      ) : status === "error" ? (
        <div className="flex flex-col items-center py-16 px-10 text-center">
          <div className="bg-red-50 p-5 rounded-full mb-4">
            <XCircleIcon className="h-20 w-20 text-red-500" />
          </div>
          <Typography variant="h4" className="text-blue-900 font-black uppercase italic">Gagal Simpan</Typography>
          <Typography className="text-red-400 font-bold text-sm mt-2">{errorMessage}</Typography>
          <Button 
            className="mt-8 bg-red-500 rounded-2xl normal-case font-black px-10" 
            onClick={() => setStatus(null)}
          >
            Coba Lagi
          </Button>
        </div>
      ) : (
        <>
          <DialogHeader className="flex justify-between px-10 pt-10 pb-4">
            <div className="flex flex-col">
              <Typography variant="h5" className="text-blue-900 font-black uppercase italic leading-none">Update Profile</Typography>
              <Typography className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Sinkronisasi Identitas EcoCash</Typography>
            </div>
            <div className="p-2 hover:bg-gray-100 rounded-2xl cursor-pointer transition-all" onClick={handleClose}>
              <XMarkIcon className="h-6 w-6 text-gray-400" />
            </div>
          </DialogHeader>

          <DialogBody className="px-10 py-2 space-y-5 overflow-y-auto max-h-[65vh]">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-[30px] bg-blue-50/50 flex items-center justify-center border-2 border-dashed border-blue-200 overflow-hidden shadow-inner p-1">
                   <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username}`} 
                    alt="Preview" 
                    className="w-full h-full object-cover rounded-[25px]" 
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl shadow-lg border-2 border-white">
                  <PhotoIcon className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <Typography className="text-[10px] font-black text-blue-900/50 ml-1 uppercase tracking-widest italic">Full Name</Typography>
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="!border-t-blue-gray-100 focus:!border-[#2b6cb0] rounded-2xl bg-gray-50/50 font-bold text-blue-900"
                  labelProps={{ className: "hidden" }}
                />
              </div>

              <div className="space-y-1">
                <Typography className="text-[10px] font-black text-blue-900/50 ml-1 uppercase tracking-widest italic">Username</Typography>
                <Input 
                  value={form.username} 
                  onChange={(e) => setForm({...form, username: e.target.value})}
                  className="!border-t-blue-gray-100 focus:!border-[#2b6cb0] rounded-2xl bg-gray-50/50 font-bold text-blue-900"
                  labelProps={{ className: "hidden" }}
                />
              </div>

              <div className="space-y-1">
                <Typography className="text-[10px] font-black text-blue-900/50 ml-1 uppercase tracking-widest italic">New Password (Optional)</Typography>
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Kosongkan jika tidak ingin ganti"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  icon={
                    <div className="cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </div>
                  }
                  className="!border-t-blue-gray-100 focus:!border-[#2b6cb0] rounded-2xl bg-gray-50/50"
                  labelProps={{ className: "hidden" }}
                />
              </div>

              <div className="space-y-1">
                <Typography className="text-[10px] font-black text-blue-900/50 ml-1 uppercase tracking-widest italic">Location</Typography>
                <Input 
                  value={form.location} 
                  onChange={(e) => setForm({...form, location: e.target.value})}
                  className="!border-t-blue-gray-100 focus:!border-[#2b6cb0] rounded-2xl bg-gray-50/50 font-bold text-blue-900"
                  labelProps={{ className: "hidden" }}
                />
              </div>

              <div className="space-y-1">
                <Typography className="text-[10px] font-black text-blue-900/50 ml-1 uppercase tracking-widest italic">Account Bio</Typography>
                <Textarea 
                  value={form.bio} 
                  onChange={(e) => setForm({...form, bio: e.target.value})}
                  className="!border-t-blue-gray-100 focus:!border-[#2b6cb0] rounded-2xl bg-gray-50/50 font-medium italic"
                  labelProps={{ className: "hidden" }}
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="px-10 pb-10 pt-4 gap-3">
            <Button 
              variant="text" 
              color="gray" 
              onClick={handleClose} 
              disabled={loading} 
              className="normal-case font-black text-[11px] px-6 rounded-2xl uppercase"
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#2b6cb0] rounded-2xl normal-case px-10 font-black shadow-none text-[11px] uppercase italic" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Syncing..." : "Update Details"}
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
};

export default EditProfileModal;