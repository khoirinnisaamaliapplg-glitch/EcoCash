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
} from "@material-tailwind/react";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArrowPathIcon,
  ChevronRightIcon, 
  ChevronLeftIcon,
  ChevronUpDownIcon 
} from "@heroicons/react/24/outline";

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
      const token = localStorage.getItem("token");
      
      // Sinkronisasi Parameter untuk menghindari Error 400
      const response = await axios.get("http://localhost:3000/api/v1/machines", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: Number(page), // Pastikan Number
          limit: Number(limit),
          search: debouncedSearch || undefined, 
          // Pastikan sortBy sesuai whitelist backend: createdAt, name, machineCode
          sortBy: ["createdAt", "name", "machineCode"].includes(sortBy) ? sortBy : "createdAt",
          sortOrder: sortOrder,
          // isActive tidak dikirim secara eksplisit agar menggunakan default backend (true)
        }
      });
      
      const result = response.data;
      
      // Menggunakan result.data dan result.meta sesuai struktur backend Anda
      setMachines(result.data || []);
      setTotalPages(result.meta?.totalPages || 1);
      setTotalData(result.meta?.total || 0); 
      
    } catch (error) {
      console.error("Gagal mengambil data mesin:", error.response?.data);
      const msg = error.response?.data?.message || "Validation Invalid / Error 400";
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

  return (
    <MainLayout>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="p-4 md:p-0 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Typography variant="h4" className="text-[#2b6cb0] font-bold text-2xl md:text-3xl">
              Smart Container
            </Typography>
            <Typography className="text-gray-500 text-sm italic">
              Monitoring Database
            </Typography>
          </div>
          <Button 
            variant="text" 
            size="sm" 
            className="flex items-center gap-2 text-blue-600 font-bold"
            onClick={fetchMachines}
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
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
            <table className="w-full min-w-[900px] table-auto text-left">
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
                    <tr key={row.id || index} className="hover:bg-blue-50/10">
                      <td className="p-5 border-b border-blue-50/50">
                        <Typography variant="small" className="font-bold text-blue-900">
                          {row.machineCode}
                        </Typography>
                      </td>
                      <td className="p-5 border-b border-blue-50/50">
                        <Typography variant="small" className="font-semibold">{row.name}</Typography>
                        <Typography className="text-[10px] text-gray-500">{row.placeName}</Typography>
                      </td>
                      <td className="p-5 border-b border-blue-50/50">
                        <Chip value={row.area?.name || row.areaId} size="sm" variant="ghost" />
                      </td>
                      <td className="p-5 border-b border-blue-50/50">
                        <Typography variant="small">{row.district}</Typography>
                      </td>
                      <td className="p-5 border-b border-blue-50/50">
                        <Chip value={row.isActive ? "Active" : "Inactive"} color={row.isActive ? "green" : "red"} size="sm" />
                      </td>
                      <td className="p-5 border-b border-blue-50/50">
                        <div className="flex gap-2">
                          <Button onClick={() => { setSelectedData(row); setOpenDetail(true); }} size="sm" variant="text">Detail</Button>
                          <Button onClick={() => { setSelectedData(row); setOpenEdit(true); }} size="sm" color="green">Edit</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-5 border-t border-blue-50">
            <Typography variant="small">
              Total: <b>{totalData}</b> data
            </Typography>
            <div className="flex items-center gap-2">
              <Button
                variant="outlined" size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                Prev
              </Button>
              <Typography variant="small" className="font-bold">{page} / {totalPages}</Typography>
              <Button
                variant="outlined" size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        <CreateModal open={openCreate} handleOpen={() => setOpenCreate(false)} refreshData={fetchMachines} />
        {selectedData && (
          <>
            <EditModal open={openEdit} handleOpen={() => setOpenEdit(false)} data={selectedData} refreshData={fetchMachines} />
            <DetailModal open={openDetail} handleOpen={() => setOpenDetail(false)} data={selectedData} />
            <DeleteModal open={openDelete} handleOpen={() => setOpenDelete(false)} data={selectedData} refreshData={fetchMachines} />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default SmartContainerIndex;