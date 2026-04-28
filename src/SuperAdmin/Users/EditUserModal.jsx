import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Button, Typography, Select, Option, Spinner, IconButton
} from "@material-tailwind/react";
import { 
  PencilSquareIcon, XMarkIcon 
} from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from "react-toastify"; // Import Toast

const EditUserModal = ({ open, handleOpen, data, refreshData }) => {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  // Ambil ID user yang sedang login untuk validasi self-edit
  const currentUserId = localStorage.getItem("userId"); 

  useEffect(() => {
    if (open && data) {
      setRole(data.role || "");
    }
  }, [data, open]);

  const handleUpdateRole = async () => {
    if (!data?.id) return;

    // 1. Validasi Sisi Klien: Jangan ganti role sendiri
    if (String(currentUserId) === String(data.id)) {
      toast.error("Sistem melarang Anda mengubah Role akun Anda sendiri demi keamanan.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const cleanId = String(data.id).replace(':', '');

      await axios.patch(
        `http://localhost:3000/api/users/${cleanId}/role`, 
        { role: role }, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );

      toast.success(`Role untuk ${data?.name} berhasil diperbarui!`);
      
      // Langsung tutup dan refresh
      if (refreshData) refreshData();
      handleOpen();

    } catch (error) {
      const msg = error.response?.data?.message || "Terjadi kesalahan pada server";
      toast.error(msg);
      console.error("Update Role Error:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} handler={loading ? () => {} : handleOpen} size="sm" className="rounded-[28px]">
      <DialogHeader className="flex justify-between px-8 pt-8">
        <div className="flex items-center gap-3 text-blue-900">
          <div className="p-2.5 bg-blue-50 rounded-xl">
            <PencilSquareIcon className="h-6 w-6 text-blue-600" />
          </div>
          <Typography variant="h5" className="font-bold">Edit Akses User</Typography>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen} disabled={loading}>
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>
      
      <DialogBody className="px-8 py-4">
        <div className="space-y-4">
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
              disabled={loading}
            >
              <Option value="SUPER_ADMIN">Super Admin</Option>
              <Option value="AREA_ADMIN">Area Admin</Option>
              <Option value="STORE_ADMIN">Store Admin</Option>
              <Option value="MACHINE_OPERATOR">Machine Operator</Option>
              <Option value="REGULAR_USER">Regular User</Option>
            </Select>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="px-8 pb-8 pt-2 gap-3">
        <Button variant="text" color="red" onClick={handleOpen} disabled={loading} className="normal-case">
          Batal
        </Button>
        <Button 
          className="bg-blue-600 px-10 rounded-xl normal-case flex items-center gap-2" 
          onClick={handleUpdateRole}
          disabled={loading || (String(currentUserId) === String(data?.id))}
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Simpan Role"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditUserModal;