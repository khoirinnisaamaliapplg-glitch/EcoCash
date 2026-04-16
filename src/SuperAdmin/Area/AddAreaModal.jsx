import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";

const AddAreaModal = ({ open, setOpen, dataArea, setDataArea }) => {
  const [newArea, setNewArea] = useState({
    name: "",
    province: "",
    code: "",
    regencyName: "",
    regencyType: "",
  });

  const handleSave = () => {
    if (!newArea.name || !newArea.code) return alert("Mohon isi data utama");
    setDataArea([...dataArea, { ...newArea, id: Date.now() }]);
    setOpen(false);
    setNewArea({ name: "", province: "", code: "", regencyName: "", regencyType: "" });
  };

  return (
    <Dialog
      open={open}
      handler={() => setOpen(false)}
      // size="xs" untuk desktop, tapi di mobile otomatis akan menyesuaikan
      size="sm"
      className="rounded-2xl md:rounded-[2.5rem] p-2 md:p-4"
    >
      <DialogHeader className="text-blue-900 font-bold uppercase tracking-tight text-xl md:text-2xl">
        Tambah Wilayah Baru
      </DialogHeader>

      <DialogBody className="space-y-4 h-[60vh] md:h-auto overflow-y-auto pr-2">
        <div className="space-y-4">
          <Input
            label="Kode Area (Contoh: 32.78.01)"
            value={newArea.code}
            onChange={(e) => setNewArea({ ...newArea, code: e.target.value })}
            color="blue"
          />
          <Input
            label="Nama Area"
            value={newArea.name}
            onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
            color="blue"
          />

          {/* Grid responsive: 1 kolom di mobile, 2 kolom di tablet/desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Provinsi"
              value={newArea.province}
              onChange={(e) => setNewArea({ ...newArea, province: e.target.value })}
              color="blue"
            />
            <Input
              label="Nama Kabupaten/Kota"
              value={newArea.regencyName}
              onChange={(e) => setNewArea({ ...newArea, regencyName: e.target.value })}
              color="blue"
            />
          </div>

          <Select
            label="Tipe Wilayah"
            value={newArea.regencyType}
            onChange={(val) => setNewArea({ ...newArea, regencyType: val })}
          >
            <Option value="Kota">Kota</Option>
            <Option value="Kabupaten">Kabupaten</Option>
          </Select>
        </div>
      </DialogBody>

      <DialogFooter className="flex flex-col-reverse md:flex-row gap-2">
        <Button
          variant="text"
          color="red"
          onClick={() => setOpen(false)}
          className="w-full md:w-auto rounded-xl font-bold normal-case"
        >
          Batal
        </Button>
        <Button
          className="w-full md:w-auto bg-blue-600 rounded-xl px-10 font-bold normal-case shadow-none"
          onClick={handleSave}
        >
          Simpan Area
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddAreaModal;