import React, { useState } from "react";
import MainLayout from "../MainLayout"; 
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import DetailModal from "./DetailModal";
import { 
  Card, 
  Typography, 
  Button, 
  Input, 
  Chip, 
  Progress 
} from "@material-tailwind/react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const TABLE_HEAD = ["Container ID", "Status", "Location", "Fill Level", "Action"];

const TABLE_ROWS = [
  { id: "001", status: "Aktif", location: "Cikini 1", fill: 65, color: "green" },
  { id: "002", status: "Penuh", location: "Cikini 2", fill: 95, color: "orange" },
];

const SmartContainerIndex = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  
  const [selectedData, setSelectedData] = useState(null);

  const handleOpenCreate = () => setOpenCreate(!openCreate);

  const handleOpenEdit = (row) => {
    setSelectedData(row);
    setOpenEdit(true);
  };

  const handleOpenDelete = (row) => {
    setSelectedData(row);
    setOpenDelete(true);
  };

  const handleOpenDetail = (row) => {
    setSelectedData(row);
    setOpenDetail(true);
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-0 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold text-2xl md:text-3xl">
            Smart Container
          </Typography>
          <Typography className="text-gray-500 text-sm italic">
            Monitoring sistem pembuangan limbah AIoT EcoCash
          </Typography>
        </div>

        {/* Toolbar Section: Stack on mobile, row on desktop */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <Button 
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 bg-[#4CAF50] normal-case text-sm px-5 py-3 rounded-xl shadow-none hover:shadow-lg transition-all"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Container
          </Button>
          
          <div className="w-full md:w-80">
            <Input
              label="Cari Kontainer..."
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              className="bg-white rounded-xl"
            />
          </div>
        </div>

        {/* Table Card: Scrollable on mobile */}
        <Card className="w-full border border-blue-50 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-auto text-left">
              <thead>
                <tr className="bg-[#f8fbff]">
                  {TABLE_HEAD.map((head) => (
                    <th key={head} className="p-5 border-b border-blue-50">
                      <Typography className="font-bold text-[#2b6cb0] leading-none uppercase text-[10px] tracking-widest">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {TABLE_ROWS.map((row, index) => {
                  const isLast = index === TABLE_ROWS.length - 1;
                  const classes = isLast ? "p-5" : "p-5 border-b border-blue-50/50";

                  return (
                    <tr key={row.id} className="hover:bg-blue-50/10 transition-colors group">
                      <td className={classes}>
                        <Typography variant="small" className="font-bold text-blue-900">#{row.id}</Typography>
                      </td>
                      <td className={classes}>
                        <Chip
                          variant="ghost"
                          size="sm"
                          value={row.status}
                          className={`${row.status === "Aktif" ? "text-green-600 bg-green-50" : "text-orange-700 bg-orange-50"} text-[10px] font-bold rounded-lg`}
                        />
                      </td>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-blue-900 rounded-lg flex items-center justify-center shrink-0">
                             <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                          </div>
                          <Typography variant="small" className="font-semibold text-gray-700">{row.location}</Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="flex flex-col gap-1 w-44">
                          <div className="flex justify-between items-center">
                            <Typography className="text-[10px] font-bold text-blue-700">{row.fill}% Full</Typography>
                          </div>
                          <Progress value={row.fill} size="sm" color={row.color} className="bg-gray-100" />
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => handleOpenDetail(row)}
                            size="sm" 
                            variant="text"
                            className="text-blue-600 capitalize text-xs font-bold hover:bg-blue-50"
                          >
                            Detail
                          </Button>
                          <Button 
                            onClick={() => handleOpenEdit(row)}
                            size="sm" 
                            className="bg-green-500 normal-case text-xs px-4 py-2 shadow-none rounded-lg"
                          >
                            Edit
                          </Button>
                          <Button 
                            onClick={() => handleOpenDelete(row)}
                            size="sm" 
                            className="bg-red-400 normal-case text-xs px-4 py-2 shadow-none rounded-lg"
                          >
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* --- DAFTAR MODAL --- */}
        <CreateModal open={openCreate} handleOpen={handleOpenCreate} />
        
        <EditModal 
          open={openEdit} 
          handleOpen={() => setOpenEdit(false)} 
          data={selectedData} 
        />

        <DeleteModal 
          open={openDelete} 
          handleOpen={() => setOpenDelete(false)} 
          data={selectedData} 
        />

        <DetailModal 
          open={openDetail} 
          handleOpen={() => setOpenDetail(false)} 
          data={selectedData} 
        />
      </div>
    </MainLayout>
  );
};

export default SmartContainerIndex;