import React, { useState } from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Input, 
  Button, 
  Typography 
} from "@material-tailwind/react";
import { UserPlusIcon, IdentificationIcon, LockClosedIcon } from "@heroicons/react/24/outline";

const CreateModal = ({ open, setOpen, setOperators, operators }) => {
  const [form, setForm] = useState({ 
    nama: "", 
    idMesin: "", 
    lokasi: "", 
    ktp: "", 
    username: "", 
    password: "" 
  });

  const handleSave = () => {
    if (form.nama && form.username && form.password) {
      setOperators([...operators, { ...form, id: Date.now() }]);
      setOpen(false);
      setForm({ nama: "", idMesin: "", lokasi: "", ktp: "", username: "", password: "" });
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={() => setOpen(false)} 
      // Responsive width: sm untuk layar kecil, md untuk layar besar
      size="md"
      className="rounded-[25px] md:rounded-[35px] shadow-2xl overflow-hidden mx-4 md:mx-0"
    >
      {/* Header Responsif */}
      <DialogHeader className="flex flex-col items-start gap-1 pt-6 md:pt-8 px-6 md:px-10">
        <div className="bg-blue-50 p-2.5 md:p-3 rounded-2xl mb-2">
          <UserPlusIcon className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
        </div>
        <Typography variant="h4" className="text-blue-900 font-black text-xl md:text-2xl">
          Registrasi Operator
        </Typography>
        <Typography className="text-gray-500 font-medium text-xs md:text-sm">
          Lengkapi data di bawah untuk membuat akun akses AIoT EcoCash.
        </Typography>
      </DialogHeader>

      {/* Body dengan Scrollable Area untuk HP */}
      <DialogBody className="px-6 md:px-10 py-4 md:py-6 max-h-[60vh] md:max-h-none overflow-y-auto">
        <div className="space-y-6 md:space-y-8">
          
          {/* Section 1: Informasi Personal */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IdentificationIcon className="h-5 w-5 text-blue-400" />
              <Typography className="text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-800/60">
                Informasi Personal & Lokasi
              </Typography>
            </div>
            {/* Grid Responsif: 1 kolom di HP, 2 kolom di Laptop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <Input 
                size="lg"
                label="Nama Lengkap" 
                className="rounded-xl"
                color="blue"
                value={form.nama}
                onChange={(e) => setForm({...form, nama: e.target.value})} 
              />
              <Input 
                size="lg"
                label="No KTP" 
                className="rounded-xl"
                color="blue"
                value={form.ktp}
                onChange={(e) => setForm({...form, ktp: e.target.value})} 
              />
              <Input 
                size="lg"
                label="ID Mesin (AIoT Unit)" 
                className="rounded-xl"
                color="blue"
                value={form.idMesin}
                onChange={(e) => setForm({...form, idMesin: e.target.value})} 
              />
              <Input 
                size="lg"
                label="Lokasi Penempatan" 
                className="rounded-xl"
                color="blue"
                value={form.lokasi}
                onChange={(e) => setForm({...form, lokasi: e.target.value})} 
              />
            </div>
          </div>

          {/* Section 2: Informasi Akun */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LockClosedIcon className="h-5 w-5 text-blue-400" />
              <Typography className="text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-800/60">
                Kredensial Login
              </Typography>
            </div>
            {/* Grid Responsif */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <Input 
                size="lg"
                label="Username" 
                className="rounded-xl font-bold"
                color="blue"
                value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value})} 
              />
              <Input 
                size="lg"
                label="Password" 
                type="password" 
                className="rounded-xl"
                color="blue"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})} 
              />
            </div>
          </div>
        </div>
      </DialogBody>

      {/* Footer Responsif */}
      <DialogFooter className="px-6 md:px-10 pb-8 md:pb-10 pt-4 flex flex-col-reverse md:flex-row gap-3 md:gap-4">
        <Button 
          variant="text" 
          color="red" 
          onClick={() => setOpen(false)}
          className="w-full md:w-auto rounded-xl normal-case font-bold py-3 px-6"
        >
          Batal
        </Button>
        <Button 
          className="w-full md:flex-1 bg-blue-600 rounded-xl normal-case font-black py-3.5 shadow-lg shadow-blue-100 hover:shadow-blue-300 transition-all"
          onClick={handleSave}
        >
          Daftarkan Operator
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateModal;