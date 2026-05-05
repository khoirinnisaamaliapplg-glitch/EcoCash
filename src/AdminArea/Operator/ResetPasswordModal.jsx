import React, { useState } from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Input, 
  Button, 
  Typography,
  Spinner 
} from "@material-tailwind/react";
import { KeyIcon } from "@heroicons/react/24/outline";
// 1. Import toast
import { toast } from "react-hot-toast";
import axios from "axios";

const ResetPasswordModal = ({ open, setOpen, data }) => {
  const [newPass, setNewPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    // Validasi sederhana
    if (!newPass || newPass.length < 6) {
      toast.error("Password minimal harus 6 karakter!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Sedang memperbarui password...");

    try {
      const token = localStorage.getItem("token");
      
      // Simulasi/Eksekusi API Patch untuk Reset Password
      // Sesuaikan endpoint dengan backend Anda, contoh: /api/users/:id/reset-password
      await axios.patch(
        `http://localhost:3000/api/users/${data.id}`, 
        { password: newPass },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Tampilkan Toast Sukses
      toast.success(`Password untuk @${data?.username} berhasil diperbarui!`, { 
        id: toastId,
        duration: 4000 
      });

      setOpen(false);
      setNewPass("");
    } catch (error) {
      console.error("Reset Error:", error);
      const errorMsg = error.response?.data?.message || "Gagal memperbarui password.";
      
      // 3. Tampilkan Toast Error
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
    <Dialog 
      open={open} 
      handler={handleClose} 
      className="rounded-[30px]" 
      size="xs"
    >
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
          Masukkan password baru untuk operator <span className="font-bold text-blue-700">@{data?.username}</span>.
        </Typography>
        <div className="relative">
          <Input 
            type="password" 
            label="Password Baru" 
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            disabled={loading}
            color="green"
            className="rounded-xl"
          />
        </div>
      </DialogBody>

      <DialogFooter className="px-8 pb-8 pt-6 flex flex-col gap-2">
        <Button 
          className="bg-green-600 w-full rounded-xl py-3 flex justify-center items-center gap-2 normal-case font-bold shadow-lg shadow-green-100" 
          onClick={handleReset}
          disabled={loading || !newPass}
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