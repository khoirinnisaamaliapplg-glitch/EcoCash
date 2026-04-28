import React, { useState } from "react";
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

const AddAreaModal = ({ open, setOpen, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [newArea, setNewArea] = useState({
    code: "",
    name: "",
    province: "",
    regencyName: "",
    regencyType: "",
  });

  const handleSave = async () => {
    // Validasi Dasar
    if (!newArea.code || !newArea.name || !newArea.regencyType) {
      toast.warning("Mohon lengkapi field yang wajib diisi (Kode, Nama, Tipe).");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/api/areas/", newArea, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      // Feedback Sukses
      toast.success(`Wilayah ${newArea.name} berhasil ditambahkan!`);
      
      // Langsung tutup dan refresh
      handleClose();
      if (refreshData) refreshData();

    } catch (error) {
      console.error("Error Detail:", error.response?.data);
      const msg = error.response?.data?.message || "Terjadi kesalahan pada server.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk reset modal saat ditutup
  const handleClose = () => {
    setOpen(false);
    // Reset form setelah animasi tutup modal selesai
    setTimeout(() => {
      setNewArea({ code: "", name: "", province: "", regencyName: "", regencyType: "" });
    }, 300);
  };

  return (
    <Dialog open={open} handler={handleClose} size="sm" className="rounded-2xl p-4">
      <DialogHeader className="text-blue-900 font-bold uppercase">
        Tambah Wilayah Baru
      </DialogHeader>

      <DialogBody className="space-y-4">
        <Input
          label="Kode Wilayah"
          value={newArea.code}
          onChange={(e) => setNewArea({ ...newArea, code: e.target.value })}
        />
        <Input
          label="Nama Area"
          value={newArea.name}
          onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Provinsi"
            value={newArea.province}
            onChange={(e) => setNewArea({ ...newArea, province: e.target.value })}
          />
          <Input
            label="Kabupaten/Kota"
            value={newArea.regencyName}
            onChange={(e) => setNewArea({ ...newArea, regencyName: e.target.value })}
          />
        </div>
        <Select
          label="Tipe Wilayah"
          value={newArea.regencyType}
          onChange={(val) => setNewArea({ ...newArea, regencyType: val })}
        >
          <Option value="KOTA">KOTA</Option>
          <Option value="KABUPATEN">KABUPATEN</Option>
        </Select>
      </DialogBody>

      <DialogFooter className="gap-2">
        <Button variant="text" color="red" onClick={handleClose} disabled={loading}>
          Batal
        </Button>
        <Button 
          className="bg-blue-600 px-8 flex items-center gap-2" 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? "Proses..." : "Simpan Area"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddAreaModal;