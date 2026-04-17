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
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import axios from "axios";

const AddAreaModal = ({ open, setOpen, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState("");
  const [newArea, setNewArea] = useState({
    code: "",
    name: "",
    province: "",
    regencyName: "",
    regencyType: "",
  });

  const handleSave = async () => {
    if (!newArea.code || !newArea.name || !newArea.regencyType) {
      setErrorMessage("Mohon lengkapi field yang wajib diisi.");
      setStatus("error");
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

      // Jika berhasil, ubah status ke success
      setStatus("success");
      
      // Tunggu 2 detik lalu tutup modal dan refresh data
      setTimeout(() => {
        handleClose();
        if (refreshData) refreshData();
      }, 2000);

    } catch (error) {
      console.error("Error Detail:", error.response?.data);
      setErrorMessage(error.response?.data?.message || "Terjadi kesalahan pada server.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk reset modal saat ditutup
  const handleClose = () => {
    setOpen(false);
    // Reset state setelah modal tertutup sepenuhnya
    setTimeout(() => {
      setStatus(null);
      setErrorMessage("");
      setNewArea({ code: "", name: "", province: "", regencyName: "", regencyType: "" });
    }, 300);
  };

  return (
    <Dialog open={open} handler={handleClose} size="sm" className="rounded-2xl p-4">
      {/* 1. TAMPILAN JIKA SUKSES */}
      {status === "success" ? (
        <div className="flex flex-col items-center py-10">
          <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4 animate-bounce" />
          <Typography variant="h4" color="blue-gray" className="font-bold">
            Berhasil!
          </Typography>
          <Typography className="text-gray-600 font-medium">
            Wilayah baru telah ditambahkan ke sistem.
          </Typography>
        </div>
      ) : status === "error" ? (
        /* 2. TAMPILAN JIKA ERROR */
        <div className="flex flex-col items-center py-10 text-center">
          <XCircleIcon className="h-20 w-20 text-red-500 mb-4" />
          <Typography variant="h4" color="blue-gray" className="font-bold">
            Gagal Menyimpan
          </Typography>
          <Typography className="text-red-500 font-medium px-6">
            {errorMessage}
          </Typography>
          <Button 
            className="mt-6 bg-red-500" 
            onClick={() => setStatus(null)} // Kembali ke form
          >
            Coba Lagi
          </Button>
        </div>
      ) : (
        /* 3. TAMPILAN FORM (NORMAL) */
        <>
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
              className="bg-blue-600 px-8" 
              onClick={handleSave} 
              disabled={loading}
            >
              {loading ? "Proses..." : "Simpan Area"}
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
};

export default AddAreaModal;