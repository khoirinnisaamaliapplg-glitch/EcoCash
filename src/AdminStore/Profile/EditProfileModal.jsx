import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const EditProfileModal = ({ open, setOpen, data, setData }) => {
  const [formData, setFormData] = useState({ ...data });

  const handleSave = () => {
    setData(formData);
    setOpen(false);
  };

  return (
    <Dialog 
      open={open} 
      handler={() => setOpen(false)} 
      size="md"
      className="rounded-[2.5rem] p-4"
    >
      <DialogHeader className="flex justify-between items-center">
        <Typography variant="h4" className="text-blue-900 font-black uppercase">
          Edit Profil Toko
        </Typography>
        <button onClick={() => setOpen(false)}>
          <XMarkIcon className="h-6 w-6 text-gray-400" />
        </button>
      </DialogHeader>
      
      <DialogBody className="space-y-6 overflow-y-auto max-h-[70vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Nama Lengkap" 
            value={formData.nama} 
            onChange={(e) => setFormData({...formData, nama: e.target.value})}
          />
          <Input 
            label="Nama Toko" 
            value={formData.namaToko} 
            onChange={(e) => setFormData({...formData, namaToko: e.target.value})}
          />
        </div>
        <Input 
          label="Email Bisnis" 
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <Input 
          label="WhatsApp" 
          value={formData.phone} 
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
        <Input 
          label="Lokasi/Wilayah" 
          value={formData.wilayah} 
          onChange={(e) => setFormData({...formData, wilayah: e.target.value})}
        />
        <Textarea 
          label="Bio/Deskripsi Toko" 
          rows={4}
          value={formData.bio} 
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
        />
      </DialogBody>

      <DialogFooter className="gap-3">
        <Button variant="text" color="red" onClick={() => setOpen(false)} className="rounded-xl font-bold">
          Batal
        </Button>
        <Button className="bg-blue-700 rounded-xl px-10 font-black" onClick={handleSave}>
          Simpan Perubahan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditProfileModal;