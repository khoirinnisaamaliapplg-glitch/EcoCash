import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography } from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const DeleteStoreModal = ({ open, handleOpen, data }) => {
  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-[28px]">
      <DialogHeader className="flex flex-col items-center pt-8 gap-2">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
        <Typography variant="h5" className="text-blue-900 font-bold">Hapus Produk?</Typography>
      </DialogHeader>
      <DialogBody className="text-center px-8">
        <Typography className="text-gray-600 font-medium">
          Apakah Anda yakin ingin menghapus <span className="text-red-600 font-bold">{data?.name}</span> dari MarketPlace?
        </Typography>
      </DialogBody>
      <DialogFooter className="flex flex-col gap-2 p-8">
        <Button fullWidth className="bg-red-500 rounded-xl normal-case" onClick={handleOpen}>Ya, Hapus</Button>
        <Button fullWidth variant="text" className="normal-case" onClick={handleOpen}>Batalkan</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteStoreModal;