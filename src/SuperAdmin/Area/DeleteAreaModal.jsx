import React, { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography } from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { toast } from 'react-toastify'; // Import Toast

const DeleteAreaModal = ({ open, handleOpen, data, confirmDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await confirmDelete(data.id);
      
      // Feedback sukses lewat toast
      toast.success(`Area "${data?.name}" berhasil dihapus!`);
      
      // Tutup modal (refresh data sudah di-handle oleh fungsi confirmDelete di parent)
      handleOpen();
    } catch (error) {
      console.error("Error saat menghapus:", error);
      const msg = error.response?.data?.message || "Gagal menghapus data wilayah.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={loading ? () => {} : handleOpen} size="xs" className="rounded-[28px] p-4">
      <DialogHeader className="flex flex-col items-center pt-8 gap-2">
        <div className="bg-red-50 p-4 rounded-full">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
        </div>
        <Typography variant="h5" className="text-blue-900 font-black">
          Hapus Wilayah?
        </Typography>
      </DialogHeader>
      
      <DialogBody className="text-center px-8">
        <Typography className="text-gray-600 font-medium leading-relaxed">
          Apakah Anda yakin ingin menghapus area <span className="text-red-600 font-black">"{data?.name}"</span> dengan kode <span className="font-bold text-gray-800">{data?.code}</span>? 
          <br />
          <span className="text-xs text-gray-400">Data yang dihapus tidak dapat dipulihkan.</span>
        </Typography>
      </DialogBody>

      <DialogFooter className="flex flex-col gap-2 p-8 pt-4">
        <Button 
          fullWidth 
          disabled={loading}
          className="bg-red-500 rounded-xl normal-case font-black shadow-lg shadow-red-100 py-4 flex justify-center items-center gap-2" 
          onClick={handleConfirm}
        >
          {loading ? "Menghapus..." : "Ya, Hapus Area"}
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          disabled={loading}
          className="normal-case font-bold text-gray-500" 
          onClick={handleOpen}
        >
          Batalkan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteAreaModal;