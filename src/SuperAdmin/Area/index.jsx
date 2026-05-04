import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../MainLayout";
import { Card, Typography, Button, Input, Chip, IconButton } from "@material-tailwind/react";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  GlobeAsiaAustraliaIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon,
  ChevronUpDownIcon 
} from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from 'react-toastify';
import { useDebounce } from "use-debounce";

// Import Modal
import AddAreaModal from "./AddAreaModal";
import EditAreaModal from "./EditAreaModal";
import DeleteAreaModal from "./DeleteAreaModal";

const TABLE_HEAD = [
  { label: "Kode Wilayah", value: "code" },
  { label: "Nama Area", value: "name" },
  { label: "Lokasi Utama", value: "regencyName" },
  { label: "Tipe", value: "regencyType" },
  { label: "Action", value: null },
];

const AreaIndex = () => {
  // --- States ---
  const [dataArea, setDataArea] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Query (Pagination, Search, Sort)
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500); 
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // State Modal
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  // --- Functions ---
  
  // Fetch Data dari API
  const fetchAreas = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/areas", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit,
          search: debouncedSearch,
          sortBy,
          sortOrder,
        }
      });

      // Sesuaikan mapping data berdasarkan struktur response API Anda
      const result = response.data;
      setDataArea(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalData(result.pagination?.totalItems || 0);
    } catch (error) {
      console.error("Gagal mengambil data area:", error);
      toast.error("Gagal memuat data wilayah.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  // Effect untuk fetch data
  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // Reset ke halaman 1 jika user mencari sesuatu
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleSort = (value) => {
    if (!value) return;
    const isAsc = sortBy === value && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(value);
  };

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
      
      toast.success("Wilayah berhasil dihapus!");
      fetchAreas(); 
      setOpenDelete(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus wilayah.");
    }
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-0 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">Manajemen Wilayah</Typography>
          <Typography className="text-gray-500 text-sm">Data pusat kontrol area operasional EcoCash</Typography>
        </div>

        {/* Action Section: Add & Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button 
            onClick={() => setOpenAdd(true)}
            className="flex items-center justify-center gap-2 bg-[#66bb6a] normal-case rounded-xl shadow-none px-6"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Area
          </Button>
          <div className="w-full md:w-80">
            <Input 
              label="Cari kode atau nama..." 
              icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <Card className="w-full overflow-hidden border border-blue-50 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto text-left">
              <thead>
                <tr className="bg-[#e3f2fd]/50">
                  {TABLE_HEAD.map((head) => (
                    <th 
                      key={head.label} 
                      onClick={() => handleSort(head.value)}
                      className={`p-5 border-b border-blue-gray-50 font-bold text-[#2b6cb0] uppercase text-[11px] ${head.value ? "cursor-pointer hover:bg-blue-100/50 transition-colors" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {head.label}
                        {head.value && (
                          <ChevronUpDownIcon className={`h-4 w-4 ${sortBy === head.value ? "text-blue-700" : "text-gray-400"}`} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && dataArea.length > 0 ? (
                  dataArea.map((area) => (
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
                          <Button size="sm" onClick={() => handleEditTrigger(area)} className="bg-[#66bb6a] shadow-none hover:shadow-none">Edit</Button>
                          <Button size="sm" onClick={() => handleDeleteTrigger(area)} className="bg-[#ef5350] shadow-none hover:shadow-none">Hapus</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-400 font-medium">
                      {loading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                          Memuat data...
                        </div>
                      ) : "Data wilayah tidak ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-5 border-t border-blue-gray-50 bg-white">
            <Typography variant="small" className="font-medium text-gray-600">
              Menampilkan <span className="text-blue-700">{dataArea.length}</span> dari <span className="text-blue-700">{totalData}</span> data
            </Typography>
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || loading}
                className="flex items-center gap-1 border-blue-gray-100"
              >
                <ChevronLeftIcon className="h-3 w-3 stroke-[3]" /> Prev
              </Button>
              <div className="flex items-center gap-1 px-2">
                <Typography variant="small" className="font-bold text-blue-700">
                  {page}
                </Typography>
                <Typography variant="small" className="font-normal text-gray-500">
                  / {totalPages}
                </Typography>
              </div>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || loading}
                className="flex items-center gap-1 border-blue-gray-100"
              >
                Next <ChevronRightIcon className="h-3 w-3 stroke-[3]" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Modals Section */}
      <AddAreaModal 
        open={openAdd} 
        setOpen={setOpenAdd} 
        refreshData={fetchAreas} 
      />
      
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