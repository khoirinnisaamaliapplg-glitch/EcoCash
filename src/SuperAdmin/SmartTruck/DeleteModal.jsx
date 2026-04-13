import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
} from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const DeleteModal = ({ open, handleOpen, data }) => {
  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-2xl">
      <DialogBody className="text-center p-8">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <Typography variant="h5" className="text-blue-gray-900 font-bold mb-2">
          Hapus Smart Truck?
        </Typography>
        <Typography className="text-gray-600 text-sm">
          Apakah Anda yakin ingin menghapus data truk <span className="font-bold text-red-500">{data?.id}</span>? Tindakan ini tidak dapat dibatalkan.
        </Typography>
      </DialogBody>
      <DialogFooter className="flex justify-center gap-3 pb-8 px-8">
        <Button
          variant="outlined"
          color="blue-gray"
          onClick={handleOpen}
          className="capitalize border-blue-gray-100"
        >
          Batal
        </Button>
        <Button
          className="bg-[#ef5350] capitalize shadow-none hover:shadow-lg"
          onClick={handleOpen}
        >
          Ya, Hapus
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteModal;