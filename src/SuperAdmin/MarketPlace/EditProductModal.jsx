import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button, Typography, Textarea } from "@material-tailwind/react";
import { PencilSquareIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

const EditProductModal = ({ open, handleOpen, data }) => {
  const [formData, setFormData] = useState({
    name: "",
    mitra: "",
    price: "",
    address: "",
    img: ""
  });

  // Mengisi form saat modal dibuka dengan data yang dipilih
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name,
        mitra: data.mitra,
        price: data.price.replace(/[^0-9]/g, ""), // Mengambil angka saja dari Rp.100.000
        address: data.address,
        img: data.img
      });
    }
  }, [data]);

  return (
    <Dialog open={open} handler={handleOpen} size="sm" className="rounded-[28px] shadow-2xl border border-blue-50">
      <DialogHeader className="flex justify-between px-8 pt-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl">
            <PencilSquareIcon className="h-6 w-6 text-blue-600" />
          </div>
          <Typography variant="h5" className="text-blue-900 font-bold">Edit Produk Market</Typography>
        </div>
        <XMarkIcon className="h-5 w-5 cursor-pointer text-gray-400" onClick={handleOpen} />
      </DialogHeader>

      <DialogBody className="px-8 py-4 space-y-4 overflow-y-auto max-h-[70vh]">
        <div className="space-y-4">
          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-bold ml-1">Nama Produk</Typography>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="!rounded-xl border-t-blue-gray-200 focus:!border-blue-500"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Typography variant="small" className="text-blue-900 font-bold ml-1">Nama Mitra</Typography>
              <Input 
                value={formData.mitra}
                onChange={(e) => setFormData({...formData, mitra: e.target.value})}
                className="!rounded-xl border-t-blue-gray-200 focus:!border-blue-500"
                labelProps={{ className: "hidden" }}
              />
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="text-blue-900 font-bold ml-1">Harga (Rp)</Typography>
              <Input 
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="!rounded-xl border-t-blue-gray-200 focus:!border-blue-500"
                labelProps={{ className: "hidden" }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-bold ml-1">Titik Alamat Pengiriman</Typography>
            <Textarea 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="!rounded-xl border-t-blue-gray-200 focus:!border-blue-500"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-bold ml-1">Foto Produk</Typography>
            <div className="flex items-center gap-4 border-2 border-dashed border-blue-gray-50 rounded-xl p-3">
              <img src={formData.img} alt="preview" className="h-16 w-16 rounded-lg object-cover border border-blue-50 shadow-sm" />
              <div className="flex flex-col">
                <Button size="sm" variant="outlined" className="flex items-center gap-2 rounded-lg py-2 normal-case border-blue-200 text-blue-700">
                  <PhotoIcon className="h-4 w-4" /> Ganti Foto
                </Button>
                <Typography className="text-[10px] text-gray-400 mt-1">*Format: JPG, PNG (Max 2MB)</Typography>
              </div>
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="px-8 pb-8 pt-2 gap-3">
        <Button variant="text" color="blue-gray" onClick={handleOpen} className="normal-case font-bold">Batal</Button>
        <Button 
          className="bg-[#66bb6a] px-10 rounded-xl normal-case font-bold shadow-none hover:shadow-lg transition-all" 
          onClick={handleOpen}
        >
          Update Produk
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditProductModal;