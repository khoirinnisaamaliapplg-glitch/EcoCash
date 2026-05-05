import React, { useState } from "react";
import { Dialog, DialogBody, DialogFooter, Button, Typography, Spinner } from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
// 1. Import toast
import { toast } from "react-hot-toast";

const DeleteMachineModal = ({ open, handleOpen, data, refreshData }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!data?.id) return;

    setLoading(true);

    // 2. Gunakan toast.promise untuk menangani feedback
    const deleteAction = axios.delete(`http://localhost:3000/api/machines/${data.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.promise(deleteAction, {
      loading: 'Menghapus unit...',
      success: () => {
        handleOpen(); // Tutup modal
        if (refreshData) refreshData(); // Refresh list data
        return <b>Unit berhasil dihapus!</b>;
      },
      error: (err) => {
        const msg = err.response?.data?.message || "Gagal menghapus unit.";
        return <b>{msg}</b>;
      },
    }, {
      style: { borderRadius: '12px' }
    });

    try {
      await deleteAction;
    } catch (error) {
      console.error("Delete Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={loading ? () => {} : handleOpen} size="xs" className="rounded-[28px]">
      <DialogBody className="p-8 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
          {loading ? (
            <Spinner className="h-8 w-8" />
          ) : (
            <ExclamationTriangleIcon className="h-10 w-10 stroke-[2]" />
          )}
        </div>
        
        <div className="space-y-2">
          <Typography variant="h5" className="text-blue-900 font-black">Hapus Unit?</Typography>
          <Typography className="text-sm font-medium text-gray-500 leading-relaxed px-4">
            Apakah kamu yakin ingin menghapus unit <span className="text-red-600 font-black">{data?.machineCode || data?.id}</span>? Data yang dihapus tidak bisa dikembalikan.
          </Typography>
        </div>
      </DialogBody>

      <DialogFooter className="px-8 pb-8 flex gap-3 pt-0">
        <Button 
          variant="text" 
          color="blue-gray" 
          onClick={handleOpen} 
          disabled={loading}
          className="flex-1 normal-case font-bold py-3 rounded-xl"
        >
          Kembali
        </Button>
        <Button 
          className="flex-1 bg-red-500 rounded-xl normal-case font-black py-3 shadow-none flex justify-center items-center active:scale-95 transition-transform" 
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Proses..." : "Ya, Hapus"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteMachineModal;