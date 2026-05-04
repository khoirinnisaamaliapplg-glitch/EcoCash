import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MainLayout from "../MainLayout";
import {
  Card,
  Typography,
  Button,
  Input,
  IconButton,
  Spinner,
} from "@material-tailwind/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { useDebounce } from "use-debounce";
import { toast, ToastContainer } from "react-toastify";

import CreateStoreModal from "./CreateStoreModal";
import EditStoreModal from "./EditStoreModal";
import DeleteStoreModal from "./DeleteStoreModal";

const API_URL = "http://localhost:3000/api/stores";

const TABLE_HEAD = [
  { label: "ID", value: "id", align: "center" },
  { label: "Toko & Area", value: "name", align: "left" },
  { label: "Alamat", value: "address", align: "left" },
  { label: "Admin", value: "adminId", align: "left" },
  { label: "Action", value: null, align: "center" },
];

const MarketPlaceIndex = () => {
  // --- States ---
  const [stores, setStores] = useState([]);
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
  const [selectedStore, setSelectedStore] = useState(null);

  // --- Functions ---

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          isActive: true, // Filter default toko aktif
          page,
          limit,
          search: debouncedSearch,
          sortBy,
          sortOrder,
        },
      });

      const result = response.data;
      setStores(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalData(result.pagination?.totalItems || 0);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Gagal memuat data toko.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

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

  return (
    <MainLayout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="space-y-6 px-4 pb-10">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">
            Store Management
          </Typography>
          <Typography className="text-gray-500 text-sm italic">
            Kelola unit toko EcoCash (Hanya menampilkan toko aktif)
          </Typography>
        </div>

        {/* Action: Add & Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 bg-[#66bb6a] normal-case rounded-xl py-3 shadow-none hover:shadow-lg transition-all"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Tambah Toko
          </Button>
          <div className="w-full md:w-80">
            <Input
              label="Cari nama toko..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              color="blue"
            />
          </div>
        </div>

        {/* Table Card */}
        <Card className="rounded-[24px] overflow-hidden border border-blue-50 shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-auto text-left">
              <thead>
                <tr className="bg-[#e3f2fd]/40">
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head.label}
                      onClick={() => handleSort(head.value)}
                      className={`p-4 border-b border-blue-gray-50 transition-colors ${
                        head.value ? "cursor-pointer hover:bg-blue-100/50" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          head.align === "center" ? "justify-center" : "justify-between"
                        }`}
                      >
                        <Typography className="font-black text-[#2b6cb0] uppercase text-[10px] tracking-widest leading-none">
                          {head.label}
                        </Typography>
                        {head.value && (
                          <ChevronUpDownIcon
                            className={`h-4 w-4 ${
                              sortBy === head.value ? "text-blue-700" : "text-gray-400"
                            }`}
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Spinner className="h-8 w-8 text-blue-500" />
                        <Typography className="text-gray-400 italic text-sm">Memuat data...</Typography>
                      </div>
                    </td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center italic text-gray-400">
                      Tidak ada toko aktif ditemukan
                    </td>
                  </tr>
                ) : (
                  stores.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50/20 border-b border-blue-gray-50 transition-colors"
                    >
                      <td className="p-4 text-center">
                        <Typography className="text-sm font-bold text-blue-800">
                          #{row.id}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-[12px] text-blue-900 font-black uppercase leading-none">
                          {row.name}
                        </Typography>
                        <Typography className="text-[10px] text-gray-500 mt-1">
                          Area: {row.area?.name || "N/A"}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-[11px] text-gray-600 max-w-[250px] leading-relaxed">
                          {row.address}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-[11px] font-bold text-blue-700">
                          {row.admin?.name || "No Admin"}
                        </Typography>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-1">
                          <IconButton
                            variant="text"
                            color="green"
                            onClick={() => {
                              setSelectedStore(row);
                              setOpenEdit(true);
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            variant="text"
                            color="red"
                            onClick={() => {
                              setSelectedStore(row);
                              setOpenDelete(true);
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-5 border-t border-blue-gray-50 bg-white">
            <Typography variant="small" className="font-medium text-gray-600">
              Menampilkan <span className="text-blue-700">{stores.length}</span> dari{" "}
              <span className="text-blue-700">{totalData}</span> data
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

      {/* Modals */}
      <CreateStoreModal
        open={openCreate}
        handleOpen={() => setOpenCreate(false)}
        onSuccess={fetchStores}
      />

      {selectedStore && (
        <>
          <EditStoreModal
            open={openEdit}
            handleOpen={() => setOpenEdit(false)}
            data={selectedStore}
            onSuccess={fetchStores}
          />
          <DeleteStoreModal
            open={openDelete}
            handleOpen={() => setOpenDelete(false)}
            data={selectedStore}
            onSuccess={fetchStores}
          />
        </>
      )}
    </MainLayout>
  );
};

export default MarketPlaceIndex;