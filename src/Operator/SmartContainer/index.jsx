import React, { useState } from "react";
import MainLayout from "../MainLayout";
import { 
  Card, 
  Typography, 
  Button, 
  IconButton, 
  Progress,
  Chip
} from "@material-tailwind/react";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MapPinIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

// Import Modals
import AddMachineModal from "./AddMachineModal";
import EditMachineModal from "./EditMachineModal";
import DeleteMachineModal from "./DeleteMachineModal";

const MACHINE_DATA = [
  { id: "MS 001", type: "Pencacah Plastik Otomatis", load: 45, status: "Aktif", color: "green" },
  { id: "MS 002", type: "Mesin Press Hidrolik", load: 65, status: "Siaga", color: "orange" },
  { id: "MS 003", type: "Pemilah Magnetik", load: 95, status: "Penuh", color: "red" },
];

const SmartContainerIndex = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  return (
    <MainLayout>
      <div className="space-y-6 mt-4 pb-10 px-2 md:px-0">
        
        {/* --- SECTION 1: STATS (Budi's Work Style) --- */}
        <div className="space-y-4">
          <Typography variant="h4" className="text-[#1e5ea8] font-black">
            Budi's work
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 shadow-sm border border-gray-100 rounded-2xl">
              <Typography className="text-blue-800 font-bold text-sm mb-4">Total Output Proses</Typography>
              <Typography variant="h3" className="text-[#1e5ea8] font-black">500 gram</Typography>
            </Card>

            <Card className="p-6 shadow-sm border border-gray-100 rounded-2xl">
              <Typography className="text-blue-800 font-bold text-sm mb-4">Container Penuh Di Area</Typography>
              <Typography variant="h3" className="text-[#1e5ea8] font-black">2 Unit</Typography>
            </Card>

            <Card className="p-6 shadow-sm border border-gray-100 rounded-2xl">
              <Typography className="text-blue-800 font-bold text-sm mb-4">Status Mesin</Typography>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full"></div>
                <Typography variant="h4" className="text-green-500 font-black uppercase text-xl">Aktif</Typography>
              </div>
            </Card>
          </div>
        </div>

        {/* --- SECTION 2: FIELD ACCESS HEADER --- */}
        <Card className="p-4 border border-blue-100 rounded-2xl shadow-none flex flex-row items-center justify-between">
           <Typography className="text-[#1e5ea8] font-black uppercase text-sm tracking-tight">
             My Smart Containers & Machine Status (Field Access)
           </Typography>
           <Button color="blue" className="flex items-center gap-2 rounded-xl py-2 px-4 normal-case text-xs shadow-none">
             <MapPinIcon className="h-4 w-4 stroke-[3]" /> Lihat Peta Area Local
           </Button>
        </Card>

        {/* --- SECTION 3: NOTIFICATION --- */}
        <Card className="p-4 bg-[#e3effb] border-none rounded-2xl shadow-none">
          <div className="flex items-center gap-3">
            <Typography className="text-[#1e5ea8] text-sm font-black">
              Notifikasi Penting : 
              <span className="font-medium ml-2 text-blue-700 underline">
                Container 001 Penuh. Silahkan inisiasi panggilan Truk Sampah
              </span>
            </Typography>
          </div>
        </Card>

        {/* --- SECTION 4: TABLE (MY MACHINE) --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Typography className="text-[#1e5ea8] font-black uppercase text-sm">
              My Machine
            </Typography>
            <Button 
              onClick={() => setOpenAdd(true)}
              className="bg-green-600 rounded-xl py-2 px-4 normal-case text-xs shadow-none flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4 stroke-[3]" /> Tambah Unit
            </Button>
          </div>

          <Card className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl shadow-blue-900/5 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] table-auto text-left">
                <thead>
                  <tr className="bg-[#e3effb]/50">
                    {["ID Unit", "Jenis", "Kapasitas Load", "Update Status", "Aksi"].map((head) => (
                      <th key={head} className="p-4 border-b border-blue-gray-50 text-center font-black text-blue-800 uppercase text-[10px] tracking-widest">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MACHINE_DATA.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/20 border-b border-gray-50 last:border-none">
                      <td className="p-4 text-center font-bold text-blue-700 text-xs italic">{item.id}</td>
                      <td className="p-4 text-center">
                        <Typography className="text-[12px] font-bold text-gray-700">{item.type}</Typography>
                      </td>
                      <td className="p-4 w-52 text-center">
                        <div className="flex items-center gap-3 justify-center">
                           <div className="flex gap-1">
                              {[1,2,3,4,5].map((bar, i) => (
                                <div 
                                  key={i} 
                                  className={`w-1.5 h-4 rounded-sm ${i < (item.load/20) ? 'bg-'+item.color+'-500' : 'bg-gray-200'}`}
                                />
                              ))}
                           </div>
                          <Typography className={`text-[11px] font-black text-${item.color}-600`}>{item.load}%</Typography>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                           <Typography className="text-[11px] font-bold text-gray-600">{item.status}</Typography>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Button 
                            size="sm"
                            onClick={() => { setSelectedData(item); setOpenEdit(true); }}
                            className="bg-green-500 rounded-lg py-1.5 px-3 normal-case shadow-none"
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => { setSelectedData(item); setOpenDelete(true); }}
                            className="bg-red-500 rounded-lg py-1.5 px-3 normal-case shadow-none"
                          >
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <AddMachineModal open={openAdd} handleOpen={() => setOpenAdd(false)} />
      <EditMachineModal open={openEdit} handleOpen={() => setOpenEdit(false)} data={selectedData} />
      <DeleteMachineModal open={openDelete} handleOpen={() => setOpenDelete(false)} data={selectedData} />
    </MainLayout>
  );
};

export default SmartContainerIndex;