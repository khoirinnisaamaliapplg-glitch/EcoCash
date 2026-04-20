import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Button, Typography, Select, Option, Spinner, IconButton, Alert
} from "@material-tailwind/react";
import { 
  PencilSquareIcon, XMarkIcon, CheckCircleIcon, InformationCircleIcon 
} from "@heroicons/react/24/outline";
import axios from "axios";

const EditUserModal = ({ open, handleOpen, data, refreshData }) => {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Ambil ID user yang sedang login untuk validasi self-edit
  const currentUserId = localStorage.getItem("userId"); 

  useEffect(() => {
    if (open && data) {
      setRole(data.role || "");
      setErrorMessage(""); 
    }
  }, [data, open]);

  const handleUpdateRole = async () => {
    if (!data?.id) return;

    // 1. Validasi Sisi Klien: Jangan ganti role sendiri
    if (String(currentUserId) === String(data.id)) {
      setErrorMessage("Sistem melarang Anda mengubah Role akun Anda sendiri demi keamanan.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      
      /**
       * KONTROL ID: 
       * Memastikan ID benar-benar bersih (hanya angka). 
       * Jika ada karakter ":1" seperti di error sebelumnya, ini akan membuangnya.
       */
      const cleanId = String(data.id).split(':')[0];

      // Menggunakan PUT agar sesuai dengan route di Backend kamu
      const response = await axios.put(
        `http://localhost:3000/api/users/role/${cleanId}`, 
        { role: role }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus("success");

      // Beri jeda sedikit agar user bisa melihat notifikasi sukses
      setTimeout(() => {
        if (refreshData) refreshData();
        handleOpen();
        setStatus(null);
      }, 1500);

    } catch (error) {
      // Menangkap pesan error dari backend (seperti "Invalid role" atau "User not found")
      const msg = error.response?.data?.message || "Terjadi kesalahan pada server";
      setErrorMessage(msg);
      console.error("Update Role Error:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} handler={handleOpen} size="sm" className="rounded-[28px]">
      <DialogHeader className="flex justify-between px-8 pt-8">
        <div className="flex items-center gap-3 text-blue-900">
          <div className="p-2.5 bg-blue-50 rounded-xl">
            <PencilSquareIcon className="h-6 w-6 text-blue-600" />
          </div>
          <Typography variant="h5" className="font-bold">Edit Akses User</Typography>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen}>
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>
      
      <DialogBody className="px-8 py-4">
        {status === "success" ? (
          <div className="flex flex-col items-center py-6">
            <CheckCircleIcon className="h-16 w-16 text-green-500 animate-bounce" />
            <Typography className="mt-4 font-bold text-green-700">Role Berhasil Diupdate!</Typography>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tampilkan Alert jika ada error */}
            {errorMessage && (
              <Alert
                color="red"
                icon={<InformationCircleIcon className="h-5 w-5" />}
                className="rounded-xl bg-red-50 text-red-600 border border-red-100"
              >
                {errorMessage}
              </Alert>
            )}

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <Typography variant="small" className="font-bold text-gray-600">User Target:</Typography>
              <Typography variant="h6" className="text-blue-900">{data?.name}</Typography>
              <Typography variant="small" className="text-gray-500">{data?.email}</Typography>
            </div>

            <div className="space-y-2 pt-2">
              <Typography variant="small" className="text-blue-900 font-bold ml-1">Pilih Role Baru</Typography>
              <Select 
                label="Pilih Role"
                value={role} 
                onChange={(val) => setRole(val)}
                className="!rounded-xl"
              >
                <Option value="SUPER_ADMIN">Super Admin</Option>
                <Option value="AREA_ADMIN">Area Admin</Option>
                <Option value="STORE_ADMIN">Store Admin</Option>
                <Option value="MACHINE_OPERATOR">Machine Operator</Option>
                <Option value="REGULAR_USER">Regular User</Option>
              </Select>
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="px-8 pb-8 pt-2 gap-3">
        <Button variant="text" color="red" onClick={handleOpen} disabled={loading} className="normal-case">
          Batal
        </Button>
        <Button 
          className="bg-blue-600 px-10 rounded-xl normal-case flex items-center gap-2" 
          onClick={handleUpdateRole}
          disabled={loading || status === "success" || (String(currentUserId) === String(data?.id))}
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Simpan Role"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditUserModal;