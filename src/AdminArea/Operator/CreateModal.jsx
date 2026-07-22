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
  XMarkIcon,
  CreditCardIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import api from "../../utils/api"; 
import { toast } from "react-hot-toast";

const CreateModal = ({ open, setOpen, refreshData }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Ambil data admin yang sedang login
  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;

  const formik = useFormik({
    initialValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      ktp: "", // Ini adalah state lokal formik
    },
    onSubmit: async (values, { resetForm }) => {
      if (!userData?.areaId) {
        toast.error("Gagal: ID Area Admin tidak terdeteksi.");
        return;
      }

      if (values.ktp.length !== 16) {
        toast.error("Gagal: Nomor KTP harus 16 digit.");
        return;
      }

      setIsLoading(true);
      const loadToast = toast.loading("Sedang mendaftarkan operator...");

      try {
        const token = localStorage.getItem("token");
        
        // PAYLOAD DISESUAIKAN DENGAN BACKEND (menggunakan ktpNumber)
        const payload = {
          name: values.name.trim(),
          username: values.username.toLowerCase().trim(),
          email: values.email.toLowerCase().trim(),
          password: values.password,
          phoneNumber: values.phoneNumber ? values.phoneNumber.trim() : null,
          ktpNumber: values.ktp.trim(), // Sesuai dengan req.body.ktpNumber di backend
          role: "MACHINE_OPERATOR",
          areaId: Number(userData.areaId),
        };

        await api.post("/admin/users", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success("Operator Berhasil Didaftarkan!", { id: loadToast });
        
        resetForm();
        setOpen(false); 
        if (refreshData) refreshData();
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Terjadi kesalahan server";
        toast.error(`Gagal: ${errorMsg}`, { id: loadToast });
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleClose = () => {
    if (!isLoading) {
      formik.resetForm();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} handler={handleClose} size="sm" className="rounded-[28px]">
      <DialogHeader className="px-8 pt-8 flex justify-between">
        <div>
          <Typography variant="h4" className="text-blue-900">Registrasi Operator</Typography>
          <Typography className="text-gray-500 text-sm">
            Area: {userData?.areaId ? `ID ${userData.areaId}` : "N/A"}
          </Typography>
        </div>
        <XMarkIcon className="h-6 w-6 cursor-pointer text-gray-400" onClick={handleClose} />
      </DialogHeader>

      <form onSubmit={formik.handleSubmit}>
        <DialogBody className="px-8 py-4 space-y-4">
          <Input 
            label="Area Penempatan" 
            value={userData?.areaId ? `Area ID: ${userData.areaId}` : "Tidak Terdeteksi"}
            disabled 
            icon={<BuildingOfficeIcon className="h-4 w-4" />}
          />
          <Input label="Nama Lengkap" {...formik.getFieldProps("name")} required disabled={isLoading} />
          <Input label="Username" {...formik.getFieldProps("username")} required disabled={isLoading} />
          <Input label="Email" type="email" {...formik.getFieldProps("email")} required disabled={isLoading} />
          <Input 
            label="Nomor KTP (16 Digit)" 
            maxLength={16}
            {...formik.getFieldProps("ktp")} 
            required 
            disabled={isLoading}
            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
          />
          <Input label="Nomor WhatsApp" {...formik.getFieldProps("phoneNumber")} disabled={isLoading} />
          <Input type="password" label="Password" {...formik.getFieldProps("password")} required disabled={isLoading} />
        </DialogBody>

        <DialogFooter className="px-8 pb-8">
          <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 rounded-xl">
            {isLoading ? <><Spinner className="h-4 w-4 mr-2" /> Memproses...</> : "Daftarkan Operator"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default CreateModal;