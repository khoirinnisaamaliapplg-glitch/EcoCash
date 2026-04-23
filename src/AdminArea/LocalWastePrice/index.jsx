import React, { useState, useEffect } from "react";
import MainLayout from "../MainLayout";
import axios from "axios";
import { Card, Typography, Button, Spinner, Chip, IconButton } from "@material-tailwind/react";
import { PlusIcon, MapPinIcon, InboxIcon, PencilIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

import CreateWasteModal from "./CreateWasteModal";
import EditPriceModal from "./EditPriceModal"; 
import DeleteWasteModal from "./DeleteWasteModal";

const LocalWastePrice = () => {
  const [wasteData, setWasteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // LOGIKA 1: Ambil User Data (Sama persis dengan MachineManagement)
  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;

  // LOGIKA 2: Fetch Data dengan Filter areaId Manual (Sama persis dengan MachineManagement)
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/waste-prices", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mengikuti pola: response.data.data || response.data
      const result = response.data.data || response.data;
      
      if (Array.isArray(result)) {
        // Filter manual berdasarkan areaId user yang sedang login
        const myAreaPrices = result.filter(item => item.areaId === userData?.areaId);
        setWasteData(myAreaPrices);
      }
    } catch (error) {
      console.error("Gagal mengambil data harga:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEdit = (item) => { setSelectedItem(item); setOpenEdit(true); };
  const handleOpenDelete = (item) => { setSelectedItem(item); setOpenDelete(true); };

  return (
    <MainLayout>
      <div className="p-4 md:p-0 space-y-6">
        {/* Header - Mengikuti style Smart Container */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Typography variant="h4" className="text-[#2b6cb0] font-bold text-2xl md:text-3xl">
              Local Waste Price
            </Typography>
            <Typography className="text-gray-500 text-sm italic">
              Area Management: <span className="text-blue-600 font-bold">{userData?.areaName || userData?.area?.name || "My Area"}</span>
            </Typography>
          </div>
          <Button 
            variant="text" 
            size="sm" 
            className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50"
            onClick={fetchData}
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </Button>
        </div>

        <Button 
          onClick={() => setOpenCreate(true)}
          className="flex items-center justify-center gap-2 bg-[#2196F3] normal-case text-sm px-5 py-3 rounded-xl shadow-none hover:shadow-lg transition-all w-full md:w-fit"
        >
          <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Price
        </Button>

        {/* List Data */}
        <div className="grid gap-6">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner className="h-10 w-10" /></div>
          ) : wasteData.length === 0 ? (
            <div className="p-10 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
               <InboxIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
               Data tidak ditemukan untuk area ini.
            </div>
          ) : (
            wasteData.map((item) => (
              <Card key={item.id} className="p-6 rounded-2xl shadow-sm border border-blue-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <Typography className="text-[10px] font-black text-blue-800/50 uppercase tracking-widest">Kategori</Typography>
                    <Typography className="text-lg font-black text-blue-900">
                      {item.wasteType?.name || "N/A"}
                    </Typography>
                  </div>
                  <div className="flex gap-1">
                    <IconButton size="sm" variant="text" color="green" onClick={() => handleOpenEdit(item)}>
                      <PencilIcon className="h-4 w-4" />
                    </IconButton>
                    <IconButton size="sm" variant="text" color="red" onClick={() => handleOpenDelete(item)}>
                      <TrashIcon className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                  <div>
                    <Typography className="text-[10px] font-bold text-gray-400 uppercase">Harga per Kg</Typography>
                    <Typography className="font-black text-blue-600 text-xl">
                      Rp {Number(item.pricePerKg).toLocaleString("id-ID")}
                    </Typography>
                  </div>
                  <div className="text-right">
                    <Typography className="text-[10px] font-bold text-gray-400 uppercase">Status</Typography>
                    <Chip 
                      size="sm"
                      value={item.isActive ? "Aktif" : "Non-Aktif"}
                      color={item.isActive ? "green" : "red"}
                      className="rounded-full mt-1 inline-block"
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal - Diproteksi dengan selectedItem agar tidak error saat render */}
      <CreateWasteModal open={openCreate} handleOpen={() => setOpenCreate(false)} refreshData={fetchData} />
      {selectedItem && (
        <>
          <EditPriceModal open={openEdit} handleOpen={() => setOpenEdit(false)} data={selectedItem} refreshData={fetchData} />
          <DeleteWasteModal open={openDelete} handleOpen={() => setOpenDelete(false)} data={selectedItem} refreshData={fetchData} />
        </>
      )}
    </MainLayout>
  );
};

export default LocalWastePrice;