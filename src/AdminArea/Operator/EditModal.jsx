import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Input, 
  Button, 
  Typography 
} from "@material-tailwind/react";
import { PencilSquareIcon, MapPinIcon, IdentificationIcon, UserIcon } from "@heroicons/react/24/outline";

const EditModal = ({ open, setOpen, data, setOperators, operators }) => {
  const [form, setForm] = useState({ nama: "", idMesin: "", lokasi: "", ktp: "", username: "" });

  useEffect(() => { 
    if (data) setForm(data); 
  }, [data]);

  const handleUpdate = () => {
    if (data?.id) {
      setOperators(operators.map((op) => (op.id === data.id ? form : op)));
      setOpen(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={() => setOpen(false)} 
      className="rounded-[35px] shadow-2xl overflow-hidden" 
      size="sm"
    >
      {/* Header dengan Aksen Warna Oranye/Amber untuk Mode Edit */}
      <DialogHeader className="flex flex-col items-start gap-1 pt-8 px-10">
        <div className="bg-amber-50 p-3 rounded-2xl mb-2">
          <PencilSquareIcon className="h-8 w-8 text-amber-600" />
        </div>
        <Typography variant="h4" className="text-blue-900 font-black">
          Edit Profil Operator
        </Typography>
        <Typography className="text-gray-500 font-medium text-sm">
          Perbarui informasi untuk operator <span className="text-blue-600 font-bold">@{data?.username}</span>.
        </Typography>
      </DialogHeader>

      <DialogBody className="px-10 py-4">
        <div className="space-y-5">
          {/* Input Nama */}
          <div className="relative">
            <Input 
              size="lg"
              label="Nama Lengkap" 
              className="rounded-xl"
              color="blue"
              value={form.nama || ""} 
              onChange={(e) => setForm({...form, nama: e.target.value})} 
              icon={<UserIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>

          {/* Input Lokasi */}
          <div className="relative">
            <Input 
              size="lg"
              label="Lokasi Wilayah" 
              className="rounded-xl"
              color="blue"
              value={form.lokasi || ""} 
              onChange={(e) => setForm({...form, lokasi: e.target.value})} 
              icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>

          {/* Input KTP */}
          <div className="relative">
            <Input 
              size="lg"
              label="Nomor KTP" 
              className="rounded-xl"
              color="blue"
              value={form.ktp || ""} 
              onChange={(e) => setForm({...form, ktp: e.target.value})} 
              icon={<IdentificationIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>
          
          <Typography className="text-[10px] text-gray-400 text-center font-medium uppercase tracking-widest mt-2">
            ID Mesin Terkait: <span className="text-blue-600">{form.idMesin}</span>
          </Typography>
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
          className="bg-blue-600 rounded-xl normal-case font-black flex-[2] py-3.5 shadow-lg shadow-blue-100 hover:shadow-blue-300 transition-all"
          onClick={handleUpdate}
        >
          Simpan Perubahan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditModal;