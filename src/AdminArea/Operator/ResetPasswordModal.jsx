import React, { useState } from "react";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Input, Button, Typography, Spinner 
} from "@material-tailwind/react";
import { KeyIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import api from "../../utils/api"; 

const ResetPasswordModal = ({ open, setOpen, data }) => {
  const [newPass, setNewPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    // Debugging: Pastikan data ada
    if (!data?.id) {
      toast.error("Data pengguna tidak ditemukan!");
      return;
    }

    if (!newPass || newPass.length < 6) {
      toast.error("Password minimal 6 karakter!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Sedang memperbarui password...");

    try {
      const token = localStorage.getItem("token");
      
      // Mengirim request ke backend
      // Sesuaikan endpoint sesuai dengan route yang Anda punya di backend
      await api.patch(
        `/admin/users/${data.id}/reset-password`, // Pastikan endpoint ini benar di backend Anda
        { password: newPass },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Password untuk @${data.username} berhasil direset!`, { id: toastId });
      
      // Reset state dan tutup modal
      setNewPass("");
      setOpen(false);
    } catch (error) {
      console.error("Reset Error:", error);
      const errorMsg = error.response?.data?.message || "Gagal memperbarui password.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setNewPass("");
    }
  };

  return (
    <Dialog open={open} handler={handleClose} className="rounded-[30px]" size="xs">
      <DialogHeader className="flex flex-col items-center pt-8">
        <div className="bg-green-50 p-3 rounded-full mb-2">
          <KeyIcon className="h-8 w-8 text-green-600" />
        </div>
        <Typography variant="h5" color="blue-gray" className="font-black">
          Reset Password
        </Typography>
      </DialogHeader>

      <DialogBody className="px-8 text-center">
        <Typography className="text-sm text-gray-500 mb-6 font-medium">
          Masukkan password baru untuk <span className="font-bold text-blue-700">@{data?.username || "..."}</span>.
        </Typography>
        <Input 
          type="password" 
          label="Password Baru" 
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          disabled={loading}
          color="green"
          className="rounded-xl"
        />
      </DialogBody>

      <DialogFooter className="px-8 pb-8 pt-6 flex flex-col gap-2">
        <Button 
          className="bg-green-600 w-full rounded-xl py-3 flex justify-center items-center gap-2 normal-case font-bold" 
          onClick={handleReset}
          // Tombol hanya akan aktif jika loading = false DAN newPass sudah terisi
          disabled={loading || newPass.length < 6}
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Perbarui Password"}
        </Button>
        <Button 
          variant="text" 
          color="blue-gray" 
          className="w-full normal-case font-bold" 
          onClick={handleClose}
          disabled={loading}
        >
          Batal
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ResetPasswordModal;