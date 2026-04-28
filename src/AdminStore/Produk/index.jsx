import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../MainLayout";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import DeleteConfirmModal from "./DeleteConfirmModal"; // Import modal hapus baru
import { Card, Typography, Button, IconButton } from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";

const API_URL = "http://localhost:3000/api/products";

const ProdukIndex = () => {
  const [products, setProducts] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  
  // State untuk data yang sedang diproses (Edit/Delete)
  const [formData, setFormData] = useState({ 
    id: "", name: "", stock: 0, price: 0, weight: 0, description: "", storeId: "" 
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const fetchProducts = async () => {
    try {
      // Menggunakan endpoint /my untuk mendapatkan produk khusus toko ini
      const response = await axios.get(`${API_URL}/my`, getAuthHeader());
      setProducts(response.data.data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Gagal memuat daftar produk");
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Fungsi untuk membuka modal tambah
  const handleOpenAdd = () => {
    setOpenAdd(!openAdd);
  };

  // Fungsi untuk membuka modal edit
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

  // Fungsi untuk memicu modal hapus
  const handleOpenDelete = (product) => {
    setFormData(product); // Simpan info produk yang mau dihapus ke state
    setOpenDelete(true);
  };

  // Logika Update (Submit dari EditProductModal)
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

  // Logika Delete (Konfirmasi dari DeleteConfirmModal)
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
            <Typography variant="h4" className="font-black text-blue-900 uppercase">Inventory Toko</Typography>
            <Typography className="text-gray-500 text-sm font-medium">Kelola stok dan harga produk Anda</Typography>
          </div>
          <Button onClick={handleOpenAdd} className="bg-blue-600 flex items-center gap-2 rounded-xl shadow-lg shadow-blue-100 uppercase tracking-wider">
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Tambah Produk
          </Button>
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
                  <td colSpan={4} className="p-10 text-center text-gray-400 italic">Belum ada produk di toko ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        {/* Modal-modal Pendukung */}
        <AddProductModal 
          open={openAdd} 
          handleOpen={handleOpenAdd} 
          refreshData={fetchProducts} 
        />

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