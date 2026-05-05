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
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  PhoneIcon,
  UserCircleIcon,
  IdentificationIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import axios from "axios";
import { toast } from "react-hot-toast";

const CreateModal = ({ open, setOpen, refreshData }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Ambil data admin dari localStorage
  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;

  const formik = useFormik({
    initialValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
    },
    onSubmit: async (values, { resetForm }) => {
      // 1. Proteksi Awal
      if (!userData?.areaId) {
        toast.error("Gagal: ID Area Admin tidak terdeteksi. Silakan login ulang.");
        return;
      }

      setIsLoading(true);
      // Menggunakan loading toast dengan ID untuk diupdate nanti
      const loadToast = toast.loading("Sedang mendaftarkan operator...");

      try {
        const token = localStorage.getItem("token");
        
        const payload = {
          name: values.name.trim(),
          username: values.username.toLowerCase().trim(),
          email: values.email.toLowerCase().trim(),
          password: values.password,
          phoneNumber: values.phoneNumber ? values.phoneNumber.trim() : null,
          role: "MACHINE_OPERATOR",
          areaId: Number(userData.areaId),
        };

        const response = await axios.post("http://localhost:3000/api/users", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 2. Handle Berhasil
        toast.success(response.data.message || "Operator Berhasil Didaftarkan!", { 
            id: loadToast,
            duration: 4000 
        });
        
        resetForm();
        setOpen(false); 
        if (refreshData) refreshData();

      } catch (error) {
        // 3. Handle Error yang lebih spesifik
        const errorMsg = error.response?.data?.message || "Terjadi kesalahan pada server";
        toast.error(`Gagal: ${errorMsg}`, { id: loadToast });
        console.error("Submission Error:", error.response?.data);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleClose = () => {
    if (!isLoading) {
      formik.resetForm();
      setOpen(false);
    } else {
      toast("Harap tunggu hingga proses selesai", { icon: "⏳" });
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={handleClose} 
      size="sm" 
      className="rounded-[28px] overflow-hidden"
    >
      <DialogHeader className="px-8 pt-8 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-blue-900 font-black">
            Registrasi Operator
          </Typography>
          <Typography className="text-gray-500 text-sm font-medium">
            Penempatan di <span className="text-blue-600 font-bold uppercase">Area ID: {userData?.areaId || "N/A"}</span>
          </Typography>
        </div>
        <button 
          onClick={handleClose} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          type="button"
        >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
        </button>
      </DialogHeader>

      <form onSubmit={formik.handleSubmit}>
        <DialogBody className="px-8 py-4 space-y-5">
          <div className="space-y-4">
            <Input 
              size="lg"
              label="Nama Lengkap" 
              className="rounded-xl"
              icon={<UserIcon className="h-4 w-4" />} 
              {...formik.getFieldProps("name")} 
              required 
              disabled={isLoading}
            />
            <Input 
              size="lg"
              label="Username" 
              className="rounded-xl"
              icon={<UserCircleIcon className="h-4 w-4" />} 
              {...formik.getFieldProps("username")} 
              required 
              disabled={isLoading}
            />
            <Input 
              size="lg"
              label="Email" 
              type="email" 
              className="rounded-xl"
              icon={<EnvelopeIcon className="h-4 w-4" />} 
              {...formik.getFieldProps("email")} 
              required 
              disabled={isLoading}
            />
            <Input 
              size="lg"
              label="Nomor WhatsApp" 
              placeholder="Contoh: 08123456789"
              className="rounded-xl"
              icon={<PhoneIcon className="h-4 w-4" />} 
              {...formik.getFieldProps("phoneNumber")} 
              disabled={isLoading}
            />
            <Input 
              size="lg"
              type="password" 
              label="Password" 
              className="rounded-xl"
              icon={<KeyIcon className="h-4 w-4" />} 
              {...formik.getFieldProps("password")} 
              required 
              disabled={isLoading}
            />
          </div>
          
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
            <IdentificationIcon className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
                <Typography className="text-[11px] font-black uppercase text-blue-800 tracking-wider">
                    Sistem Penugasan Otomatis
                </Typography>
                <Typography className="text-[11px] text-blue-700/80 leading-relaxed font-medium">
                    Operator ini akan memiliki hak akses terbatas untuk mengelola mesin di area Anda.
                </Typography>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="px-8 pb-8 gap-3">
          <Button 
            variant="text" 
            color="red" 
            onClick={handleClose} 
            disabled={isLoading} 
            className="normal-case rounded-xl font-bold"
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="bg-blue-600 normal-case flex-1 rounded-xl shadow-blue-100 shadow-lg flex justify-center items-center gap-2 py-3"
          >
            {isLoading ? (
              <>
                <Spinner className="h-4 w-4" /> Memproses...
              </>
            ) : (
              "Daftarkan Operator"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default CreateModal;