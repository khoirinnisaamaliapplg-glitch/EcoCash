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
  PlusIcon, 
  CubeIcon, 
  BanknotesIcon, 
  PhotoIcon, 
  TagIcon 
} from "@heroicons/react/24/outline";

const AddProductModal = ({ open, setOpen, formData, setFormData, handleAdd }) => (
  <Dialog 
    open={open} 
    handler={() => setOpen(false)} 
    size="sm" 
    className="rounded-[2rem] p-4 shadow-2xl border border-blue-50/50"
  >
    <DialogHeader className="flex items-center gap-4 border-b border-blue-50 pb-4">
      <div className="bg-blue-600 p-2.5 rounded-xl shadow-md shadow-blue-100">
        <PlusIcon className="h-6 w-6 text-white stroke-[3]" />
      </div>
      <div>
        <Typography variant="h5" className="text-blue-900 font-black uppercase tracking-tight">
          Tambah Produk
        </Typography>
        <Typography className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">
          EcoCash Admin Store
        </Typography>
      </div>
    </DialogHeader>

    <DialogBody className="py-6 px-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Kolom Kiri: Nama & URL Gambar */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Typography className="text-[11px] font-black text-blue-700 ml-1 uppercase flex items-center gap-2">
              <TagIcon className="h-3 w-3" /> Nama Produk
            </Typography>
            <Input 
              size="md"
              placeholder="Pot Hias Kaleng"
              className="!border !border-blue-100 bg-blue-50/20 focus:!border-blue-600 rounded-xl transition-all"
              labelProps={{ className: "hidden" }}
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})} 
            />
          </div>
          <div className="space-y-1.5">
            <Typography className="text-[11px] font-black text-blue-700 ml-1 uppercase flex items-center gap-2">
              <PhotoIcon className="h-3 w-3" /> URL Gambar
            </Typography>
            <Input 
              placeholder="https://..."
              className="!border !border-blue-100 bg-blue-50/20 focus:!border-blue-600 rounded-xl"
              labelProps={{ className: "hidden" }}
              value={formData.img}
              onChange={(e) => setFormData({...formData, img: e.target.value})} 
            />
          </div>
        </div>

        {/* Kolom Kanan: Stok & Harga */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Typography className="text-[11px] font-black text-blue-700 ml-1 uppercase flex items-center gap-2">
              <CubeIcon className="h-3 w-3" /> Stok Tersedia
            </Typography>
            <Input 
              type="number"
              placeholder="0"
              className="!border !border-blue-100 bg-blue-50/20 focus:!border-blue-600 rounded-xl"
              labelProps={{ className: "hidden" }}
              value={formData.stok}
              onChange={(e) => setFormData({...formData, stok: e.target.value})} 
            />
          </div>
          <div className="space-y-1.5">
            <Typography className="text-[11px] font-black text-blue-700 ml-1 uppercase flex items-center gap-2">
              <BanknotesIcon className="h-3 w-3" /> Harga Jual (Rp)
            </Typography>
            <Input 
              type="number"
              placeholder="15000"
              className="!border !border-blue-100 bg-blue-50/20 focus:!border-blue-600 rounded-xl"
              labelProps={{ className: "hidden" }}
              value={formData.harga}
              onChange={(e) => setFormData({...formData, harga: e.target.value})} 
            />
          </div>
        </div>
      </div>
    </DialogBody>

    <DialogFooter className="flex justify-end gap-3 border-t border-blue-50 pt-4">
      <Button 
        variant="text" 
        color="red" 
        onClick={() => setOpen(false)} 
        className="rounded-xl font-black italic lowercase py-2.5"
      >
        batal
      </Button>
      <Button 
        onClick={handleAdd} 
        className="bg-blue-600 rounded-xl font-black shadow-lg shadow-blue-100 px-8 py-2.5 text-xs uppercase"
      >
        Simpan Produk
      </Button>
    </DialogFooter>
  </Dialog>
);

export default AddProductModal;