import React, { useState, useEffect } from "react";
import {
  Dialog, DialogHeader, DialogBody, DialogFooter,
  Input, Button, Typography, IconButton, Textarea, Spinner, Select, Option,
} from "@material-tailwind/react";
import { 
  XMarkIcon, 
  CpuChipIcon, 
} from "@heroicons/react/24/outline";
import axios from "axios";
// 1. Import toast
import { toast } from "react-hot-toast";

const CreateModal = ({ open, handleOpen, refreshData }) => {
  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;

  const initialState = {
    machineCode: "",
    name: "",
    areaId: userData?.areaId || "",
    machineType: "BOX",
    locationType: "OTHER",
    latitude: "",
    longitude: "",
    district: "",
    subdistrict: "",
    address: "",
    placeName: "",
    description: "",
  };

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData?.areaId) {
      setForm(prev => ({ ...prev, areaId: userData.areaId }));
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleClose = () => {
    setForm(initialState);
    handleOpen();
  };

  const handleSubmit = async () => {
    // 2. Validasi dengan Toast
    if (!form.machineCode.trim() || !form.name.trim()) {
      toast.error("Kode Mesin dan Nama wajib diisi!");
      return;
    }

    setLoading(true);
    // 3. Loading Toast
    const toastId = toast.loading("Mendaftarkan mesin baru...");

    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        ...form,
        machineCode: form.machineCode.trim().toUpperCase(),
        name: form.name.trim(),
        areaId: Number(form.areaId),
        latitude: form.latitude ? parseFloat(form.latitude) : 0,
        longitude: form.longitude ? parseFloat(form.longitude) : 0,
      };

      const response = await axios.post("http://localhost:3000/api/machines/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        // 4. Success Toast
        toast.success("Mesin berhasil didaftarkan!", { id: toastId });
        
        if (refreshData) refreshData();
        handleClose();
      }
    } catch (error) {
      console.error("CREATE ERROR:", error);
      const errorMsg = error.response?.data?.message || "Gagal menyimpan data.";
      // 5. Error Toast
      toast.error(errorMsg, { id: toastId });
    } finally { 
      setLoading(false); 
    }
  };

  const locationOptions = ["OFFICE", "HOTEL", "MALL", "MARKET", "SCHOOL_CAMPUS", "RT_RW", "PARK", "HOSPITAL", "OTHER"];

  return (
    <Dialog 
      open={open} 
      handler={handleClose} 
      size="xl" 
      className="rounded-xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col font-sans"
    >
      <DialogHeader className="flex justify-between items-center border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <CpuChipIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <Typography variant="h5" color="blue-gray" className="font-bold">
              Registrasi Mesin Baru
            </Typography>
            <Typography className="text-xs text-blue-600 font-bold uppercase tracking-tight">
                Area: {userData?.areaName || "Area Tugas Anda"} (ID: {userData?.areaId})
            </Typography>
          </div>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleClose}>
          <XMarkIcon className="h-5 w-5" strokeWidth={2} />
        </IconButton>
      </DialogHeader>

      <DialogBody className="overflow-y-auto px-6 py-4 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMN 1: UNIT INFO */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Identitas Unit</Typography>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Typography className="text-[10px] uppercase font-bold text-gray-500">Area Pengelolaan Saat Ini</Typography>
                  <Typography className="text-sm font-bold text-blue-700">{userData?.areaName || "Area Tugas"} (ID: {userData?.areaId})</Typography>
              </div>

              <Input label="Kode Mesin (Unik)" name="machineCode" value={form.machineCode} onChange={handleChange} color="blue" />
              <Input label="Nama Tampilan" name="name" value={form.name} onChange={handleChange} color="blue" />
              
              <Select label="Tipe Perangkat Keras" value={form.machineType} onChange={(v) => handleSelectChange("machineType", v)}>
                <Option value="BOX">SISTEM BOX</Option>
                <Option value="CONTAINER">SISTEM KONTAINER</Option>
              </Select>
            </div>
          </div>

          {/* COLUMN 2: PLACEMENT */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-green-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">GPS & Alamat</Typography>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nama Lokasi (Gedung)" name="placeName" value={form.placeName} onChange={handleChange} />
                <Select label="Kategori Lokasi" value={form.locationType} onChange={(v) => handleSelectChange("locationType", v)}>
                  {locationOptions.map((opt) => (
                    <Option key={opt} value={opt}>{opt.replace("_", " ")}</Option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Latitudo" name="latitude" type="number" value={form.latitude} onChange={handleChange} />
                <Input label="Longitudo" name="longitude" type="number" value={form.longitude} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Kecamatan" name="district" value={form.district} onChange={handleChange} />
                <Input label="Kelurahan" name="subdistrict" value={form.subdistrict} onChange={handleChange} />
              </div>
              <Textarea label="Detail Alamat Lengkap" name="address" rows={2} value={form.address} onChange={handleChange} />
            </div>
          </div>

          {/* INTERNAL NOTES */}
          <div className="lg:col-span-2 pt-2">
            <div className="flex items-center gap-2 border-l-4 border-orange-400 pl-3 mb-4">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Deskripsi Internal</Typography>
            </div>
            <Textarea label="Catatan Tambahan" name="description" rows={2} value={form.description} onChange={handleChange} />
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="border-t border-gray-100 p-4 gap-2">
        <Button variant="text" color="gray" onClick={handleClose} className="normal-case">
          Batal
        </Button>
        <Button 
          variant="gradient" 
          color="blue" 
          onClick={handleSubmit} 
          disabled={loading} 
          className="flex items-center gap-2 normal-case"
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Konfirmasi Registrasi"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateModal;