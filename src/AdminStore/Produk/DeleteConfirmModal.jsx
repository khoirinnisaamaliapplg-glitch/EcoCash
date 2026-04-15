import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Typography, Button } from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/outline";

const DeleteConfirmModal = ({ open, setOpen, onConfirm, productName }) => (
  <Dialog open={open} handler={() => setOpen(false)} size="xs" className="rounded-[2rem] text-center">
    <DialogBody className="p-10 flex flex-col items-center">
      <div className="bg-red-50 p-5 rounded-full mb-4">
        <TrashIcon className="h-12 w-12 text-red-500" />
      </div>
      <Typography variant="h4" className="text-blue-900 font-black">Hapus Produk?</Typography>
      <Typography className="text-gray-500 mt-2 font-medium">
        Apakah Anda yakin ingin menghapus <span className="font-black text-red-500">"{productName}"</span>? Tindakan ini tidak bisa dibatalkan.
      </Typography>
    </DialogBody>
    <DialogFooter className="flex gap-3 px-10 pb-10">
      <Button variant="outlined" color="blue-gray" onClick={() => setOpen(false)} className="flex-1 rounded-xl font-bold">Batal</Button>
      <Button color="red" onClick={onConfirm} className="flex-1 rounded-xl font-black shadow-lg shadow-red-100">Ya, Hapus!</Button>
    </DialogFooter>
  </Dialog>
);

export default DeleteConfirmModal;