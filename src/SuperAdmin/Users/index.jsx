import React, { useState } from "react";
import MainLayout from "../MainLayout";
import { Card, Typography, Button, Input, Chip, Avatar } from "@material-tailwind/react";
import { PlusIcon, MagnifyingGlassIcon, UserCircleIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";

const TABLE_HEAD = ["User", "Email", "QR-Code", "Role", "Location", "Action"];

const TABLE_ROWS = [
  { name: "Admin Amel", email: "AdminAmel@gmail.com", role: "Super Admin", location: "Jakarta", color: "blue" },
  { name: "Nisa", email: "Nisa@gmail.com", role: "Admin", location: "Jakarta", color: "green" },
  { name: "Santo", email: "Santo@gmail.com", role: "Operator", location: "Jakarta", color: "orange" },
];

const UserIndex = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <MainLayout>
      <div className="p-4 md:p-0 space-y-6">
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">Data Users</Typography>
          <Typography className="text-gray-500 text-sm">Kelola hak akses dan profil pengguna sistem</Typography>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button 
            onClick={() => setOpenCreate(true)} 
            className="flex items-center justify-center gap-2 bg-[#66bb6a] normal-case rounded-xl shadow-none"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add User
          </Button>
          <div className="w-full md:w-80">
            <Input label="Cari user atau email..." icon={<MagnifyingGlassIcon className="h-5 w-5" />} />
          </div>
        </div>

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
                {TABLE_ROWS.map((row, index) => (
                  <tr key={row.email} className="hover:bg-blue-50/20 transition-colors border-b border-blue-gray-50/50">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <Avatar src={`https://ui-avatars.com/api/?name=${row.name}&background=random`} size="sm" variant="rounded" />
                        <Typography variant="small" className="font-bold text-blue-900">{row.name}</Typography>
                      </div>
                    </td>
                    <td className="p-5">
                      <Typography className="text-xs font-medium text-blue-600 underline decoration-blue-200">{row.email}</Typography>
                    </td>
                    <td className="p-5">
                      <div className="p-2 bg-gray-50 w-fit rounded-lg border border-gray-100 cursor-pointer hover:bg-white transition-all">
                        <QrCodeIcon className="h-6 w-6 text-gray-800" />
                      </div>
                    </td>
                    <td className="p-5">
                      <Chip variant="ghost" size="sm" value={row.role} color={row.color} className="text-[10px] font-bold" />
                    </td>
                    <td className="p-5">
                      <Typography className="text-xs font-semibold text-gray-700">{row.location}</Typography>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {setSelectedUser(row); setOpenEdit(true)}} 
                          className="bg-[#66bb6a] px-4 py-2 normal-case rounded-lg"
                        >Edit</Button>
                        <Button 
                          size="sm" 
                          onClick={() => {setSelectedUser(row); setOpenDelete(true)}} 
                          className="bg-[#ef5350] px-4 py-2 normal-case rounded-lg"
                        >Hapus</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <CreateUserModal open={openCreate} handleOpen={() => setOpenCreate(false)} />
      <EditUserModal open={openEdit} handleOpen={() => setOpenEdit(false)} data={selectedUser} />
      <DeleteUserModal open={openDelete} handleOpen={() => setOpenDelete(false)} data={selectedUser} />
    </MainLayout>
  );
};

export default UserIndex;