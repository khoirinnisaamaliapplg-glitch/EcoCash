import React, { useState } from "react";
import MainLayout from "../MainLayout";
import { Card, Typography, Button, Input, Avatar } from "@material-tailwind/react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import CreateProductModal from "./CreateProductModal";
import EditProductModal from "./EditProductModal";
import DeleteProductModal from "./DeleteProductModal";

const TABLE_HEAD = ["ID Produk", "Nama Produk", "Nama Mitra", "Titik Alamat Pengiriman", "Harga", "Foto Produk", "Action"];

const TABLE_ROWS = [
  { id: "po 001", name: "Lampu dari sendok plastik bekas", mitra: "Bank Sampah Jaya", address: "Bandung, Jawa Barat", price: "Rp.100.000", img: "https://images.unsplash.com/photo-1544111306-05680076211f?w=400" },
  { id: "po 002", name: "Pot Tanaman dari kaleng bekas", mitra: "Bank Sampah Ideas", address: "Bandung, Jawa Barat", price: "Rp.20.000", img: "https://images.unsplash.com/photo-1599591459243-30047649302b?w=400" },
];

const MarketPlaceIndex = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <MainLayout>
      <div className="space-y-6 px-2 md:px-0 pb-10">
        {/* Header Section */}
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold text-2xl md:text-3xl">
            MarketPlace
          </Typography>
          <Typography className="text-gray-500 text-sm italic">
            Kelola produk kreatif dari limbah daur ulang
          </Typography>
        </div>

        {/* Action Bar: Add Button & Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button 
            onClick={() => setOpenCreate(true)} 
            className="flex items-center justify-center gap-2 bg-[#66bb6a] normal-case rounded-xl shadow-none py-3 order-2 md:order-1"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Produk
          </Button>
          <div className="w-full md:w-80 order-1 md:order-2">
            <Input 
              label="Search product..." 
              icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
              color="blue"
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Table Container dengan Horizontal Scroll */}
        <Card className="rounded-[24px] md:rounded-[32px] overflow-hidden border border-blue-50 shadow-sm p-1 md:p-2 bg-white/80 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto text-left">
              <thead>
                <tr className="bg-[#e3f2fd]/40">
                  {TABLE_HEAD.map((head) => (
                    <th key={head} className="p-4 border-b border-blue-gray-50">
                      <Typography className="font-black text-[#2b6cb0] uppercase text-[10px] tracking-widest text-center">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/20 transition-colors border-b border-blue-gray-50 last:border-none">
                    <td className="p-4">
                      <Typography className="text-[11px] text-blue-800 font-bold text-center italic opacity-70">
                        {row.id}
                      </Typography>
                    </td>
                    <td className="p-4 w-60">
                      <Typography className="text-[11px] md:text-[12px] text-blue-900 font-black leading-tight">
                        {row.name}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography className="text-[11px] text-blue-800 font-bold text-center">
                        {row.mitra}
                      </Typography>
                    </td>
                    <td className="p-4 w-48">
                      <Typography className="text-[10px] text-gray-600 font-medium text-center leading-relaxed">
                        {row.address}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography className="text-[12px] text-green-700 font-black text-center">
                        {row.price}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <Avatar 
                          src={row.img} 
                          variant="rounded" 
                          className="h-14 w-14 border-2 border-white shadow-md hover:scale-110 transition-transform" 
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {setSelectedProduct(row); setOpenEdit(true)}} 
                          className="bg-[#66bb6a] px-4 py-2 normal-case rounded-lg shadow-none font-bold"
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="text"
                          onClick={() => {setSelectedProduct(row); setOpenDelete(true)}} 
                          className="text-[#ef5350] hover:bg-red-50 px-3 py-2 normal-case rounded-lg font-bold"
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <CreateProductModal open={openCreate} handleOpen={() => setOpenCreate(false)} />
      <EditProductModal open={openEdit} handleOpen={() => setOpenEdit(false)} data={selectedProduct} />
      <DeleteProductModal open={openDelete} handleOpen={() => setOpenDelete(false)} data={selectedProduct} />
    </MainLayout>
  );
};

export default MarketPlaceIndex;