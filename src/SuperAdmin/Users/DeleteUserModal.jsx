import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography } from "@material-tailwind/react";
import { TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const DeleteUserModal = ({ open, handleOpen, data }) => {
  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-[28px] overflow-hidden">
      <DialogHeader className="flex flex-col items-center pt-8 pb-4">
        <div className="p-4 bg-red-50 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-500 animate-pulse" />
        </div>
        <Typography variant="h5" className="text-blue-900 font-bold text-center">Hapus Pengguna?</Typography>
      </DialogHeader>
      
      <DialogBody className="px-8 text-center">
        <Typography className="text-gray-600 font-medium">
          Apakah Anda yakin ingin menghapus akun <span className="text-red-600 font-bold">{data?.name}</span>? 
          Tindakan ini tidak dapat dibatalkan.
        </Typography>
      </DialogBody>

      <DialogFooter className="flex flex-col gap-2 p-8">
        <Button 
          fullWidth 
          className="bg-red-500 py-3.5 rounded-xl normal-case font-bold shadow-none hover:bg-red-600 active:scale-95 transition-all" 
          onClick={handleOpen}
        >
          Ya, Hapus Akun
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          color="blue-gray" 
          className="py-3.5 normal-case font-bold rounded-xl" 
          onClick={handleOpen}
        >
          Batalkan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteUserModal;