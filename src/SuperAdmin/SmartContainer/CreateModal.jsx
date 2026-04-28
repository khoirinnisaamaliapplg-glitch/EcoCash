import React, { useState, useEffect } from "react";
import {
  Dialog, DialogHeader, DialogBody, DialogFooter,
  Input, Button, Typography, IconButton, Textarea, Spinner, Select, Option,
} from "@material-tailwind/react";
import { XMarkIcon, CpuChipIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from 'react-toastify';

const CreateModal = ({ open, handleOpen, refreshData }) => {
  const initialState = {
    machineCode: "",
    name: "",
    areaId: "",
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
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Ambil data area untuk dropdown
  useEffect(() => {
    if (open) {
      const fetchAreas = async () => {
        try {
          setLoadingAreas(true);
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:3000/api/areas", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const areaData = response.data.data || response.data;
          setAreas(Array.isArray(areaData) ? areaData.filter(a => a.isActive) : []);
        } catch (err) {
          console.error("Gagal load area:", err);
          toast.error("Gagal memuat daftar area.");
        } finally {
          setLoadingAreas(false);
        }
      };
      fetchAreas();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    // Validasi Dasar
    if (!form.machineCode.trim() || !form.name.trim() || !form.areaId) {
      toast.warning("Harap isi kolom wajib (Kode, Nama, Area)");
      return;
    }

    setLoading(true);
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
        toast.success("Mesin baru berhasil ditambahkan!");
        handleClose(); // Langsung tutup modal
        if (refreshData) refreshData(); 
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal menyimpan data ke server.";
      toast.error(msg);
    } finally { 
      setLoading(false); 
    }
  };

  const handleClose = () => {
    setForm(initialState);
    handleOpen(); 
  };

  const locationOptions = ["OFFICE", "HOTEL", "MALL", "MARKET", "SCHOOL_CAMPUS", "RT_RW", "PARK", "HOSPITAL", "OTHER"];

  return (
    <Dialog 
      open={open} 
      handler={handleClose} 
      size="xl" 
      className="rounded-xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col"
    >
      <DialogHeader className="flex justify-between items-center border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <CpuChipIcon className="h-6 w-6 text-blue-600" />
          </div>
          <Typography variant="h5" color="blue-gray" className="font-bold">
            Tambah Mesin Baru
          </Typography>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleClose}>
          <XMarkIcon className="h-5 w-5" strokeWidth={2} />
        </IconButton>
      </DialogHeader>

      <DialogBody className="overflow-y-auto px-6 py-4 flex-grow custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* COLUMN 1: UNIT INFO */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Informasi Unit</Typography>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Select 
                label="Pilih Area" 
                value={form.areaId.toString()} 
                onChange={(v) => handleSelectChange("areaId", v)}
                disabled={loadingAreas}
              >
                {areas.length > 0 ? areas.map((area) => (
                  <Option key={area.id} value={area.id.toString()}>{area.name}</Option>
                )) : (
                  <Option disabled>Tidak Ada Area Aktif</Option>
                )}
              </Select>
              <Input label="Kode Mesin (contoh: MC-01)" name="machineCode" value={form.machineCode} onChange={handleChange} />
              <Input label="Nama Mesin" name="name" value={form.name} onChange={handleChange} />
              <Select label="Tipe Mesin" value={form.machineType} onChange={(v) => handleSelectChange("machineType", v)}>
                <Option value="BOX">BOX</Option>
                <Option value="CONTAINER">KONTAINER</Option>
              </Select>
            </div>
          </div>

          {/* COLUMN 2: LOCATION */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-green-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Detail Penempatan</Typography>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nama Tempat (Gedung/Titik)" name="placeName" value={form.placeName} onChange={handleChange} />
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
              <Textarea label="Alamat Lengkap" name="address" rows={2} value={form.address} onChange={handleChange} />
            </div>
          </div>

          {/* FULL WIDTH SECTION */}
          <div className="lg:col-span-2 pt-2">
            <div className="flex items-center gap-2 border-l-4 border-orange-400 pl-3 mb-4">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Catatan Internal</Typography>
            </div>
            <Textarea label="Deskripsi Mesin" name="description" rows={2} value={form.description} onChange={handleChange} />
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="border-t border-gray-100 p-4 gap-2 flex-col sm:flex-row">
        <Button variant="text" color="gray" onClick={handleClose} className="w-full sm:w-auto">
          Batal
        </Button>
        <Button 
          variant="gradient" 
          color="blue" 
          onClick={handleSubmit} 
          disabled={loading} 
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Simpan Mesin"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateModal;