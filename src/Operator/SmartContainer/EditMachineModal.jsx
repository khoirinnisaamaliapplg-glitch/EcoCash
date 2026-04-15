import React, { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Input, 
  Button, 
  Select, 
  Option,
  Typography 
} from "@material-tailwind/react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

const EditMachineModal = ({ open, handleOpen, data }) => {
  // State lokal untuk menampung perubahan input
  const [formData, setFormData] = useState({ id: "", type: "", load: 0 });

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  return (
    <Dialog 
      open={open} 
      handler={handleOpen} 
      size="xs" 
      className="rounded-[28px] mx-4 md:mx-0 overflow-hidden"
    >
      <DialogHeader className="px-8 pt-8 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
          <PencilSquareIcon className="h-6 w-6 stroke-[2]" />
        </div>
        <Typography variant="h5" className="text-blue-900 font-black">Edit Unit AIoT</Typography>
      </DialogHeader>

      <DialogBody className="px-8 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-black ml-1 text-[10px] uppercase tracking-widest">ID Unit</Typography>
            <Input 
              value={formData.id} 
              disabled 
              color="blue" 
              className="!border-t-blue-gray-100 bg-gray-50 rounded-xl"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-black ml-1 text-[10px] uppercase tracking-widest">Jenis Mesin</Typography>
            <Select 
              value={formData.type} 
              label="Pilih Jenis"
              className="rounded-xl"
            >
              <Option value="Pencacah Plastik Otomatis">Pencacah Plastik Otomatis</Option>
              <Option value="Mesin Press Hidrolik">Mesin Press Hidrolik</Option>
              <Option value="Pemilah Magnetik">Pemilah Magnetik</Option>
            </Select>
          </div>

          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-black ml-1 text-[10px] uppercase tracking-widest">Manual Load Update (%)</Typography>
            <Input 
              type="number"
              value={formData.load}
              color="blue" 
              className="rounded-xl"
              labelProps={{ className: "hidden" }}
            />
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="px-8 pb-8 pt-2 flex flex-col-reverse md:flex-row gap-3">
        <Button variant="text" color="blue-gray" onClick={handleOpen} className="w-full md:w-auto normal-case font-bold py-3">
          Batal
        </Button>
        <Button className="w-full md:flex-1 bg-blue-900 rounded-xl normal-case font-black py-3.5 shadow-none" onClick={handleOpen}>
          Simpan Perubahan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditMachineModal;