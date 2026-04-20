import React, { useEffect, useState } from "react";
import {
  Dialog, DialogHeader, DialogBody, DialogFooter,
  Input, Button, Typography, IconButton, Textarea, Spinner, Select, Option,
} from "@material-tailwind/react";
import { XMarkIcon, CpuChipIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";

const EditModal = ({ open, handleOpen, data, refreshData }) => {
  const [formData, setFormData] = useState({});
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // 1. Inisialisasi data & Bersihkan ID
  useEffect(() => {
    if (data && open) {
      // Pastikan ID murni angka (mencegah error :1:1)
      const cleanId = parseInt(data.id);
      
      setFormData({
        id: cleanId,
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

  // 2. Load Daftar Area
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
          console.error("Gagal load area:", err);
        }
      };
      fetchAreas();
    }
  }, [open]);

  // 3. Fungsi Update (PATCH)
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!formData.id || isNaN(formData.id)) {
        alert("ID Mesin tidak valid.");
        setLoading(false);
        return;
      }

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

      // Eksekusi PATCH
      await axios.patch(`http://localhost:3000/api/machines/${formData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatus("success");
      setTimeout(() => {
        setStatus(null);
        handleOpen();
        if (refreshData) refreshData();
      }, 1500);
    } catch (error) {
      console.error("PATCH ERROR:", error.response?.data);
      alert(error.response?.data?.message || "Error 404: Route PATCH /api/machines/:id tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} handler={handleOpen} size="xl" className="rounded-xl flex flex-col max-h-[95vh]">
      <DialogHeader className="flex justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <CpuChipIcon className="h-6 w-6 text-blue-600" />
          <Typography variant="h5">Edit Mesin: {formData.machineCode}</Typography>
        </div>
        <IconButton variant="text" onClick={handleOpen}><XMarkIcon className="h-5 w-5" /></IconButton>
      </DialogHeader>

      <DialogBody className="overflow-y-auto px-6 py-4 flex-grow">
        {status === "success" ? (
          <div className="flex flex-col items-center py-10">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mb-2" />
            <Typography variant="h4" color="green">Berhasil Diupdate!</Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Select label="Area" value={formData.areaId} onChange={(v) => setFormData(p => ({...p, areaId: v}))}>
                {areas.map(a => <Option key={a.id} value={a.id.toString()}>{a.name}</Option>)}
              </Select>
              <Input label="Kode Mesin" name="machineCode" value={formData.machineCode} onChange={handleChange} />
              <Input label="Nama Mesin" name="name" value={formData.name} onChange={handleChange} />
              <Select label="Tipe Mesin" value={formData.machineType} onChange={(v) => setFormData(p => ({...p, machineType: v}))}>
                <Option value="BOX">BOX</Option>
                <Option value="CONTAINER">CONTAINER</Option>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Latitude" name="latitude" value={formData.latitude} onChange={handleChange} />
                <Input label="Longitude" name="longitude" value={formData.longitude} onChange={handleChange} />
              </div>
              <Textarea label="Alamat" name="address" value={formData.address} onChange={handleChange} />
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="border-t p-4 gap-2">
        <Button variant="text" color="red" onClick={handleOpen}>Batal</Button>
        <Button variant="gradient" color="blue" onClick={handleUpdate} disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : "Simpan Perubahan"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditModal;