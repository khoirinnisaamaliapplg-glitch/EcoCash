import React, { useState, useEffect, useCallback, useMemo } from "react";
// 1. Konsisten menggunakan instance api.js yang sudah dibuat
import api from "../../utils/api"; 
import MainLayout from "../MainLayout";
import {
  Card,
  Typography,
  Button,
  Input,
  IconButton,
  Chip,
  Select,
  Option,
  CardBody,
  Spinner,
} from "@material-tailwind/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  BuildingStorefrontIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

import CreateStoreModal from "./CreateStoreModal";
import EditStoreModal from "./EditStoreModal";
import DeleteStoreModal from "./DeleteStoreModal";

// 2. Gunakan path relatif
const ENDPOINT = "/stores";
const TABLE_HEAD = ["ID", "Toko & Area", "Alamat", "Administrator", "Status", "Aksi"];

const StoreIndex = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  // 3. fetchData tidak perlu getAuthHeader manual karena sudah dihandle api.js interceptor
  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(ENDPOINT);
      const allData = response.data.data || [];
      // Filter data aktif (soft delete logic)
      const activeOnly = allData.filter(store => store.isActive !== false);
      setStores(activeOnly);
    } catch (error) {
      toast.error("Gagal memuat data toko");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Client-side filtering
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const searchContent = `${store.name} ${store.address} ${store.area?.name} ${store.admin?.name}`.toLowerCase();
      return searchContent.includes(searchTerm.toLowerCase());
    });
  }, [stores, searchTerm]);

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const paginatedStores = useMemo(() => {
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    return filteredStores.slice(firstIndex, lastIndex);
  }, [filteredStores, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // 4. CRUD Operations menggunakan instance 'api'
  const handleCreate = async (payload) => {
    const loadId = toast.loading("Menambahkan toko...");
    try {
      await api.post(ENDPOINT, payload);
      toast.success("Toko berhasil ditambahkan", { id: loadId });
      setOpenCreate(false);
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menambah toko", { id: loadId });
    }
  };

  const handleUpdate = async (id, payload) => {
    const loadId = toast.loading("Memperbarui data...");
    try {
      await api.patch(`${ENDPOINT}/${id}`, payload);
      toast.success("Data toko diperbarui", { id: loadId });
      setOpenEdit(false);
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal update toko", { id: loadId });
    }
  };

  const handleDelete = async (id) => {
    const loadId = toast.loading("Menghapus toko...");
    try {
      // Logic Soft Delete
      await api.patch(`${ENDPOINT}/${id}`, { isActive: false });
      toast.success("Toko berhasil dihapus", { id: loadId });
      setOpenDelete(false);
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus toko", { id: loadId });
    }
  };

  return (
    <MainLayout>
      <Toaster position="top-right" />
      <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[24px] shadow-sm border border-blue-50">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-blue-200 shadow-lg">
              <BuildingStorefrontIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <Typography variant="h4" className="text-blue-900 font-black tracking-tight uppercase italic">
                Store Management
              </Typography>
              <Typography className="text-gray-500 text-[11px] font-bold uppercase italic">
                Daftar unit toko aktif <span className="text-blue-600">AIoT EcoCash</span>
              </Typography>
            </div>
          </div>
          <Button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-3 shadow-none normal-case transition-all font-black text-[11px] uppercase italic"
          >
            <PlusIcon className="h-4 w-4 stroke-[3]" /> Tambah Toko
          </Button>
        </div>

        {/* TOOLBAR */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-2">
          <div className="md:col-span-9">
            <Input
              variant="outlined"
              label="Cari toko, alamat, atau admin..."
              icon={<MagnifyingGlassIcon className="h-5 w-5 text-blue-gray-300" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white !rounded-xl"
              color="blue"
            />
          </div>
          <div className="md:col-span-3">
            <Select
              label="Tampilkan Baris"
              value={String(itemsPerPage)}
              onChange={(val) => setItemsPerPage(Number(val))}
              className="bg-white !rounded-xl"
              color="blue"
            >
              <Option value="5">5 Baris</Option>
              <Option value="10">10 Baris</Option>
              <Option value="20">20 Baris</Option>
            </Select>
          </div>
        </div>

        {/* TABLE */}
        <Card className="rounded-[24px] overflow-hidden border border-blue-100/50 shadow-md shadow-blue-900/5">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] table-auto">
                <thead className="bg-blue-50/40">
                  <tr>
                    {TABLE_HEAD.map((head) => (
                      <th key={head} className="px-6 py-4 border-b border-blue-50 text-left">
                        <Typography className="font-black text-blue-800/80 uppercase text-[10px] tracking-widest">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                           <Spinner className="h-8 w-8 text-blue-600" />
                           <Typography className="text-gray-400 text-[10px] font-black uppercase italic animate-pulse">Syncing Stores...</Typography>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedStores.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-gray-400 italic text-sm">
                        Data toko tidak ditemukan
                      </td>
                    </tr>
                  ) : (
                    paginatedStores.map((row) => (
                      <tr key={row.id} className="hover:bg-blue-50/10 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">#{row.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <Typography className="text-sm font-black text-gray-900 uppercase leading-tight mb-1">
                              {row.name}
                            </Typography>
                            <Typography className="text-[10px] text-blue-500 font-black flex items-center gap-1 uppercase italic">
                              <MapPinIcon className="h-3 w-3" /> {row.area?.name || "N/A"}
                            </Typography>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Typography className="text-[11px] font-medium text-gray-600 max-w-[220px] line-clamp-2 italic">
                            {row.address || "-"}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <UserCircleIcon className="h-8 w-8 text-blue-gray-100" />
                            <div className="flex flex-col">
                              <Typography className="text-xs font-black text-gray-800 uppercase">{row.admin?.name || "-"}</Typography>
                              <Typography className="text-[10px] text-gray-400 font-medium">{row.admin?.email || ""}</Typography>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Chip size="sm" value="ACTIVE" color="green" variant="ghost" className="rounded-lg font-black text-[9px] py-1 px-2 uppercase" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <IconButton variant="text" color="blue" onClick={() => { setSelectedStore(row); setOpenEdit(true); }}>
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                            <IconButton variant="text" color="red" onClick={() => { setSelectedStore(row); setOpenDelete(true); }}>
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
          </CardBody>

          {/* FOOTER PAGINATION */}
          <div className="flex items-center justify-between p-5 bg-white border-t border-gray-50">
            <Typography variant="small" className="text-gray-500 font-black text-[10px] uppercase">
              Showing <span className="text-blue-900">{paginatedStores.length}</span> / <span className="text-blue-900">{filteredStores.length}</span> Stores
            </Typography>
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 border-blue-gray-100 font-black text-[10px] uppercase italic"
              >
                <ChevronLeftIcon className="h-3 w-3 stroke-2" /> Prev
              </Button>
              <div className="flex items-center gap-1 mx-2">
                 <Typography variant="small" className="font-black text-blue-700 text-[11px]">{currentPage}</Typography>
                 <Typography variant="small" className="font-medium text-gray-400 text-[11px]">/ {totalPages}</Typography>
              </div>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center gap-1 border-blue-gray-100 font-black text-[10px] uppercase italic"
              >
                Next <ChevronRightIcon className="h-3 w-3 stroke-2" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* MODALS */}
      <CreateStoreModal 
        open={openCreate} 
        handleOpen={() => setOpenCreate(false)} 
        onConfirm={handleCreate} 
      />
      
      {selectedStore && (
        <>
          <EditStoreModal 
            open={openEdit} 
            handleOpen={() => { setOpenEdit(false); setSelectedStore(null); }} 
            data={selectedStore} 
            onConfirm={(data) => handleUpdate(selectedStore.id, data)} 
          />
          <DeleteStoreModal 
            open={openDelete} 
            handleOpen={() => { setOpenDelete(false); setSelectedStore(null); }} 
            data={selectedStore} 
            onConfirm={() => handleDelete(selectedStore.id)} 
          />
        </>
      )}
    </MainLayout>
  );
};

export default StoreIndex;