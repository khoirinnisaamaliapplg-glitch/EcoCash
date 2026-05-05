import React, { useState } from "react";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Input, Button, Typography, Textarea 
} from "@material-tailwind/react";
// 1. Import toast
import { toast } from "react-hot-toast";

const CreateStoreModal = ({ open, handleOpen, onConfirm }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    district: "",
    subdistrict: "",
    latitude: "",
    longitude: "",
    areaId: "",
    admin: {
      name: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: ""
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("admin.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        admin: { ...prev.admin, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    // 2. Validasi dengan Toast
    if (!formData.name.trim()) return toast.error("Nama Toko wajib diisi!");
    if (!formData.areaId) return toast.error("ID Area wajib diisi!");
    if (!formData.admin.email.trim()) return toast.error("Email Admin wajib diisi!");
    if (!formData.admin.password || formData.admin.password.length < 6) {
      return toast.error("Password minimal 6 karakter!");
    }

    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      district: formData.district.trim(),
      subdistrict: formData.subdistrict.trim(),
      latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0,
      areaId: Number(formData.areaId),
      admin: {
        name: formData.admin.name.trim(),
        username: formData.admin.username.toLowerCase().trim(),
        email: formData.admin.email.toLowerCase().trim(),
        password: formData.admin.password,
        phoneNumber: formData.admin.phoneNumber
      }
    };

    onConfirm(payload);
  };

  return (
    <Dialog open={open} handler={handleOpen} size="md" className="rounded-[28px] shadow-2xl">
      <DialogHeader className="px-8 pt-8 text-blue-900 font-black">
        Tambah Unit Toko Baru
      </DialogHeader>
      
      <DialogBody className="px-8 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* SEKSI INFORMASI TOKO */}
        <div className="space-y-4">
          <Typography className="font-bold text-blue-600 border-b text-[11px] uppercase tracking-wider">
            Informasi Toko
          </Typography>
          <Input label="Nama Toko" name="name" value={formData.name} onChange={handleChange} color="blue" />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kecamatan" name="district" value={formData.district} onChange={handleChange} color="blue" />
            <Input label="Kelurahan" name="subdistrict" value={formData.subdistrict} onChange={handleChange} color="blue" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="ID Area (Angka)" name="areaId" type="number" value={formData.areaId} onChange={handleChange} color="blue" />
            <Input label="Latitude" name="latitude" value={formData.latitude} onChange={handleChange} color="blue" />
            <Input label="Longitude" name="longitude" value={formData.longitude} onChange={handleChange} color="blue" />
          </div>

          <Textarea label="Alamat Lengkap Toko" name="address" value={formData.address} onChange={handleChange} color="blue" />
        </div>

        {/* SEKSI AKUN ADMIN */}
        <div className="space-y-4 pt-4">
          <Typography className="font-bold text-green-600 border-b text-[11px] uppercase tracking-wider">
            Akun Admin Toko
          </Typography>
          <Input label="Nama Lengkap Admin" name="admin.name" value={formData.admin.name} onChange={handleChange} color="green" />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Username" name="admin.username" value={formData.admin.username} onChange={handleChange} color="green" />
            <Input label="Email Admin" name="admin.email" type="email" value={formData.admin.email} onChange={handleChange} color="green" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Password" name="admin.password" type="password" value={formData.admin.password} onChange={handleChange} color="green" />
            <Input label="Nomor WhatsApp" name="admin.phoneNumber" value={formData.admin.phoneNumber} onChange={handleChange} color="green" />
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="px-8 pb-8 gap-3 border-t border-gray-50 pt-4">
        <Button 
          variant="text" 
          color="red" 
          onClick={handleOpen} 
          className="normal-case font-bold"
        >
          Batal
        </Button>
        <Button 
          className="bg-[#2b6cb0] px-10 rounded-xl shadow-none hover:shadow-lg normal-case font-bold" 
          onClick={handleSubmit}
        >
          Simpan Toko
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateStoreModal;