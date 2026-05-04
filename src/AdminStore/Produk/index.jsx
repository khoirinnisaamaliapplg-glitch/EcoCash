import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../MainLayout";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { Card, Typography, Button, IconButton, Input, Select, Option } from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";

const API_URL = "http://localhost:3000/api/products";
const STORE_API_URL = "http://localhost:3000/api/stores/my";

const ProdukIndex = () => {
  const [products, setProducts] = useState([]);
  const [myStore, setMyStore] = useState(null);
  
  // State untuk Query Params (Pagination, Search, Sort)
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "name",
    order: "asc"
  });

  const [totalPages, setTotalPages] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  
  const [formData, setFormData] = useState({ 
    id: "", name: "", stock: 0, price: 0, weight: 0, description: "", storeId: "" 
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const fetchMyStore = async () => {
    try {
      const response = await axios.get(STORE_API_URL, getAuthHeader());
      setMyStore(response.data.data);
    } catch (error) {
      toast.error("Gagal mengenali profil toko Anda");
    }
  };

  const fetchProducts = async () => {
    try {
      const { page, limit, search, sortBy, order } = params;
      const response = await axios.get(`${API_URL}/my`, {
        ...getAuthHeader(),
        params: { page, limit, search, sortBy, order }
      });
      
      setProducts(response.data.data);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (error) {
      toast.error("Gagal memuat daftar produk");
    }
  };

  useEffect(() => { fetchMyStore(); }, []);
  
  // Re-fetch otomatis saat params berubah
  useEffect(() => { 
    fetchProducts(); 
  }, [params.page, params.limit, params.sortBy, params.order]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setParams({ ...params, page: 1 });
      fetchProducts();
    }
  };

  const handleOpenAdd = () => setOpenAdd(!openAdd);

  const handleOpenEdit = (product) => {
    setFormData({
      id: product.id,
      name: product.name,
      stock: product.stock,
      price: product.price,
      weight: product.weight || 0,
      description: product.description || "",
      storeId: product.storeId
    });
    setOpenEdit(true);
  };

  const handleOpenDelete = (product) => {
    setFormData(product);
    setOpenDelete(true);
  };

  // Fungsi Submit Edit yang tadinya Error Undefined
  const submitEdit = async () => {
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        weight: Number(formData.weight)
      };
      
      await axios.patch(`${API_URL}/${formData.id}`, payload, getAuthHeader());
      toast.success("Produk berhasil diperbarui");
      setOpenEdit(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal update produk");
    }
  };

  // Fungsi Submit Delete
  const submitDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${formData.id}`, getAuthHeader());
      toast.success("Produk berhasil dihapus");
      setOpenDelete(false);
      fetchProducts();
    } catch (error) {
      toast.error("Gagal menghapus produk");
    }
  };

  return (
    <MainLayout>
      <ToastContainer />
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h4" className="font-black text-blue-900 uppercase">
              {myStore ? `Inventory ${myStore.name}` : "Inventory Toko"}
            </Typography>
            <Typography className="text-gray-500 text-sm font-medium">
              Kelola stok dan harga produk Anda
            </Typography>
          </div>
          <Button onClick={handleOpenAdd} disabled={!myStore} className="bg-blue-600 flex items-center gap-2 rounded-xl shadow-lg uppercase">
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Tambah Produk
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border-2 border-blue-50">
          <div className="md:col-span-2">
            <Input 
              label="Cari Produk (Tekan Enter)..." 
              icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
              value={params.search}
              onChange={(e) => setParams({ ...params, search: e.target.value })}
              onKeyDown={handleSearch}
            />
          </div>
          <Select label="Urutkan" value={params.sortBy} onChange={(v) => setParams({ ...params, sortBy: v })}>
            <Option value="name">Nama</Option>
            <Option value="price">Harga</Option>
            <Option value="stock">Stok</Option>
          </Select>
          <Select label="Order" value={params.order} onChange={(v) => setParams({ ...params, order: v })}>
            <Option value="asc">A-Z / Terendah</Option>
            <Option value="desc">Z-A / Tertinggi</Option>
          </Select>
        </div>

        <Card className="overflow-hidden border-2 border-blue-100 rounded-3xl shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-blue-50/50">
              <tr>
                {["Nama Produk", "Stok", "Harga", "Aksi"].map((head) => (
                  <th key={head} className="p-4 text-[11px] font-black uppercase text-blue-800 tracking-widest">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((row) => (
                  <tr key={row.id} className="border-b border-blue-50 hover:bg-blue-50/20 transition-colors">
                    <td className="p-4">
                      <Typography className="font-bold text-sm text-gray-800">{row.name}</Typography>
                      <Typography className="text-[10px] text-gray-400 font-medium uppercase">{row.description?.substring(0, 30)}...</Typography>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-600">
                      <span className={`px-2 py-1 rounded-md ${row.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {row.stock} unit
                      </span>
                    </td>
                    <td className="p-4 text-sm font-black text-blue-700">Rp {row.price.toLocaleString()}</td>
                    <td className="p-4 flex gap-2">
                      <IconButton variant="text" color="green" onClick={() => handleOpenEdit(row)} className="bg-green-50 rounded-lg">
                        <PencilIcon className="h-4 w-4" />
                      </IconButton>
                      <IconButton variant="text" color="red" onClick={() => handleOpenDelete(row)} className="bg-red-50 rounded-lg">
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400 italic">Produk tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 border-t border-blue-50 bg-white">
            <Typography className="text-sm font-medium text-gray-600">
              Halaman <span className="text-blue-700">{params.page}</span> dari {totalPages}
            </Typography>
            <div className="flex gap-2">
              <Button 
                variant="outlined" size="sm" className="rounded-lg" 
                onClick={() => setParams(p => ({ ...p, page: p.page - 1 }))} 
                disabled={params.page === 1}
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button 
                variant="outlined" size="sm" className="rounded-lg" 
                onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))} 
                disabled={params.page === totalPages}
              >
                Next <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Modal-modal */}
        <AddProductModal open={openAdd} handleOpen={handleOpenAdd} refreshData={fetchProducts} storeId={myStore?.id} />
        <EditProductModal open={openEdit} setOpen={setOpenEdit} formData={formData} setFormData={setFormData} handleUpdate={submitEdit} />
        <DeleteConfirmModal open={openDelete} setOpen={setOpenDelete} onConfirm={submitDelete} productName={formData.name} />
      </div>
    </MainLayout>
  );
};

export default ProdukIndex;