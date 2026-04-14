import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography } from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/outline";

const DeleteWasteModal = ({ open, setOpen, data }) => {
  return (
    <Dialog 
      open={open} 
      handler={() => setOpen(false)} 
      size="xs" 
      className="rounded-[30px]"
    >
      <DialogHeader className="flex flex-col items-center justify-center pt-10 px-8">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <TrashIcon className="h-10 w-10 text-red-600 stroke-2" />
        </div>
        <Typography variant="h4" className="text-gray-900 font-black text-center">
          Hapus Kategori?
        </Typography>
      </DialogHeader>

      <DialogBody className="px-8 py-2 text-center">
        <Typography className="text-gray-600 font-medium">
          Anda akan menghapus kategori <span className="font-black text-red-600">{data?.kategori}</span> dari daftar harga wilayah ini.
        </Typography>
      </DialogBody>

      <DialogFooter className="flex flex-col gap-2 p-8 pt-6">
        <Button 
          color="red" 
          fullWidth
          className="bg-red-600 rounded-xl font-bold py-3.5 shadow-md shadow-red-100"
          onClick={() => setOpen(false)}
        >
          Ya, Hapus Harga
        </Button>
        <Button 
          variant="text" 
          color="blue-gray" 
          fullWidth
          onClick={() => setOpen(false)}
          className="rounded-xl font-bold"
        >
          Batal
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteWasteModal;