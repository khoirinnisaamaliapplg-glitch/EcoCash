import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../MainLayout";
import { Card, Typography, Button, Input, Chip, Spinner } from "@material-tailwind/react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import AddWastePriceModal from "./AddWastePriceModal";
import EditWastePriceModal from "./EditWastePriceModal";
import DeleteWastePriceModal from "./DeleteWastePriceModal";

const API_URL = "http://localhost:3000/api/waste-prices";

const WastePricesIndex = () => {
  const [wasteData, setWasteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false); // State untuk modal Edit
  const [openDelete, setOpenDelete] = useState(false); // State untuk modal Delete
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWasteData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) alert("Sesi habis, silakan login kembali.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // FUNGSI HANDLER UNTUK TOMBOL
  const handleEditClick = (item) => {
    setSelectedItem(item);
    setOpenEdit(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setOpenDelete(true);
  };

  const filteredData = wasteData.filter((item) => 
    item.area?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.wasteType?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6 px-2 md:px-0 pb-10">
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">
            Waste Prices
          </Typography>
          <Typography className="text-gray-500 text-sm italic">
            Atur standar harga sampah tiap wilayah AIoT
          </Typography>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button 
            onClick={() => setOpenAdd(true)}
            className="flex items-center justify-center gap-2 bg-[#66bb6a] normal-case rounded-xl shadow-none py-3"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Price
          </Button>
          <div className="w-full md:w-80">
            <Input 
              label="Cari wilayah atau jenis..." 
              icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="rounded-[24px] overflow-hidden border border-blue-50 shadow-sm p-4 bg-white/50">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center p-10"><Spinner className="h-8 w-8 text-green-500" /></div>
            ) : (
              <table className="w-full min-w-[700px] table-auto border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[#2b6cb0] text-[11px] font-black uppercase tracking-widest text-center">
                    <th className="pb-4">Wilayah</th>
                    <th className="pb-4">Jenis Sampah</th>
                    <th className="pb-4">Harga / Kg</th>
                    <th className="pb-4">Terakhir Update</th>
                    <th className="pb-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id} className="bg-white hover:bg-blue-50/40 transition-all shadow-sm">
                      <td className="p-4 rounded-l-xl text-center font-bold text-blue-900 border-y border-l border-blue-50">
                        {item.area?.name}
                      </td>
                      <td className="p-4 text-center border-y border-blue-50">
                        <Chip value={item.wasteType?.name} variant="ghost" color="blue" className="rounded-lg" />
                      </td>
                      <td className="p-4 text-center font-black text-blue-700 border-y border-blue-50">
                        Rp {Number(item.pricePerKg).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-center text-xs text-gray-500 border-y border-blue-50">
                        {new Date(item.updatedAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4 rounded-r-xl border-y border-r border-blue-50 text-center">
                        <div className="flex justify-center gap-2">
                           {/* PERBAIKAN: Tambahkan onClick di sini */}
                           <Button 
                             size="sm" 
                             className="bg-green-500 normal-case"
                             onClick={() => handleEditClick(item)}
                           >
                             Edit
                           </Button>
                           <Button 
                             size="sm" 
                             variant="text" 
                             className="text-red-500 normal-case font-bold"
                             onClick={() => handleDeleteClick(item)}
                           >
                             Hapus
                           </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* MODAL ADD */}
      <AddWastePriceModal 
        open={openAdd} 
        handleOpen={() => setOpenAdd(false)} 
        refreshData={fetchData} 
      />

      {/* MODAL EDIT */}
      <EditWastePriceModal 
        open={openEdit} 
        handleOpen={() => {
            setOpenEdit(false);
            setSelectedItem(null);
        }}  
        data={selectedItem}
        refreshData={fetchData}
      />

      {/* MODAL DELETE */}  
      <DeleteWastePriceModal 
        open={openDelete} 
        handleOpen={() => {
            setOpenDelete(false);
            setSelectedItem(null);
        }}
        data={selectedItem}
        refreshData={fetchData}
      />
     
    </MainLayout>
  );
};

export default WastePricesIndex;