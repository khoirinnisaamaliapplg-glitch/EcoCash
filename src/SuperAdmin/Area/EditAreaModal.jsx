import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Select,
  Option,
  Typography,
} from "@material-tailwind/react";
import api from "../../utils/api"; 
import axios from "axios";
import { toast } from 'react-toastify';

const EditAreaModal = ({ open, setOpen, selectedArea, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  
  const [formData, setFormData] = useState({ 
    name: "", 
    province: "", 
    code: "", 
    regencyName: "", 
    regencyType: "" 
  });

  // 1. Load semua provinsi saat modal dibuka
  useEffect(() => {
    if (open) {
      axios.get("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
        .then(res => setProvinces(res.data))
        .catch(() => toast.error("Gagal memuat data wilayah pusat"));
    }
  }, [open]);

  // 2. Sinkronisasi data selectedArea ke form & Load Kabupaten lama
  useEffect(() => {
    if (open && selectedArea && provinces.length > 0) {
      setFormData({
        name: selectedArea.name || "",
        province: selectedArea.province || "",
        code: selectedArea.code || "",
        regencyName: selectedArea.regencyName || "",
        regencyType: selectedArea.regencyType || "",
      });

      // Cari ID provinsi berdasarkan nama untuk load daftar kabupaten yang sesuai
      const foundProv = provinces.find(p => p.name === selectedArea.province);
      if (foundProv) {
        axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${foundProv.id}.json`)
          .then(res => setRegencies(res.data))
          .catch(err => console.error("Error loading regencies:", err));
      }
    }
  }, [selectedArea, open, provinces]);

  // 3. Handle saat Provinsi diganti manual
  const handleProvinceChange = async (val) => {
    if (!val) return;
    
    // Set provinsi baru dan reset kabupaten
    setFormData(prev => ({ ...prev, province: val, regencyName: "" }));
    setRegencies([]); // Kosongkan daftar kabupaten lama

    const selectedProv = provinces.find(p => p.name === val);
    if (selectedProv) {
      try {
        const response = await axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProv.id}.json`);
        setRegencies(response.data);
      } catch (error) {
        toast.error("Gagal mengambil daftar Kabupaten");
      }
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.code || !formData.province || !formData.regencyName) {
      toast.warning("Lengkapi data wilayah sebelum menyimpan.");
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/areas/${selectedArea.id}`, formData);
      toast.success("Data wilayah berhasil diperbarui!");
      handleClose();
      if (refreshData) refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memperbarui data");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setRegencies([]);
  };

  return (
    <Dialog 
      open={open} 
      handler={loading ? () => {} : handleClose} 
      size="sm"
      className="rounded-[1.5rem] md:rounded-[2rem] p-2 md:p-4 bg-white shadow-2xl min-w-[90%] md:min-w-[450px]"
    >
      <DialogHeader className="text-blue-900 font-black uppercase italic tracking-wider">
        Edit Wilayah
      </DialogHeader>

      <DialogBody className="space-y-4 max-h-[65vh] overflow-y-auto px-4">
        {/* Identitas Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Typography className="text-[10px] font-black text-blue-600 ml-1 uppercase italic">ID Code</Typography>
            <Input 
              label="Kode Area" 
              value={formData.code} 
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
              color="blue" 
            />
          </div>
          <div className="space-y-1">
            <Typography className="text-[10px] font-black text-blue-600 ml-1 uppercase italic">Display Name</Typography>
            <Input 
              label="Nama Area" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              color="blue" 
            />
          </div>
        </div>

        {/* Dropdown Provinsi */}
        <div className="space-y-1">
          <Typography className="text-[10px] font-black text-blue-600 ml-1 uppercase italic">Province</Typography>
          <Select
            key={`prov-${formData.province}`} // Trik agar value tampil
            label="Pilih Provinsi"
            value={formData.province}
            onChange={(val) => handleProvinceChange(val)}
            color="blue"
          >
            {provinces.map((prov) => (
              <Option key={prov.id} value={prov.name} className="text-sm">
                {prov.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Dropdown Kabupaten */}
        <div className="space-y-1">
          <Typography className="text-[10px] font-black text-blue-600 ml-1 uppercase italic">Regency / City</Typography>
          <Select
            key={`reg-${formData.regencyName}`} // Trik agar value tampil
            label="Pilih Kabupaten/Kota"
            value={formData.regencyName}
            disabled={!formData.province || regencies.length === 0}
            onChange={(val) => setFormData({ ...formData, regencyName: val })}
            color="blue"
          >
            {regencies.map((reg) => (
              <Option key={reg.id} value={reg.name} className="text-sm">
                {reg.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Klasifikasi */}
        <div className="space-y-1">
          <Typography className="text-[10px] font-black text-blue-600 ml-1 uppercase italic">Classification</Typography>
          <Select 
            label="Tipe Wilayah" 
            value={formData.regencyType} 
            onChange={(val) => setFormData({...formData, regencyType: val})}
            color="blue"
          >
            <Option value="KOTA">KOTA</Option>
            <Option value="KABUPATEN">KABUPATEN</Option>
          </Select>
        </div>
      </DialogBody>

      <DialogFooter className="flex flex-col-reverse md:flex-row gap-2 px-4 pb-4">
        <Button 
          variant="text" 
          color="red" 
          onClick={handleClose} 
          className="w-full md:w-auto font-black uppercase italic text-[11px]"
        >
          Batal
        </Button>
        <Button 
          className="bg-blue-600 w-full md:w-auto rounded-full px-10 font-black uppercase italic text-[11px] shadow-lg" 
          onClick={handleUpdate} 
          disabled={loading}
        >
          {loading ? "Saving..." : "Simpan Perubahan"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditAreaModal;