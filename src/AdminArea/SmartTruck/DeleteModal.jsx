import React from "react";
import api from "../../utils/api";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
} from "@material-tailwind/react";

const DeleteModal = ({ open, handleOpen, data, onRefresh }) => {
  const handleDelete = async () => {
    try {
      // Sesuaikan endpoint hapus truck milik API-mu
      await api.delete(`/trucks/${data?.id}`);
      onRefresh();
      handleOpen();
    } catch (error) {
      console.error("Gagal menghapus armada:", error);
    }
  };

  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-2xl">
      <DialogHeader className="text-red-500 font-bold">Hapus Armada</DialogHeader>
      <DialogBody>
        <Typography className="text-gray-600">
          Apakah Anda yakin ingin menghapus truk dengan kode{" "}
          <span className="font-bold text-gray-900">{data?.truckCode}</span> ({data?.plateNumber})? Tindakan ini tidak dapat dibatalkan.
        </Typography>
      </DialogBody>
      <DialogFooter className="space-x-2">
        <Button variant="text" color="blue-gray" onClick={handleOpen} className="normal-case rounded-xl">
          Batal
        </Button>
        <Button onClick={handleDelete} className="bg-red-500 normal-case rounded-xl shadow-none">
          Ya, Hapus
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

// --- BARIS INI YANG WAJIB ADA AGAR INDEX.JSX TIDAK CRASH ---
export default DeleteModal;