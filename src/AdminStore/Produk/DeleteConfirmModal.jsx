import React from "react";
import { Dialog, DialogBody, DialogFooter, Typography, Button } from "@material-tailwind/react";
import { TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const DeleteConfirmModal = ({ open, setOpen, onConfirm, productName, loading }) => (
  <Dialog 
    open={open} 
    handler={() => !loading && setOpen(false)} // Cegah tutup modal saat sedang menghapus
    size="xs" 
    className="rounded-[2rem] text-center overflow-hidden"
  >
    <DialogBody className="p-8 flex flex-col items-center">
      <div className="bg-red-50 p-5 rounded-full mb-4 animate-pulse">
        <TrashIcon className="h-12 w-12 text-red-500" />
      </div>
      <Typography variant="h4" className="text-blue-900 font-black uppercase tracking-tight">
        Hapus Produk?
      </Typography>
      <Typography className="text-gray-500 mt-4 font-medium leading-relaxed">
        Apakah Anda yakin ingin menghapus <br />
        <span className="font-black text-red-600 bg-red-50 px-2 py-0.5 rounded italic">
          "{productName}"
        </span>? <br />
        Data yang sudah dihapus tidak dapat dipulihkan.
      </Typography>
    </DialogBody>
    <DialogFooter className="flex gap-3 px-8 pb-8">
      <Button 
        variant="text" 
        color="blue-gray" 
        onClick={() => setOpen(false)} 
        disabled={loading}
        className="flex-1 rounded-2xl font-bold normal-case"
      >
        Batal
      </Button>
      <Button 
        color="red" 
        onClick={onConfirm} 
        disabled={loading}
        className="flex-1 rounded-2xl font-black shadow-lg shadow-red-200 uppercase text-xs flex justify-center items-center gap-2"
      >
        {loading ? "Menghapus..." : "Ya, Hapus!"}
      </Button>
    </DialogFooter>
  </Dialog>
);

export default DeleteConfirmModal;