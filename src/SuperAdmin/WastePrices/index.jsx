import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api"; 
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
  ChevronUpDownIcon,
  PencilSquareIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDebounce } from "use-debounce";

import AddWastePriceModal from "./AddWastePriceModal";
import EditWastePriceModal from "./EditWastePriceModal";
import DeleteWastePriceModal from "./DeleteWastePriceModal";

const ENDPOINT = "/waste-prices";

const TABLE_HEAD = [
  { label: "Wilayah", value: "areaId" },
  { label: "Jenis Sampah", value: "wasteTypeId" },
  { label: "Harga / Kg", value: "pricePerKg" },
  { label: "Terakhir Update", value: "updatedAt" },
  { label: "Aksi", value: null },
];

const WastePricesIndex = () => {
  const [wasteData, setWasteData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(ENDPOINT, {
        params: {
          page,
          limit,
          search: debouncedSearch || undefined,
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
      const msg = error.response?.data?.message || "Gagal memuat data harga sampah.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleSort = (value) => {
    if (!value) return;
    const isAsc = sortBy === value && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(value);
  };

  return (
    <MainLayout>
      {/* Toast Container dengan z-index tinggi agar selalu di atas Modal */}
      <style>{`.Toastify__toast-container { z-index: 99999 !important; }`}</style>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop />
      
      <div className="space-y-6 px-4 pb-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Typography variant="h4" className="text-[#2b6cb0] font-black uppercase italic">
              Waste Prices
            </Typography>
            <Typography variant="small" className="text-gray-500 italic font-medium">
              Atur standar harga sampah tiap wilayah AIoT EcoCash
            </Typography>
          </div>
          <Button 
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 bg-[#66bb6a] normal-case rounded-xl shadow-none hover:shadow-lg transition-all py-3 font-black uppercase italic text-[11px]"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Price
          </Button>
        </div>

        {/* Action: Search */}
        <div className="flex justify-end">
          <div className="w-full md:w-80">
            <Input 
              label="Cari wilayah atau jenis..." 
              icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              color="blue"
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Table Card */}
        <Card className="rounded-[24px] overflow-hidden border border-blue-50 shadow-sm bg-white/50">
          <div className="overflow-x-auto p-4">
            <table className="w-full min-w-[700px] table-auto border-separate border-spacing-y-2">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th 
                      key={head.label}
                      onClick={() => handleSort(head.value)}
                      className={`pb-4 px-4 text-[#2b6cb0] text-[10px] font-black uppercase tracking-widest ${head.value ? "cursor-pointer hover:text-blue-800 transition-colors" : ""}`}
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
                          <Spinner className="h-8 w-8 text-blue-500" />
                          <Typography className="text-[10px] font-black uppercase italic text-gray-400 animate-pulse">Syncing Price Data...</Typography>
                       </div>
                    </td>
                  </tr>
                ) : wasteData.length > 0 ? (
                  wasteData.map((item) => (
                    <tr key={item.id} className="bg-white hover:bg-blue-50/40 transition-all shadow-sm">
                      <td className="p-4 rounded-l-xl text-center font-bold text-blue-900 border-y border-l border-blue-50 text-sm">
                        {item.area?.name || "-"}
                      </td>
                      <td className="p-4 text-center border-y border-blue-50">
                        <Chip 
                           value={item.wasteType?.name || "N/A"} 
                           variant="ghost" 
                           color="blue" 
                           className="rounded-lg lowercase font-bold" 
                        />
                      </td>
                      <td className="p-4 text-center font-black text-blue-700 border-y border-blue-50 text-sm">
                        Rp {Number(item.pricePerKg).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-center text-[11px] font-medium text-gray-500 border-y border-blue-50 italic">
                        {new Date(item.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 rounded-r-xl border-y border-r border-blue-50 text-center">
                        <div className="flex justify-center gap-1">
                           <IconButton 
                             variant="text" 
                             color="blue"
                             onClick={() => {
                               setSelectedItem(item);
                               setOpenEdit(true);
                             }}
                           >
                             <PencilSquareIcon className="h-5 w-5" />
                           </IconButton>
                           <IconButton 
                             variant="text" 
                             color="red" 
                             onClick={() => {
                               setSelectedItem(item);
                               setOpenDelete(true);
                             }}
                           >
                             <TrashIcon className="h-5 w-5" />
                           </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-20 text-gray-400 italic text-sm">
                      Data tidak ditemukan. Silakan tambah harga baru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-5 border-t border-blue-gray-50 bg-white">
            <Typography variant="small" className="font-black text-[10px] uppercase text-gray-500">
              Showing <span className="text-blue-700">{wasteData.length}</span> of <span className="text-blue-700">{totalData}</span> entries
            </Typography>
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || loading}
                className="flex items-center gap-1 border-blue-gray-100 font-black text-[10px] uppercase italic"
              >
                <ChevronLeftIcon className="h-3 w-3 stroke-[3]" /> Prev
              </Button>
              <Typography variant="small" className="font-black text-blue-700 text-[11px]">
                {page} <span className="text-gray-400 font-medium">/ {totalPages}</span>
              </Typography>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || loading}
                className="flex items-center gap-1 border-blue-gray-100 font-black text-[10px] uppercase italic"
              >
                Next <ChevronRightIcon className="h-3 w-3 stroke-[3]" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* MODALS */}
      <AddWastePriceModal 
        open={openAdd} 
        handleOpen={() => setOpenAdd(false)} 
        refreshData={fetchData} 
      />

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