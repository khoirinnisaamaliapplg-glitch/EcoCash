import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api"; 
import MainLayout from "../MainLayout";
import { 
  Card, 
  Typography, 
  Button, 
  Input, 
  IconButton, 
  Spinner 
} from "@material-tailwind/react";
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpDownIcon
} from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDebounce } from "use-debounce";

import AddWasteTypeModal from "./AddWasteTypeModal";
import EditWasteTypeModal from "./EditWasteTypeModal";
import DeleteWasteTypeModal from "./DeleteWasteTypeModal";

const ENDPOINT = "/waste-types"; 

const TABLE_HEAD = [
  { label: "Nama Jenis Sampah", value: "name" },
  { label: "Aksi", value: null },
];

const WasteManagementIndex = () => {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchWasteTypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(ENDPOINT, {
        params: {
          page: Number(page),
          limit: Number(limit),
          search: debouncedSearch || undefined,
          sortBy,
          sortOrder,
        }
      });

      const result = response.data;
      setWasteTypes(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalData(result.pagination?.totalItems || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      const errorMsg = error.response?.data?.message || "Gagal mengambil data jenis sampah.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchWasteTypes();
  }, [fetchWasteTypes]);

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
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Typography variant="h4" className="text-[#2b6cb0] font-black uppercase italic">
              Waste Types
            </Typography>
            <Typography variant="small" className="text-gray-500 italic font-medium">
              Master data management for EcoCash AIoT Systems
            </Typography>
          </div>
          <Button 
            onClick={() => setOpenAdd(true)} 
            className="bg-[#66bb6a] flex items-center gap-2 normal-case rounded-xl shadow-none hover:shadow-lg transition-all py-3 font-black uppercase italic text-[11px]"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add New Type
          </Button>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row justify-end gap-4">
          <div className="w-full md:w-80">
            <Input 
              label="Cari jenis sampah..." 
              icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              color="blue"
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Table Card */}
        <Card className="rounded-[24px] overflow-hidden border border-blue-50 shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] table-auto text-left">
              <thead>
                <tr className="bg-[#e3f2fd]/40">
                  {TABLE_HEAD.map((head) => (
                    <th 
                      key={head.label}
                      onClick={() => handleSort(head.value)}
                      className={`p-4 border-b border-blue-gray-50 transition-colors ${head.value ? "cursor-pointer hover:bg-blue-100/50" : ""}`}
                    >
                      <div className={`flex items-center gap-2 ${head.label === "Aksi" ? "justify-center" : "justify-start"}`}>
                        <Typography className="font-black text-[#2b6cb0] uppercase text-[10px] tracking-widest leading-none">
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
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={2} className="p-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Spinner className="h-8 w-8 text-blue-500" />
                        <Typography className="text-gray-400 italic font-black uppercase text-[10px] animate-pulse">Syncing Waste Data...</Typography>
                      </div>
                    </td>
                  </tr>
                ) : wasteTypes.length > 0 ? (
                  wasteTypes.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/20 transition-colors border-b border-blue-gray-50">
                      <td className="p-4 capitalize font-bold text-blue-900 text-sm">
                        {item.name}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
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
                    <td colSpan={2} className="text-center py-20 text-gray-400 italic text-sm">
                      No data available. Add a new waste type to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-5 border-t border-blue-gray-50 bg-white">
            <Typography variant="small" className="font-black text-[10px] uppercase text-gray-500">
              Showing <span className="text-blue-700">{wasteTypes.length}</span> of <span className="text-blue-700">{totalData}</span> entries
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

        {/* Modals */}
        <AddWasteTypeModal 
          open={openAdd} 
          handleOpen={() => setOpenAdd(false)} 
          refreshData={fetchWasteTypes} 
        />

        {selectedItem && (
          <>
            <EditWasteTypeModal 
              open={openEdit} 
              handleOpen={() => {
                setOpenEdit(false);
                setSelectedItem(null);
              }} 
              data={selectedItem} 
              refreshData={fetchWasteTypes} 
            />
            <DeleteWasteTypeModal 
              open={openDelete} 
              handleOpen={() => {
                setOpenDelete(false);
                setSelectedItem(null);
              }} 
              data={selectedItem} 
              refreshData={fetchWasteTypes} 
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default WasteManagementIndex;