import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Select,
  Option
} from "@material-tailwind/react";

const EditAreaModal = ({ open, setOpen, selectedArea, dataArea, setDataArea }) => {
  const [formData, setFormData] = useState({ 
    name: "", province: "", code: "", regencyName: "", regencyType: "" 
  });

  // Load data lama ke dalam form saat modal dibuka
  useEffect(() => {
    if (selectedArea) {
      setFormData(selectedArea);
    }
  }, [selectedArea]);

  const handleUpdate = () => {
    const updatedData = dataArea.map((area) =>
      area.id === selectedArea.id ? formData : area
    );
    setDataArea(updatedData);
    setOpen(false);
  };

  return (
    <Dialog 
      open={open} 
      handler={() => setOpen(false)} 
      size="sm"
      className="rounded-2xl md:rounded-[2.5rem] p-2 md:p-4"
    >
      <DialogHeader className="text-blue-900 font-bold uppercase text-xl md:text-2xl tracking-tight">
        Edit Data Wilayah
      </DialogHeader>
      
      {/* h-[60vh] dan overflow-y-auto agar aman jika layar HP pendek atau keyboard muncul */}
      <DialogBody className="space-y-4 max-h-[65vh] md:max-h-none overflow-y-auto pr-2">
        <div className="flex flex-col gap-4">
          <Input 
            label="Kode Area" 
            value={formData.code} 
            onChange={(e) => setFormData({...formData, code: e.target.value})} 
            color="blue" 
          />
          <Input 
            label="Nama Area" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            color="blue" 
          />
          
          {/* Grid: 1 Kolom di HP (default), 2 Kolom di Desktop (md:) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Provinsi" 
              value={formData.province} 
              onChange={(e) => setFormData({...formData, province: e.target.value})} 
              color="blue" 
            />
            <Input 
              label="Kabupaten/Kota" 
              value={formData.regencyName} 
              onChange={(e) => setFormData({...formData, regencyName: e.target.value})} 
              color="blue" 
            />
          </div>
          
          <Select 
            label="Tipe Wilayah" 
            value={formData.regencyType} 
            onChange={(val) => setFormData({...formData, regencyType: val})}
          >
            <Option value="Kota">Kota</Option>
            <Option value="Kabupaten">Kabupaten</Option>
          </Select>
        </div>
      </DialogBody>

      {/* flex-col-reverse agar tombol Batal di bawah Simpan saat mode mobile */}
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
          onClick={handleUpdate}
        >
          Simpan Perubahan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditAreaModal;