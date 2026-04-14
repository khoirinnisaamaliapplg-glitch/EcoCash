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
import { PencilSquareIcon } from "@heroicons/react/24/outline";

const EditModal = ({ open, setOpen, data, setMachines, machines }) => {
  const [form, setForm] = useState({ id: "", jenis: "", lokasi: "", operator: "", status: "" });

  // Sinkronisasi data saat modal dibuka
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleUpdate = () => {
    if (data?.id) {
      setMachines(machines.map((m) => (m.id === data.id ? form : m)));
      setOpen(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={() => setOpen(false)} 
      className="rounded-[30px] shadow-2xl"
      size="sm"
    >
      {/* Header dengan Ikon Edit */}
      <DialogHeader className="flex flex-col items-start gap-1 pt-8 px-8">
        <div className="bg-orange-50 p-3 rounded-2xl mb-2">
          <PencilSquareIcon className="h-8 w-8 text-orange-600" />
        </div>
        <Typography variant="h4" className="text-blue-900 font-black">
          Edit Data Mesin
        </Typography>
        <Typography className="text-gray-500 font-medium text-sm">
          Perbarui informasi unit mesin <span className="text-blue-600 font-bold">{data?.id}</span>.
        </Typography>
      </DialogHeader>

      {/* Body dengan Input yang Konsisten */}
      <DialogBody className="px-8 py-4 space-y-6">
        <div className="grid gap-5">
          <Input 
            size="lg"
            label="Jenis Mesin" 
            className="rounded-xl"
            color="blue"
            value={form.jenis || ""} 
            onChange={(e) => setForm({...form, jenis: e.target.value})} 
          />
          <Input 
            size="lg"
            label="Lokasi Penempatan" 
            className="rounded-xl"
            color="blue"
            value={form.lokasi || ""} 
            onChange={(e) => setForm({...form, lokasi: e.target.value})} 
          />
          <Input 
            size="lg"
            label="Nama Admin Operator" 
            className="rounded-xl"
            color="blue"
            value={form.operator || ""} 
            onChange={(e) => setForm({...form, operator: e.target.value})} 
          />
        </div>
      </DialogBody>

      {/* Footer */}
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
          onClick={handleUpdate}
        >
          Simpan Perubahan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditModal;