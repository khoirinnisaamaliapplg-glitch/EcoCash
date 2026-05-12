import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../MainLayout";
import { Card, Typography, Button, Input, Chip } from "@material-tailwind/react";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  GlobeAsiaAustraliaIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon,
  ChevronUpDownIcon 
} from "@heroicons/react/24/outline";
// 1. GANTI IMPORT AXIOS DENGAN API
import api from "../../utils/api"; 
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
  
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500); 
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  // --- Functions ---
  
  // Fetch Data dari API
  const fetchAreas = useCallback(async () => {
    setLoading(true);
    try {
      // 2. CUKUP PAKAI API.GET (Token & BaseURL Otomatis)
      const response = await api.get("/areas", {
        params: {
          page,
          limit,
          search: debouncedSearch,
          sortBy,
          sortOrder,
        }
      });

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

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

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
      // 3. CUKUP PAKAI API.DELETE
      await api.delete(`/areas/${id}`);
      
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
          <Typography variant="h4" className="text-[#2b6cb0] font-black uppercase italic">Manajemen Wilayah</Typography>
          <Typography className="text-gray-500 text-sm font-medium">Data pusat kontrol area operasional EcoCash</Typography>
        </div>

        {/* Action Section: Add & Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button 
            onClick={() => setOpenAdd(true)}
            className="flex items-center justify-center gap-2 bg-[#66bb6a] normal-case rounded-xl shadow-none px-6 font-bold"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Area
          </Button>
          <div className="w-full md:w-80">
            <Input 
              label="Cari kode atau nama..." 
              icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Table Section */}
        <Card className="w-full overflow-hidden border border-blue-50 shadow-sm rounded-2xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto text-left">
              <thead>
                <tr className="bg-[#e3f2fd]/30">
                  {TABLE_HEAD.map((head) => (
                    <th 
                      key={head.label} 
                      onClick={() => handleSort(head.value)}
                      className={`p-5 border-b border-blue-gray-50 font-black text-[#2b6cb0] uppercase text-[11px] tracking-widest ${head.value ? "cursor-pointer hover:bg-blue-100/50 transition-colors" : ""}`}
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
                    <tr key={area.id} className="hover:bg-blue-50/20 border-b border-blue-gray-50/50 transition-colors">
                      <td className="p-5 font-black text-blue-900 text-sm">
                        <div className="flex items-center gap-2">
                          <GlobeAsiaAustraliaIcon className="h-4 w-4 text-blue-600" />
                          {area.code}
                        </div>
                      </td>
                      <td className="p-5 font-bold text-gray-800 text-sm">{area.name}</td>
                      <td className="p-5">
                        <Typography className="text-xs font-black text-blue-gray-800">{area.regencyName}</Typography>
                        <Typography className="text-[10px] font-bold text-gray-400 uppercase italic">{area.province}</Typography>
                      </td>
                      <td className="p-5">
                        <Chip 
                          variant="ghost" 
                          size="sm" 
                          value={area.regencyType || "Wilayah"} 
                          color={area.regencyType === "Kota" ? "purple" : "orange"}
                          className="font-black rounded-lg"
                        />
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => handleEditTrigger(area)} className="bg-blue-600 shadow-none hover:shadow-md normal-case font-bold">Edit</Button>
                          <Button size="sm" onClick={() => handleDeleteTrigger(area)} className="bg-red-500 shadow-none hover:shadow-md normal-case font-bold">Hapus</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-400 font-black italic uppercase tracking-widest">
                      {loading ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                          Synchronizing...
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
            <Typography variant="small" className="font-bold text-gray-500 italic uppercase text-[10px]">
              Showing <span className="text-blue-700">{dataArea.length}</span> of <span className="text-blue-700">{totalData}</span> entries
            </Typography>
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || loading}
                className="flex items-center gap-1 border-blue-gray-100 font-bold"
              >
                <ChevronLeftIcon className="h-3 w-3 stroke-[3]" /> Prev
              </Button>
              <div className="flex items-center gap-1 px-3">
                <Typography variant="small" className="font-black text-blue-700">
                  {page}
                </Typography>
                <Typography variant="small" className="font-bold text-gray-400">
                  / {totalPages}
                </Typography>
              </div>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || loading}
                className="flex items-center gap-1 border-blue-gray-100 font-bold"
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