import React, { useState, useEffect } from "react";
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
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  PencilSquareIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline";
import axios from "axios";

const EditModal = ({ open, handleOpen, data, refreshData }) => {
  // 1. State Management
  const [formData, setFormData] = useState({
    machineCode: "",
    name: "",
    areaId: "",
    machineType: "BOX",
    locationType: "OTHER",
    placeName: "",
    latitude: "0",
    longitude: "0",
    address: "",
    district: "",
    subdistrict: "",
    description: "",
  });
  
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorDetails, setErrorDetails] = useState("");

  // 2. Inisialisasi data & Bersihkan ID (Logika dari Kode Kedua)
  useEffect(() => {
    if (data && open) {
      setFormData({
        id: parseInt(data.id),
        machineCode: data.machineCode || "",
        name: data.name || "",
        areaId: data.areaId?.toString() || "",
        machineType: data.machineType || "BOX",
        locationType: data.locationType || "OTHER",
        placeName: data.placeName || "",
        latitude: data.latitude?.toString() || "0",
        longitude: data.longitude?.toString() || "0",
        address: data.address || "",
        district: data.district || "",
        subdistrict: data.subdistrict || "",
        description: data.description || "",
      });
    }
  }, [data, open]);

  // 3. Load Daftar Area untuk Dropdown Select
  useEffect(() => {
    if (open) {
      const fetchAreas = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:3000/api/areas", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAreas(response.data.data || response.data);
        } catch (err) {
          console.error("Gagal load daftar area:", err);
        }
      };
      fetchAreas();
    }
  }, [open]);

  // 4. Handler Perubahan Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 5. Fungsi Update (PATCH)
  const handleUpdate = async () => {
    if (!formData.name?.trim()) {
      alert("Nama mesin wajib diisi.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        machineCode: formData.machineCode?.trim(),
        name: formData.name?.trim(),
        areaId: parseInt(formData.areaId),
        machineType: formData.machineType,
        locationType: formData.locationType,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
        placeName: formData.placeName,
        district: formData.district,
        subdistrict: formData.subdistrict,
        description: formData.description
      };

      await axios.patch(`http://localhost:3000/api/machines/${formData.id}`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      setStatus("success");
      setTimeout(() => {
        setStatus(null);
        handleOpen();
        if (refreshData) refreshData();
      }, 1500);

    } catch (error) {
      console.error("PATCH ERROR:", error.response?.data);
      setStatus("error");
      setErrorDetails(error.response?.data?.message || "Gagal memperbarui data mesin.");
    } finally {
      setLoading(false);
    }
  };

  const locationOptions = [
    "OFFICE", "HOTEL", "MALL", "MARKET", "SCHOOL_CAMPUS", 
    "RT_RW", "PARK", "HOSPITAL", "OTHER"
  ];

  return (
    <Dialog 
      open={open} 
      handler={handleOpen} 
      size="xl" 
      className="rounded-xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
    >
      {/* Header - Style Visual Rapi */}
      <DialogHeader className="flex justify-between items-center border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <PencilSquareIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <Typography variant="h5" color="blue-gray" className="font-bold">
              Edit Data Mesin
            </Typography>
            <Typography className="text-xs text-blue-600 font-bold uppercase tracking-tight">
              ID Database: {formData.id}
            </Typography>
          </div>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen}>
          <XMarkIcon className="h-5 w-5" strokeWidth={2} />
        </IconButton>
      </DialogHeader>

      {/* Body - Layout Grid 2 Kolom */}
      <DialogBody className="overflow-y-auto px-6 py-4 flex-grow">
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4 animate-bounce" />
            <Typography variant="h4" className="text-green-700 font-bold">Update Berhasil!</Typography>
            <Typography className="text-gray-500">Informasi mesin telah diperbarui.</Typography>
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <XCircleIcon className="h-20 w-20 text-red-500 mb-4" />
            <Typography variant="h5" color="red" className="font-bold">Gagal Update</Typography>
            <Typography color="red" className="mt-2 text-sm">{errorDetails}</Typography>
            <Button variant="outlined" color="red" onClick={() => setStatus(null)} className="mt-6 rounded-lg">Coba Lagi</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Kolom 1: Identitas & Area */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Identitas & Area</Typography>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Select 
                  label="Area Lokasi" 
                  value={formData.areaId} 
                  onChange={(v) => handleSelectChange("areaId", v)}
                >
                  {areas.map((a) => (
                    <Option key={a.id} value={a.id.toString()}>{a.name}</Option>
                  ))}
                </Select>
                <Input label="Kode Mesin" name="machineCode" value={formData.machineCode} onChange={handleChange} />
                <Input label="Nama Tampilan Mesin" name="name" value={formData.name} onChange={handleChange} color="blue" />
                <Select label="Tipe Sistem" value={formData.machineType} onChange={(v) => handleSelectChange("machineType", v)}>
                  <Option value="BOX">BOX SYSTEM</Option>
                  <Option value="CONTAINER">CONTAINER SYSTEM</Option>
                </Select>
              </div>
            </div>

            {/* Kolom 2: Lokasi & Koordinat */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-l-4 border-green-500 pl-3">
                <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Lokasi & Koordinat</Typography>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nama Tempat/Gedung" name="placeName" value={formData.placeName} onChange={handleChange} />
                  <Select label="Kategori Lokasi" value={formData.locationType} onChange={(v) => handleSelectChange("locationType", v)}>
                    {locationOptions.map((opt) => (
                      <Option key={opt} value={opt}>{opt.replace("_", " ")}</Option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Latitude" name="latitude" value={formData.latitude} onChange={handleChange} />
                  <Input label="Longitude" name="longitude" value={formData.longitude} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Kecamatan" name="district" value={formData.district} onChange={handleChange} />
                  <Input label="Kelurahan" name="subdistrict" value={formData.subdistrict} onChange={handleChange} />
                </div>
                <Textarea label="Alamat Lengkap" name="address" rows={2} value={formData.address} onChange={handleChange} />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="lg:col-span-2 pt-2">
              <div className="flex items-center gap-2 border-l-4 border-orange-400 pl-3 mb-4">
                <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Informasi Tambahan</Typography>
              </div>
              <Textarea label="Catatan Deskripsi" name="description" rows={2} value={formData.description} onChange={handleChange} />
            </div>
          </div>
        )}
      </DialogBody>

      {/* Footer */}
      <DialogFooter className="border-t border-gray-100 p-4 gap-2">
        {!status && (
          <>
            <Button variant="text" color="red" onClick={handleOpen} disabled={loading} className="normal-case rounded-lg">
              Batal
            </Button>
            <Button 
              variant="gradient" 
              color="blue" 
              onClick={handleUpdate} 
              disabled={loading} 
              className="flex items-center gap-2 normal-case rounded-lg px-8"
            >
              {loading ? <Spinner className="h-4 w-4" /> : "Simpan Perubahan"}
            </Button>
          </>
        )}
      </DialogFooter>
    </Dialog>
  );
};

export default EditModal;