import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Input, Button, Typography, Textarea 
} from "@material-tailwind/react";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const EditStoreModal = ({ open, handleOpen, data, onSuccess }) => {
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
      phoneNumber: ""
    }
  });

  useEffect(() => {
    if (data && open) {
      setFormData({
        name: data.name || "",
        address: data.address || "",
        district: data.district || "",
        subdistrict: data.subdistrict || "",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        areaId: data.areaId || "",
        admin: {
          name: data.admin?.name || "",
          username: data.admin?.username || "",
          email: data.admin?.email || "",
          phoneNumber: data.admin?.phoneNumber || ""
        }
      });
    }
  }, [data, open]);

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
    setLoading(true);
    try {
      // Konstruksi payload untuk PATCH
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
          phoneNumber: formData.admin.phoneNumber
        }
      };

      // MENGGUNAKAN PATCH
      await axios.patch(`http://localhost:3000/api/stores/${data.id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      toast.success("Berhasil update data toko (PATCH)!");
      onSuccess(); 
      handleOpen(); 
    } catch (error) {
      console.error("Patch error detail:", error.response?.data);
      toast.error(error.response?.data?.message || "Gagal update toko dengan metode PATCH");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={handleOpen} size="md" className="rounded-[28px] shadow-2xl border border-blue-50">
      <DialogHeader className="flex justify-between px-8 pt-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl">
            <PencilSquareIcon className="h-6 w-6 text-blue-600" />
          </div>
          <Typography variant="h5" className="text-blue-900 font-bold">Edit Unit Toko (PATCH)</Typography>
        </div>
        <XMarkIcon className="h-5 w-5 cursor-pointer text-gray-400" onClick={handleOpen} />
      </DialogHeader>

      <DialogBody className="px-8 py-4 space-y-6 overflow-y-auto max-h-[70vh]">
        {/* Konten Form Tetap Sama Seperti Sebelumnya */}
        <div className="space-y-4">
          <Typography className="font-bold text-blue-600 border-b pb-1 text-xs uppercase tracking-wider">Informasi Toko</Typography>
          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-bold ml-1">Nama Toko</Typography>
            <Input name="name" value={formData.name} onChange={handleChange} labelProps={{ className: "hidden" }} className="!rounded-xl !border-blue-gray-100 focus:!border-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Typography variant="small" className="text-blue-900 font-bold ml-1">Kecamatan</Typography>
              <Input name="district" value={formData.district} onChange={handleChange} labelProps={{ className: "hidden" }} className="!rounded-xl !border-blue-gray-100 focus:!border-blue-500" />
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="text-blue-900 font-bold ml-1">Kelurahan</Typography>
              <Input name="subdistrict" value={formData.subdistrict} onChange={handleChange} labelProps={{ className: "hidden" }} className="!rounded-xl !border-blue-gray-100 focus:!border-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Typography variant="small" className="text-blue-900 font-bold ml-1">ID Area</Typography>
              <Input name="areaId" type="number" value={formData.areaId} onChange={handleChange} labelProps={{ className: "hidden" }} className="!rounded-xl !border-blue-gray-100 focus:!border-blue-500" />
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="text-blue-900 font-bold ml-1">Latitude</Typography>
              <Input name="latitude" value={formData.latitude} onChange={handleChange} labelProps={{ className: "hidden" }} className="!rounded-xl !border-blue-gray-100 focus:!border-blue-500" />
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="text-blue-900 font-bold ml-1">Longitude</Typography>
              <Input name="longitude" value={formData.longitude} onChange={handleChange} labelProps={{ className: "hidden" }} className="!rounded-xl !border-blue-gray-100 focus:!border-blue-500" />
            </div>
          </div>
          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-bold ml-1">Alamat Lengkap</Typography>
            <Textarea name="address" value={formData.address} onChange={handleChange} labelProps={{ className: "hidden" }} className="!rounded-xl !border-blue-gray-100 focus:!border-blue-500" />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Typography className="font-bold text-green-600 border-b pb-1 text-xs uppercase tracking-wider">Akun Admin Toko</Typography>
          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-bold ml-1">Nama Admin</Typography>
            <Input name="admin.name" value={formData.admin.name} onChange={handleChange} labelProps={{ className: "hidden" }} className="!rounded-xl !border-blue-gray-100 focus:!border-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Typography variant="small" className="text-blue-900 font-bold ml-1">Username</Typography>
              <Input name="admin.username" value={formData.admin.username} onChange={handleChange} labelProps={{ className: "hidden" }} className="!rounded-xl !border-blue-gray-100 focus:!border-blue-500" />
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="text-blue-900 font-bold ml-1">Email</Typography>
              <Input name="admin.email" type="email" value={formData.admin.email} onChange={handleChange} labelProps={{ className: "hidden" }} className="!rounded-xl !border-blue-gray-100 focus:!border-blue-500" />
            </div>
          </div>
          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-bold ml-1">Nomor WhatsApp</Typography>
            <Input name="admin.phoneNumber" value={formData.admin.phoneNumber} onChange={handleChange} labelProps={{ className: "hidden" }} className="!rounded-xl !border-blue-gray-100 focus:!border-blue-500" />
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="px-8 pb-8 pt-2 gap-3">
        <Button variant="text" color="red" onClick={handleOpen} className="normal-case font-bold">Batal</Button>
        <Button 
          className="bg-[#2b6cb0] px-10 rounded-xl normal-case font-bold" 
          onClick={handleSubmit}
          loading={loading}
        >
          Simpan (PATCH)
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditStoreModal;