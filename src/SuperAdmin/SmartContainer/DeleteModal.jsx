import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
} from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/outline";

const DeleteModal = ({ open, handleOpen, data }) => {
  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-3xl shadow-2xl">
      <DialogBody className="text-center p-8">
        {/* Icon Peringatan */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <TrashIcon className="h-10 w-10 text-red-500" />
        </div>
        
        <Typography variant="h5" color="blue-gray" className="font-black mb-2">
          Hapus Container?
        </Typography>
        
        <Typography className="font-normal text-gray-600">
          Apakah kamu yakin ingin menghapus kontainer <span className="font-bold text-blue-900">{data?.id}</span>? 
          Data yang sudah dihapus tidak bisa dikembalikan.
        </Typography>
      </DialogBody>

      <DialogFooter className="flex justify-center gap-2 pb-8">
        <Button variant="text" color="blue-gray" onClick={handleOpen} className="normal-case">
          Batal
        </Button>
        <Button 
          className="bg-red-500 normal-case px-8 shadow-none hover:shadow-red-200" 
          onClick={handleOpen}
        >
          Ya, Hapus
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteModal;