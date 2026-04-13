import React, { useState } from "react";
import MainLayout from "../MainLayout"; 
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import { Card, Typography, Button, Input, Chip, Progress } from "@material-tailwind/react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const TABLE_HEAD = ["Truck ID", "Status", "Location", "Fill Level", "Last Service", "Action"];

const TABLE_ROWS = [
  { id: "eco-001", status: "Aktif", location: "Cikini 1", fill: 65, service: "2026-03-27", color: "green" },
  { id: "eco-002", status: "Penuh", location: "Cikini 2", fill: 92, service: "2026-03-27", color: "orange" },
  { id: "eco-003", status: "Maintenance", location: "Cikini 3", fill: 0, service: "2026-03-25", color: "purple" },
];

const SmartTruckIndex = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  return (
    <MainLayout>
      <div className="p-4 md:p-0 space-y-6">
        {/* Header Area */}
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold text-2xl md:text-3xl">
            Smart Truck
          </Typography>
          <Typography className="text-gray-500 text-sm">
            Manajemen armada pengangkut limbah AIoT
          </Typography>
        </div>

        {/* Action Bar: Stack on Mobile */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button 
            onClick={() => setOpenCreate(true)} 
            className="flex items-center justify-center gap-2 bg-[#66bb6a] normal-case rounded-xl shadow-none py-3 px-5"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Truck
          </Button>
          
          <div className="w-full md:w-80">
            <Input 
              label="Cari Truck ID..." 
              icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
              className="bg-white rounded-xl"
            />
          </div>
        </div>

        {/* Table Container with Horizontal Scroll */}
        <Card className="w-full overflow-hidden border border-blue-50 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] table-auto text-left">
              <thead>
                <tr className="bg-[#f8fbff]">
                  {TABLE_HEAD.map((head) => (
                    <th key={head} className="p-5 border-b border-blue-gray-50">
                      <Typography className="font-bold text-[#2b6cb0] uppercase text-[10px] tracking-widest leading-none opacity-80">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {TABLE_ROWS.map((row, index) => (
                  <tr key={row.id} className="hover:bg-blue-50/10 transition-colors border-b border-blue-gray-50/50">
                    <td className="p-5">
                      <Typography variant="small" className="font-bold text-blue-900">#{row.id}</Typography>
                    </td>
                    <td className="p-5">
                      <Chip 
                        variant="ghost" 
                        size="sm" 
                        value={row.status} 
                        color={row.color === "purple" ? "purple" : row.color === "orange" ? "orange" : "green"} 
                        className="text-[10px] font-bold" 
                      />
                    </td>
                    <td className="p-5">
                       <div className="flex items-center gap-3">
                         <div className="h-9 w-10 bg-[#0d1b3e] rounded-lg flex items-center justify-center border border-blue-100 shrink-0">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                         </div>
                         <Typography className="text-xs font-semibold text-gray-700">{row.location}</Typography>
                       </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1 w-40">
                        <Typography className="text-[10px] font-bold text-blue-800">{row.fill}% Full</Typography>
                        <Progress value={row.fill} size="sm" color={row.color} className="bg-gray-100" />
                      </div>
                    </td>
                    <td className="p-5">
                      <Typography className="text-xs font-medium text-gray-600 italic">
                        {row.service}
                      </Typography>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {setSelectedData(row); setOpenEdit(true)}} 
                          className="bg-[#66bb6a] px-4 py-2 normal-case rounded-lg shadow-none"
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => {setSelectedData(row); setOpenDelete(true)}} 
                          className="bg-[#ef5350] px-4 py-2 normal-case rounded-lg shadow-none"
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

        {/* Modals */}
        <CreateModal open={openCreate} handleOpen={() => setOpenCreate(false)} />
        <EditModal open={openEdit} handleOpen={() => setOpenEdit(false)} data={selectedData} />
        <DeleteModal open={openDelete} handleOpen={() => setOpenDelete(false)} data={selectedData} />
      </div>
    </MainLayout>
  );
};

export default SmartTruckIndex;