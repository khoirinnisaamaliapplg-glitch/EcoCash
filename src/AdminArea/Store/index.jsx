import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
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
  Tooltip,
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
import toast from "react-hot-toast";

// Import Modal
import CreateStoreModal from "./CreateStoreModal";
import EditStoreModal from "./EditStoreModal";
import DeleteStoreModal from "./DeleteStoreModal";

const API_URL = "http://localhost:3000/api/stores";
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

  const getAuthHeader = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }), []);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, getAuthHeader());
      const allData = response.data.data || [];
      const activeOnly = allData.filter(store => store.isActive !== false);
      setStores(activeOnly);
    } catch (error) {
      toast.error("Gagal memuat data toko");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

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

  const handleCreate = async (payload) => {
    const loadId = toast.loading("Menambahkan toko...");
    try {
      await axios.post(API_URL, payload, getAuthHeader());
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
      await axios.patch(`${API_URL}/${id}`, payload, getAuthHeader());
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
      await axios.patch(`${API_URL}/${id}`, { isActive: false }, getAuthHeader());
      toast.success("Toko berhasil dihapus", { id: loadId });
      setOpenDelete(false);
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus toko", { id: loadId });
    }
  };

  return (
    <MainLayout>
      {/* Menggunakan min-h-fit agar container membungkus rapat kontennya */}
      <div className="p-6 space-y-6 bg-gray-50/50 min-h-fit">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[24px] shadow-sm border border-blue-50">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-blue-200 shadow-lg">
              <BuildingStorefrontIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <Typography variant="h4" className="text-blue-900 font-extrabold tracking-tight">
                Store Management
              </Typography>
              <Typography className="text-gray-500 text-sm font-medium">
                Daftar unit toko aktif <span className="text-blue-600 font-bold">EcoCash</span>
              </Typography>
            </div>
          </div>
          <Button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-3 shadow-md normal-case transition-all"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> 
            <span className="font-bold text-sm">Tambah Toko</span>
          </Button>
        </div>

        {/* --- TOOLBAR SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 lg:col-span-9">
            <Input
              variant="outlined"
              label="Cari toko, alamat, atau admin..."
              icon={<MagnifyingGlassIcon className="h-5 w-5 text-blue-gray-300" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white !rounded-xl"
              containerProps={{ className: "shadow-sm" }}
            />
          </div>
          <div className="md:col-span-4 lg:col-span-3">
            <Select
              label="Baris"
              value={String(itemsPerPage)}
              onChange={(val) => setItemsPerPage(Number(val))}
              className="bg-white !rounded-xl"
              containerProps={{ className: "shadow-sm" }}
            >
              <Option value="5">5 Baris</Option>
              <Option value="10">10 Baris</Option>
              <Option value="20">20 Baris</Option>
            </Select>
          </div>
        </div>

        {/* --- TABLE SECTION --- */}
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
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                           <Typography className="text-gray-400 text-xs italic font-medium">Memuat data...</Typography>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedStores.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <Typography className="text-gray-400 text-sm font-medium italic">Data tidak ditemukan</Typography>
                      </td>
                    </tr>
                  ) : (
                    paginatedStores.map((row) => (
                      <tr key={row.id} className="hover:bg-blue-50/10 transition-colors">
                        <td className="px-6 py-3">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">#{row.id}</span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex flex-col">
                            <Typography className="text-sm font-bold text-gray-900 uppercase leading-none mb-1">
                              {row.name}
                            </Typography>
                            <Typography className="text-[10px] text-blue-500 font-bold flex items-center gap-1 uppercase">
                              <MapPinIcon className="h-3 w-3" /> {row.area?.name || "N/A"}
                            </Typography>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <Typography className="text-[11px] text-gray-600 max-w-[220px] line-clamp-2">
                            {row.address || "-"}
                          </Typography>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <UserCircleIcon className="h-6 w-6 text-gray-400" />
                            <div className="flex flex-col">
                              <Typography className="text-xs font-bold text-gray-800">{row.admin?.name || "-"}</Typography>
                              <Typography className="text-[10px] text-gray-400">{row.admin?.email || ""}</Typography>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <Chip size="sm" value="AKTIF" color="green" className="rounded-md font-bold text-[9px] py-1 px-2" />
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1">
                            <IconButton variant="text" color="blue" size="sm" onClick={() => { setSelectedStore(row); setOpenEdit(true); }}>
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                            <IconButton variant="text" color="red" size="sm" onClick={() => { setSelectedStore(row); setOpenDelete(true); }}>
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

          {/* --- FOOTER PAGINATION --- */}
          <div className="flex items-center justify-between p-5 bg-white border-t border-gray-50">
            <Typography variant="small" className="text-gray-500 text-xs font-medium">
              Data <span className="text-blue-900 font-bold">{paginatedStores.length}</span> / <span className="text-blue-900 font-bold">{filteredStores.length}</span> Toko
            </Typography>
            <div className="flex items-center gap-2">
              <Button
                variant="text"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg font-bold normal-case text-xs"
              >
                <ChevronLeftIcon className="h-3 w-3 stroke-2" /> Prev
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <IconButton
                    key={i}
                    size="sm"
                    variant={currentPage === (i + 1) ? "filled" : "text"}
                    color={currentPage === (i + 1) ? "blue" : "blue-gray"}
                    onClick={() => setCurrentPage(i + 1)}
                    className="h-8 w-8 rounded-lg"
                  >
                    {i + 1}
                  </IconButton>
                ))}
              </div>
              <Button
                variant="text"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center gap-1 rounded-lg font-bold normal-case text-xs"
              >
                Next <ChevronRightIcon className="h-3 w-3 stroke-2" />
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Spacing penutup */}
        <div className="pb-2"></div>
      </div>

      {/* --- MODALS SECTION --- */}
      <CreateStoreModal open={openCreate} handleOpen={() => setOpenCreate(false)} onConfirm={handleCreate} />
      {selectedStore && (
        <>
          <EditStoreModal open={openEdit} handleOpen={() => setOpenEdit(false)} data={selectedStore} onConfirm={(data) => handleUpdate(selectedStore.id, data)} />
          <DeleteStoreModal open={openDelete} handleOpen={() => setOpenDelete(false)} data={selectedStore} onConfirm={() => handleDelete(selectedStore.id)} />
        </>
      )}
    </MainLayout>
  );
};

export default StoreIndex;