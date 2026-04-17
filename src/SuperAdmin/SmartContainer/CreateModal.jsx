import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Typography,
  IconButton,
  Textarea,
  Spinner,
  Select,
  Option,
} from "@material-tailwind/react";
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";

const CreateModal = ({ open, handleOpen, refreshData }) => {
  const initialState = {
    machineCode: "",
    name: "",
    areaId: "",
    machineType: "DROP_MACHINE", // Sesuaikan dengan Enum di DB Anda
    locationType: "INDOOR",     // Sesuaikan dengan Enum di DB Anda
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
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handler khusus untuk Select Material Tailwind
  const handleSelectChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // PENYESUAIAN KOLOM DATABASE (Casting Tipe Data)
      const payload = {
        ...form,
        areaId: parseInt(form.areaId) || 0,        // Kolom 'areaId' (Integer)
        latitude: parseFloat(form.latitude) || 0,   // Kolom 'latitude' (Double Precision)
        longitude: parseFloat(form.longitude) || 0, // Kolom 'longitude' (Double Precision)
        isActive: true                              // Kolom 'isActive' (Boolean)
      };

      await axios.post("http://localhost:3000/api/machines/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatus("success");
      setTimeout(() => {
        handleClose();
        if (refreshData) refreshData();
      }, 2000);
    } catch (error) {
      console.error("Gagal simpan:", error.response?.data || error.message);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    handleOpen();
    setTimeout(() => {
      setStatus(null);
      setForm(initialState);
    }, 300);
  };

  return (
    <Dialog open={open} handler={handleClose} size="xl" className="rounded-3xl shadow-2xl overflow-hidden">
      {status === "success" ? (
        <div className="flex flex-col items-center py-16 px-10 text-center">
          <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4 animate-bounce" />
          <Typography variant="h4" className="text-blue-900 font-black">Berhasil!</Typography>
          <Typography className="text-gray-600 font-medium">Data Machine berhasil masuk ke database.</Typography>
        </div>
      ) : status === "error" ? (
        <div className="flex flex-col items-center py-16 px-10 text-center">
          <XCircleIcon className="h-20 w-20 text-red-500 mb-4" />
          <Typography variant="h4" className="text-blue-900 font-black">Gagal Simpan</Typography>
          <Typography className="text-red-500 font-medium">Cek kembali Machine Code (Unique) atau koneksi database.</Typography>
          <Button className="mt-6 bg-red-500" onClick={() => setStatus(null)}>Coba Lagi</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between pr-4 border-b border-gray-50">
            <DialogHeader className="text-[#2b6cb0] font-black text-xl">
              Add New Machine Column
            </DialogHeader>
            <IconButton variant="text" color="blue-gray" onClick={handleClose}>
              <XMarkIcon className="h-6 w-6" />
            </IconButton>
          </div>

          <DialogBody className="px-8 py-6 overflow-y-auto max-h-[75vh]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Kolom 1: Identitas Dasar */}
              <div className="space-y-4">
                <Typography variant="h6" color="blue-gray" className="-mb-2">Basic Info</Typography>
                <InputGroup label="Machine Code" name="machineCode" value={form.machineCode} onChange={handleChange} placeholder="MCH-101" />
                <InputGroup label="Machine Name" name="name" value={form.name} onChange={handleChange} placeholder="Cikini Bin 1" />
                <InputGroup label="Area ID" name="areaId" value={form.areaId} onChange={handleChange} placeholder="12" />
                
                <div className="space-y-1">
                  <Typography variant="small" className="font-bold text-blue-900 ml-1">Machine Type</Typography>
                  <Select 
                    label="Select Type" 
                    value={form.machineType} 
                    onChange={(val) => handleSelectChange("machineType", val)}
                  >
                    <Option value="DROP_MACHINE">Drop Machine</Option>
                    <Option value="VENDING_MACHINE">Vending Machine</Option>
                  </Select>
                </div>
              </div>

              {/* Kolom 2: Lokasi & Koordinat */}
              <div className="space-y-4">
                <Typography variant="h6" color="blue-gray" className="-mb-2">Location Detail</Typography>
                <InputGroup label="District (Kecamatan)" name="district" value={form.district} onChange={handleChange} placeholder="Menteng" />
                <InputGroup label="Sub-district (Kelurahan)" name="subdistrict" value={form.subdistrict} onChange={handleChange} placeholder="Cikini" />
                <InputGroup label="Place Name" name="placeName" value={form.placeName} onChange={handleChange} placeholder="Stasiun Cikini" />
                
                <div className="grid grid-cols-2 gap-2">
                  <InputGroup label="Latitude" name="latitude" value={form.latitude} onChange={handleChange} placeholder="-6.123" />
                  <InputGroup label="Longitude" name="longitude" value={form.longitude} onChange={handleChange} placeholder="106.123" />
                </div>
              </div>

              {/* Kolom 3: Alamat & Deskripsi */}
              <div className="space-y-4">
                <Typography variant="h6" color="blue-gray" className="-mb-2">Additional Info</Typography>
                <div className="space-y-1">
                  <Typography variant="small" className="font-bold text-blue-900 ml-1">Location Type</Typography>
                  <Select 
                    label="Select Location Type" 
                    value={form.locationType} 
                    onChange={(val) => handleSelectChange("locationType", val)}
                  >
                    <Option value="INDOOR">Indoor</Option>
                    <Option value="OUTDOOR">Outdoor</Option>
                    <Option value="PUBLIC">Public Space</Option>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Typography variant="small" className="font-bold text-blue-900 ml-1">Full Address</Typography>
                  <Textarea name="address" value={form.address} onChange={handleChange} placeholder="Jl. Pegangsaan Timur No. 1..." labelProps={{ className: "hidden" }} className="!border-t-blue-gray-200 focus:!border-blue-500" />
                </div>

                <div className="space-y-1">
                  <Typography variant="small" className="font-bold text-blue-900 ml-1">Description</Typography>
                  <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Keterangan tambahan unit..." labelProps={{ className: "hidden" }} className="!border-t-blue-gray-200 focus:!border-blue-500" />
                </div>
              </div>

            </div>
          </DialogBody>

          <DialogFooter className="space-x-2 border-t border-gray-50 px-8 py-4">
            <Button variant="text" color="red" onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button className="bg-[#4CAF50] px-10 flex items-center gap-2" onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner className="h-4 w-4" /> : "Save Machine"}
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
};

const InputGroup = ({ label, name, value, onChange, placeholder }) => (
  <div className="space-y-1">
    <Typography variant="small" className="font-bold text-blue-900 ml-1">{label}</Typography>
    <Input name={name} value={value} onChange={onChange} placeholder={placeholder} labelProps={{ className: "hidden" }} className="!border-t-blue-gray-200 focus:!border-blue-500 bg-gray-50/50 shadow-sm" />
  </div>
);

export default CreateModal;