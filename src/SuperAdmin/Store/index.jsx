import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MainLayout from "../MainLayout";
import {
  Card,
  Typography,
  Button,
  Input,
  IconButton,
} from "@material-tailwind/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import CreateStoreModal from "./CreateStoreModal";
import EditStoreModal from "./EditStoreModal";
import DeleteStoreModal from "./DeleteStoreModal";

const API_URL = "http://localhost:3000/api/stores";

// Definisi Header dengan Alignment yang konsisten
const TABLE_HEAD = [
  { label: "ID", align: "center" },
  { label: "Toko & Area", align: "left" },
  { label: "Alamat", align: "left" },
  { label: "Admin", align: "left" },
  { label: "Action", align: "center" },
];

const MarketPlaceIndex = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  // Helper Header untuk Auth
  const getAuthHeader = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }), []);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}?search=${searchTerm}`,
        getAuthHeader()
      );
      setStores(response.data.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, getAuthHeader]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleCreateStore = async (payload) => {
    try {
      const response = await axios.post(API_URL, payload, getAuthHeader());
      alert(response.data.message || "Toko berhasil dibuat");
      fetchStores();
      setOpenCreate(false);
    } catch (error) {
      alert(error.response?.data?.message || "Gagal membuat toko");
    }
  };

  const handleUpdateStore = async (id, payload) => {
    try {
      await axios.patch(`${API_URL}/${id}`, payload, getAuthHeader());
      fetchStores();
      setOpenEdit(false);
      setOpenDelete(false);
    } catch (error) {
      alert(error.response?.data?.message || "Operasi gagal");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 px-4 pb-10">
        {/* JUDUL HALAMAN */}
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">
            Store Management
          </Typography>
          <Typography className="text-gray-500 text-sm italic">
            Kelola unit toko EcoCash (Super Admin)
          </Typography>
        </div>

        {/* TOOLBAR: TOMBOL TAMBAH & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 bg-[#66bb6a] normal-case rounded-xl shadow-none py-3"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Tambah Toko
          </Button>
          <div className="w-full md:w-80">
            <Input
              label="Cari nama toko..."
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE CARD */}
        <Card className="rounded-[24px] overflow-hidden border border-blue-50 shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-auto text-left">
              <thead>
                <tr className="bg-[#e3f2fd]/40">
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head.label}
                      className={`p-4 border-b border-blue-gray-50 text-${head.align}`}
                    >
                      <Typography className="font-black text-[#2b6cb0] uppercase text-[10px] tracking-widest">
                        {head.label}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center italic text-gray-400">
                      Memuat data...
                    </td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center italic text-gray-400">
                      Data tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  stores.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50/20 border-b border-blue-gray-50 transition-colors"
                    >
                      {/* ID - Center */}
                      <td className="p-4 text-center">
                        <Typography className="text-sm font-bold text-blue-800">
                          #{row.id}
                        </Typography>
                      </td>

                      {/* TOKO & AREA - Left */}
                      <td className="p-4 text-left">
                        <Typography className="text-[12px] text-blue-900 font-black uppercase leading-none">
                          {row.name}
                        </Typography>
                        <Typography className="text-[10px] text-gray-500 mt-1">
                          Area: {row.area?.name || "N/A"}
                        </Typography>
                      </td>

                      {/* ALAMAT - Left */}
                      <td className="p-4 text-left">
                        <Typography className="text-[11px] text-gray-600 max-w-[250px] leading-relaxed">
                          {row.address}
                        </Typography>
                      </td>

                      {/* ADMIN - Left */}
                      <td className="p-4 text-left">
                        <Typography className="text-[11px] font-bold text-blue-700 leading-none">
                          {row.admin?.name || "No Admin"}
                        </Typography>
                        <Typography className="text-[10px] text-gray-500 mt-1">
                          {row.admin?.email || "-"}
                        </Typography>
                      </td>

                      {/* ACTION - Center */}
                      <td className="p-4">
                        <div className="flex justify-center gap-1">
                          <IconButton
                            variant="text"
                            color="green"
                            size="sm"
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
                            size="sm"
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
        </Card>
      </div>

      {/* MODALS */}
      <CreateStoreModal
        open={openCreate}
        handleOpen={() => setOpenCreate(false)}
        onConfirm={handleCreateStore}
      />

      {selectedStore && (
        <>
          <EditStoreModal
            open={openEdit}
            handleOpen={() => setOpenEdit(false)}
            data={selectedStore}
            onConfirm={(data) => handleUpdateStore(selectedStore.id, data)}
          />
          <DeleteStoreModal
            open={openDelete}
            handleOpen={() => setOpenDelete(false)}
            onConfirm={() =>
              handleUpdateStore(selectedStore.id, { isActive: false })
            }
          />
        </>
      )}
    </MainLayout>
  );
};

export default MarketPlaceIndex;