import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography } from "@material-tailwind/react";
import { TrashIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

const DeleteWastePriceModal = ({ open, handleOpen, data }) => {
  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-[28px]">
      <DialogHeader className="flex flex-col items-center pt-8">
        <div className="p-4 bg-orange-50 rounded-full mb-3">
          <ExclamationCircleIcon className="h-10 w-10 text-orange-500" />
        </div>
        <Typography variant="h5" className="text-blue-900 font-bold">Hapus Harga?</Typography>
      </DialogHeader>
      
      <DialogBody className="px-8 text-center">
        <Typography className="text-gray-600 font-medium">
          Anda akan menghapus standar harga untuk kategori <span className="text-blue-700 font-bold">{data?.category}</span>.
        </Typography>
      </DialogBody>

      <DialogFooter className="flex flex-col gap-2 p-8">
        <Button fullWidth className="bg-[#ef5350] py-3.5 rounded-xl normal-case font-bold shadow-none" onClick={handleOpen}>
          Ya, Hapus Sekarang
        </Button>
        <Button fullWidth variant="text" color="blue-gray" className="py-3.5 normal-case font-bold rounded-xl" onClick={handleOpen}>
          Batalkan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteWastePriceModal;