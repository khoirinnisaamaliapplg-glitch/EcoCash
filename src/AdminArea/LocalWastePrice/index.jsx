import React, { useState } from "react";
import MainLayout from "../MainLayout";
import { Card, Typography, Button, Chip } from "@material-tailwind/react";
import { PlusIcon, MapPinIcon } from "@heroicons/react/24/outline";

// Komponen Modal
import CreateWasteModal from "./CreateWasteModal";
import EditPriceModal from "./EditPriceModal";
import DeleteWasteModal from "./DeleteWasteModal";

const LocalWastePrice = () => {
  const [wasteData, setWasteData] = useState([
    {
      id: "WI-001",
      namaWilayah: "Cikini 1",
      tipeMitra: "Pemerintah",
      provinsi: "DKI Jakarta",
      pj: "Dinas Lingkungan Hidup (DLH)",
      prices: [
        { id: 1, kategori: "Plastik", harga: 2500, update: "2026-03-27 10:30 WIB" },
        { id: 2, kategori: "Organik", harga: 2000, update: "2026-03-27 10:30 WIB" },
      ]
    },
    {
      id: "WI-002",
      namaWilayah: "Cikini 2",
      tipeMitra: "Swadaya",
      provinsi: "DKI Jakarta",
      pj: "Koperasi Unit Desa (KUD)",
      prices: [
        { id: 3, kategori: "Kaca", harga: 3000, update: "2026-03-27 10:30 WIB" },
      ]
    }
  ]);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8 pb-10 px-2 md:px-0">
        
        {/* Header Tetap Responsif */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
          <div>
            <Typography variant="h3" className="text-blue-900 font-black text-2xl md:text-3xl">
              Local Waste Price
            </Typography>
            <Typography className="text-gray-500 font-medium text-sm md:text-base">
              Atur standarisasi harga sampah per wilayah kemitraan.
            </Typography>
          </div>
          <Button 
            onClick={() => setOpenCreate(true)}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-blue-600 rounded-2xl normal-case shadow-lg shadow-blue-100 py-3.5 px-6 font-black"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Tambah Wilayah
          </Button>
        </div>

        {/* List Card Wilayah */}
        <div className="grid gap-6 md:gap-8">
          {wasteData.map((wilayah) => (
            <Card key={wilayah.id} className="p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-white bg-white/80 backdrop-blur-md overflow-hidden">
              
              {/* Info Wilayah (Top Section) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 pb-6 border-b border-dashed border-blue-100">
                <div className="flex flex-col">
                  <Typography className="text-[10px] md:text-[11px] font-black text-blue-800/50 uppercase tracking-widest">
                    ID Wilayah : {wilayah.id}
                  </Typography>
                  <Typography className="text-lg md:text-xl font-black text-blue-900 flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-blue-600 shrink-0" /> {wilayah.namaWilayah}
                  </Typography>
                </div>
                <div className="flex flex-col">
                  <Typography className="text-[10px] md:text-[11px] font-black text-blue-800/50 uppercase tracking-widest">Tipe Mitra</Typography>
                  <Typography className="font-bold text-gray-800 text-sm md:text-base">{wilayah.tipeMitra}</Typography>
                </div>
                <div className="flex flex-col">
                  <Typography className="text-[10px] md:text-[11px] font-black text-blue-800/50 uppercase tracking-widest">Penanggung Jawab</Typography>
                  <Typography className="font-bold text-gray-800 text-sm md:text-base">{wilayah.pj}</Typography>
                </div>
              </div>

              {/* BAGIAN INI YANG BISA DI-SCROLL KE SAMPING */}
              <div className="overflow-x-auto -mx-1 px-1 scrollbar-hide">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="text-blue-800/60 uppercase text-[10px] font-black tracking-widest">
                      <th className="pb-4">Kategori</th>
                      <th className="pb-4">Price / Kg</th>
                      <th className="pb-4 text-center">Last Update</th>
                      <th className="pb-4 text-right px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {wilayah.prices.map((item) => (
                      <tr key={item.id} className="border-t border-gray-50 group hover:bg-blue-50/20 transition-all">
                        <td className="py-4">
                          <Chip 
                            value={item.kategori} 
                            className="bg-white border border-blue-100 text-blue-700 rounded-lg normal-case font-black w-fit shadow-sm" 
                          />
                        </td>
                        <td className="py-4 font-black text-blue-800">
                          Rp {item.harga.toLocaleString()}
                        </td>
                        <td className="py-4 text-center">
                          <Typography className="text-[10px] font-bold text-gray-400 leading-tight">
                            {item.update}
                          </Typography>
                        </td>
                        <td className="py-4 text-right px-4">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              color="green" 
                              className="rounded-xl py-2 px-4 normal-case font-bold shadow-none" 
                              onClick={() => { setSelectedItem(item); setOpenEdit(true); }}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              color="red" 
                              variant="text"
                              className="rounded-xl py-2 px-3 normal-case font-bold hover:bg-red-50" 
                              onClick={() => { setSelectedItem(item); setOpenDelete(true); }}
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
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateWasteModal open={openCreate} setOpen={setOpenCreate} />
      <EditPriceModal open={openEdit} setOpen={setOpenEdit} data={selectedItem} />
      <DeleteWasteModal open={openDelete} setOpen={setOpenDelete} data={selectedItem} />
    </MainLayout>
  );
};

export default LocalWastePrice;