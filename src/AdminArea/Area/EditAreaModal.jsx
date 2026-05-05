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
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import axios from "axios";
// 1. IMPORT TOAST
import { toast } from "react-hot-toast";

const EditAreaModal = ({ open, setOpen, selectedArea, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState("");
  
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
    // 2. TOAST UNTUK VALIDASI
    if (!formData.name || !formData.code) {
      toast.error("Nama dan Kode Area wajib diisi!");
      setErrorMessage("Nama dan Kode Area tidak boleh kosong");
      setStatus("error");
      return;
    }

    setLoading(true);
    setStatus(null);
    const toastId = toast.loading("Sedang memperbarui data...");

    try {
      const token = localStorage.getItem("token");
      
      await axios.patch(`http://localhost:3000/api/areas/${selectedArea.id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      // 3. TOAST SUKSES
      toast.success("Wilayah berhasil diperbarui!", { id: toastId });
      setStatus("success");
      
      setTimeout(() => {
        handleClose();
        if (refreshData) refreshData();
      }, 1500);
      
    } catch (error) {
      console.error("Gagal update area:", error.response?.data);
      const msg = error.response?.data?.message || "Terjadi kesalahan pada server.";
      
      // 4. TOAST ERROR
      toast.error(msg, { id: toastId });
      setErrorMessage(msg);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStatus(null);
      setErrorMessage("");
    }, 300);
  };

  return (
    <Dialog 
      open={open} 
      handler={handleClose} 
      size="sm"
      className="rounded-2xl p-2 md:p-4"
    >
      {status === "success" ? (
        <div className="flex flex-col items-center py-10">
          <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4 animate-bounce" />
          <Typography variant="h4" color="blue-gray" className="font-bold">Update Berhasil!</Typography>
          <Typography className="text-gray-600 font-medium text-center">Data wilayah telah diperbarui.</Typography>
        </div>
      ) : status === "error" ? (
        <div className="flex flex-col items-center py-10 text-center">
          <XCircleIcon className="h-20 w-20 text-red-500 mb-4" />
          <Typography variant="h4" color="blue-gray" className="font-bold">Gagal Update</Typography>
          <Typography className="text-red-500 font-medium px-6 mt-2">{errorMessage}</Typography>
          <Button className="mt-6 bg-red-500 rounded-xl" onClick={() => setStatus(null)}>Coba Lagi</Button>
        </div>
      ) : (
        <>
          <DialogHeader className="text-blue-900 font-bold uppercase text-xl">Edit Data Wilayah</DialogHeader>
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
            <Button variant="text" color="red" onClick={handleClose} disabled={loading} className="w-full md:w-auto rounded-xl">Batal</Button>
            <Button className="bg-blue-600 w-full md:w-auto rounded-xl px-10" onClick={handleUpdate} disabled={loading}>
              {loading ? "Loading..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
};

export default EditAreaModal;