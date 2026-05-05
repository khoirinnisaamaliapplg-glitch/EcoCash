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
} from "@material-tailwind/react";
import {
  XMarkIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon
} from "@heroicons/react/24/outline";
import axios from "axios";
// 1. Import toast
import toast from "react-hot-toast";

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
    setLoading(false);
    handleOpen();
  };

  const handleSubmit = async () => {
    // 2. Validasi dengan Toast Error
    if (!form.name.trim()) return toast.error("Nama produk wajib diisi!");
    if (!form.price || Number(form.price) <= 0) return toast.error("Harga harus lebih dari 0!");
    if (!form.storeId) return toast.error("ID Toko tidak ditemukan!");

    setLoading(true);
    
    // 3. Gunakan toast.promise untuk UX yang lebih baik
    const token = localStorage.getItem("token");
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock || 0),
      weight: Number(form.weight || 0),
      storeId: Number(form.storeId), 
    };

    const postAction = axios.post("http://localhost:3000/api/products", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.promise(postAction, {
      loading: 'Sedang menyimpan produk...',
      success: () => {
        handleClose();
        if (refreshData) refreshData();
        return <b>Produk berhasil ditambahkan!</b>;
      },
      error: (err) => err.response?.data?.message || "Gagal menyimpan produk.",
    }, {
      style: { minWidth: '250px' },
      success: { duration: 3000 },
    });

    try {
      await postAction;
    } catch (error) {
      console.error(error);
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
          <Typography variant="h5" color="blue-gray" className="font-black uppercase tracking-tight">
            Tambah Produk Baru
          </Typography>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleClose}>
          <XMarkIcon className="h-6 w-6" strokeWidth={2} />
        </IconButton>
      </DialogHeader>

      <DialogBody className="px-6 py-4 overflow-y-auto max-h-[70vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bagian Kiri: Identitas */}
          <div className="space-y-5">
            <div>
              <Typography className="font-bold text-blue-900 text-[11px] uppercase tracking-wider mb-2">
                Informasi Produk
              </Typography>
              <div className="space-y-4">
                <Input 
                  label="Nama Produk" 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  color="blue"
                />
                <Textarea 
                  label="Deskripsi Detail" 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  color="blue"
                />
              </div>
            </div>
          </div>

          {/* Bagian Kanan: Logistik & Harga */}
          <div className="space-y-5">
            <div>
              <Typography className="font-bold text-blue-900 text-[11px] uppercase tracking-wider mb-2">
                Store & Harga
              </Typography>
              <div className="space-y-4">
                <Input 
                  label="ID Toko" 
                  name="storeId" 
                  disabled 
                  icon={<BuildingStorefrontIcon className="h-4 w-4" />}
                  value={form.storeId} 
                  className="bg-gray-50/50"
                />

                <Input 
                  label="Harga Jual (Rp)" 
                  name="price" 
                  type="number" 
                  icon={<CurrencyDollarIcon className="h-4 w-4" />} 
                  value={form.price} 
                  onChange={handleChange}
                  color="blue"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Jumlah Stok" 
                    name="stock" 
                    type="number" 
                    value={form.stock} 
                    onChange={handleChange}
                    color="blue"
                  />
                  <Input 
                    label="Berat (Gram)" 
                    name="weight" 
                    type="number" 
                    value={form.weight} 
                    onChange={handleChange}
                    color="blue"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="p-6 gap-3 border-t border-gray-50">
        <Button 
          variant="text" 
          color="red" 
          onClick={handleClose} 
          className="normal-case font-bold"
          disabled={loading}
        >
          Batal
        </Button>
        <Button 
          variant="gradient" 
          color="blue" 
          onClick={handleSubmit} 
          disabled={loading || !form.storeId}
          className="flex items-center gap-2 px-8 rounded-xl normal-case"
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Simpan Produk"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddProductModal;