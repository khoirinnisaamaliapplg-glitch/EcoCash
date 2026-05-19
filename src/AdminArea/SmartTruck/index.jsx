import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api"; 
import MainLayout from "../MainLayout"; 
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import AssignDriverModal from "./AssignDriverModal"; 
import { Card, Typography, Button, Input, Chip, Progress } from "@material-tailwind/react";
import { PlusIcon, MagnifyingGlassIcon, UserPlusIcon } from "@heroicons/react/24/outline";

// Kolom tabel utama area admin
const TABLE_HEAD = ["Truck Code", "Plate Number", "Driver / Tipe", "Status", "Kapasitas", "Action"];

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
  
  // States untuk kontrol modal aksi
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAssignDriver, setOpenAssignDriver] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  // 1. Mengambil scope wilayah penugasan admin dari localStorage
  const userSession = JSON.parse(localStorage.getItem("user") || "{}");
  const adminAreaId = userSession?.areaId || userSession?.area?.id || null;
  const adminAreaName = userSession?.area?.name || "Area Admin";

  // 2. Mengambil data truk yang tersaring berdasarkan area tugas admin
  const fetchTrucks = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const response = await api.get("/trucks", {
        params: { 
          search: search,
          areaId: adminAreaId 
        }
      });
      
      let rawData = [];
      if (response?.data && Array.isArray(response.data.data)) {
        rawData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        rawData = response.data;
      }

      if (adminAreaId) {
        rawData = rawData.filter(truck => truck.areaId === adminAreaId || truck.area?.id === adminAreaId);
      }

      setTrucks(rawData);
    } catch (error) {
      console.error("Gagal memuat data truck:", error);
      setTrucks([]);
    } finally {
      setLoading(false);
    }
  }, [adminAreaId]);

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
      <div className="p-4 md:p-0 space-y-6">

        {/* Header Area */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Typography variant="h4" className="text-[#2b6cb0] font-bold text-2xl md:text-3xl">
              Smart Truck
            </Typography>
            <Chip value={adminAreaName} size="sm" className="bg-blue-50 text-[#2b6cb0] font-bold border border-blue-100 rounded-lg normal-case" />
          </div>
          <Typography className="text-gray-500 text-sm">
            Manajemen armada pengangkut limbah AIoT khusus wilayah tugas Anda.
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
            <table className="w-full min-w-[950px] table-auto text-left">
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
                      <Typography className="text-gray-500 italic text-sm">Tidak ada data armada di wilayah ini.</Typography>
                    </td>
                  </tr>
                ) : (
                  trucks.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50/10 transition-colors border-b border-blue-gray-50/50">
                      {/* Truck Code */}
                      <td className="p-5">
                        <Typography variant="small" className="font-bold text-blue-900">
                          {row.truckCode}
                        </Typography>
                      </td>
                      
                      {/* Plate Number */}
                      <td className="p-5">
                        <Typography variant="small" className="font-semibold text-gray-700">
                          {row.plateNumber}
                        </Typography>
                      </td>
                      
                      {/* Driver & Jenis Kendaraan */}
                      <td className="p-5">
                        <div className="flex flex-col">
                          {row.driver?.name || row.driverName ? (
                            <Typography variant="small" className="font-bold text-gray-800 flex items-center gap-1.5">
                              <span className="text-xs">👤</span> {row.driver?.name || row.driverName}
                            </Typography>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-lg w-fit border border-amber-100">
                              <span className="text-xs">⚠️</span>
                              <Typography className="text-[11px] font-bold uppercase tracking-wider">
                                Belum ada driver
                              </Typography>
                            </div>
                          )}
                          <span className="text-[10px] block text-blue-400 font-medium mt-1">
                            {row.type || "Truk Standar"} • {row.area?.name || "No Area"}
                          </span>
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="p-5">
                        <Chip 
                          variant="ghost" 
                          size="sm" 
                          value={row.status || "Aktif"} 
                          color={getStatusColor(row.status || "Aktif")} 
                          className="text-[10px] font-bold" 
                        />
                      </td>
                      
                      {/* Kapasitas Tampung muatan */}
                      <td className="p-5">
                        <div className="flex flex-col gap-1 w-40">
                          <Typography className="text-[10px] font-bold text-blue-800">
                            {row.capacityKg} Kg
                          </Typography>
                          <Progress value={row.currentLoadKg ? (row.currentLoadKg / row.capacityKg) * 100 : 0} size="sm" color="blue" className="bg-gray-100" />
                        </div>
                      </td>
                      
                      {/* Tombol Aksi */}
                      <td className="p-5 text-right">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outlined"
                            onClick={() => { setSelectedData(row); setOpenAssignDriver(true); }} 
                            className="flex items-center gap-1 border-blue-500 text-blue-500 px-3 py-2 normal-case rounded-lg shadow-none font-bold hover:bg-blue-50"
                          >
                            <UserPlusIcon className="h-4 w-4 stroke-[2.5]" /> Driver
                          </Button>

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

        {/* Modals Handler */}
        <CreateModal open={openCreate} handleOpen={() => setOpenCreate(false)} onRefresh={() => fetchTrucks(searchQuery)} />
        <EditModal open={openEdit} handleOpen={() => setOpenEdit(false)} data={selectedData} onRefresh={() => fetchTrucks(searchQuery)} />
        <DeleteModal open={openDelete} handleOpen={() => setOpenDelete(false)} data={selectedData} onRefresh={() => fetchTrucks(searchQuery)} />
        <AssignDriverModal open={openAssignDriver} handleOpen={() => setOpenAssignDriver(false)} data={selectedData} onRefresh={() => fetchTrucks(searchQuery)} />
      </div>
    </MainLayout>
  );
};

export default SmartTruckIndex;