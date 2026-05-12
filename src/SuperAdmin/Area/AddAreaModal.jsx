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
import { toast } from 'react-toastify';
import axios from "axios";

const AddAreaModal = ({ open, setOpen, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  
  const [newArea, setNewArea] = useState({
    code: "",
    name: "",
    province: "",
    regencyName: "",
    regencyType: "",
  });

  useEffect(() => {
    if (open) {
      const fetchProvinces = async () => {
        try {
          const response = await axios.get("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
          setProvinces(response.data);
        } catch (error) {
          toast.error("Gagal memuat data provinsi");
        }
      };
      fetchProvinces();
    }
  }, [open]);

  const handleProvinceChange = async (val) => {
    const selectedProv = provinces.find(p => p.name === val);
    setNewArea({ ...newArea, province: val, regencyName: "" });
    
    if (selectedProv) {
      try {
        const response = await axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProv.id}.json`);
        setRegencies(response.data);
      } catch (error) {
        toast.error("Gagal memuat data kabupaten");
      }
    }
  };

  const handleSave = async () => {
    if (!newArea.code || !newArea.name || !newArea.province || !newArea.regencyName) {
      toast.warning("Mohon lengkapi semua data wilayah.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/areas/", newArea);
      toast.success(`Wilayah ${newArea.name} berhasil ditambahkan!`);
      handleClose();
      if (refreshData) refreshData();
    } catch (error) {
      const msg = error.response?.data?.message || "Terjadi kesalahan pada server.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setNewArea({ code: "", name: "", province: "", regencyName: "", regencyType: "" });
      setRegencies([]);
    }, 300);
  };

  return (
    <Dialog 
      open={open} 
      handler={handleClose} 
      // Mengatur ukuran agar responsif (sm di desktop, full di mobile)
      size="sm" 
      className="rounded-[1.5rem] md:rounded-[2rem] p-2 md:p-4 bg-white shadow-2xl mx-auto min-w-[90%] md:min-w-[450px]"
    >
      <DialogHeader className="text-blue-900 font-black uppercase italic tracking-wider text-lg md:text-xl">
        Tambah Wilayah
      </DialogHeader>

      <DialogBody className="space-y-4 max-h-[70vh] overflow-y-auto px-4">
        {/* Grid 1 kolom di mobile, 2 kolom di tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Typography className="text-[10px] font-black text-blue-600 ml-1 uppercase italic">ID Code</Typography>
            <Input
              label="Kode Wilayah"
              value={newArea.code}
              onChange={(e) => setNewArea({ ...newArea, code: e.target.value })}
              color="blue"
            />
          </div>
          <div className="space-y-1">
            <Typography className="text-[10px] font-black text-blue-600 ml-1 uppercase italic">Display Name</Typography>
            <Input
              label="Nama Area"
              value={newArea.name}
              onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
              color="blue"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Typography className="text-[10px] font-black text-blue-600 ml-1 uppercase italic">Region / Province</Typography>
          <Select
            label="Pilih Provinsi"
            value={newArea.province}
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

        <div className="space-y-1">
          <Typography className="text-[10px] font-black text-blue-600 ml-1 uppercase italic">City / Regency</Typography>
          <Select
            label="Pilih Kabupaten/Kota"
            value={newArea.regencyName}
            disabled={!newArea.province}
            onChange={(val) => setNewArea({ ...newArea, regencyName: val })}
            color="blue"
          >
            {regencies.map((reg) => (
              <Option key={reg.id} value={reg.name} className="text-sm">
                {reg.name}
              </Option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <Typography className="text-[10px] font-black text-blue-600 ml-1 uppercase italic">Classification</Typography>
          <Select
            label="Tipe Wilayah"
            value={newArea.regencyType}
            onChange={(val) => setNewArea({ ...newArea, regencyType: val })}
            color="blue"
          >
            <Option value="KOTA" className="font-bold">KOTA</Option>
            <Option value="KABUPATEN" className="font-bold">KABUPATEN</Option>
          </Select>
        </div>
      </DialogBody>

      <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 px-4 pb-4">
        <Button 
          variant="text" 
          color="red" 
          onClick={handleClose} 
          disabled={loading}
          className="w-full sm:w-auto font-black uppercase italic text-[11px]"
        >
          Batal
        </Button>
        <Button 
          className="w-full sm:w-auto bg-blue-600 px-8 rounded-full font-black uppercase italic text-[11px] shadow-lg flex justify-center items-center" 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? "Syncing..." : "Simpan Area"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddAreaModal;