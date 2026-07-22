import React, { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button, IconButton, Textarea } from "@material-tailwind/react";
import { XMarkIcon, BuildingStorefrontIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const AddProductModal = ({ open, handleOpen, onConfirm }) => {
  const [formData, setFormData] = useState({ name: "", price: "", stock: "", weight: "", description: "", storeId: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.storeId || !formData.price) {
      return toast.error("Lengkapi data!");
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock || 0),
      weight: Number(formData.weight || 0),
      storeId: Number(formData.storeId)
    };

    await onConfirm(payload);
    handleOpen(); // Tutup modal setelah kirim
  };

  return (
    <Dialog open={open} handler={handleOpen}>
      <DialogHeader>Tambah Produk <IconButton onClick={handleOpen}><XMarkIcon/></IconButton></DialogHeader>
      <DialogBody className="space-y-4">
        <Input label="Nama" name="name" onChange={handleChange} />
        <Input label="ID Toko" name="storeId" type="number" onChange={handleChange} icon={<BuildingStorefrontIcon/>} />
        <Input label="Harga" name="price" type="number" onChange={handleChange} icon={<CurrencyDollarIcon/>} />
        <div className="grid grid-cols-2 gap-4">
            <Input label="Stok" name="stock" type="number" onChange={handleChange} />
            <Input label="Berat" name="weight" type="number" onChange={handleChange} />
        </div>
        <Textarea label="Deskripsi" name="description" onChange={handleChange} />
      </DialogBody>
      <DialogFooter>
        <Button color="red" onClick={handleOpen}>Batal</Button>
        <Button className="bg-blue-600 ml-4" onClick={handleSubmit}>Simpan</Button>
      </DialogFooter>
    </Dialog>
  );
};
export default AddProductModal;