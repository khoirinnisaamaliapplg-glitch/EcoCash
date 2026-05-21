import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../MainLayout"; 
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import DetailModal from "./DetailModal";
import api from "../../utils/api";

import { 
  Card, 
  Typography, 
  Button, 
  Input, 
  Chip, 
  Spinner,
  Progress, 
} from "@material-tailwind/react";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArrowPathIcon,
  ChevronUpDownIcon 
} from "@heroicons/react/24/outline";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDebounce } from "use-debounce";

const TABLE_HEAD = [
  { label: "Machine Code", value: "machineCode" },
  { label: "Name & Place", value: "name" },
  { label: "Capacity", value: "fillPercentage" }, 
  { label: "Area", value: "areaId" },
  { label: "Status", value: "isActive" },
  { label: "Action", value: null },
];

const SmartContainerIndex = () => {
  const [machines, setMachines] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const fetchMachines = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/machines", {
        params: {
          page: Number(page),
          limit: Number(limit),
          search: debouncedSearch || undefined, 
          sortBy: ["createdAt", "name", "machineCode", "fillPercentage"].includes(sortBy) ? sortBy : "createdAt",
          sortOrder: sortOrder,
        }
      });
      
      const result = response.data;
      setMachines(result.data || []);
      setTotalPages(result.meta?.totalPages || 1);
      setTotalData(result.meta?.total || 0); 
      
    } catch (error) {
      console.error("Gagal mengambil data mesin:", error.response?.data || error.message);
      const msg = error.response?.data?.message || "Koneksi database terganggu.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleSort = (value) => {
    if (!value) return;
    const isAsc = sortBy === value && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(value);
  };

  const getProgressColor = (percent) => {
    if (percent >= 80) return "red";
    if (percent >= 50) return "amber";
    return "green";
  };

  return (
    <MainLayout>
      {/* CSS ini memastikan Toast berada di atas modal */}
      <style>
        {`.Toastify__toast-container { z-index: 99999 !important; }`}
      </style>
      
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="p-4 md:p-0 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Typography variant="h4" className="text-[#2b6cb0] font-bold text-2xl md:text-3xl">
              Smart Container
            </Typography>
            <Typography className="text-gray-500 text-sm italic">
              Monitoring Database System (Limiter Off)
            </Typography>
          </div>
          <Button 
            variant="text" 
            size="sm" 
            className="flex items-center gap-2 text-blue-600 font-bold navigation-case"
            onClick={fetchMachines}
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <Button 
            onClick={() => setOpenCreate(true)}
            className="flex items-center justify-center gap-2 bg-[#4CAF50] normal-case"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Machine
          </Button>
          
          <div className="w-full md:w-80">
            <Input
              label="Cari Mesin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
        </div>

        <Card className="w-full border border-blue-50 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] table-auto text-left">
              <thead>
                <tr className="bg-[#f8fbff]">
                  {TABLE_HEAD.map((head) => (
                    <th 
                      key={head.label} 
                      onClick={() => handleSort(head.value)}
                      className={`p-5 border-b border-blue-50 ${head.value ? "cursor-pointer" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Typography className="font-bold text-[#2b6cb0] uppercase text-[10px]">
                          {head.label}
                        </Typography>
                        {head.value && <ChevronUpDownIcon className="h-4 w-4" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center"><Spinner className="mx-auto" /></td>
                  </tr>
                ) : machines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center">Data tidak ditemukan.</td>
                  </tr>
                ) : (
                  machines.map((row, index) => (
                    <tr key={row.id || index} className="hover:bg-blue-50/10 transition-colors">
                      <td className="p-5 border-b border-blue-50/50">
                        <Typography variant="small" className="font-bold text-blue-900">
                          {row.machineCode}
                        </Typography>
                      </td>
                      <td className="p-5 border-b border-blue-50/50">
                        <Typography variant="small" className="font-semibold">{row.name}</Typography>
                        <Typography className="text-[10px] text-gray-500">{row.placeName || row.district}</Typography>
                      </td>
                      <td className="p-5 border-b border-blue-50/50 w-64">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between mb-1">
                            <Typography variant="small" className="text-[10px] font-bold">
                              Level: {row.fillLevel} cm
                            </Typography>
                            <Typography variant="small" className="text-[10px] font-bold">
                              {row.fillPercentage}%
                            </Typography>
                          </div>
                          <Progress 
                            value={row.fillPercentage} 
                            size="sm" 
                            color={getProgressColor(row.fillPercentage)}
                          />
                        </div>
                      </td>
                      <td className="p-5 border-b border-blue-50/50">
                        <Chip value={row.area?.name || "No Area"} size="sm" variant="ghost" className="capitalize" />
                      </td>
                      <td className="p-5 border-b border-blue-50/50">
                        <Chip 
                          value={row.isActive ? "Active" : "Inactive"} 
                          color={row.isActive ? "green" : "red"} 
                          size="sm" 
                        />
                      </td>
                      <td className="p-5 border-b border-blue-50/50">
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => { setSelectedData(row); setOpenDetail(true); }} 
                            size="sm" 
                            variant="text" 
                            className="text-blue-600 normal-case"
                          >
                            Detail
                          </Button>
                          <Button 
                            onClick={() => { setSelectedData(row); setOpenEdit(true); }} 
                            size="sm" 
                            color="green" 
                            variant="gradient"
                            className="normal-case"
                          >
                            Edit
                          </Button>
                          <Button 
                            onClick={() => { setSelectedData(row); setOpenDelete(true); }} 
                            size="sm" 
                            color="red" 
                            variant="gradient"
                            className="normal-case"
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

          <div className="flex items-center justify-between p-5 border-t border-blue-50">
            <Typography variant="small" className="text-gray-600">
              Menampilkan <b>{machines.length}</b> dari <b>{totalData}</b> mesin
            </Typography>
            <div className="flex items-center gap-2">
              <Button
                variant="outlined" size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="border-blue-100"
              >
                Prev
              </Button>
              <Typography variant="small" className="font-bold text-blue-700 mx-2">
                {page} / {totalPages}
              </Typography>
              <Button
                variant="outlined" size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="border-blue-100"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        {/* Modals */}
        <CreateModal 
          open={openCreate} 
          handleOpen={() => setOpenCreate(false)} 
          refreshData={fetchMachines} 
        />

        {selectedData && (
          <>
            <EditModal 
              open={openEdit} 
              handleOpen={() => { setOpenEdit(false); setSelectedData(null); }} 
              data={selectedData} 
              refreshData={fetchMachines} 
            />
            <DetailModal 
              open={openDetail} 
              handleOpen={() => { setOpenDetail(false); setSelectedData(null); }} 
              data={selectedData} 
            />
            <DeleteModal 
              open={openDelete} 
              handleOpen={() => { setOpenDelete(false); setSelectedData(null); }} 
              data={selectedData} 
              refreshData={fetchMachines} 
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default SmartContainerIndex;