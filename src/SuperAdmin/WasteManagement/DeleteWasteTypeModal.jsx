import React, { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography, Spinner } from "@material-tailwind/react";
import axios from "axios";
import { toast } from "react-toastify"; // Import Toast

const DeleteWasteTypeModal = ({ open, handleOpen, data, refreshData, apiUrl }) => {
  const [loading, setLoading] = useState(false);
  
  const handleDelete = async () => {
    if (!data?.id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Pastikan URL bersih dari double slash (//)
      const cleanUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

      // Kirim request DELETE dengan header token
      await axios.delete(`${cleanUrl}/${data.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(`Kategori "${data?.name}" berhasil dihapus!`);
      handleOpen();
      if (refreshData) refreshData();
    } catch (error) {
      console.error("Gagal menghapus:", error);
      if (error.response?.status === 401) {
        toast.error("Sesi habis, silakan login kembali.");
      } else {
        const msg = error.response?.data?.message || "Gagal menghapus data";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={loading ? () => {} : handleOpen} 
      size="xs" 
      className="rounded-2xl"
    >
      <DialogHeader className="text-red-500 font-bold">Confirm Delete</DialogHeader>
      <DialogBody>
        <Typography color="gray" className="font-normal">
          Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-blue-gray-900">"{data?.name}"</span>? 
          Tindakan ini tidak dapat dibatalkan.
        </Typography>
      </DialogBody>
      <DialogFooter className="gap-2">
        <Button 
          variant="text" 
          color="blue-gray" 
          onClick={handleOpen} 
          className="normal-case"
          disabled={loading}
        >
          Batal
        </Button>
        <Button 
          color="red" 
          onClick={handleDelete} 
          className="normal-case shadow-none hover:shadow-red-200 flex items-center gap-2"
          disabled={loading}
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Ya, Hapus"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteWasteTypeModal;