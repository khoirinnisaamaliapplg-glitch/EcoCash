import React, { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography } from "@material-tailwind/react";
import { ExclamationTriangleIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
// 1. IMPORT TOAST
import { toast } from "react-hot-toast";

const DeleteAreaModal = ({ open, handleOpen, data, confirmDelete }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async () => {
    // 2. TAMPILKAN TOAST LOADING
    const toastId = toast.loading("Menghapus data wilayah...");
    
    setLoading(true);
    try {
      await confirmDelete(data.id);
      
      // Jika berhasil, update toast dan tampilkan status sukses
      toast.success("Data wilayah berhasil dihapus", { id: toastId });
      setStatus("success");
      
      // Tunggu 2 detik lalu tutup modal
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error saat menghapus:", error);
      const msg = error.response?.data?.message || "Gagal menghapus data wilayah.";
      
      // 3. TAMPILKAN TOAST ERROR
      toast.error(msg, { id: toastId });
      setErrorMessage(msg);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    handleOpen();
    // Reset status setelah modal tertutup
    setTimeout(() => {
      setStatus(null);
      setErrorMessage("");
    }, 300);
  };

  return (
    <Dialog open={open} handler={handleClose} size="xs" className="rounded-[28px] p-4">
      {status === "success" ? (
        /* 1. TAMPILAN BERHASIL HAPUS */
        <div className="flex flex-col items-center py-10 text-center">
          <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4 animate-bounce" />
          <Typography variant="h4" color="blue-gray" className="font-bold">
            Terhapus!
          </Typography>
          <Typography className="text-gray-600 font-medium">
            Data wilayah telah dihapus dari sistem EcoCash.
          </Typography>
        </div>
      ) : status === "error" ? (
        /* 2. TAMPILAN GAGAL HAPUS */
        <div className="flex flex-col items-center py-10 text-center">
          <XCircleIcon className="h-20 w-20 text-red-500 mb-4" />
          <Typography variant="h4" color="blue-gray" className="font-bold">
            Gagal Menghapus
          </Typography>
          <Typography className="text-red-500 font-medium px-6">
            {errorMessage}
          </Typography>
          <Button 
            className="mt-6 bg-red-500 rounded-xl" 
            onClick={() => setStatus(null)}
          >
            Coba Lagi
          </Button>
        </div>
      ) : (
        /* 3. TAMPILAN KONFIRMASI HAPUS (NORMAL) */
        <>
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
              className="bg-red-500 rounded-xl normal-case font-black shadow-lg shadow-red-100 py-4" 
              onClick={handleConfirm}
            >
              {loading ? "Menghapus..." : "Ya, Hapus Area"}
            </Button>
            <Button 
              fullWidth 
              variant="text" 
              disabled={loading}
              className="normal-case font-bold text-gray-500" 
              onClick={handleClose}
            >
              Batalkan
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
};

export default DeleteAreaModal;