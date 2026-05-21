import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api"; 
import MainLayout from "../MainLayout"; 
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import { Card, Typography, Button, Input, Chip, Progress } from "@material-tailwind/react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Import Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TABLE_HEAD = ["Truck Code", "Plate Number", "Nama / Tipe", "Status", "Kapasitas", "Action"];

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "AKTIF":
    case "ACTIVE":
      return "green";
    case "PENUH":
    case "FULL":
      return "orange";
    case "MAINTENANCE":
      return "purple";
    default:
      return "blue-gray";
  }
};

const SmartTruckIndex = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const fetchTrucks = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const response = await api.get("/trucks", {
        params: { search: search }
      });
      
      if (response?.data && Array.isArray(response.data.data)) {
        setTrucks(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setTrucks(response.data);
      } else {
        setTrucks([]);
      }
    } catch (error) {
      // Peringatan menggunakan Toast
      toast.error(error.response?.data?.message || "Gagal memuat data armada.");
      setTrucks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchTrucks(value);
  };

  return (
    <MainLayout>
      {/* Toast Container dengan Z-Index tinggi agar selalu di atas modal */}
      <ToastContainer position="top-right" autoClose={3000} />
      <style>{`.Toastify__toast-container { z-index: 99999 !important; }`}</style>

      <div className="p-4 md:p-0 space-y-6">
        {/* Header Area */}
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold text-2xl md:text-3xl">
            Smart Truck
          </Typography>
          <Typography className="text-gray-500 text-sm">
            Manajemen armada pengangkut limbah AIoT
          </Typography>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button 
            onClick={() => setOpenCreate(true)} 
            className="flex items-center justify-center gap-2 bg-[#66bb6a] normal-case rounded-xl shadow-none py-3 px-5"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Truck
          </Button>
          
          <div className="w-full md:w-80">
            <Input 
              label="Cari Truck Code / Plat..." 
              value={searchQuery}
              onChange={handleSearchChange}
              icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
              className="bg-white rounded-xl"
            />
          </div>
        </div>

        {/* Table Container */}
        <Card className="w-full overflow-hidden border border-blue-50 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] table-auto text-left">
              <thead>
                <tr className="bg-[#f8fbff]">
                  {TABLE_HEAD.map((head) => (
                    <th key={head} className="p-5 border-b border-blue-gray-50">
                      <Typography className="font-bold text-[#2b6cb0] uppercase text-[10px] tracking-widest leading-none opacity-80">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={TABLE_HEAD.length} className="p-10 text-center">
                      <Typography className="text-gray-500 italic text-sm">Memuat armada...</Typography>
                    </td>
                  </tr>
                ) : trucks.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_HEAD.length} className="p-10 text-center">
                      <Typography className="text-gray-500 italic text-sm">Tidak ada data armada.</Typography>
                    </td>
                  </tr>
                ) : (
                  trucks.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50/10 transition-colors border-b border-blue-gray-50/50">
                      <td className="p-5">
                        <Typography variant="small" className="font-bold text-blue-900">
                          {row.truckCode}
                        </Typography>
                      </td>
                      <td className="p-5">
                        <Typography variant="small" className="font-semibold text-gray-700">
                          {row.plateNumber}
                        </Typography>
                      </td>
                      <td className="p-5">
                        <Typography variant="small" className="text-gray-600">
                          {row.name || "-"} <span className="text-[10px] block text-gray-400">{row.area?.name || "No Area"}</span>
                        </Typography>
                      </td>
                      <td className="p-5">
                        <Chip 
                          variant="ghost" 
                          size="sm" 
                          value={row.status || "Aktif"} 
                          color={getStatusColor(row.status || "Aktif")} 
                          className="text-[10px] font-bold" 
                        />
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-1 w-40">
                          <Typography className="text-[10px] font-bold text-blue-800">
                            {row.capacityKg} Kg
                          </Typography>
                          <Progress value={row.currentLoadKg ? (row.currentLoadKg / row.capacityKg) * 100 : 0} size="sm" color="blue" className="bg-gray-100" />
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => { setSelectedData(row); setOpenEdit(true); }} 
                            className="bg-[#66bb6a] px-4 py-2 normal-case rounded-lg shadow-none"
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => { setSelectedData(row); setOpenDelete(true); }} 
                            className="bg-[#ef5350] px-4 py-2 normal-case rounded-lg shadow-none"
                          >
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modals dengan notifikasi Toast */}
        <CreateModal 
          open={openCreate} 
          handleOpen={() => setOpenCreate(false)} 
          onRefresh={() => { 
            fetchTrucks(searchQuery); 
            toast.success("Armada berhasil ditambahkan!"); 
          }} 
        />
        <EditModal 
          open={openEdit} 
          handleOpen={() => setOpenEdit(false)} 
          data={selectedData} 
          onRefresh={() => { 
            fetchTrucks(searchQuery); 
            toast.success("Data armada berhasil diperbarui!"); 
          }} 
        />
        <DeleteModal 
          open={openDelete} 
          handleOpen={() => setOpenDelete(false)} 
          data={selectedData} 
          onRefresh={() => { 
            fetchTrucks(searchQuery); 
            toast.info("Data armada berhasil dihapus."); 
          }} 
        />
      </div>
    </MainLayout>
  );
};

export default SmartTruckIndex;