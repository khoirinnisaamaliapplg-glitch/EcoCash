import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography } from "@material-tailwind/react";
import { TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const DeleteMachineModal = ({ open, handleOpen, data }) => {
  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-[28px]">
      <DialogBody className="p-8 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
          <ExclamationTriangleIcon className="h-10 w-10 stroke-[2]" />
        </div>
        
        <div className="space-y-2">
          <Typography variant="h5" className="text-blue-900 font-black">Hapus Unit?</Typography>
          <Typography className="text-sm font-medium text-gray-500 leading-relaxed px-4">
            Apakah kamu yakin ingin menghapus unit <span className="text-red-600 font-black">{data?.id}</span>? Data yang dihapus tidak bisa dikembalikan.
          </Typography>
        </div>
      </DialogBody>

      <DialogFooter className="px-8 pb-8 flex gap-3 pt-0">
        <Button variant="text" color="blue-gray" onClick={handleOpen} className="flex-1 normal-case font-bold py-3 rounded-xl">
          Kembali
        </Button>
        <Button className="flex-1 bg-red-500 rounded-xl normal-case font-black py-3 shadow-none" onClick={handleOpen}>
          Ya, Hapus
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteMachineModal;