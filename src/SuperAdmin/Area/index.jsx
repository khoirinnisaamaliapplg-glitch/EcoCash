import React, { useState } from "react";
import MainLayout from "../MainLayout";
import { 
  Card, 
  Typography, 
  Button, 
  Input, 
  Chip 
} from "@material-tailwind/react";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  MapIcon, 
  GlobeAsiaAustraliaIcon 
} from "@heroicons/react/24/outline";

// Import Modal
import AddAreaModal from "./AddAreaModal";
import EditAreaModal from "./EditAreaModal";
import DeleteAreaModal from "./DeleteAreaModal";

const TABLE_HEAD = ["Kode Wilayah", "Nama Area", "Lokasi Utama", "Tipe", "Action"];

const AreaIndex = () => {
  const [dataArea, setDataArea] = useState([
    { id: 1, name: "Cihideung", province: "Jawa Barat", code: "32.78.01", regencyName: "Tasikmalaya", regencyType: "Kota" },
    { id: 2, name: "Cipedes", province: "Jawa Barat", code: "32.78.04", regencyName: "Tasikmalaya", regencyType: "Kota" },
  ]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  const handleEditTrigger = (area) => {
    setSelectedArea(area);
    setOpenEdit(true);
  };

  const handleDeleteTrigger = (area) => {
    setSelectedArea(area);
    setOpenDelete(true);
  };

  const executeDelete = (id) => {
    setDataArea(dataArea.filter((area) => area.id !== id));
    setOpenDelete(false);
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-0 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">
            Manajemen Wilayah
          </Typography>
          <Typography className="text-gray-500 text-sm">
            Data pusat kontrol area operasional EcoCash
          </Typography>
        </div>

        {/* Toolbar Section */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button 
            onClick={() => setOpenAdd(true)}
            className="flex items-center justify-center gap-2 bg-[#66bb6a] normal-case rounded-xl shadow-none px-6"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Area
          </Button>
          <div className="w-full md:w-80">
            <Input 
              label="Cari kode atau nama..." 
              icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
              className="bg-white"
            />
          </div>
        </div>

        {/* Table Card */}
        <Card className="w-full overflow-hidden border border-blue-50 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto text-left">
              <thead>
                <tr className="bg-[#e3f2fd]/50">
                  {TABLE_HEAD.map((head) => (
                    <th key={head} className="p-5 border-b border-blue-gray-50">
                      <Typography className="font-bold text-[#2b6cb0] uppercase text-[11px] tracking-wider leading-none">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataArea.map((area) => (
                  <tr key={area.id} className="hover:bg-blue-50/20 transition-colors border-b border-blue-gray-50/50">
                    {/* Kode Wilayah */}
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 rounded-md">
                          <GlobeAsiaAustraliaIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <Typography variant="small" className="font-bold text-blue-900">
                          {area.code}
                        </Typography>
                      </div>
                    </td>

                    {/* Nama Area */}
                    <td className="p-5">
                      <Typography variant="small" className="font-bold text-gray-800">
                        {area.name}
                      </Typography>
                    </td>

                    {/* Lokasi Utama */}
                    <td className="p-5">
                      <div className="flex flex-col">
                        <Typography className="text-xs font-bold text-blue-gray-800">
                          {area.regencyName}
                        </Typography>
                        <Typography className="text-[10px] font-medium text-gray-500 uppercase">
                          {area.province}
                        </Typography>
                      </div>
                    </td>

                    {/* Tipe (Chip style) */}
                    <td className="p-5">
                      <Chip 
                        variant="ghost" 
                        size="sm" 
                        value={area.regencyType} 
                        color={area.regencyType === "Kota" ? "purple" : "orange"}
                        className="text-[10px] font-bold rounded-lg w-fit" 
                      />
                    </td>

                    {/* Action Buttons */}
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleEditTrigger(area)}
                          className="bg-[#66bb6a] px-4 py-2 normal-case rounded-lg shadow-none hover:shadow-md"
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleDeleteTrigger(area)}
                          className="bg-[#ef5350] px-4 py-2 normal-case rounded-lg shadow-none hover:shadow-md"
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

      {/* Modal Components */}
      <AddAreaModal 
        open={openAdd} 
        setOpen={setOpenAdd} 
        dataArea={dataArea} 
        setDataArea={setDataArea} 
      />
      
      {selectedArea && (
        <>
          <EditAreaModal 
            open={openEdit} 
            setOpen={setOpenEdit} 
            selectedArea={selectedArea} 
            dataArea={dataArea} 
            setDataArea={setDataArea} 
          />
          <DeleteAreaModal 
            open={openDelete} 
            handleOpen={() => setOpenDelete(!openDelete)} 
            data={selectedArea} 
            confirmDelete={executeDelete}
          />
        </>
      )}
    </MainLayout>
  );
};

export default AreaIndex;