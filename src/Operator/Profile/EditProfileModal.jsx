import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  Header,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

const EditProfileModal = ({ open, setOpen, data, setProfileData }) => {
  // State lokal untuk menampung input sebelum di-save
  const [formData, setFormData] = useState(data);

  // Sync data jika props data berubah
  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setProfileData(formData); // Kirim data baru ke parent (ProfileIndex)
    setOpen(false); // Tutup modal
  };

  return (
    <Dialog 
      size="md" 
      open={open} 
      handler={() => setOpen(false)} 
      className="rounded-[2.5rem] p-4 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-50">
        <Typography variant="h5" className="text-blue-900 font-black uppercase tracking-tighter">
          Update Operator Profile
        </Typography>
        <button 
          onClick={() => setOpen(false)}
          className="p-2 hover:bg-red-50 rounded-xl transition-colors group"
        >
          <XMarkIcon className="h-6 w-6 text-gray-400 group-hover:text-red-500" />
        </button>
      </div>

      <DialogBody className="space-y-6 px-4 pt-6 overflow-y-auto max-h-[70vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Typography className="text-[10px] font-black text-blue-900 ml-1 uppercase">Nama Lengkap</Typography>
            <Input
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              color="blue"
              className="rounded-xl font-bold"
              labelProps={{ className: "hidden" }}
            />
          </div>
          <div className="space-y-1">
            <Typography className="text-[10px] font-black text-blue-900 ml-1 uppercase">Email Kedinasan</Typography>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              color="blue"
              className="rounded-xl font-bold"
              labelProps={{ className: "hidden" }}
            />
          </div>
          <div className="space-y-1">
            <Typography className="text-[10px] font-black text-blue-900 ml-1 uppercase">Nomor Kontak</Typography>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              color="blue"
              className="rounded-xl font-bold"
              labelProps={{ className: "hidden" }}
            />
          </div>
          <div className="space-y-1">
            <Typography className="text-[10px] font-black text-blue-900 ml-1 uppercase">Wilayah Tugas</Typography>
            <Input
              name="wilayah"
              value={formData.wilayah}
              onChange={handleChange}
              color="blue"
              className="rounded-xl font-bold"
              labelProps={{ className: "hidden" }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Typography className="text-[10px] font-black text-blue-900 ml-1 uppercase">Bio / Deskripsi Tugas</Typography>
          <Textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            color="blue"
            className="rounded-xl font-bold min-h-[100px]"
            labelProps={{ className: "hidden" }}
          />
        </div>
      </DialogBody>

      <DialogFooter className="flex gap-3 justify-end p-4 border-t border-gray-50 mt-4">
        <Button
          variant="text"
          color="red"
          onClick={() => setOpen(false)}
          className="rounded-xl normal-case font-black text-xs px-6"
        >
          Batalkan
        </Button>
        <Button
          onClick={handleSave}
          className="bg-[#1e5ea8] rounded-xl normal-case px-10 font-black text-xs shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <CheckIcon className="h-4 w-4 stroke-[3]" /> Simpan Perubahan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditProfileModal;