import React, { useState, useEffect } from "react";
import MainLayout from "../MainLayout"; 
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import AssignOperatorModal from "./AssignOperatorModal"; 
import axios from "axios";
import { 
  Card, 
  Typography, 
  Button, 
  Input, 
  Chip, 
  Spinner,
  IconButton // Sudah ditambahkan
} from "@material-tailwind/react";
import { PlusIcon, MagnifyingGlassIcon, ArrowPathIcon, UserPlusIcon } from "@heroicons/react/24/outline";

const TABLE_HEAD = ["Machine Code", "Name & Place", "Operator", "Location", "Status", "Action"];

const MachineManagement = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  
  const [selectedData, setSelectedData] = useState(null);
  const [machines, setMachines] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/machines", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const result = response.data.data || response.data;
      
      if (Array.isArray(result)) {
        const myAreaMachines = result.filter(m => m.areaId === userData?.areaId);
        setMachines(myAreaMachines);
      }
    } catch (error) {
      console.error("Gagal mengambil data mesin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const filteredMachines = machines.filter((item) => {
    const searchLower = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.machineCode?.toLowerCase().includes(searchLower) ||
      item.placeName?.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenEdit = (row) => { setSelectedData(row); setOpenEdit(true); };
  const handleOpenDelete = (row) => { setSelectedData(row); setOpenDelete(true); };
  const handleOpenAssign = (row) => { setSelectedData(row); setOpenAssign(true); };

  return (
    <MainLayout>
      <div className="p-4 md:p-0 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Typography variant="h4" className="text-[#2b6cb0] font-bold text-2xl md:text-3xl">
              Smart Container
            </Typography>
            <Typography className="text-gray-500 text-sm italic">
              Area Management: <span className="text-blue-600 font-bold">{userData?.areaName || "My Area"}</span>
            </Typography>
          </div>
          <Button 
            variant="text" 
            size="sm" 
            className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50"
            onClick={fetchMachines}
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <Button 
            onClick={() => setOpenCreate(true)}
            className="flex items-center justify-center gap-2 bg-[#2196F3] normal-case text-sm px-5 py-3 rounded-xl shadow-none hover:shadow-lg transition-all"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Unit
          </Button>
          
          <div className="w-full md:w-80">
            <Input
              label="Cari di area ini..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              className="bg-white rounded-xl"
              color="blue"
            />
          </div>
        </div>

        <Card className="w-full border border-blue-50 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] table-auto text-left">
              <thead>
                <tr className="bg-[#f8fbff]">
                  {TABLE_HEAD.map((head) => (
                    <th key={head} className="p-5 border-b border-blue-50">
                      <Typography className="font-bold text-[#2b6cb0] uppercase text-[10px] tracking-widest">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center"><Spinner className="mx-auto" /></td>
                  </tr>
                ) : filteredMachines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-500">Data tidak ditemukan.</td>
                  </tr>
                ) : (
                  filteredMachines.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50/10 transition-colors border-b border-blue-50/50">
                      <td className="p-5">
                        <Typography variant="small" className="font-bold text-blue-900 uppercase">
                          {row.machineCode}
                        </Typography>
                      </td>
                      <td className="p-5">
                        <Typography variant="small" className="font-semibold text-gray-800">{row.name}</Typography>
                        <Typography className="text-[10px] text-gray-500">{row.placeName || "-"}</Typography>
                      </td>
                      <td className="p-5">
                         {row.operator ? (
                           <div className="flex flex-col">
                             <Typography className="text-xs font-bold text-blue-gray-800">{row.operator.name}</Typography>
                             <Typography className="text-[9px] text-gray-500">Petugas Area</Typography>
                           </div>
                         ) : (
                           <Typography className="text-[10px] font-bold text-red-400 bg-red-50 px-2 py-1 rounded w-fit italic">
                             Belum di-assign
                           </Typography>
                         )}
                      </td>
                      <td className="p-5">
                        <Typography variant="small" className="text-gray-700">{row.district}</Typography>
                        <Typography className="text-[10px] text-gray-400">{row.subdistrict}</Typography>
                      </td>
                      <td className="p-5">
                        <Chip
                          variant="ghost"
                          size="sm"
                          value={row.isActive ? "Operasional" : "Non-Aktif"}
                          color={row.isActive ? "green" : "red"}
                          className="rounded-full font-bold"
                        />
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-1">
                          <IconButton size="sm" variant="text" color="blue" onClick={() => handleOpenAssign(row)}>
                            <UserPlusIcon className="h-4 w-4" />
                          </IconButton>
                          <Button onClick={() => handleOpenEdit(row)} size="sm" variant="text" color="green" className="capitalize font-bold">Edit</Button>
                          <Button onClick={() => handleOpenDelete(row)} size="sm" variant="text" color="red" className="capitalize font-bold">Hapus</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modals */}
        <CreateModal open={openCreate} handleOpen={() => setOpenCreate(false)} refreshData={fetchMachines} />
        {selectedData && (
          <>
            <EditModal open={openEdit} handleOpen={() => setOpenEdit(false)} data={selectedData} refreshData={fetchMachines} />
            <DeleteModal open={openDelete} handleOpen={() => setOpenDelete(false)} data={selectedData} refreshData={fetchMachines} />
            <AssignOperatorModal 
                open={openAssign} 
                handleOpen={() => setOpenAssign(false)} 
                machineData={selectedData} 
                refreshData={fetchMachines} 
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default MachineManagement;