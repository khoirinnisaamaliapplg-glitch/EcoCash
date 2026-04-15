import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { 
  PencilSquareIcon, 
  CubeIcon, 
  BanknotesIcon, 
  PhotoIcon, 
  TagIcon 
} from "@heroicons/react/24/outline";

const EditProductModal = ({ open, setOpen, formData, setFormData, handleUpdate }) => (
  <Dialog 
    open={open} 
    handler={() => setOpen(false)} 
    size="sm" 
    className="rounded-[2rem] p-4 shadow-2xl border border-blue-100 bg-white"
  >
    {/* Header Ringkas Sejajar */}
    <DialogHeader className="flex items-center gap-4 border-b border-blue-50 pb-4">
      <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">
        <PencilSquareIcon className="h-6 w-6 text-white stroke-[2.5]" />
      </div>
      <div>
        <Typography variant="h5" className="text-blue-900 font-black uppercase tracking-tight leading-none">
          Update Produk
        </Typography>
        <Typography className="text-[10px] text-blue-400 font-bold tracking-widest uppercase mt-1">
          EcoCash System Editing
        </Typography>
      </div>
    </DialogHeader>

    <DialogBody className="py-6 px-2">
      {/* Grid 2 Kolom agar tidak kepanjangan ke bawah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        
        {/* Sisi Kiri: Identitas Produk */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Typography className="text-[11px] font-black text-blue-800 ml-1 uppercase flex items-center gap-2">
              <TagIcon className="h-3.5 w-3.5" /> Nama Produk
            </Typography>
            <Input 
              size="md"
              placeholder="Contoh: Pot Hias"
              className="!border !border-blue-100 bg-blue-50/20 focus:!border-blue-600 rounded-xl transition-all"
              labelProps={{ className: "hidden" }}
              value={formData?.nama || ""}
              onChange={(e) => setFormData({...formData, nama: e.target.value})} 
            />
          </div>
          <div className="space-y-1.5">
            <Typography className="text-[11px] font-black text-blue-800 ml-1 uppercase flex items-center gap-2">
              <PhotoIcon className="h-3.5 w-3.5" /> Link Foto Baru
            </Typography>
            <Input 
              placeholder="https://..."
              className="!border !border-blue-100 bg-blue-50/20 focus:!border-blue-600 rounded-xl"
              labelProps={{ className: "hidden" }}
              value={formData?.img || ""}
              onChange={(e) => setFormData({...formData, img: e.target.value})} 
            />
          </div>
        </div>

        {/* Sisi Kanan: Angka (Stok & Harga) */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Typography className="text-[11px] font-black text-blue-800 ml-1 uppercase flex items-center gap-2">
              <CubeIcon className="h-3.5 w-3.5" /> Update Stok
            </Typography>
            <Input 
              type="number"
              className="!border !border-blue-100 bg-blue-50/20 focus:!border-blue-600 rounded-xl"
              labelProps={{ className: "hidden" }}
              value={formData?.stok || ""}
              onChange={(e) => setFormData({...formData, stok: e.target.value})} 
            />
          </div>
          <div className="space-y-1.5">
            <Typography className="text-[11px] font-black text-blue-800 ml-1 uppercase flex items-center gap-2">
              <BanknotesIcon className="h-3.5 w-3.5" /> Penyesuaian Harga
            </Typography>
            <Input 
              type="number"
              className="!border !border-blue-100 bg-blue-50/20 focus:!border-blue-600 rounded-xl"
              labelProps={{ className: "hidden" }}
              value={formData?.harga || ""}
              onChange={(e) => setFormData({...formData, harga: e.target.value})} 
            />
          </div>
        </div>

      </div>
    </DialogBody>

    <DialogFooter className="flex justify-end gap-3 border-t border-blue-50 pt-5">
      <Button 
        variant="text" 
        color="red" 
        onClick={() => setOpen(false)} 
        className="rounded-xl font-black italic py-2.5 px-6"
      >
        batal
      </Button>
      <Button 
        onClick={handleUpdate} 
        className="bg-blue-600 hover:bg-blue-700 rounded-xl font-black shadow-lg shadow-blue-100 px-8 py-2.5 text-xs uppercase transition-all active:scale-95"
      >
        Simpan Perubahan
      </Button>
    </DialogFooter>
  </Dialog>
);

export default EditProductModal;