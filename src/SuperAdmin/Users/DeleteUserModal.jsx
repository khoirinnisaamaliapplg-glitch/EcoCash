import React, { useState } from "react";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Button, Typography, Spinner, Alert 
} from "@material-tailwind/react";
import { 
  TrashIcon, ExclamationTriangleIcon, InformationCircleIcon 
} from "@heroicons/react/24/outline";
import axios from "axios";

const DeleteUserModal = ({ open, handleOpen, data, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async () => {
    if (!data?.id) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      const cleanId = String(data.id).replace(':', '');

      // Menjalankan request DELETE ke API
      await axios.delete(`http://localhost:3000/api/users/${cleanId}`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });

      // Jika berhasil, refresh data di tabel dan tutup modal
      if (refreshData) refreshData();
      handleOpen();
      
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal menghapus pengguna";
      setErrorMessage(msg);
      console.error("Delete Error:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-[28px] overflow-hidden">
      <DialogHeader className="flex flex-col items-center pt-8 pb-4">
        <div className="p-4 bg-red-50 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-500 animate-pulse" />
        </div>
        <Typography variant="h5" className="text-blue-900 font-bold text-center">
          Hapus Pengguna?
        </Typography>
      </DialogHeader>
      
      <DialogBody className="px-8 text-center">
        {errorMessage && (
          <Alert color="red" className="mb-4 rounded-xl font-medium text-sm">
            {errorMessage}
          </Alert>
        )}
        
        <Typography className="text-gray-600 font-medium">
          Apakah Anda yakin ingin menghapus akun <span className="text-red-600 font-bold">{data?.name}</span>? 
          <br />Tindakan ini tidak dapat dibatalkan.
        </Typography>
      </DialogBody>

      <DialogFooter className="flex flex-col gap-2 p-8">
        <Button 
          fullWidth 
          className="bg-red-500 py-3.5 rounded-xl normal-case font-bold shadow-none hover:bg-red-600 flex justify-center items-center gap-2" 
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Ya, Hapus Akun"}
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          color="blue-gray" 
          className="py-3.5 normal-case font-bold rounded-xl" 
          onClick={handleOpen}
          disabled={loading}
        >
          Batalkan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteUserModal;