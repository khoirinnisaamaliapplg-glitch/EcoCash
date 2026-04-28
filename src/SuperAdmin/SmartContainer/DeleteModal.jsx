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

// 1. Import Toast
import { toast } from 'react-toastify';

const DeleteModal = ({ open, handleOpen, data, refreshData }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const targetId = data?.id; 
    
    if (!targetId) {
      toast.error("Gagal menghapus: ID Mesin tidak ditemukan.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.delete(`http://localhost:3000/api/machines/${targetId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      // 2. Toast Sukses
      toast.success(`Mesin ${data?.machineCode || ""} berhasil dihapus!`);

      if (refreshData) refreshData();
      handleOpen();
      
    } catch (error) {
      console.error("Detail Error Delete:", error.response);
      
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.error || 
                       "Terjadi kesalahan pada server.";
      
      // 3. Toast Error
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
          Konfirmasi Hapus
        </Typography>
        
        <Typography className="font-normal text-gray-600">
          Apakah Anda yakin ingin menghapus mesin <br />
          <strong className="text-red-700">
            {data?.machineCode || data?.name || "ini"}
          </strong>?
        </Typography>
        <Typography variant="small" className="mt-4 text-gray-400 italic">
          ID: {data?.id}
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

export default DeleteModal;