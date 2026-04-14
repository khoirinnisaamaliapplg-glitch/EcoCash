import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button, Typography } from "@material-tailwind/react";
import { BanknotesIcon } from "@heroicons/react/24/outline";

const EditPriceModal = ({ open, setOpen, data }) => {
  const [price, setPrice] = useState("");

  useEffect(() => { if (data) setPrice(data.harga); }, [data]);

  return (
    <Dialog open={open} handler={() => setOpen(false)} className="rounded-[35px]" size="xs">
      <DialogHeader className="flex flex-col items-start gap-1 pt-8 px-10">
        <div className="bg-green-50 p-3 rounded-2xl mb-2">
          <BanknotesIcon className="h-8 w-8 text-green-600" />
        </div>
        <Typography variant="h4" className="text-blue-900 font-black">Update Harga</Typography>
        <Typography className="text-gray-500 font-medium text-sm">Update harga sampah kategori <span className="text-blue-600 font-bold">{data?.kategori}</span>.</Typography>
      </DialogHeader>
      <DialogBody className="px-10 py-4">
        <Input 
          size="lg" 
          label="Harga Baru (Rp/Kg)" 
          className="rounded-xl font-black text-blue-700" 
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </DialogBody>
      <DialogFooter className="px-10 pb-10 gap-3">
        <Button variant="text" color="red" onClick={() => setOpen(false)} className="rounded-xl">Batal</Button>
        <Button className="bg-green-600 flex-1 rounded-xl shadow-green-100 shadow-lg font-black" onClick={() => setOpen(false)}>Simpan Harga Baru</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditPriceModal;