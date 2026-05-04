import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../MainLayout"; 
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import DetailModal from "./DetailModal";
import axios from "axios";
import { 
  Card, 
  Typography, 
  Button, 
  Input, 
  Chip, 
  Spinner,
  IconButton
} from "@material-tailwind/react";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArrowPathIcon,
  ChevronRightIcon, 
  ChevronLeftIcon,
  ChevronUpDownIcon 
} from "@heroicons/react/24/outline";

// TOASTIFY & DEBOUNCE
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDebounce } from "use-debounce";

const TABLE_HEAD = [
  { label: "Machine Code", value: "machineCode" },
  { label: "Name & Place", value: "name" },
  { label: "Area", value: "areaId" },
  { label: "Location", value: "district" },
  { label: "Status", value: "isActive" },
  { label: "Action", value: null },
];

const SmartContainerIndex = () => {
  // --- States ---
  const [machines, setMachines] = useState([]); 
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
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  // --- Functions ---

  const fetchMachines = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/machines", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          isActive: true, // Filter default sesuai permintaan
          page,
          limit,
          search: debouncedSearch,
          sortBy,
          sortOrder,
        }
      });
      
      const result = response.data;
      setMachines(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalData(result.pagination?.totalItems || 0);
      
    } catch (error) {
      console.error("Gagal mengambil data mesin:", error);
      toast.error("Gagal memuat data mesin!");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  // Reset ke halaman 1 jika mencari sesuatu
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleSort = (value) => {
    if (!value) return;
    const isAsc = sortBy === value && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(value);
  };

  const handleOpenEdit = (row) => { setSelectedData(row); setOpenEdit(true); };
  const handleOpenDelete = (row) => { setSelectedData(row); setOpenDelete(true); };
  const handleOpenDetail = (row) => { setSelectedData(row); setOpenDetail(true); };

  return (
    <MainLayout>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="p-4 md:p-0 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Typography variant="h4" className="text-[#2b6cb0] font-bold text-2xl md:text-3xl">
              Smart Container
            </Typography>
            <Typography className="text-gray-500 text-sm italic">
              EcoCash AIoT Machine Monitoring Database
            </Typography>
          </div>
          <Button 
            variant="text" 
            size="sm" 
            className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50"
            onClick={() => {
              fetchMachines();
              toast.info("Memperbarui data...");
            }}
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Database
          </Button>
        </div>

        {/* Action & Search Section */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <Button 
            onClick={() => setOpenCreate(true)}
            className="flex items-center justify-center gap-2 bg-[#4CAF50] normal-case text-sm px-5 py-3 rounded-xl shadow-none hover:shadow-lg transition-all"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Machine
          </Button>
          
          <div className="w-full md:w-80">
            <Input
              label="Cari Kode, Nama, atau Lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              className="bg-white rounded-xl"
              color="blue"
            />
          </div>
        </div>

        {/* Table Section */}
        <Card className="w-full border border-blue-50 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto text-left">
              <thead>
                <tr className="bg-[#f8fbff]">
                  {TABLE_HEAD.map((head) => (
                    <th 
                      key={head.label} 
                      onClick={() => handleSort(head.value)}
                      className={`p-5 border-b border-blue-50 ${head.value ? "cursor-pointer hover:bg-blue-100/30 transition-colors" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Typography className="font-bold text-[#2b6cb0] uppercase text-[10px] tracking-widest">
                          {head.label}
                        </Typography>
                        {head.value && (
                          <ChevronUpDownIcon className={`h-4 w-4 ${sortBy === head.value ? "text-blue-700" : "text-gray-400"}`} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center">
                      <Spinner className="h-8 w-8 text-blue-500 mx-auto" />
                      <Typography className="text-gray-500 text-sm mt-2">Memuat data...</Typography>
                    </td>
                  </tr>
                ) : machines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center">
                      <Typography className="text-gray-500 font-medium">
                        {search ? `Data "${search}" tidak ditemukan.` : "Belum ada data mesin tersedia."}
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  machines.map((row, index) => {
                    const isLast = index === machines.length - 1;
                    const classes = isLast ? "p-5" : "p-5 border-b border-blue-50/50";

                    return (
                      <tr key={row.id || index} className="hover:bg-blue-50/10 transition-colors">
                        <td className={classes}>
                          <Typography variant="small" className="font-bold text-blue-900 uppercase">
                            {row.machineCode || "-"}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" className="font-semibold text-gray-800">
                            {row.name || "Unnamed"}
                          </Typography>
                          <Typography className="text-[10px] text-gray-500 italic">
                            {row.placeName || "No Place Name"}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Chip 
                            value={row.area?.name || `ID: ${row.areaId || '?'}`} 
                            size="sm" 
                            variant="ghost" 
                            className="rounded-full w-fit bg-blue-50 text-blue-700 border-none normal-case" 
                          />
                        </td>
                        <td className={classes}>
                          <Typography variant="small" className="text-gray-700 font-medium">
                            {row.district || "-"}
                          </Typography>
                          <Typography className="text-[10px] text-gray-400">
                            {row.subdistrict || "-"}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Chip
                            variant="ghost"
                            size="sm"
                            value={row.isActive ? "Active" : "Inactive"}
                            color={row.isActive ? "green" : "red"}
                            className="text-[10px] font-bold rounded-lg"
                          />
                        </td>
                        <td className={classes}>
                          <div className="flex items-center gap-2">
                            <Button onClick={() => handleOpenDetail(row)} size="sm" variant="text" className="text-blue-600 capitalize text-xs font-bold shadow-none hover:bg-blue-50">Detail</Button>
                            <Button onClick={() => handleOpenEdit(row)} size="sm" className="bg-green-500 shadow-none rounded-lg capitalize hover:shadow-md">Edit</Button>
                            <Button onClick={() => handleOpenDelete(row)} size="sm" className="bg-red-400 shadow-none rounded-lg capitalize hover:shadow-md">Hapus</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-5 border-t border-blue-50 bg-white">
            <Typography variant="small" className="font-medium text-gray-600">
              Menampilkan <span className="text-blue-700">{machines.length}</span> dari <span className="text-blue-700">{totalData}</span> mesin
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
                <Typography variant="small" className="font-bold text-blue-700">{page}</Typography>
                <Typography variant="small" className="font-normal text-gray-500">/ {totalPages}</Typography>
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

        {/* MODAL SECTION */}
        <CreateModal 
          open={openCreate} 
          handleOpen={() => setOpenCreate(false)} 
          refreshData={fetchMachines} 
        />
        
        {selectedData && (
          <>
            <EditModal 
              open={openEdit} 
              handleOpen={() => { setOpenEdit(false); }} 
              data={selectedData} 
              refreshData={fetchMachines} 
            />
            <DeleteModal 
              open={openDelete} 
              handleOpen={() => { setOpenDelete(false); }} 
              data={selectedData} 
              refreshData={fetchMachines} 
            />
            <DetailModal 
              open={openDetail} 
              handleOpen={() => { setOpenDetail(false); }} 
              data={selectedData} 
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default SmartContainerIndex;