import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../MainLayout";
import { Card, Typography, Button, Input, Chip, Avatar, IconButton } from "@material-tailwind/react";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  QrCodeIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon,
  ChevronUpDownIcon 
} from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from 'react-toastify';
import { useDebounce } from "use-debounce";

// Import Modal
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";

const TABLE_HEAD = [
  { label: "User", value: "name" },
  { label: "Email", value: "email" },
  { label: "QR-Code", value: null },
  { label: "Role", value: "role" },
  { label: "Location", value: "areaId" },
  { label: "Action", value: null },
];

const UserIndex = () => {
  // --- States ---
  const [users, setUsers] = useState([]);
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
  const [selectedUser, setSelectedUser] = useState(null);

  // --- Functions ---

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/users", {
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
      setUsers(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalData(result.pagination?.totalItems || 0);
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      toast.error("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const getRoleColor = (role) => {
    switch (role) {
      case "SUPER_ADMIN": return "blue";
      case "AREA_ADMIN": return "green";
      case "MACHINE_OPERATOR": return "orange";
      case "STORE_ADMIN": return "purple";
      case "REGULAR_USER": return "teal";
      default: return "gray";
    }
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-0 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">Data Users</Typography>
          <Typography className="text-gray-500 text-sm">Kelola hak akses dan profil pengguna sistem</Typography>
        </div>

        {/* Action: Add & Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button 
            onClick={() => setOpenCreate(true)} 
            className="flex items-center justify-center gap-2 bg-[#66bb6a] normal-case rounded-xl shadow-none px-6"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add User
          </Button>
          <div className="w-full md:w-80">
            <Input 
              label="Cari user atau email..." 
              icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <Card className="w-full overflow-hidden border border-blue-50 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto text-left">
              <thead>
                <tr className="bg-[#e3f2fd]/50">
                  {TABLE_HEAD.map((head) => (
                    <th 
                      key={head.label} 
                      onClick={() => handleSort(head.value)}
                      className={`p-5 border-b border-blue-gray-50 transition-colors ${head.value ? "cursor-pointer hover:bg-blue-100/50" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Typography className="font-bold text-[#2b6cb0] uppercase text-[11px] tracking-wider leading-none">
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
                {!loading && users.length > 0 ? (
                  users.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50/20 transition-colors border-b border-blue-gray-50/50">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            src={`https://ui-avatars.com/api/?name=${row.name}&background=random&color=fff`} 
                            size="sm" 
                            variant="rounded" 
                          />
                          <div>
                            <Typography variant="small" className="font-bold text-blue-900">{row.name}</Typography>
                            <Typography className="text-[10px] text-gray-400">@{row.username}</Typography>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <Typography className="text-xs font-medium text-blue-600 underline decoration-blue-200">{row.email}</Typography>
                      </td>
                      <td className="p-5">
                        <div className="p-2 bg-gray-50 w-fit rounded-lg border border-gray-100 cursor-pointer hover:bg-white transition-all">
                          <QrCodeIcon className="h-6 w-6 text-gray-800" />
                        </div>
                      </td>
                      <td className="p-5">
                        <Chip 
                          variant="ghost" 
                          size="sm" 
                          value={row.role?.replace("_", " ") || "USER"} 
                          color={getRoleColor(row.role)} 
                          className="text-[10px] font-bold" 
                        />
                      </td>
                      <td className="p-5">
                        <Typography className="text-xs font-semibold text-gray-700">
                          {row.area?.name || (row.areaId ? `Area ID: ${row.areaId}` : "Pusat")}
                        </Typography>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => {setSelectedUser(row); setOpenEdit(true)}} 
                            className="bg-[#66bb6a] px-4 py-2 normal-case rounded-lg shadow-none"
                          >Edit</Button>
                          <Button 
                            size="sm" 
                            onClick={() => {setSelectedUser(row); setOpenDelete(true)}} 
                            className="bg-[#ef5350] px-4 py-2 normal-case rounded-lg shadow-none"
                          >Hapus</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400">
                      {loading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                          Memuat data...
                        </div>
                      ) : "Tidak ada data user ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-5 border-t border-blue-gray-50 bg-white">
            <Typography variant="small" className="font-medium text-gray-600">
              Menampilkan <span className="text-blue-700">{users.length}</span> dari <span className="text-blue-700">{totalData}</span> data
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

      {/* Modals */}
      <CreateUserModal open={openCreate} handleOpen={() => setOpenCreate(false)} refreshData={fetchUsers} />
      
      {selectedUser && (
        <>
          <EditUserModal 
            open={openEdit} 
            handleOpen={() => setOpenEdit(false)} 
            data={selectedUser} 
            refreshData={fetchUsers} 
          />
          <DeleteUserModal 
            open={openDelete} 
            handleOpen={() => setOpenDelete(false)} 
            data={selectedUser} 
            refreshData={fetchUsers} 
          />
        </>
      )}
    </MainLayout>
  );
};

export default UserIndex;