import React, { useState, useEffect, useCallback } from "react";
// 1. Ganti axios menjadi api (karena api.js sudah punya base URL & interceptor)
import api from "../../utils/api"; 
import MainLayout from "../MainLayout";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

import {
  Card,
  Typography,
  Button,
  IconButton,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";

import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// 2. Gunakan toast yang konsisten (sebelumnya kamu pakai react-hot-toast di modal lain)
// Jika di sini mau pakai react-toastify, pastikan ToastContainer ada di App.js atau di sini.
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Path API biasanya tidak perlu /api/v1 jika sudah diset di api.js
const API_URL = "/products/my"; 

const ProdukIndex = () => {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "name",
    order: "asc",
  });

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    stock: 0,
    price: 0,
    weight: 0,
    description: "",
    storeId: "",
  });

  // =========================
  // FETCH PRODUCTS
  // =========================
  // Menggunakan useCallback agar fungsi tidak dibuat ulang setiap render
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Gunakan instance 'api' yang sudah kita buat sebelumnya
      const response = await api.get(API_URL, {
        params: params,
      });

      // Sesuaikan dengan struktur respons backend EcoCash
      setProducts(response.data.data || []);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (error) {
      console.error("PRODUCT ERROR:", error);
      toast.error(error.response?.data?.message || "Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }, [params]);

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // =========================
  // SEARCH HANDLER
  // =========================
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setParams((prev) => ({ ...prev, page: 1 }));
      // fetchProducts akan otomatis terpanggil karena params berubah
    }
  };

  // =========================
  // MODAL HANDLERS
  // =========================
  const handleOpenAdd = () => setOpenAdd(!openAdd);

  const handleOpenEdit = (product) => {
    setFormData({
      id: product.id,
      name: product.name,
      stock: product.stock,
      price: product.price,
      weight: product.weight || 0,
      description: product.description || "",
      storeId: product.storeId,
    });
    setOpenEdit(true);
  };

  const handleOpenDelete = (product) => {
    setFormData(product);
    setOpenDelete(true);
  };

  // =========================
  // UPDATE PRODUCT
  // =========================
  const submitEdit = async () => {
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        weight: Number(formData.weight),
      };

      await api.patch(`/products/${formData.id}`, payload);
      toast.success("Produk berhasil diperbarui");
      setOpenEdit(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal update produk");
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================
  const submitDelete = async () => {
    try {
      await api.delete(`/products/${formData.id}`);
      toast.success("Produk berhasil dihapus");
      setOpenDelete(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus produk");
    }
  };

  return (
    <MainLayout>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="p-4 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Typography variant="h4" className="font-black text-blue-900 uppercase italic">
              Inventory Produk
            </Typography>
            <Typography className="text-gray-500 text-sm font-bold uppercase tracking-tight">
              Manajemen Stok & Harga EcoCash Store
            </Typography>
          </div>

          <Button
            onClick={handleOpenAdd}
            className="bg-blue-600 flex items-center gap-2 rounded-2xl shadow-lg uppercase font-black italic px-6"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" />
            Tambah Produk
          </Button>
        </div>

        {/* FILTER BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-[25px] border-2 border-blue-50 shadow-sm">
          <div className="md:col-span-2">
            <Input
              label="Cari Nama Produk..."
              icon={<MagnifyingGlassIcon className="h-5 w-5 text-blue-500" />}
              value={params.search}
              onChange={(e) => setParams({ ...params, search: e.target.value })}
              onKeyDown={handleSearch}
              className="rounded-xl"
            />
          </div>

          <Select
            label="Urutkan"
            value={params.sortBy}
            onChange={(v) => setParams({ ...params, sortBy: v })}
          >
            <Option value="name">Nama</Option>
            <Option value="price">Harga</Option>
            <Option value="stock">Stok</Option>
          </Select>

          <Select
            label="Order"
            value={params.order}
            onChange={(v) => setParams({ ...params, order: v })}
          >
            <Option value="asc">A-Z (Terkecil)</Option>
            <Option value="desc">Z-A (Terbesar)</Option>
          </Select>
        </div>

        {/* TABLE */}
        <Card className="overflow-hidden border-2 border-blue-100 rounded-[30px] shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50/50">
                  {["Info Produk", "Status Stok", "Harga Unit", "Aksi"].map((head) => (
                    <th key={head} className="p-5 text-[10px] font-black uppercase text-blue-900/60 tracking-widest border-b border-blue-100">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-blue-600 font-bold italic">Memuat data...</td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((row) => (
                    <tr key={row.id} className="border-b border-blue-50 hover:bg-blue-50/20 transition-all">
                      <td className="p-5">
                        <Typography className="font-black text-sm text-blue-900 uppercase">
                          {row.name}
                        </Typography>
                        <Typography className="text-[10px] text-gray-400 font-bold italic line-clamp-1">
                          {row.description || "Tidak ada deskripsi"}
                        </Typography>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                          row.stock < 10 ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
                        }`}>
                          {row.stock} Unit
                        </span>
                      </td>
                      <td className="p-5 text-sm font-black text-blue-800">
                        Rp {row.price.toLocaleString("id-ID")}
                      </td>
                      <td className="p-5 flex gap-2">
                        <IconButton variant="text" color="blue" onClick={() => handleOpenEdit(row)} className="bg-blue-50 rounded-xl">
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton variant="text" color="red" onClick={() => handleOpenDelete(row)} className="bg-red-50 rounded-xl">
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-gray-400 font-bold uppercase italic">Produk Kosong</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between p-5 border-t border-blue-50 bg-gray-50/50">
            <Typography className="text-[11px] font-black text-blue-900/50 uppercase italic">
              Page <span className="text-blue-700">{params.page}</span> of {totalPages}
            </Typography>
            <div className="flex gap-2">
              <Button
                variant="white"
                size="sm"
                className="rounded-xl border border-blue-100 shadow-sm font-black text-[10px] uppercase"
                onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}
                disabled={params.page === 1}
              >
                <ChevronLeftIcon className="h-3 w-3 mr-1" strokeWidth={3} /> Prev
              </Button>
              <Button
                variant="white"
                size="sm"
                className="rounded-xl border border-blue-100 shadow-sm font-black text-[10px] uppercase"
                onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
                disabled={params.page === totalPages}
              >
                Next <ChevronRightIcon className="h-3 w-3 ml-1" strokeWidth={3} />
              </Button>
            </div>
          </div>
        </Card>

        {/* MODALS */}
        <AddProductModal open={openAdd} handleOpen={handleOpenAdd} refreshData={fetchProducts} />
        <EditProductModal 
          open={openEdit} 
          setOpen={setOpenEdit} 
          formData={formData} 
          setFormData={setFormData} 
          handleUpdate={submitEdit} 
        />
        <DeleteConfirmModal 
          open={openDelete} 
          setOpen={setOpenDelete} 
          onConfirm={submitDelete} 
          productName={formData.name} 
        />
      </div>
    </MainLayout>
  );
};

export default ProdukIndex;