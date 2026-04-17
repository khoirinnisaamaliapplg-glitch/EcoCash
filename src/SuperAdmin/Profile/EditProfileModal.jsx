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
import axios from "axios";

const EditProfileModal = ({ open, handleOpen, data, refreshData }) => {
  const [form, setForm] = useState(data);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setForm(data);
  }, [data]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Kirim data ke API (Ganti URL sesuai backend kamu)
      await axios.put("http://localhost:3000/api/auth/update-profile", form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStatus("success");

      // Tunggu 2 detik lalu tutup dan refresh data di halaman utama
      setTimeout(() => {
        handleClose();
        if (refreshData) refreshData();
      }, 2000);

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
    // Reset status modal setelah tertutup
    setTimeout(() => {
      setStatus(null);
      setErrorMessage("");
    }, 300);
  };

  return (
    <Dialog open={open} handler={handleClose} size="sm" className="rounded-[35px] shadow-2xl bg-white overflow-hidden">
      {status === "success" ? (
        /* 1. TAMPILAN SUKSES */
        <div className="flex flex-col items-center py-16 px-10 text-center">
          <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4 animate-bounce" />
          <Typography variant="h4" className="text-blue-900 font-black">Profil Diperbarui!</Typography>
          <Typography className="text-gray-600 font-medium">Informasi akun EcoCash Anda berhasil disimpan.</Typography>
        </div>
      ) : status === "error" ? (
        /* 2. TAMPILAN ERROR */
        <div className="flex flex-col items-center py-16 px-10 text-center">
          <XCircleIcon className="h-20 w-20 text-red-500 mb-4" />
          <Typography variant="h4" className="text-blue-900 font-black">Gagal Update</Typography>
          <Typography className="text-red-500 font-medium">{errorMessage}</Typography>
          <Button className="mt-6 bg-red-500 rounded-2xl" onClick={() => setStatus(null)}>Coba Lagi</Button>
        </div>
      ) : (
        /* 3. TAMPILAN FORM (NORMAL) */
        <>
          <DialogHeader className="flex justify-between px-10 pt-10 pb-4">
            <div className="flex flex-col">
              <Typography variant="h5" className="text-blue-900 font-black">Pembaruan Profil</Typography>
              <Typography className="text-xs text-gray-400 font-medium">Ubah informasi akun EcoCash Anda di sini</Typography>
            </div>
            <div className="p-2 hover:bg-gray-100 rounded-2xl cursor-pointer transition-colors" onClick={handleClose}>
              <XMarkIcon className="h-6 w-6 text-gray-400" />
            </div>
          </DialogHeader>

          <DialogBody className="px-10 py-2 space-y-5 overflow-y-auto max-h-[60vh]">
            {/* Preview Foto Berdasarkan Username */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative group">
                <div className="h-28 w-28 rounded-[30px] bg-blue-50/50 flex items-center justify-center border-2 border-dashed border-blue-100 overflow-hidden shadow-inner">
                   <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username}`} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                   <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]">
                      <PhotoIcon className="h-7 w-7 text-white mb-1" />
                      <Typography className="text-[9px] text-white font-black uppercase tracking-tighter">Avatar Otomatis</Typography>
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1">
                <Typography className="text-[11px] font-black text-blue-900 ml-1 uppercase tracking-wider opacity-60">Nama Lengkap</Typography>
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="!border-t-blue-gray-100 focus:!border-[#2b6cb0] rounded-2xl bg-gray-50/30"
                  labelProps={{ className: "hidden" }}
                />
              </div>

              <div className="space-y-1">
                <Typography className="text-[11px] font-black text-blue-900 ml-1 uppercase tracking-wider opacity-60">Username</Typography>
                <Input 
                  value={form.username} 
                  onChange={(e) => setForm({...form, username: e.target.value})}
                  className="!border-t-blue-gray-100 focus:!border-[#2b6cb0] rounded-2xl bg-gray-50/30"
                  labelProps={{ className: "hidden" }}
                />
              </div>

              <div className="space-y-1">
                <Typography className="text-[11px] font-black text-blue-900 ml-1 uppercase tracking-wider opacity-60">Password Baru (Opsional)</Typography>
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Isi jika ingin ganti password"
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
            <Button variant="text" color="red" onClick={handleClose} disabled={loading} className="normal-case font-bold px-6 rounded-2xl">
              Batal
            </Button>
            <Button 
              className="bg-[#2b6cb0] rounded-2xl normal-case px-10 font-black shadow-none" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Profil"}
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
};

export default EditProfileModal;