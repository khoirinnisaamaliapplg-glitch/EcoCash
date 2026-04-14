import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography } from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const DeleteModal = ({ open, setOpen, data, setOperators, operators }) => {
  const handleDelete = () => {
    if (data?.id) {
      setOperators(operators.filter((op) => op.id !== data.id));
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} handler={() => setOpen(false)} size="xs" className="rounded-[30px]">
      <DialogHeader className="flex flex-col items-center pt-8">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
        </div>
        <Typography variant="h4" className="text-center text-blue-900 font-black">Hapus Operator?</Typography>
      </DialogHeader>
      <DialogBody className="px-8 text-center">
        <Typography className="text-gray-600">
          Apakah Anda yakin ingin menghapus akun <span className="font-bold text-red-600">{data?.nama}</span>? 
          Akses operator ini ke sistem akan segera dicabut.
        </Typography>
      </DialogBody>
      <DialogFooter className="flex flex-col gap-2 p-8 pt-6">
        <Button color="red" fullWidth className="rounded-xl py-3.5" onClick={handleDelete}>
          Ya, Hapus Akun
        </Button>
        <Button variant="text" color="blue-gray" fullWidth className="rounded-xl" onClick={() => setOpen(false)}>
          Batal
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteModal;