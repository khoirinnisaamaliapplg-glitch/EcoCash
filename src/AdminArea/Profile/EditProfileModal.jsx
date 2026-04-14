import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Input, 
  Button, 
  Typography,
  Textarea
} from "@material-tailwind/react";
import { 
  PencilSquareIcon, 
  UserIcon, 
  PhoneIcon, 
  ChatBubbleLeftEllipsisIcon 
} from "@heroicons/react/24/outline";

const EditProfileModal = ({ open, setOpen, data, setProfileData }) => {
  // State lokal untuk form sebelum disimpan
  const [form, setForm] = useState({ nama: "", phone: "", bio: "" });

  // Sinkronisasi data saat modal dibuka
  useEffect(() => {
    if (data) {
      setForm({
        nama: data.nama,
        phone: data.phone,
        bio: data.bio
      });
    }
  }, [data, open]);

  // Fungsi simpan perubahan
  const handleSave = () => {
    if (form.nama) {
      setProfileData({ ...data, ...form }); // Update state profil utama
      setOpen(false); // Tutup modal
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={() => setOpen(false)} 
      className="rounded-[35px] shadow-2xl overflow-hidden" 
      size="sm"
    >
      {/* Header Modal - Aksen Warna Oranye/Amber untuk Mode Edit */}
      <DialogHeader className="flex flex-col items-start gap-1 pt-10 px-10 pb-4">
        <div className="bg-amber-50 p-3 rounded-2xl mb-2">
          <PencilSquareIcon className="h-8 w-8 text-amber-600 stroke-2" />
        </div>
        <Typography variant="h4" className="text-blue-900 font-black">
          Perbarui Profil Personal
        </Typography>
        <Typography className="text-gray-500 font-medium text-sm">
          Perubahan pada nama akan memperbarui User ID System Anda.
        </Typography>
      </DialogHeader>

      <DialogBody className="px-10 py-4">
        <div className="space-y-6">
          {/* Input Nama Lengkap */}
          <div className="space-y-1">
            <Typography className="text-xs font-black uppercase text-blue-900 tracking-wider">Nama Lengkap</Typography>
            <Input 
              size="lg"
              placeholder="Khoirin Nisa Amalia"
              className="rounded-xl border border-gray-100 !border-t-gray-100 focus:!border-blue-500"
              color="blue"
              value={form.nama} 
              onChange={(e) => setForm({...form, nama: e.target.value})} 
              icon={<UserIcon className="h-5 w-5 text-gray-400" />}
              labelProps={{
                className: "hidden", // Sembunyikan label Material Tailwind bawaan
              }}
            />
          </div>

          {/* Input Nomor HP */}
          <div className="space-y-1">
            <Typography className="text-xs font-black uppercase text-blue-900 tracking-wider">Nomor HP / WhatsApp</Typography>
            <Input 
              size="lg"
              placeholder="+62 812-3456-7890"
              className="rounded-xl border border-gray-100 !border-t-gray-100 focus:!border-blue-500"
              color="blue"
              value={form.phone} 
              onChange={(e) => setForm({...form, phone: e.target.value})} 
              icon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
              labelProps={{
                className: "hidden",
              }}
            />
          </div>

          {/* Input Bio / Deskripsi Tugas */}
          <div className="space-y-1">
            <Typography className="text-xs font-black uppercase text-blue-900 tracking-wider">Deskripsi Tugas / Bio</Typography>
            <Textarea 
              size="lg"
              rows={4}
              placeholder="Sebutkan tanggung jawab utama Anda sebagai Admin Area."
              className="rounded-xl border border-gray-100 !border-t-gray-100 focus:!border-blue-500"
              color="blue"
              value={form.bio} 
              onChange={(e) => setForm({...form, bio: e.target.value})} 
              labelProps={{
                className: "hidden",
              }}
            />
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="px-10 pb-10 pt-6 gap-3">
        <Button 
          variant="text" 
          color="red" 
          onClick={() => setOpen(false)}
          className="rounded-xl normal-case font-bold flex-1 py-3"
        >
          Batal
        </Button>
        <Button 
          className="bg-blue-600 rounded-xl normal-case font-black flex-[2] py-3.5 shadow-lg shadow-blue-100 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2"
          onClick={handleSave}
        >
          Simpan Perubahan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditProfileModal;