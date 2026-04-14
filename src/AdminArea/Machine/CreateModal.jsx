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
import { CpuChipIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CreateModal = ({ open, setOpen, setMachines, machines }) => {
  const [form, setForm] = useState({ 
    id: "", 
    jenis: "", 
    lokasi: "", 
    operator: "", 
    status: "Beroperasi" 
  });

  const handleSave = () => {
    if (form.id && form.jenis) {
      setMachines([...machines, form]);
      setOpen(false);
      // Reset form setelah simpan
      setForm({ id: "", jenis: "", lokasi: "", operator: "", status: "Beroperasi" });
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={() => setOpen(false)} 
      className="rounded-[30px] shadow-2xl"
      size="sm"
    >
      {/* Header dengan Ikon */}
      <DialogHeader className="flex flex-col items-start gap-1 pt-8 px-8">
        <div className="bg-blue-50 p-3 rounded-2xl mb-2">
          <CpuChipIcon className="h-8 w-8 text-blue-600" />
        </div>
        <Typography variant="h4" className="text-blue-900 font-black">
          Tambah Mesin Baru
        </Typography>
        <Typography className="text-gray-500 font-medium text-sm">
          Masukkan detail unit AIoT EcoCash yang akan didaftarkan.
        </Typography>
      </DialogHeader>

      {/* Body dengan Input yang Rapi */}
      <DialogBody className="px-8 py-4 space-y-6">
        <div className="grid gap-5">
          <Input 
            size="lg"
            label="ID Mesin (Contoh: MS-001)" 
            className="rounded-xl"
            color="blue"
            value={form.id}
            onChange={(e) => setForm({...form, id: e.target.value})} 
          />
          <Input 
            size="lg"
            label="Jenis Mesin" 
            className="rounded-xl"
            color="blue"
            value={form.jenis}
            onChange={(e) => setForm({...form, jenis: e.target.value})} 
          />
          <Input 
            size="lg"
            label="Lokasi Penempatan" 
            className="rounded-xl"
            color="blue"
            value={form.lokasi}
            onChange={(e) => setForm({...form, lokasi: e.target.value})} 
          />
          <Input 
            size="lg"
            label="Nama Admin Operator" 
            className="rounded-xl"
            color="blue"
            value={form.operator}
            onChange={(e) => setForm({...form, operator: e.target.value})} 
          />
        </div>
      </DialogBody>

      {/* Footer dengan Tombol yang Tegas */}
      <DialogFooter className="px-8 pb-8 pt-4 gap-3">
        <Button 
          variant="text" 
          color="red" 
          onClick={() => setOpen(false)}
          className="rounded-xl normal-case font-bold flex-1 py-3"
        >
          Batal
        </Button>
        <Button 
          className="bg-blue-600 rounded-xl normal-case font-bold flex-[2] py-3 shadow-blue-100 shadow-lg hover:shadow-blue-200"
          onClick={handleSave}
        >
          Simpan Unit Mesin
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateModal;