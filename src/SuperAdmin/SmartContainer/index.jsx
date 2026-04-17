import React, { useState, useEffect } from "react";
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
  Spinner 
} from "@material-tailwind/react";
import { PlusIcon, MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

// 1. SESUAIKAN HEADER TABEL DENGAN SKEMA DB
const TABLE_HEAD = ["Machine Code", "Name & Place", "Area ID", "Location", "Status", "Action"];

const SmartContainerIndex = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  
  const [selectedData, setSelectedData] = useState(null);
  const [machines, setMachines] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/machines/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMachines(response.data.data || response.data);
    } catch (error) {
      console.error("Gagal mengambil data mesin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // 2. LOGIKA FILTER SEARCH (Berdasarkan Kode atau Nama)
  const filteredMachines = machines.filter((item) => 
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.machineCode?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenEdit = (row) => { setSelectedData(row); setOpenEdit(true); };
  const handleOpenDelete = (row) => { setSelectedData(row); setOpenDelete(true); };
  const handleOpenDetail = (row) => { setSelectedData(row); setOpenDetail(true); };

  return (
    <MainLayout>
      <div className="p-4 md:p-0 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Typography variant="h4" className="text-[#2b6cb0] font-bold text-2xl md:text-3xl">
              Smart Container
            </Typography>
            <Typography className="text-gray-500 text-sm italic">
              EcoCash AIoT Machine Monitoring Database
            </Typography>
          </div>
          <Button 
            variant="text" 
            size="sm" 
            className="flex items-center gap-2 text-blue-600 font-bold"
            onClick={fetchMachines}
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Database
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <Button 
            onClick={() => setOpenCreate(true)}
            className="flex items-center justify-center gap-2 bg-[#4CAF50] normal-case text-sm px-5 py-3 rounded-xl shadow-none hover:shadow-lg transition-all"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Machine
          </Button>
          
          <div className="w-full md:w-80">
            <Input
              label="Cari Kode atau Nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              className="bg-white rounded-xl"
            />
          </div>
        </div>

        <Card className="w-full border border-blue-50 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto text-left">
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
                    <td colSpan={6} className="p-10 text-center">
                      <Spinner className="h-8 w-8 text-blue-500 mx-auto" />
                    </td>
                  </tr>
                ) : filteredMachines.map((row, index) => {
                  const isLast = index === filteredMachines.length - 1;
                  const classes = isLast ? "p-5" : "p-5 border-b border-blue-50/50";

                  return (
                    <tr key={row.id} className="hover:bg-blue-50/10 transition-colors">
                      {/* 1. Machine Code */}
                      <td className={classes}>
                        <Typography variant="small" className="font-bold text-blue-900 uppercase">
                          {row.machineCode}
                        </Typography>
                      </td>

                      {/* 2. Name & Place */}
                      <td className={classes}>
                        <Typography variant="small" className="font-semibold text-gray-800">
                          {row.name}
                        </Typography>
                        <Typography className="text-[10px] text-gray-500 italic">
                          {row.placeName || "No Place Name"}
                        </Typography>
                      </td>

                      {/* 3. Area ID */}
                      <td className={classes}>
                        <Chip value={`Area: ${row.areaId}`} size="sm" variant="ghost" className="rounded-full w-fit" />
                      </td>

                      {/* 4. Location (District & Sub) */}
                      <td className={classes}>
                        <Typography variant="small" className="text-gray-700 font-medium">
                          {row.district}
                        </Typography>
                        <Typography className="text-[10px] text-gray-400">
                          {row.subdistrict}
                        </Typography>
                      </td>

                      {/* 5. Status (isActive) */}
                      <td className={classes}>
                        <Chip
                          variant="ghost"
                          size="sm"
                          value={row.isActive ? "Active" : "Inactive"}
                          color={row.isActive ? "green" : "red"}
                          className="text-[10px] font-bold rounded-lg"
                        />
                      </td>

                      {/* 6. Action */}
                      <td className={classes}>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => handleOpenDetail(row)} size="sm" variant="text" className="text-blue-600 capitalize text-xs font-bold">Detail</Button>
                          <Button onClick={() => handleOpenEdit(row)} size="sm" className="bg-green-500 shadow-none rounded-lg capitalize">Edit</Button>
                          <Button onClick={() => handleOpenDelete(row)} size="sm" className="bg-red-400 shadow-none rounded-lg capitalize">Hapus</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* --- MODALS --- */}
        <CreateModal open={openCreate} handleOpen={() => setOpenCreate(false)} refreshData={fetchMachines} />
        <EditModal open={openEdit} handleOpen={() => setOpenEdit(false)} data={selectedData} refreshData={fetchMachines} />
        <DeleteModal open={openDelete} handleOpen={() => setOpenDelete(false)} data={selectedData} refreshData={fetchMachines} />
        <DetailModal open={openDetail} handleOpen={() => setOpenDetail(false)} data={selectedData} />
      </div>
    </MainLayout>
  );
};

export default SmartContainerIndex;