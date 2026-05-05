import React from "react";
import { Dialog, DialogBody, DialogFooter, Typography, Button } from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/outline";
// 1. Import toast
import { toast } from "react-hot-toast";

const DeleteConfirmModal = ({ open, setOpen, onConfirm, productName, loading }) => {
  
  // 2. Handler untuk pembungkus konfirmasi
  const handleConfirm = () => {
    // Memberikan feedback awal bahwa proses dimulai
    onConfirm();
  };

  return (
    <Dialog 
      open={open} 
      handler={() => !loading && setOpen(false)} 
      size="xs" 
      className="rounded-[2rem] text-center overflow-hidden border border-red-50 shadow-2xl"
    >
      <DialogBody className="p-8 flex flex-col items-center">
        {/* Ikon dengan animasi pulse saat loading */}
        <div className={`bg-red-50 p-5 rounded-full mb-4 ${loading ? 'animate-bounce' : 'animate-pulse'}`}>
          <TrashIcon className={`h-12 w-12 ${loading ? 'text-gray-400' : 'text-red-500'}`} />
        </div>
        
        <Typography variant="h4" className="text-blue-900 font-black uppercase tracking-tight">
          Hapus Produk?
        </Typography>
        
        <Typography className="text-gray-600 mt-4 font-medium leading-relaxed">
          Apakah Anda yakin ingin menghapus <br />
          <span className="font-black text-red-600 bg-red-50 px-2 py-0.5 rounded italic">
            "{productName || "Produk ini"}"
          </span>? <br />
          <span className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">
            Tindakan ini permanen
          </span>
        </Typography>
      </DialogBody>

      <DialogFooter className="flex gap-3 px-8 pb-8">
        <Button 
          variant="text" 
          color="blue-gray" 
          onClick={() => setOpen(false)} 
          disabled={loading}
          className="flex-1 rounded-2xl font-bold normal-case hover:bg-gray-50 transition-all"
        >
          Batal
        </Button>
        <Button 
          color="red" 
          onClick={handleConfirm} 
          disabled={loading}
          className="flex-1 rounded-2xl font-black shadow-lg shadow-red-200 uppercase text-xs flex justify-center items-center gap-2 transition-all active:scale-95"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Proses...
            </span>
          ) : (
            "Ya, Hapus!"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteConfirmModal;