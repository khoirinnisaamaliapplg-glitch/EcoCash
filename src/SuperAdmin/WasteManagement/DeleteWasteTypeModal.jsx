import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography } from "@material-tailwind/react";
import axios from "axios";

const DeleteWasteTypeModal = ({ open, handleOpen, data, refreshData, apiUrl }) => {
  
  const handleDelete = async () => {
    if (!data?.id) return;

    try {
      // 1. Ambil token dari localStorage
      const token = localStorage.getItem("token");

      // 2. Pastikan URL bersih dari double slash (//)
      const cleanUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

      // 3. Kirim request DELETE dengan header token
      await axios.delete(`${cleanUrl}/${data.id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // WAJIB
        },
      });

      handleOpen();
      refreshData();
    } catch (error) {
      console.error("Gagal menghapus:", error);
      if (error.response?.status === 401) {
        alert("Sesi habis, silakan login kembali.");
      } else {
        alert(error.response?.data?.message || "Gagal menghapus data");
      }
    }
  };

  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-2xl">
      <DialogHeader className="text-red-500 font-bold">Confirm Delete</DialogHeader>
      <DialogBody>
        <Typography color="gray" className="font-normal">
          Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-blue-gray-900">"{data?.name}"</span>? 
          Tindakan ini tidak dapat dibatalkan.
        </Typography>
      </DialogBody>
      <DialogFooter className="gap-2">
        <Button variant="text" color="blue-gray" onClick={handleOpen} className="normal-case">
          Batal
        </Button>
        <Button color="red" onClick={handleDelete} className="normal-case shadow-none hover:shadow-red-200">
          Ya, Hapus
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteWasteTypeModal;