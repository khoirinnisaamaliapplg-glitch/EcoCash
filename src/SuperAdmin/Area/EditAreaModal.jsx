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
import axios from "axios";
import { toast } from 'react-toastify'; // Import Toast

const EditAreaModal = ({ open, setOpen, selectedArea, refreshData }) => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: "", 
    province: "", 
    code: "", 
    regencyName: "", 
    regencyType: "" 
  });

  useEffect(() => {
    if (open && selectedArea) {
      setFormData({
        name: selectedArea.name || "",
        province: selectedArea.province || "",
        code: selectedArea.code || "",
        regencyName: selectedArea.regencyName || "",
        regencyType: selectedArea.regencyType || "",
      });
    }
  }, [selectedArea, open]);

  const handleUpdate = async () => {
    // Validasi Dasar
    if (!formData.name || !formData.code) {
      toast.warning("Nama dan Kode Area tidak boleh kosong");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      await axios.patch(`http://localhost:3000/api/areas/${selectedArea.id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      // Feedback sukses
      toast.success("Data wilayah berhasil diperbarui!");
      
      // Tutup modal dan refresh data
      handleClose();
      if (refreshData) refreshData();
      
    } catch (error) {
      console.error("Gagal update area:", error.response?.data);
      const msg = error.response?.data?.message || "Terjadi kesalahan pada server.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog 
      open={open} 
      handler={loading ? () => {} : handleClose} 
      size="sm"
      className="rounded-2xl p-2 md:p-4"
    >
      <DialogHeader className="text-blue-900 font-bold uppercase text-xl">
        Edit Data Wilayah
      </DialogHeader>

      <DialogBody className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
        <div className="flex flex-col gap-4">
          <Input 
            label="Kode Area" 
            value={formData.code} 
            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
            color="blue" 
          />
          <Input 
            label="Nama Area" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            color="blue" 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Provinsi" 
              value={formData.province} 
              onChange={(e) => setFormData({...formData, province: e.target.value})} 
              color="blue" 
            />
            <Input 
              label="Kabupaten/Kota" 
              value={formData.regencyName} 
              onChange={(e) => setFormData({...formData, regencyName: e.target.value})} 
              color="blue" 
            />
          </div>
          
          <Select 
            label="Tipe Wilayah" 
            value={formData.regencyType} 
            onChange={(val) => setFormData({...formData, regencyType: val})}
          >
            <Option value="KOTA">KOTA</Option>
            <Option value="KABUPATEN">KABUPATEN</Option>
          </Select>
        </div>
      </DialogBody>

      <DialogFooter className="flex flex-col-reverse md:flex-row gap-2">
        <Button 
          variant="text" 
          color="red" 
          onClick={handleClose} 
          disabled={loading} 
          className="w-full md:w-auto rounded-xl"
        >
          Batal
        </Button>
        <Button 
          className="bg-blue-600 w-full md:w-auto rounded-xl px-10" 
          onClick={handleUpdate} 
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditAreaModal;