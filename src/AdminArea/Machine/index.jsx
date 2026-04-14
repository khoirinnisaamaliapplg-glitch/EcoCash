import React, { useState } from "react";
import MainLayout from "../MainLayout";
import { 
  Card, 
  Typography, 
  Button, 
  CardHeader, 
  CardBody 
} from "@material-tailwind/react";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline";

// Import Komponen Modal
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";

const MachineManagement = () => {
  const [machines, setMachines] = useState([
    { id: "MS 001", jenis: "Pencacah Plastik Otomatis", lokasi: "Jakarta, Cikini 1", operator: "Santo", status: "Beroperasi" },
    { id: "MS 002", jenis: "Mesin Press Hidrolik", lokasi: "Jakarta, Cikini 2", operator: "Budi", status: "Rusak" },
    { id: "MS 003", jenis: "Pemilah Magnetik AI", lokasi: "Bandung, Dago 3", operator: "Ani", status: "Maintenance" },
  ]);

  const [selectedMachine, setSelectedMachine] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const TABLE_HEAD = ["ID Mesin", "Jenis Mesin", "Lokasi", "Status Operasi", "Aksi"];

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div>
            <Typography variant="h3" className="text-blue-900 font-black flex items-center gap-3">
              <CpuChipIcon className="h-9 w-9 text-blue-600" />
              Machine Management
            </Typography>
            <Typography className="text-gray-500 font-medium ml-12 -mt-1">
              Monitoring dan kontrol unit AIoT EcoCash secara real-time.
            </Typography>
          </div>
          <Button 
            onClick={() => setOpenCreate(true)} 
            className="flex items-center gap-3 bg-blue-600 rounded-xl normal-case shadow-blue-100 hover:shadow-blue-300 transition-all py-3"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Tambah Unit Mesin
          </Button>
        </div>

        {/* TABLE SECTION */}
        <Card className="h-full w-full shadow-xl shadow-blue-900/5 rounded-[2rem] border border-blue-gray-50 overflow-hidden">
          <CardHeader floated={false} shadow={false} className="rounded-none p-4 pb-0">
             <div className="mb-4 flex items-center justify-between gap-8">
                <Typography variant="h5" color="blue-gray" className="font-bold text-blue-900">
                  Daftar Unit Mesin
                </Typography>
             </div>
          </CardHeader>
          
          <CardBody className="overflow-auto px-0 pt-0">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th key={head} className="border-y border-blue-gray-100 bg-blue-50/50 p-5">
                      <Typography className="text-[11px] font-black uppercase tracking-wider text-blue-800 opacity-80">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {machines.map((m, index) => {
                  const isLast = index === machines.length - 1;
                  const classes = isLast ? "p-5" : "p-5 border-b border-blue-gray-50";

                  return (
                    <tr key={m.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className={classes}>
                        <div className="bg-blue-50 w-fit px-3 py-1 rounded-lg">
                          <Typography className="text-sm font-black text-blue-700">{m.id}</Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        <Typography className="text-sm font-bold text-gray-800">{m.jenis}</Typography>
                      </td>
                      <td className={classes}>
                        <Typography className="text-sm font-medium text-gray-600">{m.lokasi}</Typography>
                      </td>
                      <td className={classes}>
                        <div className="w-max">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm ${
                            m.status === "Beroperasi" ? "bg-green-500" : 
                            m.status === "Rusak" ? "bg-red-500" : "bg-orange-500"
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="flex gap-3">
                          <Button 
                            size="sm" 
                            color="blue" 
                            className="flex items-center gap-2 rounded-xl normal-case bg-blue-600 px-5 shadow-md shadow-blue-100"
                            onClick={() => { setSelectedMachine(m); setOpenEdit(true); }}
                          >
                            <PencilIcon className="h-4 w-4 stroke-[2]" /> Edit
                          </Button>
                          <Button 
                            size="sm" 
                            color="red" 
                            className="flex items-center gap-2 rounded-xl normal-case bg-red-500 px-5 shadow-md shadow-red-100"
                            onClick={() => { setSelectedMachine(m); setOpenDelete(true); }}
                          >
                            <TrashIcon className="h-4 w-4 stroke-[2]" /> Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      {/* Modals tetap sama */}
      <CreateModal open={openCreate} setOpen={setOpenCreate} setMachines={setMachines} machines={machines} />
      <EditModal open={openEdit} setOpen={setOpenEdit} data={selectedMachine} setMachines={setMachines} machines={machines} />
      <DeleteModal open={openDelete} setOpen={setOpenDelete} data={selectedMachine} setMachines={setMachines} machines={machines} />
    </MainLayout>
  );
};

export default MachineManagement;