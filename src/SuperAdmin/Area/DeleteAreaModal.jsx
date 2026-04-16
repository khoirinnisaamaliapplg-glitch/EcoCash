import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography } from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const DeleteAreaModal = ({ open, handleOpen, data, confirmDelete }) => {
  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-[28px]">
      <DialogHeader className="flex flex-col items-center pt-8 gap-2">
        <div className="bg-red-50 p-4 rounded-full">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
        </div>
        <Typography variant="h5" className="text-blue-900 font-black">Hapus Wilayah?</Typography>
      </DialogHeader>
      
      <DialogBody className="text-center px-8">
        <Typography className="text-gray-600 font-medium leading-relaxed">
          Apakah Anda yakin ingin menghapus area <span className="text-red-600 font-black">"{data?.name}"</span> dengan kode <span className="font-bold text-gray-800">{data?.code}</span>? 
          <br />
          <span className="text-xs text-gray-400">Data yang dihapus tidak dapat dipulihkan.</span>
        </Typography>
      </DialogBody>

      <DialogFooter className="flex flex-col gap-2 p-8 pt-4">
        <Button 
          fullWidth 
          className="bg-red-500 rounded-xl normal-case font-black shadow-lg shadow-red-100 py-4" 
          onClick={() => {
            confirmDelete(data.id);
            handleOpen();
          }}
        >
          Ya, Hapus Area
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          className="normal-case font-bold text-gray-500" 
          onClick={handleOpen}
        >
          Batalkan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteAreaModal;