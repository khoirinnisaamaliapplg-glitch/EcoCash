import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button, Select, Option } from "@material-tailwind/react";

const AddMachineModal = ({ open, handleOpen }) => {
  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-[2rem]">
      <DialogHeader className="px-8 pt-8 text-blue-900 font-black">Registrasi Unit Baru</DialogHeader>
      <DialogBody className="px-8 space-y-4">
        <Input label="ID Unit (Contoh: MS 004)" color="blue" className="rounded-xl" />
        <Select label="Jenis Mesin" color="blue" className="rounded-xl">
          <Option>Pencacah Plastik</Option>
          <Option>Mesin Press Hidrolik</Option>
          <Option>Pemilah Magnetik</Option>
        </Select>
        <Input label="Kapasitas Maksimal (Kg)" type="number" color="blue" className="rounded-xl" />
      </DialogBody>
      <DialogFooter className="px-8 pb-8 flex flex-col-reverse md:flex-row gap-3">
        <Button variant="text" color="red" onClick={handleOpen} className="w-full md:w-auto normal-case font-bold">Batal</Button>
        <Button className="bg-blue-900 w-full md:flex-1 rounded-xl normal-case font-black shadow-none" onClick={handleOpen}>Simpan Unit</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddMachineModal;