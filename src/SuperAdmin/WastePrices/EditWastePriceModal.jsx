import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button, Typography } from "@material-tailwind/react";
import { PencilSquareIcon, BanknotesIcon } from "@heroicons/react/24/outline";

const EditWastePriceModal = ({ open, handleOpen, data }) => {
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (data) setPrice(data.price.replace(".", "")); // Hapus titik format ribuan untuk input
  }, [data]);

  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-[28px] shadow-2xl border border-blue-50/50">
      <DialogHeader className="px-8 pt-8 flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 rounded-xl">
          <PencilSquareIcon className="h-6 w-6 text-blue-600" />
        </div>
        <Typography variant="h5" className="text-blue-900 font-bold">Edit Harga</Typography>
      </DialogHeader>
      
      <DialogBody className="px-8 py-4 space-y-4">
        <div>
          <Typography className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1">Kategori</Typography>
          <div className="px-4 py-2 bg-blue-50 rounded-lg text-blue-700 font-bold text-sm w-fit">
            {data?.category}
          </div>
        </div>

        <div className="space-y-1">
          <Typography variant="small" className="text-blue-900 font-bold ml-1">Harga Baru (Rp/Kg)</Typography>
          <Input 
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            icon={<BanknotesIcon className="h-4 w-4 text-green-500" />}
            className="!rounded-xl border-t-blue-gray-200 focus:!border-blue-500"
            labelProps={{ className: "hidden" }}
          />
        </div>
      </DialogBody>

      <DialogFooter className="px-8 pb-8 pt-2 gap-3">
        <Button variant="text" color="blue-gray" onClick={handleOpen} className="normal-case font-bold">Batal</Button>
        <Button className="bg-[#2b6cb0] px-8 rounded-xl normal-case font-bold shadow-none" onClick={handleOpen}>Update Harga</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditWastePriceModal;