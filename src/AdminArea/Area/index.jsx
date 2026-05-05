import React, { useState, useEffect } from "react";
import MainLayout from "../MainLayout";
import { 
  Card, Typography, Button, Input, Chip, 
  Select, Option, IconButton 
} from "@material-tailwind/react";
import { 
  PlusIcon, MagnifyingGlassIcon, GlobeAsiaAustraliaIcon,
  ChevronLeftIcon, ChevronRightIcon 
} from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from "react-hot-toast";

// Import Modal
import EditAreaModal from "./EditAreaModal";
import DeleteAreaModal from "./DeleteAreaModal";

const TABLE_HEAD = ["Kode Wilayah", "Nama Area", "Lokasi Utama", "Tipe", "Action"];

const AreaIndex = () => {
  const [dataArea, setDataArea] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const rawUserData = localStorage.getItem("userData") || localStorage.getItem("user");
      const userData = rawUserData ? JSON.parse(rawUserData) : null;
      const userAreaId = userData?.areaId;

      if (!userAreaId) {
        setDataArea([]);
        return;
      }

      const response = await axios.get(`http://localhost:3000/api/areas/${userAreaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = response.data.data || response.data;

      if (result && typeof result === 'object' && !Array.isArray(result)) {
        setDataArea([result]); 
      } else if (Array.isArray(result)) {
        setDataArea(result);
      } else {
        setDataArea([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data area:", error);
      toast.error("Gagal memuat data dari server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // Logika Filter dan Search
  const filteredData = dataArea.filter((area) => {
    const matchesSearch = 
      area?.name?.toLowerCase().includes(search.toLowerCase()) ||
      area?.code?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filterType === "all" || area?.regencyType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Logika Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
      toast.success("Area berhasil dihapus");
      fetchAreas();
      setOpenDelete(false);
    } catch (error) {
      toast.error("Gagal menghapus area");
    }
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-0 space-y-6">
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">Manajemen Wilayah</Typography>
          <Typography className="text-gray-500 text-sm">Data wilayah berdasarkan hak akses Anda</Typography>
        </div>

        {/* Toolbar: Search & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex w-full md:w-max gap-2">
            <div className="w-full md:w-72">
              <Input 
                label="Cari kode atau nama..." 
                icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // Reset ke hal 1 saat mengetik
                }}
              />
            </div>
            <div className="w-full md:w-44">
              <Select 
                label="Filter Tipe" 
                value={filterType} 
                onChange={(val) => {
                  setFilterType(val);
                  setCurrentPage(1);
                }}
              >
                <Option value="all">Semua Tipe</Option>
                <Option value="Kota">Kota</Option>
                <Option value="Kabupaten">Kabupaten</Option>
              </Select>
            </div>
          </div>
          <Typography variant="small" className="text-gray-600 font-medium">
            Total: {filteredData.length} Data
          </Typography>
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
                {!loading && currentItems.length > 0 ? (
                  currentItems.map((area) => (
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
                      {loading ? "Memuat data wilayah..." : "Data tidak ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="flex items-center justify-between p-5 border-t border-blue-gray-50">
            <Typography variant="small" color="blue-gray" className="font-normal">
              Halaman {currentPage} dari {totalPages || 1}
            </Typography>
            <div className="flex gap-2">
              <IconButton
                variant="outlined"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon strokeWidth={2} className="h-4 w-4" />
              </IconButton>
              <IconButton
                variant="outlined"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRightIcon strokeWidth={2} className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        </Card>
      </div>

      {selectedArea && (
        <>
          <EditAreaModal 
            open={openEdit} 
            setOpen={setOpenEdit} 
            selectedArea={selectedArea} 
            refreshData={() => {
                fetchAreas();
                toast.success("Data area berhasil diperbarui");
            }} 
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