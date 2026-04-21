import React, { useState, useEffect } from "react";
import MainLayout from "../MainLayout";
import { Card, Typography, Button, Input, Chip } from "@material-tailwind/react";
import { PlusIcon, MagnifyingGlassIcon, GlobeAsiaAustraliaIcon } from "@heroicons/react/24/outline";
import axios from "axios";

// Import Modal
import EditAreaModal from "./EditAreaModal";
import DeleteAreaModal from "./DeleteAreaModal";

const TABLE_HEAD = ["Kode Wilayah", "Nama Area", "Lokasi Utama", "Tipe", "Action"];

const AreaIndex = () => {
  const [dataArea, setDataArea] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // 1. PERBAIKAN DI SINI: Cek semua kemungkinan key localStorage
      // Karena di kode Login Anda menyimpannya sebagai 'userData'
      const rawUserData = localStorage.getItem("userData") || localStorage.getItem("user");
      const userData = rawUserData ? JSON.parse(rawUserData) : null;
      
      // Ambil areaId (pastikan di JWT Backend field-nya bernama 'areaId')
      const userAreaId = userData?.areaId;

      if (!userAreaId) {
        console.error("Area ID tidak ditemukan di localStorage");
        setDataArea([]);
        return;
      }

      // 2. Ambil data dari API berdasarkan ID
      const response = await axios.get(`http://localhost:3000/api/areas/${userAreaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. PERBAIKAN DI SINI: Menyesuaikan dengan response { data: area }
      const result = response.data.data || response.data;

      // Pastikan masuk ke state sebagai Array agar .map() tidak error
      if (result && typeof result === 'object' && !Array.isArray(result)) {
        setDataArea([result]); 
      } else if (Array.isArray(result)) {
        setDataArea(result);
      } else {
        setDataArea([]);
      }

    } catch (error) {
      console.error("Gagal mengambil data area:", error);
      setDataArea([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // Filter pencarian
  const filteredAreas = dataArea.filter((area) =>
    area?.name?.toLowerCase().includes(search.toLowerCase()) ||
    area?.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditTrigger = (area) => {
    setSelectedArea(area);
    setOpenEdit(true);
  };

  const handleDeleteTrigger = (area) => {
    setSelectedArea(area);
    setOpenDelete(true);
  };

  const executeDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/areas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAreas();
      setOpenDelete(false);
    } catch (error) {
      alert("Gagal menghapus area");
    }
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-0 space-y-6">
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">Manajemen Wilayah</Typography>
          <Typography className="text-gray-500 text-sm">Data wilayah berdasarkan hak akses Anda</Typography>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Tombol Add Area bisa disembunyikan jika role-nya AREA_ADMIN */}
          <div></div> 
          <div className="w-full md:w-80">
            <Input 
              label="Cari kode atau nama..." 
              icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Card className="w-full overflow-hidden border border-blue-50 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto text-left">
              <thead>
                <tr className="bg-[#e3f2fd]/50">
                  {TABLE_HEAD.map((head) => (
                    <th key={head} className="p-5 border-b border-blue-gray-50 font-bold text-[#2b6cb0] uppercase text-[11px]">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && filteredAreas.length > 0 ? (
                  filteredAreas.map((area) => (
                    <tr key={area.id} className="hover:bg-blue-50/20 border-b border-blue-gray-50/50">
                      <td className="p-5 font-bold text-blue-900">
                        <div className="flex items-center gap-2">
                          <GlobeAsiaAustraliaIcon className="h-4 w-4 text-blue-600" />
                          {area.code}
                        </div>
                      </td>
                      <td className="p-5 font-bold text-gray-800">{area.name}</td>
                      <td className="p-5">
                        <Typography className="text-xs font-bold text-blue-gray-800">{area.regencyName}</Typography>
                        <Typography className="text-[10px] text-gray-500 uppercase">{area.province}</Typography>
                      </td>
                      <td className="p-5">
                        <Chip 
                          variant="ghost" 
                          size="sm" 
                          value={area.regencyType || "Wilayah"} 
                          color={area.regencyType === "Kota" ? "purple" : "orange"}
                        />
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => handleEditTrigger(area)} className="bg-[#66bb6a]">Edit</Button>
                          <Button size="sm" onClick={() => handleDeleteTrigger(area)} className="bg-[#ef5350]">Hapus</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-400">
                      {loading ? "Memuat data wilayah..." : "Data wilayah tidak ditemukan atau Anda tidak memiliki akses."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {selectedArea && (
        <>
          <EditAreaModal 
            open={openEdit} 
            setOpen={setOpenEdit} 
            selectedArea={selectedArea} 
            refreshData={fetchAreas} 
          />
          <DeleteAreaModal 
            open={openDelete} 
            handleOpen={() => setOpenDelete(!openDelete)} 
            data={selectedArea} 
            confirmDelete={() => executeDelete(selectedArea.id)}
          />
        </>
      )}
    </MainLayout>
  );
};

export default AreaIndex;