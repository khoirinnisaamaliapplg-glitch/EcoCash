import React, { useState } from "react";
import MainLayout from "../MainLayout";
import { 
  Card, 
  Typography, 
  Button, 
  Tooltip,
  IconButton
} from "@material-tailwind/react";
import { 
  UserPlusIcon, 
  KeyIcon, 
  TrashIcon,
  UserCircleIcon,
  IdentificationIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

// Import Komponen Modal
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import ResetPasswordModal from "./ResetPasswordModal";
import DeleteModal from "./DeleteModal";

const OperatorManagement = () => {
  const [operators, setOperators] = useState([
    { id: 1, nama: "Budi Santoso", idMesin: "MS001", lokasi: "Jakarta, Cikini 1", ktp: "327310123450001", username: "santo" },
    { id: 2, nama: "Agus Riyadi", idMesin: "MS002", lokasi: "Jakarta, Cikini 2", ktp: "327310123450001", username: "budi" },
  ]);

  const [selectedOp, setSelectedOp] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openReset, setOpenReset] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const TABLE_HEAD = ["Nama Operator", "Unit & Lokasi", "No. KTP", "Akun", "Aksi"];

  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8 pb-10">
        
        {/* TOP HEADER - Responsive Flex */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2 mt-4">
          <div className="w-full md:w-auto">
            <Typography variant="h3" className="text-blue-900 font-black flex items-center gap-3 text-2xl md:text-3xl">
              <UserCircleIcon className="h-8 w-8 md:h-10 md:h-10 text-blue-600" />
              Operator Management
            </Typography>
            <Typography className="text-gray-500 font-medium text-sm md:text-base mt-1">
              Kelola hak akses dan informasi personal operator wilayah Anda.
            </Typography>
          </div>
          <Button 
            onClick={() => setOpenCreate(true)} 
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-blue-600 rounded-2xl normal-case shadow-lg shadow-blue-100 hover:shadow-blue-400 transition-all py-3.5 px-6 font-black"
          >
            <UserPlusIcon className="h-5 w-5 stroke-[3]" /> Tambah Operator
          </Button>
        </div>

        {/* MAIN TABLE CARD - Responsive Overflow */}
        <Card className="shadow-2xl shadow-blue-900/5 rounded-[2rem] md:rounded-[2.5rem] border border-white bg-white/80 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-auto text-left">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th key={head} className="p-5 md:p-6 border-b border-blue-gray-50 bg-blue-50/30">
                      <Typography className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-blue-800/70">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {operators.map((op, index) => {
                  const isLast = index === operators.length - 1;
                  const classes = isLast ? "p-5 md:p-6" : "p-5 md:p-6 border-b border-blue-gray-50";

                  return (
                    <tr key={op.id} className="hover:bg-blue-50/40 transition-all duration-300 group">
                      {/* Kolom Nama */}
                      <td className={classes}>
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100 shrink-0">
                            {op.nama.charAt(0)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <Typography className="text-sm font-black text-blue-900 truncate uppercase tracking-tight">{op.nama}</Typography>
                            <Typography className="text-[11px] text-gray-400 font-medium italic">ID: #{op.id}</Typography>
                          </div>
                        </div>
                      </td>

                      {/* Kolom Unit & Lokasi */}
                      <td className={classes}>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-md">
                              {op.idMesin}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                             <MapPinIcon className="h-3 w-3 opacity-50 shrink-0" />
                             <Typography className="text-[11px] font-bold text-gray-700 line-clamp-1">{op.lokasi}</Typography>
                          </div>
                        </div>
                      </td>

                      {/* Kolom KTP */}
                      <td className={classes}>
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50/50 p-2 rounded-lg w-fit">
                          <IdentificationIcon className="h-4 w-4 opacity-40 shrink-0" />
                          <Typography className="text-xs font-mono tracking-tighter font-bold">{op.ktp}</Typography>
                        </div>
                      </td>

                      {/* Kolom Akun */}
                      <td className={classes}>
                        <div className="bg-white border border-blue-50 px-3 py-1.5 rounded-xl w-fit shadow-sm">
                          <Typography className="text-[12px] font-black text-blue-700 italic">@{op.username}</Typography>
                        </div>
                      </td>

                      {/* Tombol Aksi */}
                      <td className={classes}>
                        <div className="flex items-center gap-2 md:gap-3">
                          <Tooltip content="Edit">
                            <Button 
                              variant="flat"
                              size="sm" 
                              className="rounded-xl bg-blue-50 text-blue-600 px-3 md:px-4 py-2.5 normal-case font-black hover:bg-blue-600 hover:text-white transition-all shadow-none shrink-0"
                              onClick={() => { setSelectedOp(op); setOpenEdit(true); }}
                            >
                              Edit
                            </Button>
                          </Tooltip>

                          <Tooltip content="Reset Sandi">
                            <IconButton 
                              size="sm" 
                              className="rounded-xl bg-green-500 shadow-md shadow-green-100 hover:shadow-green-300 transition-all shrink-0"
                              onClick={() => { setSelectedOp(op); setOpenReset(true); }}
                            >
                              <KeyIcon className="h-4 w-4 text-white stroke-[3]" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="Hapus">
                            <IconButton 
                              variant="text" 
                              color="red" 
                              className="rounded-xl hover:bg-red-50 shrink-0"
                              onClick={() => { setSelectedOp(op); setOpenDelete(true); }}
                            >
                              <TrashIcon className="h-5 w-5 stroke-2" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* MODALS */}
      <CreateModal open={openCreate} setOpen={setOpenCreate} setOperators={setOperators} operators={operators} />
      <EditModal open={openEdit} setOpen={setOpenEdit} data={selectedOp} setOperators={setOperators} operators={operators} />
      <ResetPasswordModal open={openReset} setOpen={setOpenReset} data={selectedOp} />
      <DeleteModal open={openDelete} setOpen={setOpenDelete} data={selectedOp} setOperators={setOperators} operators={operators} />
    </MainLayout>
  );
};

export default OperatorManagement;