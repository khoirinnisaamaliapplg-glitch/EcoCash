import React, { useState } from "react";
import MainLayout from "../MainLayout";
// Import file modal yang sudah kamu buat
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { Card, Typography, Button, IconButton, Chip, Avatar } from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const ProdukIndex = () => {
  const [products, setProducts] = useState([
    { id: "PO-001", nama: "Pot Tanaman Kaleng", stok: 100, harga: 10000, status: "Aktif", img: "https://images.unsplash.com/photo-1599591037488-348f3f885f81?w=100" },
    { id: "PO-002", nama: "Lampu dari Sendok", stok: 10, harga: 100000, status: "Rendah", img: "https://images.unsplash.com/photo-1513506496266-3d241991aa05?w=100" },
  ]);

  // State untuk kontrol masing-masing modal
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  
  const [formData, setFormData] = useState({ id: "", nama: "", stok: "", harga: "", img: "" });
  const [selectedId, setSelectedId] = useState(null);

  // FUNGSI TAMBAH
  const handleOpenAdd = () => {
    setFormData({ id: `PO-00${products.length + 1}`, nama: "", stok: "", harga: "", img: "" });
    setOpenAdd(true);
  };

  const submitAdd = () => {
    setProducts([...products, { ...formData, status: formData.stok > 20 ? "Aktif" : "Rendah" }]);
    setOpenAdd(false);
  };

  // FUNGSI EDIT
  const handleOpenEdit = (product) => {
    setFormData(product);
    setOpenEdit(true);
  };

  const submitEdit = () => {
    setProducts(products.map(p => p.id === formData.id ? { ...formData, status: formData.stok > 20 ? "Aktif" : "Rendah" } : p));
    setOpenEdit(false);
  };

  // FUNGSI HAPUS
  const handleOpenDelete = (id) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const submitDelete = () => {
    setProducts(products.filter(p => p.id !== selectedId));
    setOpenDelete(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Typography variant="h3" className="text-blue-900 font-black uppercase">Produk Saya</Typography>
          <Button onClick={handleOpenAdd} className="bg-blue-600 rounded-2xl flex items-center gap-3 shadow-lg shadow-blue-100">
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Tambah Produk
          </Button>
        </div>

        {/* TABEL (Sesuai desain EcoCash) */}
        <Card className="overflow-hidden rounded-[2rem] border-2 border-blue-400">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-left">
              <thead className="bg-blue-50/50">
                <tr>
                  {["ID", "Produk", "Stok", "Harga", "Status", "Aksi"].map((h) => (
                    <th key={h} className="p-5 font-black text-blue-800 uppercase text-[10px] tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {products.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/20">
                    <td className="p-5 font-bold text-blue-600">{row.id}</td>
                    <td className="p-5 flex items-center gap-3">
                      <Avatar src={row.img} size="sm" variant="rounded" className="border shadow-sm" />
                      <Typography className="text-sm font-black text-gray-800">{row.nama}</Typography>
                    </td>
                    <td className="p-5 font-bold text-gray-500">{row.stok}</td>
                    <td className="p-5 font-black text-blue-900">Rp {row.harga.toLocaleString()}</td>
                    <td className="p-5">
                      <Chip size="sm" value={row.status} color={row.status === "Aktif" ? "green" : "orange"} className="rounded-full" />
                    </td>
                    <td className="p-5 flex gap-2">
                      <IconButton variant="text" color="green" onClick={() => handleOpenEdit(row)} className="bg-green-50 rounded-xl">
                        <PencilIcon className="h-4 w-4" />
                      </IconButton>
                      <IconButton variant="text" color="red" onClick={() => handleOpenDelete(row.id)} className="bg-red-50 rounded-xl">
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* PEMANGGILAN 3 MODAL TERPISAH */}
        <AddProductModal 
          open={openAdd} 
          setOpen={setOpenAdd} 
          formData={formData} 
          setFormData={setFormData} 
          handleAdd={submitAdd} 
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
          productName={products.find(p => p.id === selectedId)?.nama}
        />
      </div>
    </MainLayout>
  );
};

export default ProdukIndex;