import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button, Typography, Select, Option } from "@material-tailwind/react";
import { UserIcon, EnvelopeIcon, MapPinIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

const CreateUserModal = ({ open, handleOpen }) => {
  return (
    <Dialog open={open} handler={handleOpen} size="sm" className="rounded-[28px] shadow-2xl">
      <DialogHeader className="px-8 pt-8">
        <Typography variant="h5" className="text-blue-900 font-bold">Registrasi User Baru</Typography>
      </DialogHeader>
      
      <DialogBody className="px-8 py-4 space-y-5">
        <div className="space-y-4">
          <Input label="Nama Lengkap" icon={<UserIcon className="h-4 w-4" />} className="rounded-xl" />
          <Input label="Email Address" icon={<EnvelopeIcon className="h-4 w-4" />} className="rounded-xl" />
          <Input label="Lokasi Kerja" icon={<MapPinIcon className="h-4 w-4" />} className="rounded-xl" />
          
          <div className="space-y-2">
             <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 tracking-widest opacity-70">Privillage Role</Typography>
             <Select label="Pilih Role" className="rounded-xl">
                <Option>Super Admin</Option>
                <Option>Admin</Option>
                <Option>Operator</Option>
             </Select>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="px-8 pb-8 pt-2 gap-3">
        <Button variant="text" color="red" onClick={handleOpen} className="normal-case font-bold">Batal</Button>
        <Button className="bg-[#2b6cb0] px-8 rounded-xl normal-case font-bold shadow-none" onClick={handleOpen}>Daftarkan User</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateUserModal;