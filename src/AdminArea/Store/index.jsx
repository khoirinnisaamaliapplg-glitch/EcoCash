import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MainLayout from "../MainLayout";
import {
  Card,
  Typography,
  Button,
  Input,
  IconButton,
  Chip,
} from "@material-tailwind/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

// Import Modal - Pastikan file ini ada di folder yang sama
import CreateStoreModal from "./CreateStoreModal";
import EditStoreModal from "./EditStoreModal";
import DeleteStoreModal from "./DeleteStoreModal";

const API_URL = "http://localhost:3000/api/stores";

const TABLE_HEAD = ["ID", "Toko & Area", "Alamat", "Admin", "Status", "Aksi"];

const StoreIndex = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Modals
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const getAuthHeader = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }), []);

  // --- 1. READ (Get All Stores) ---
  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}?search=${searchTerm}`, getAuthHeader());
      setStores(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, getAuthHeader]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // --- 2. CREATE (Post New Store) ---
  const handleCreate = async (payload) => {
    try {
      await axios.post(API_URL, payload, getAuthHeader());
      setOpenCreate(false);
      fetchStores();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menambah toko");
    }
  };

  // --- 3. UPDATE (Patch Store) ---
  const handleUpdate = async (id, payload) => {
    try {
      await axios.patch(`${API_URL}/${id}`, payload, getAuthHeader());
      setOpenEdit(false);
      fetchStores();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal update toko");
    }
  };

  // --- 4. DELETE (Soft Delete via Patch) ---
  const handleDelete = async (id) => {
    try {
      // Sesuai praktik umum Admin Area, kita ubah isActive jadi false
      await axios.patch(`${API_URL}/${id}`, { isActive: false }, getAuthHeader());
      setOpenDelete(false);
      fetchStores();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus toko");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 px-4 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BuildingStorefrontIcon className="h-6 w-6 text-blue-600" />
              <Typography variant="h4" className="text-blue-900 font-bold">
                Store Management
              </Typography>
            </div>
            <Typography className="text-gray-500 text-sm italic">
              Kelola toko dan unit area EcoCash
            </Typography>
          </div>
          <Button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 bg-green-500 rounded-xl shadow-none hover:shadow-lg"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Tambah Toko
          </Button>
        </div>

        {/* Search Bar */}
        <div className="max-w-sm">
          <Input
            label="Cari toko..."
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabel Store */}
        <Card className="rounded-2xl overflow-hidden border border-blue-50 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto text-left">
              <thead className="bg-blue-50/50">
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th key={head} className="p-4 border-b border-blue-gray-50">
                      <Typography className="font-bold text-blue-800 uppercase text-[11px] tracking-wider">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">Memuat data...</td></tr>
                ) : stores.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">Data tidak tersedia</td></tr>
                ) : (
                  stores.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50/20 border-b border-blue-gray-50 transition-colors">
                      <td className="p-4">
                        <Typography className="text-sm font-bold text-blue-700">#{row.id}</Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm font-bold text-gray-900 uppercase">{row.name}</Typography>
                        <Typography className="text-[11px] text-gray-500">Area: {row.area?.name || "N/A"}</Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-[12px] text-gray-600 max-w-[200px] truncate">{row.address}</Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm font-medium">{row.admin?.name || "-"}</Typography>
                        <Typography className="text-[11px] text-gray-400">{row.admin?.email}</Typography>
                      </td>
                      <td className="p-4">
                        <Chip
                          size="sm"
                          variant="ghost"
                          value={row.isActive !== false ? "Active" : "Inactive"}
                          color={row.isActive !== false ? "green" : "red"}
                          className="rounded-full"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <IconButton variant="text" color="blue" size="sm" 
                            onClick={() => { setSelectedStore(row); setOpenEdit(true); }}>
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton variant="text" color="red" size="sm" 
                            onClick={() => { setSelectedStore(row); setOpenDelete(true); }}>
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
        </Card>
      </div>

      {/* Modals Section */}
      <CreateStoreModal
        open={openCreate}
        handleOpen={() => setOpenCreate(false)}
        onConfirm={handleCreate}
      />

      {selectedStore && (
        <>
          <EditStoreModal
            open={openEdit}
            handleOpen={() => setOpenEdit(false)}
            data={selectedStore}
            onConfirm={(data) => handleUpdate(selectedStore.id, data)}
          />
          <DeleteStoreModal
            open={openDelete}
            handleOpen={() => setOpenDelete(false)}
            data={selectedStore}
            onConfirm={() => handleDelete(selectedStore.id)}
          />
        </>
      )}
    </MainLayout>
  );
};

export default StoreIndex;