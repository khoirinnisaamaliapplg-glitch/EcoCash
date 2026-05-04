import React, { useState } from "react";
import axios from "axios";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Input, Button, Typography, Textarea 
} from "@material-tailwind/react";
import { toast } from "react-toastify"; // Pastikan sudah install react-toastify

const CreateStoreModal = ({ open, handleOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async () => {
    if (!formData.name || !formData.areaId || !formData.admin.email) {
      toast.warn("Mohon isi field wajib: Nama Toko, ID Area, dan Email Admin");
      return;
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

    setLoading(true);
    try {
      await axios.post("http://localhost:3000/api/stores", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      toast.success("Toko berhasil ditambahkan!");
      onSuccess(); // Memanggil fetchStores di MarketPlaceIndex
      handleOpen(); // Menutup modal
      // Reset form
      setFormData({
        name: "", address: "", district: "", subdistrict: "",
        latitude: "", longitude: "", areaId: "",
        admin: { name: "", username: "", email: "", password: "", phoneNumber: "" }
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menambah toko");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={handleOpen} size="md" className="rounded-[28px]">
      <DialogHeader className="px-8 pt-8 text-blue-900 font-black">Tambah Unit Toko Baru</DialogHeader>
      <DialogBody className="px-8 space-y-4 max-h-[70vh] overflow-y-auto">
        
        <div className="space-y-4">
          <Typography className="font-bold text-blue-600 border-b text-xs uppercase">Informasi Toko</Typography>
          <Input label="Nama Toko" name="name" value={formData.name} onChange={handleChange} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kecamatan" name="district" value={formData.district} onChange={handleChange} />
            <Input label="Kelurahan" name="subdistrict" value={formData.subdistrict} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="ID Area (Angka)" name="areaId" type="number" value={formData.areaId} onChange={handleChange} />
            <Input label="Latitude" name="latitude" value={formData.latitude} onChange={handleChange} />
            <Input label="Longitude" name="longitude" value={formData.longitude} onChange={handleChange} />
          </div>

          <Textarea label="Alamat Lengkap Toko" name="address" value={formData.address} onChange={handleChange} />
        </div>

        <div className="space-y-4 pt-4">
          <Typography className="font-bold text-green-600 border-b text-xs uppercase">Akun Admin Toko</Typography>
          <Input label="Nama Lengkap Admin" name="admin.name" value={formData.admin.name} onChange={handleChange} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Username" name="admin.username" value={formData.admin.username} onChange={handleChange} />
            <Input label="Email Admin" name="admin.email" type="email" value={formData.admin.email} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Password" name="admin.password" type="password" value={formData.admin.password} onChange={handleChange} />
            <Input label="Nomor WhatsApp" name="admin.phoneNumber" value={formData.admin.phoneNumber} onChange={handleChange} />
          </div>
        </div>

      </DialogBody>
      <DialogFooter className="px-8 pb-8 gap-3">
        <Button variant="text" color="red" onClick={handleOpen}>Batal</Button>
        <Button className="bg-[#2b6cb0] px-10" onClick={handleSubmit} loading={loading}>Simpan Toko</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateStoreModal;