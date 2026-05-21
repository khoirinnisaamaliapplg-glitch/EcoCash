import React, { useState } from "react";
import api from "../../utils/api"; 
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
} from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// Import Toastify
import { toast } from 'react-toastify';

const DeleteModal = ({ open, handleOpen, data, onRefresh }) => {
  const [submitting, setSubmitting] = useState(false);

  // FUNGSI EKSEKUSI SOFT-DELETE KE BACKEND
  const handleDelete = async () => {
    if (!data?.id) return;

    setSubmitting(true);
    try {
      // Menembak endpoint DELETE /trucks/:id 
      await api.delete(`/trucks/${data.id}`);
      
      toast.success("Armada berhasil dihapus dari sistem."); // Toast Sukses
      onRefresh();  // Refresh list tabel utama
      handleOpen(); // Tutup modal delete
    } catch (error) {
      console.error("Gagal menghapus armada truk:", error);
      // Toast Error dari API
      toast.error(error.response?.data?.message || "Terjadi kegagalan saat menghapus data armada.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-2xl">
      <DialogBody className="text-center p-8">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <Typography variant="h5" className="text-blue-gray-900 font-bold mb-2">
          Hapus Smart Truck?
        </Typography>
        <Typography className="text-gray-600 text-sm leading-relaxed">
          Apakah Anda yakin ingin menghapus armada truk dengan Kode:{" "}
          <span className="font-bold text-red-500">
            {data?.truckCode || data?.plateNumber || `#${data?.id}`}
          </span>
          ? Data ini akan dinonaktifkan dari sistem operasional.
        </Typography>
      </DialogBody>
      
      <DialogFooter className="flex justify-center gap-3 pb-8 px-8">
        <Button
          variant="outlined"
          color="blue-gray"
          onClick={handleOpen}
          disabled={submitting}
          className="capitalize border-blue-gray-100 rounded-xl px-6 py-2.5"
        >
          Batal
        </Button>
        <Button
          className="bg-[#ef5350] capitalize shadow-none hover:shadow-md active:scale-95 transition-all rounded-xl px-6 py-2.5"
          onClick={handleDelete}
          disabled={submitting}
        >
          {submitting ? "Menghapus..." : "Ya, Hapus"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteModal;