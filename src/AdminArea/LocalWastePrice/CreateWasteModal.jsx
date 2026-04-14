import React, { useState } from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Input, 
  Button, 
  Typography 
} from "@material-tailwind/react";
import { PlusCircleIcon, MapIcon } from "@heroicons/react/24/outline";

const CreateWasteModal = ({ open, setOpen }) => {
  return (
    <Dialog 
      open={open} 
      handler={() => setOpen(false)} 
      // Size md tetap oke, tapi kita tambahkan margin luar untuk HP
      size="md"
      className="rounded-[25px] md:rounded-[35px] shadow-2xl overflow-hidden mx-4 md:mx-0"
    >
      {/* Header Responsif */}
      <DialogHeader className="flex flex-col items-start gap-1 pt-6 md:pt-8 px-6 md:px-10">
        <div className="bg-blue-50 p-2.5 md:p-3 rounded-2xl mb-2">
          <PlusCircleIcon className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
        </div>
        <Typography variant="h4" className="text-blue-900 font-black text-xl md:text-2xl">
          Tambah Wilayah Baru
        </Typography>
        <Typography className="text-gray-500 font-medium text-xs md:text-sm">
          Daerah baru akan memiliki standarisasi harga sampahnya sendiri.
        </Typography>
      </DialogHeader>

      {/* Body dengan max-height agar bisa di-scroll di HP */}
      <DialogBody className="px-6 md:px-10 py-4 md:py-6 max-h-[60vh] md:max-h-none overflow-y-auto space-y-5 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <Input 
            size="lg" 
            label="ID Wilayah (Contoh: WI-003)" 
            color="blue" 
            className="rounded-xl focus:shadow-md" 
          />
          <Input 
            size="lg" 
            label="Nama Wilayah" 
            color="blue" 
            className="rounded-xl focus:shadow-md" 
          />
          <Input 
            size="lg" 
            label="Provinsi" 
            color="blue" 
            className="rounded-xl focus:shadow-md" 
          />
          <Input 
            size="lg" 
            label="Tipe Mitra" 
            color="blue" 
            className="rounded-xl focus:shadow-md" 
          />
        </div>
        
        <div className="w-full">
          <Input 
            size="lg" 
            label="Penanggung Jawab Mitra (PJ)" 
            color="blue" 
            className="rounded-xl focus:shadow-md" 
            icon={<MapIcon className="h-5 w-5" />}
          />
        </div>
      </DialogBody>

      {/* Footer Responsif (Tombol Tumpuk di HP) */}
      <DialogFooter className="px-6 md:px-10 pb-8 md:pb-10 pt-4 flex flex-col-reverse md:flex-row gap-3 md:gap-4">
        <Button 
          variant="text" 
          color="red" 
          onClick={() => setOpen(false)} 
          className="w-full md:w-auto rounded-xl font-bold normal-case py-3"
        >
          Batal
        </Button>
        <Button 
          className="w-full md:flex-1 bg-blue-600 rounded-xl font-black py-3.5 shadow-lg shadow-blue-100 normal-case" 
          onClick={() => setOpen(false)}
        >
          Simpan Wilayah
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateWasteModal;