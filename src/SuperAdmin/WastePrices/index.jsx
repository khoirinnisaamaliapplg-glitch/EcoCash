import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MainLayout from "../MainLayout";
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
  ChevronRightIcon, 
  ChevronLeftIcon,
  ChevronUpDownIcon 
} from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import { useDebounce } from "use-debounce";

import AddWastePriceModal from "./AddWastePriceModal";
import EditWastePriceModal from "./EditWastePriceModal";
import DeleteWastePriceModal from "./DeleteWastePriceModal";

const API_URL = "http://localhost:3000/api/waste-prices";

const TABLE_HEAD = [
  { label: "Wilayah", value: "areaId" },
  { label: "Jenis Sampah", value: "wasteTypeId" },
  { label: "Harga / Kg", value: "pricePerKg" },
  { label: "Terakhir Update", value: "updatedAt" },
  { label: "Aksi", value: null },
];

const WastePricesIndex = () => {
  // --- States ---
  const [wasteData, setWasteData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Query (Pagination, Search, Sort)
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // State Modal
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- Functions ---

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit,
          search: debouncedSearch,
          sortBy,
          sortOrder,
        }
      });
      
      const result = response.data;
      setWasteData(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalData(result.pagination?.totalItems || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        toast.error("Sesi habis, silakan login kembali.");
      } else {
        toast.error("Gagal memuat data harga sampah.");
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setOpenEdit(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setOpenDelete(true);
  };

  return (
    <MainLayout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="space-y-6 px-2 md:px-0 pb-10">
        {/* Header */}
        <div className="flex flex-col gap-1 px-4 md:px-0">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">
            Waste Prices
          </Typography>
          <Typography className="text-gray-500 text-sm italic">
            Atur standar harga sampah tiap wilayah AIoT
          </Typography>
        </div>

        {/* Action: Add & Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4 px-4 md:px-0">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table Card */}
        <Card className="rounded-[24px] overflow-hidden border border-blue-50 shadow-sm p-4 bg-white/50 mx-4 md:mx-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-auto border-separate border-spacing-y-2">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th 
                      key={head.label}
                      onClick={() => handleSort(head.value)}
                      className={`pb-4 px-4 text-[#2b6cb0] text-[11px] font-black uppercase tracking-widest ${head.value ? "cursor-pointer hover:text-blue-800 transition-colors" : ""}`}
                    >
                      <div className="flex items-center justify-center gap-1">
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
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center">
                       <div className="flex flex-col items-center gap-2">
                          <Spinner className="h-8 w-8 text-green-500" />
                          <Typography className="text-sm text-gray-500 italic">Memuat data...</Typography>
                       </div>
                    </td>
                  </tr>
                ) : wasteData.length > 0 ? (
                  wasteData.map((item) => (
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
                           <Button 
                             size="sm" 
                             className="bg-green-500 normal-case shadow-none"
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400 italic">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-4 border-t border-blue-gray-50 bg-white/50 rounded-b-xl">
            <Typography variant="small" className="font-medium text-gray-600">
              Menampilkan <span className="text-blue-700">{wasteData.length}</span> dari <span className="text-blue-700">{totalData}</span> data
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
      </div>

      {/* MODAL ADD */}
      <AddWastePriceModal 
        open={openAdd} 
        handleOpen={() => setOpenAdd(false)} 
        refreshData={fetchData} 
      />

      {/* MODAL EDIT */}
      {selectedItem && (
        <>
          <EditWastePriceModal 
            open={openEdit} 
            handleOpen={() => {
                setOpenEdit(false);
                setSelectedItem(null);
            }}  
            data={selectedItem}
            refreshData={fetchData}
          />
          <DeleteWastePriceModal 
            open={openDelete} 
            handleOpen={() => {
                setOpenDelete(false);
                setSelectedItem(null);
            }}
            data={selectedItem}
            refreshData={fetchData}
          />
        </>
      )}
    </MainLayout>
  );
};

export default WastePricesIndex;