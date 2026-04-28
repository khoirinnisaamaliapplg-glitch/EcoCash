import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MainLayout from "../MainLayout";
import { 
  Card, Typography, Button, Tooltip, IconButton, Spinner 
} from "@material-tailwind/react";
import { 
  UserPlusIcon, KeyIcon, TrashIcon, UserCircleIcon, 
  IdentificationIcon, MapPinIcon, ArrowPathIcon 
} from "@heroicons/react/24/outline";

// Import Komponen Modal (Pastikan file ini tersedia)
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import ResetPasswordModal from "./ResetPasswordModal";
import DeleteModal from "./DeleteModal";

const OperatorManagement = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOp, setSelectedOp] = useState(null);
  
  // Modal States
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openReset, setOpenReset] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // Ambil data user login untuk filter area
  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;
  const token = localStorage.getItem("token");

  // 1. Fungsi Fetch Data Operator (Hanya yang se-area dan role MACHINE_OPERATOR)
  const fetchOperators = useCallback(async () => {
    if (!userData?.areaId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Sesuaikan dengan struktur response backend (data.data)
      const allUsers = response.data.data || response.data || [];
      
      if (Array.isArray(allUsers)) {
        const filtered = allUsers.filter(user => 
          user.role === "MACHINE_OPERATOR" && 
          Number(user.areaId) === Number(userData.areaId)
        );
        setOperators(filtered);
      }
    } catch (err) {
      console.error("Gagal mengambil data operator:", err);
    } finally {
      setLoading(false);
    }
  }, [token, userData?.areaId]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

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
              Mengelola petugas lapangan di <span className="text-blue-600 font-bold">Area ID: {userData?.areaId || "-"}</span>
            </Typography>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <IconButton variant="outline" color="blue" onClick={fetchOperators} className="rounded-2xl border-2">
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
                      <Typography className="animate-pulse font-bold text-blue-900">Menghubungkan ke server...</Typography>
                    </td>
                  </tr>
                ) : operators.length > 0 ? (
                  operators.map((op, index) => {
                    const isLast = index === operators.length - 1;
                    const classes = isLast ? "p-6" : "p-6 border-b border-blue-gray-50";

                    return (
                      <tr key={op.id} className="hover:bg-blue-50/40 transition-all duration-300">
                        {/* Nama */}
                        <td className={classes}>
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">
                              {op.name?.charAt(0) || "O"}
                            </div>
                            <div>
                              <Typography className="text-sm font-black text-blue-900 uppercase">{op.name}</Typography>
                              <Typography className="text-[11px] text-gray-400 font-medium italic">ID Petugas: #{op.id}</Typography>
                            </div>
                          </div>
                        </td>

                        {/* Area */}
                        <td className={classes}>
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-blue-400" />
                            <Typography className="text-xs font-bold text-gray-700">Area {op.areaId}</Typography>
                          </div>
                        </td>

                        {/* KTP/Kontak */}
                        <td className={classes}>
                          <div className="flex items-center gap-2 text-gray-600 bg-gray-50/50 p-2 rounded-lg w-fit">
                            <IdentificationIcon className="h-4 w-4 opacity-40" />
                            <Typography className="text-xs font-mono font-bold">{op.ktp || "No KTP Belum Set"}</Typography>
                          </div>
                        </td>

                        {/* Akun */}
                        <td className={classes}>
                          <div className="bg-white border border-blue-50 px-3 py-1.5 rounded-xl w-fit">
                            <Typography className="text-[12px] font-black text-blue-700 italic">@{op.username}</Typography>
                          </div>
                        </td>

                        {/* Aksi */}
                        <td className={classes}>
                          <div className="flex items-center gap-2">
                            <Tooltip content="Edit Data">
                              <IconButton 
                                variant="text" color="blue" className="rounded-xl bg-blue-50"
                                onClick={() => { setSelectedOp(op); setOpenEdit(true); }}
                              >
                                <ArrowPathIcon className="h-4 w-4" /> 
                              </IconButton>
                            </Tooltip>

                            <Tooltip content="Reset Sandi">
                              <IconButton 
                                className="rounded-xl bg-green-500"
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
                      <Typography className="text-gray-400 italic">Tidak ada operator di area ini.</Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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