import React, { useState } from "react";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Input, Button, Typography, Textarea 
} from "@material-tailwind/react";

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
    // Menangani nested object admin
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
    // Validasi sederhana sebelum dikirim
    if (!formData.name || !formData.areaId || !formData.admin.email) {
      alert("Mohon isi field wajib: Nama Toko, ID Area, dan Email Admin");
      return;
    }

    // KONSTRUKSI DATA (Payload)
    // Harus sesuai dengan req.body di controller backend
    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      district: formData.district.trim(),
      subdistrict: formData.subdistrict.trim(),
      latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0,
      areaId: Number(formData.areaId), // BACKEND MINTA NUMBER
      admin: {
        name: formData.admin.name.trim(),
        username: formData.admin.username.toLowerCase().trim(),
        email: formData.admin.email.toLowerCase().trim(),
        password: formData.admin.password,
        phoneNumber: formData.admin.phoneNumber
      }
    };

    console.log("Payload yang dikirim ke backend:", payload);
    onConfirm(payload);
  };

  return (
    <Dialog open={open} handler={handleOpen} size="md" className="rounded-[28px]">
      <DialogHeader className="px-8 pt-8 text-blue-900 font-black">Tambah Unit Toko Baru</DialogHeader>
      <DialogBody className="px-8 space-y-4 max-h-[70vh] overflow-y-auto">
        
        <div className="space-y-4">
          <Typography className="font-bold text-blue-600 border-b text-xs uppercase">Informasi Toko</Typography>
          <Input label="Nama Toko" name="name" onChange={handleChange} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kecamatan" name="district" onChange={handleChange} />
            <Input label="Kelurahan" name="subdistrict" onChange={handleChange} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="ID Area (Angka)" name="areaId" type="number" onChange={handleChange} />
            <Input label="Latitude" name="latitude" onChange={handleChange} />
            <Input label="Longitude" name="longitude" onChange={handleChange} />
          </div>

          <Textarea label="Alamat Lengkap Toko" name="address" onChange={handleChange} />
        </div>

        <div className="space-y-4 pt-4">
          <Typography className="font-bold text-green-600 border-b text-xs uppercase">Akun Admin Toko</Typography>
          <Input label="Nama Lengkap Admin" name="admin.name" onChange={handleChange} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Username" name="admin.username" onChange={handleChange} />
            <Input label="Email Admin" name="admin.email" type="email" onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Password" name="admin.password" type="password" onChange={handleChange} />
            <Input label="Nomor WhatsApp" name="admin.phoneNumber" onChange={handleChange} />
          </div>
        </div>

      </DialogBody>
      <DialogFooter className="px-8 pb-8 gap-3">
        <Button variant="text" color="red" onClick={handleOpen}>Batal</Button>
        <Button className="bg-[#2b6cb0] px-10" onClick={handleSubmit}>Simpan Toko</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateStoreModal;