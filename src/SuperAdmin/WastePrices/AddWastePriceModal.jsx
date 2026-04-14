import React from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Input, 
  Button, 
  Typography, 
  Select, 
  Option 
} from "@material-tailwind/react";
import { BanknotesIcon, PlusIcon } from "@heroicons/react/24/outline";

const AddWastePriceModal = ({ open, handleOpen }) => {
  return (
    <Dialog 
      open={open} 
      handler={handleOpen} 
      size="sm" 
      className="rounded-[24px] md:rounded-[28px] shadow-2xl mx-4 md:mx-0 overflow-hidden"
    >
      {/* Header Responsif */}
      <DialogHeader className="px-6 md:px-8 pt-6 md:pt-8 flex items-center gap-3">
        <div className="p-2 md:p-2.5 bg-green-50 rounded-xl shrink-0">
          <PlusIcon className="h-5 w-5 md:h-6 md:w-6 text-green-600 stroke-[3]" />
        </div>
        <Typography variant="h5" className="text-blue-900 font-bold text-lg md:text-xl">
          Tambah Harga Sampah
        </Typography>
      </DialogHeader>
      
      {/* Body dengan scroll area untuk HP */}
      <DialogBody className="px-6 md:px-8 py-4 max-h-[70vh] overflow-y-auto space-y-5">
        <div className="space-y-4">
          
          {/* Lokasi Kontainer */}
          <div className="space-y-1.5">
            <Typography variant="small" className="text-blue-900 font-bold ml-1 text-[10px] md:text-[11px] uppercase tracking-wider">
              Pilih Lokasi Kontainer
            </Typography>
            <Select label="Pilih Kontainer" className="rounded-xl border-blue-gray-100">
              <Option>Jakarta, Cikini 1 Container 001</Option>
              <Option>Jakarta, Cikini 2 Container 002</Option>
            </Select>
          </div>

          {/* Grid Kategori & Harga: 1 Kolom di HP, 2 Kolom di Laptop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-1.5">
              <Typography variant="small" className="text-blue-900 font-bold ml-1 text-[10px] md:text-[11px] uppercase tracking-wider">
                Kategori
              </Typography>
              <Select label="Pilih Kategori" className="rounded-xl border-blue-gray-100">
                <Option>Plastik</Option>
                <Option>Organik</Option>
                <Option>Kaca</Option>
                <Option>Kaleng</Option>
                <Option>Kertas</Option>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Typography variant="small" className="text-blue-900 font-bold ml-1 text-[10px] md:text-[11px] uppercase tracking-wider">
                Harga (Rp/Kg)
              </Typography>
              <Input 
                type="number" 
                placeholder="2500"
                icon={<BanknotesIcon className="h-4 w-4" />}
                className="!rounded-xl border-blue-gray-200 focus:!border-green-500"
                labelProps={{ className: "hidden" }}
                containerProps={{ className: "min-w-[100px]" }}
              />
            </div>
          </div>

        </div>
      </DialogBody>

      {/* Footer Responsif (Tombol Tumpuk di HP) */}
      <DialogFooter className="px-6 md:px-8 pb-6 md:pb-8 pt-2 flex flex-col-reverse md:flex-row gap-3">
        <Button 
          variant="text" 
          color="blue-gray" 
          onClick={handleOpen} 
          className="w-full md:w-auto normal-case font-bold py-3"
        >
          Batal
        </Button>
        <Button 
          className="w-full md:flex-1 bg-[#66bb6a] rounded-xl normal-case font-bold shadow-none py-3.5" 
          onClick={handleOpen}
        >
          Simpan Harga
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddWastePriceModal;