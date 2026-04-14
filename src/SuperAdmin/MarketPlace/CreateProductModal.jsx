import React from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Input, 
  Button, 
  Typography, 
  Textarea 
} from "@material-tailwind/react";
import { PhotoIcon } from "@heroicons/react/24/solid";

const CreateProductModal = ({ open, handleOpen }) => {
  return (
    <Dialog 
      open={open} 
      handler={handleOpen} 
      size="sm" 
      className="rounded-[24px] md:rounded-[28px] mx-4 md:mx-0 overflow-hidden"
    >
      <DialogHeader className="px-6 md:px-8 pt-6 md:pt-8 text-blue-900 font-black text-xl md:text-2xl">
        Tambah Produk Baru
      </DialogHeader>

      {/* Body dengan scroll area untuk mobile */}
      <DialogBody className="px-6 md:px-8 space-y-4 md:space-y-5 max-h-[70vh] overflow-y-auto">
        <div className="space-y-4">
          <Input label="Nama Produk" color="blue" className="rounded-xl" />
          
          {/* Grid Responsif: Stack di HP, Row di Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Mitra" color="blue" className="rounded-xl" />
            <Input label="Harga (Rp)" color="blue" type="number" className="rounded-xl" />
          </div>

          <Textarea label="Titik Alamat Pengiriman" color="blue" className="rounded-xl" />
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-blue-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50/30 transition-all group">
            <PhotoIcon className="h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <div className="text-center">
              <Typography className="text-sm font-bold text-blue-900">Upload Foto Produk</Typography>
              <Typography className="text-[11px] text-gray-500">Format JPG, PNG up to 5MB</Typography>
            </div>
          </div>
        </div>
      </DialogBody>

      {/* Footer Responsif */}
      <DialogFooter className="px-6 md:px-8 pb-6 md:pb-8 pt-2 flex flex-col-reverse md:flex-row gap-3">
        <Button 
          variant="text" 
          color="red" 
          onClick={handleOpen} 
          className="w-full md:w-auto normal-case font-bold py-3"
        >
          Batal
        </Button>
        <Button 
          className="w-full md:flex-1 bg-[#2b6cb0] rounded-xl normal-case font-black py-3.5 shadow-lg shadow-blue-100" 
          onClick={handleOpen}
        >
          Simpan Produk
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateProductModal;