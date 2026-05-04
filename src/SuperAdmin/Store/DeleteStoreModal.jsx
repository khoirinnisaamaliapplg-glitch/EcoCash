import React, { useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Spinner,
} from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from 'react-toastify';

const DeleteStoreModal = ({ open, handleOpen, data, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const storeId = data?.id; 
    
    if (!storeId) {
      toast.error("Gagal menghapus: ID Toko tidak ditemukan.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Memanggil API DELETE sesuai dokumentasi image_1e0d75.png
      await axios.delete(`http://localhost:3000/api/stores/${storeId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      toast.success(`Toko "${data?.name || ""}" berhasil dinonaktifkan!`);

      if (onSuccess) onSuccess(); // Memanggil fetchStores di parent
      handleOpen(); // Menutup modal
      
    } catch (error) {
      console.error("Detail Error Delete Store:", error.response);
      const errorMsg = error.response?.data?.message || "Terjadi kesalahan pada server.";
      toast.error(`Gagal Menghapus: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={loading ? () => {} : handleOpen} 
      size="xs" 
      className="rounded-2xl shadow-2xl"
    >
      <DialogBody className="text-center p-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
        </div>
        
        <Typography variant="h5" color="blue-gray" className="font-bold mb-3">
          Konfirmasi Hapus Toko
        </Typography>
        
        <Typography className="font-normal text-gray-600">
          Apakah Anda yakin ingin menghapus toko <br />
          <strong className="text-red-700">
            {data?.name || "ini"}
          </strong>?
        </Typography>
        
        <Typography variant="small" className="mt-4 text-gray-400 italic border-t pt-4">
          ID: {data?.id} (Soft Delete aktif)
        </Typography>
      </DialogBody>

      <DialogFooter className="flex justify-center gap-3 pb-10 px-8">
        <Button 
          variant="text" 
          color="blue-gray" 
          onClick={handleOpen} 
          disabled={loading}
          className="capitalize"
        >
          Batal
        </Button>
        <Button 
          variant="gradient"
          color="red" 
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-2 capitalize"
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Ya, Hapus Sekarang"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteStoreModal;