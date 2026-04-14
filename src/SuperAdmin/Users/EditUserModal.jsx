import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button, Typography, Select, Option } from "@material-tailwind/react";
import { PencilSquareIcon, UserIcon, EnvelopeIcon, MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";

const EditUserModal = ({ open, handleOpen, data }) => {
  const [formData, setFormData] = useState({ name: "", email: "", location: "", role: "" });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name,
        email: data.email,
        location: data.location,
        role: data.role
      });
    }
  }, [data]);

  return (
    <Dialog open={open} handler={handleOpen} size="sm" className="rounded-[28px] shadow-2xl border border-blue-50/50">
      <DialogHeader className="flex justify-between px-8 pt-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-50 rounded-xl">
            <PencilSquareIcon className="h-6 w-6 text-green-600" />
          </div>
          <Typography variant="h5" className="text-blue-900 font-bold">Perbarui Profil User</Typography>
        </div>
        <XMarkIcon className="h-5 w-5 cursor-pointer text-gray-400" onClick={handleOpen} />
      </DialogHeader>
      
      <DialogBody className="px-8 py-4 space-y-5">
        <div className="space-y-4">
          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-bold ml-1">Nama Lengkap</Typography>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              icon={<UserIcon className="h-4 w-4" />} 
              className="!rounded-xl border-t-blue-gray-200 focus:!border-blue-500" 
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-bold ml-1">Email Address</Typography>
            <Input 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              icon={<EnvelopeIcon className="h-4 w-4" />} 
              className="!rounded-xl border-t-blue-gray-200 focus:!border-blue-500" 
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Typography variant="small" className="text-blue-900 font-bold ml-1">Lokasi</Typography>
              <Input 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                icon={<MapPinIcon className="h-4 w-4" />} 
                className="!rounded-xl border-t-blue-gray-200 focus:!border-blue-500" 
                labelProps={{ className: "hidden" }}
              />
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="text-blue-900 font-bold ml-1">Hak Akses</Typography>
              <Select value={formData.role} className="!rounded-xl border-t-blue-gray-200">
                <Option value="Super Admin">Super Admin</Option>
                <Option value="Admin">Admin</Option>
                <Option value="Operator">Operator</Option>
              </Select>
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="px-8 pb-8 pt-2 gap-3">
        <Button variant="text" color="blue-gray" onClick={handleOpen} className="normal-case font-bold">Batal</Button>
        <Button className="bg-[#66bb6a] px-10 rounded-xl normal-case font-bold shadow-none active:scale-95 transition-all" onClick={handleOpen}>
          Simpan Perubahan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditUserModal;