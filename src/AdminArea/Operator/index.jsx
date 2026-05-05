import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import MainLayout from "../MainLayout";
import { 
  Card, Typography, Button, Tooltip, IconButton, Spinner, Input, Select, Option 
} from "@material-tailwind/react";
import { 
  UserPlusIcon, KeyIcon, TrashIcon, UserCircleIcon, 
  IdentificationIcon, MapPinIcon, ArrowPathIcon,
  MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

// Import Komponen Modal
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import ResetPasswordModal from "./ResetPasswordModal";
import DeleteModal from "./DeleteModal";

const OperatorManagement = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOp, setSelectedOp] = useState(null);
  
  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Modal States
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openReset, setOpenReset] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;
  const token = localStorage.getItem("token");

  const fetchOperators = useCallback(async (isRefresh = false) => {
    if (!userData?.areaId) return;
    
    if (isRefresh) setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allUsers = response.data.data || response.data || [];
      
      if (Array.isArray(allUsers)) {
        const filtered = allUsers.filter(user => 
          user.role === "MACHINE_OPERATOR" && 
          Number(user.areaId) === Number(userData.areaId)
        );
        setOperators(filtered);
        if (isRefresh) toast.success("Data operator diperbarui");
      }
    } catch (err) {
      console.error("Gagal mengambil data operator:", err);
      toast.error("Gagal mengambil data dari server");
    } finally {
      setLoading(false);
    }
  }, [token, userData?.areaId]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  // --- LOGIC SEARCH & PAGINATION ---
  const filteredOperators = useMemo(() => {
    return operators.filter((op) => 
      op.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.ktp?.includes(searchQuery)
    );
  }, [operators, searchQuery]);

  const totalPages = Math.ceil(filteredOperators.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOperators.slice(start, start + itemsPerPage);
  }, [filteredOperators, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset ke hal 1 jika search berubah
  }, [searchQuery]);

  const TABLE_HEAD = ["Nama Operator", "Info Area", "Kontak/ID", "Akun", "Aksi"];

  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8 pb-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2 mt-4">
          <div>
            <Typography variant="h3" className="text-blue-900 font-black flex items-center gap-3 text-2xl md:text-3xl">
              <UserCircleIcon className="h-10 w-10 text-blue-600" />
              Operator Management
            </Typography>
            <Typography className="text-gray-500 font-medium text-sm mt-1">
              Area Kerja: <span className="text-blue-600 font-bold uppercase">{userData?.areaName || `ID ${userData?.areaId}`}</span>
            </Typography>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <IconButton variant="outline" color="blue" onClick={() => fetchOperators(true)} className="rounded-2xl border-2 bg-white">
                <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
             </IconButton>
             <Button 
                onClick={() => setOpenCreate(true)} 
                className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-blue-600 rounded-2xl normal-case shadow-lg shadow-blue-100 py-3.5 px-6 font-black"
             >
                <UserPlusIcon className="h-5 w-5 stroke-[3]" /> Tambah Operator
             </Button>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col md:flex-row gap-4 px-2">
          <div className="w-full md:w-72">
            <Input
              label="Cari nama, username, atau KTP..."
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white rounded-xl"
            />
          </div>
          <div className="w-full md:w-40">
            <Select 
              label="Data per halaman" 
              value={String(itemsPerPage)} 
              onChange={(val) => setItemsPerPage(Number(val))}
              className="bg-white"
            >
              <Option value="5">5 Data</Option>
              <Option value="10">10 Data</Option>
              <Option value="20">20 Data</Option>
            </Select>
          </div>
        </div>

        {/* TABLE SECTION */}
        <Card className="shadow-2xl shadow-blue-900/5 rounded-[2.5rem] border border-white bg-white/80 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-auto text-left">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th key={head} className="p-6 border-b border-blue-gray-50 bg-blue-50/30">
                      <Typography className="text-[11px] font-black uppercase tracking-widest text-blue-800/70">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <Spinner className="h-10 w-10 mx-auto mb-4 text-blue-600" />
                      <Typography className="animate-pulse font-bold text-blue-900">Menarik data operator...</Typography>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((op, index) => {
                    const classes = "p-6 border-b border-blue-gray-50";

                    return (
                      <tr key={op.id} className="hover:bg-blue-50/40 transition-all duration-300">
                        <td className={classes}>
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">
                              {op.name?.charAt(0) || "O"}
                            </div>
                            <div>
                              <Typography className="text-sm font-black text-blue-900 uppercase">{op.name}</Typography>
                              <Typography className="text-[11px] text-gray-400 font-medium italic">ID: #{op.id}</Typography>
                            </div>
                          </div>
                        </td>

                        <td className={classes}>
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-blue-400" />
                            <Typography className="text-xs font-bold text-gray-700">Area {op.areaId}</Typography>
                          </div>
                        </td>

                        <td className={classes}>
                          <div className="flex items-center gap-2 text-gray-600 bg-gray-50/50 p-2 rounded-lg w-fit">
                            <IdentificationIcon className="h-4 w-4 opacity-40" />
                            <Typography className="text-xs font-mono font-bold">{op.ktp || "KTP Belum Set"}</Typography>
                          </div>
                        </td>

                        <td className={classes}>
                          <div className="bg-white border border-blue-50 px-3 py-1.5 rounded-xl w-fit">
                            <Typography className="text-[12px] font-black text-blue-700 italic">@{op.username}</Typography>
                          </div>
                        </td>

                        <td className={classes}>
                          <div className="flex items-center gap-2">
                            <Tooltip content="Edit Data">
                              <IconButton 
                                variant="text" color="blue" className="rounded-xl bg-blue-50"
                                onClick={() => { setSelectedOp(op); setOpenEdit(true); }}
                              >
                                <PencilSquareIcon className="h-4 w-4" /> 
                              </IconButton>
                            </Tooltip>

                            <Tooltip content="Reset Sandi">
                              <IconButton 
                                className="rounded-xl bg-green-500 shadow-none hover:shadow-none"
                                onClick={() => { setSelectedOp(op); setOpenReset(true); }}
                              >
                                <KeyIcon className="h-4 w-4 text-white" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip content="Hapus Operator">
                              <IconButton 
                                variant="text" color="red" className="rounded-xl hover:bg-red-50"
                                onClick={() => { setSelectedOp(op); setOpenDelete(true); }}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <Typography className="text-gray-400 italic">Data tidak ditemukan.</Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          <div className="flex items-center justify-between p-6 border-t border-blue-gray-50 bg-blue-50/20">
            <Typography variant="small" color="blue-gray" className="font-bold">
              Halaman {currentPage} dari {totalPages || 1}
            </Typography>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                size="sm"
                className="rounded-lg flex items-center gap-2 border-blue-gray-200"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" /> Prev
              </Button>
              <Button
                variant="outlined"
                size="sm"
                className="rounded-lg flex items-center gap-2 border-blue-gray-200"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* MODALS CRUD */}
      <CreateModal 
        open={openCreate} 
        setOpen={setOpenCreate} 
        refreshData={fetchOperators} 
      />
      
      {selectedOp && (
        <>
          <EditModal 
            open={openEdit} 
            setOpen={setOpenEdit} 
            data={selectedOp} 
            refreshData={fetchOperators} 
          />
          <ResetPasswordModal 
            open={openReset} 
            setOpen={setOpenReset} 
            data={selectedOp} 
          />
          <DeleteModal 
            open={openDelete} 
            setOpen={setOpenDelete} 
            data={selectedOp} 
            refreshData={fetchOperators} 
          />
        </>
      )}
    </MainLayout>
  );
};

export default OperatorManagement;