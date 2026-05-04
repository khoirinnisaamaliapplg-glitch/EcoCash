import React, { useState, useEffect } from "react"; // Tambahkan useEffect
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
} from "@material-tailwind/react";
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon
} from "@heroicons/react/24/outline";
import axios from "axios";

// Terima prop storeId dari ProdukIndex
const AddProductModal = ({ open, handleOpen, refreshData, storeId }) => {
  const initialState = {
    name: "",
    price: "",
    stock: "",
    weight: "",
    description: "",
    storeId: "", 
  };

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorDetails, setErrorDetails] = useState("");

  // Sinkronisasi: Update form.storeId ketika modal dibuka dan storeId tersedia
  useEffect(() => {
    if (open && storeId) {
      setForm((prev) => ({ ...prev, storeId: storeId }));
    }
  }, [open, storeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setForm(initialState);
    setStatus(null);
    setErrorDetails("");
    setLoading(false);
    handleOpen();
  };

  const handleSubmit = async () => {
    // Validasi dasar
    if (!form.name.trim() || !form.price || !form.storeId) {
      alert("Data belum lengkap!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock || 0),
        weight: Number(form.weight || 0),
        storeId: Number(form.storeId), 
      };

      const response = await axios.post("http://localhost:3000/api/products", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        setStatus("success");
        setTimeout(() => {
          handleClose();
          if (refreshData) refreshData();
        }, 1500);
      }
    } catch (error) {
      setStatus("error");
      setErrorDetails(error.response?.data?.message || "Gagal menyimpan produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={handleClose} size="lg" className="rounded-3xl">
      <DialogHeader className="flex justify-between items-center border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
          </div>
          <Typography variant="h5" color="blue-gray" className="font-black uppercase">
            Tambah Produk
          </Typography>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleClose}>
          <XMarkIcon className="h-6 w-6" strokeWidth={2} />
        </IconButton>
      </DialogHeader>

      <DialogBody className="px-6 py-4 overflow-y-auto max-h-[70vh]">
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4 animate-bounce" />
            <Typography variant="h4" className="text-green-700">Berhasil!</Typography>
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center justify-center py-12">
            <XCircleIcon className="h-20 w-20 text-red-500 mb-4" />
            <Typography variant="h5" color="red">{errorDetails}</Typography>
            <Button variant="outlined" color="red" onClick={() => setStatus(null)} className="mt-4">Coba Lagi</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Typography className="font-bold text-gray-800 text-xs uppercase">Informasi Produk</Typography>
              <Input label="Nama Produk" name="name" value={form.name} onChange={handleChange} />
              <Textarea label="Deskripsi" name="description" value={form.description} onChange={handleChange} />
            </div>

            <div className="space-y-4">
              <Typography className="font-bold text-gray-800 text-xs uppercase">Store & Harga</Typography>
              
              {/* INPUT STORE ID SEKARANG READ-ONLY / DISABLED KARENA OTOMATIS */}
              <Input 
                label="ID Toko (Terisi Otomatis)" 
                name="storeId" 
                type="number"
                disabled // User tidak perlu ubah ini manual
                icon={<BuildingStorefrontIcon className="h-4 w-4" />}
                value={form.storeId} 
                onChange={handleChange}
                className="bg-gray-50"
              />

              <Input 
                label="Harga (Rp)" 
                name="price" 
                type="number" 
                icon={<CurrencyDollarIcon className="h-4 w-4" />} 
                value={form.price} 
                onChange={handleChange} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Stok" name="stock" type="number" value={form.stock} onChange={handleChange} />
                <Input label="Berat (Gr)" name="weight" type="number" value={form.weight} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="p-4 gap-2">
        {!status && (
          <>
            <Button variant="text" color="red" onClick={handleClose}>Batal</Button>
            <Button 
              variant="gradient" 
              color="blue" 
              onClick={handleSubmit} 
              disabled={loading || !form.storeId} // Tombol mati jika storeId belum ada
              className="flex items-center gap-2"
            >
              {loading ? <Spinner className="h-4 w-4" /> : "Simpan"}
            </Button>
          </>
        )}
      </DialogFooter>
    </Dialog>
  );
};

export default AddProductModal;