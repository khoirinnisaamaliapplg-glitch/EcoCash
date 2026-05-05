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
  TagIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
// 1. Import toast
import { toast } from "react-hot-toast";

const EditProductModal = ({ open, setOpen, formData, setFormData, handleUpdate }) => {
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 2. Fungsi Wrapper untuk Validasi sebelum Submit
  const onSave = () => {
    if (!formData.name) return toast.error("Nama produk tidak boleh kosong!");
    if (formData.price <= 0) return toast.error("Harga harus lebih dari 0!");
    if (formData.stock < 0) return toast.error("Stok tidak boleh negatif!");
    
    // Jika valid, jalankan fungsi update dari props
    handleUpdate();
  };

  return (
    <Dialog 
      open={open} 
      handler={() => setOpen(false)} 
      size="md" 
      className="rounded-[2rem] p-4 shadow-2xl border border-blue-100 bg-white"
    >
      <DialogHeader className="flex items-center gap-4 border-b border-blue-50 pb-4">
        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">
          <PencilSquareIcon className="h-6 w-6 text-white stroke-[2.5]" />
        </div>
        <div>
          <Typography variant="h5" className="text-blue-900 font-black uppercase tracking-tight leading-none">
            Update Produk
          </Typography>
          <Typography className="text-[10px] text-blue-400 font-bold tracking-widest uppercase mt-1">
            ID Produk: {formData?.id || "-"}
          </Typography>
        </div>
      </DialogHeader>

      <DialogBody className="py-6 px-2 overflow-y-auto max-h-[70vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Typography className="text-[11px] font-black text-blue-800 ml-1 uppercase flex items-center gap-2">
                <TagIcon className="h-3.5 w-3.5" /> Nama Produk
              </Typography>
              <Input 
                name="name"
                size="md"
                placeholder="Contoh: Pot Hias"
                className="!border !border-blue-100 bg-blue-50/20 focus:!border-blue-600 rounded-xl transition-all"
                labelProps={{ className: "hidden" }}
                value={formData?.name || ""}
                onChange={handleChange} 
              />
            </div>

            <div className="space-y-1.5">
              <Typography className="text-[11px] font-black text-blue-800 ml-1 uppercase flex items-center gap-2">
                <InformationCircleIcon className="h-3.5 w-3.5" /> Deskripsi
              </Typography>
              <Input 
                name="description"
                placeholder="Detail produk..."
                className="!border !border-blue-100 bg-blue-50/20 focus:!border-blue-600 rounded-xl"
                labelProps={{ className: "hidden" }}
                value={formData?.description || ""}
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Typography className="text-[11px] font-black text-blue-800 ml-1 uppercase flex items-center gap-2">
                <CubeIcon className="h-3.5 w-3.5" /> Update Stok
              </Typography>
              <Input 
                name="stock"
                type="number"
                className="!border !border-blue-100 bg-blue-50/20 focus:!border-blue-600 rounded-xl"
                labelProps={{ className: "hidden" }}
                value={formData?.stock || ""}
                onChange={handleChange} 
              />
            </div>

            <div className="space-y-1.5">
              <Typography className="text-[11px] font-black text-blue-800 ml-1 uppercase flex items-center gap-2">
                <BanknotesIcon className="h-3.5 w-3.5" /> Harga (Rp)
              </Typography>
              <Input 
                name="price"
                type="number"
                className="!border !border-blue-100 bg-blue-50/20 focus:!border-blue-600 rounded-xl"
                labelProps={{ className: "hidden" }}
                value={formData?.price || ""}
                onChange={handleChange} 
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
          onClick={onSave} // 3. Panggil fungsi onSave yang sudah berisi validasi toast
          className="bg-blue-600 hover:bg-blue-700 rounded-xl font-black shadow-lg shadow-blue-100 px-8 py-2.5 text-xs uppercase transition-all active:scale-95"
        >
          Simpan Perubahan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditProductModal;