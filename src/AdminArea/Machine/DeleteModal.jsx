import React from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Button, 
  Typography 
} from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const DeleteModal = ({ open, setOpen, data, setMachines, machines }) => {
  const handleDelete = () => {
    if (data?.id) {
      setMachines(machines.filter((m) => m.id !== data.id));
      setOpen(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={() => setOpen(false)} 
      size="xs" 
      className="rounded-[30px] shadow-2xl"
    >
      {/* Header dengan Ikon Peringatan Merah */}
      <DialogHeader className="flex flex-col items-center justify-center pt-8 px-8 pb-2">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-600 stroke-2" />
        </div>
        <Typography variant="h4" className="text-gray-900 font-black text-center">
          Hapus Unit Mesin?
        </Typography>
      </DialogHeader>

      {/* Body dengan Teks Konfirmasi */}
      <DialogBody className="px-8 py-2 text-center">
        <Typography className="text-gray-600 font-medium">
          Apakah Anda yakin ingin menghapus unit <span className="font-black text-red-600">{data?.id}</span>? 
        </Typography>
        <Typography className="text-gray-500 text-sm mt-2">
          Tindakan ini bersifat permanen dan data mesin tidak dapat dikembalikan ke sistem.
        </Typography>
      </DialogBody>

      {/* Footer dengan Tombol Aksi yang Kontras */}
      <DialogFooter className="flex flex-col gap-2 p-8 pt-6">
        <Button 
          color="red" 
          fullWidth
          className="bg-red-600 rounded-xl normal-case font-bold py-3.5 shadow-md shadow-red-100"
          onClick={handleDelete}
        >
          Ya, Hapus Sekarang
        </Button>
        <Button 
          variant="text" 
          color="blue-gray" 
          fullWidth
          onClick={() => setOpen(false)}
          className="rounded-xl normal-case font-bold py-3.5"
        >
          Batal
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteModal;