import React, { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button, Typography } from "@material-tailwind/react";
import { KeyIcon } from "@heroicons/react/24/outline";

const ResetPasswordModal = ({ open, setOpen, data }) => {
  const [newPass, setNewPass] = useState("");

  const handleReset = () => {
    console.log(`Resetting password for ${data?.username} to: ${newPass}`);
    alert(`Password operator ${data?.nama} berhasil diperbarui!`);
    setOpen(false);
    setNewPass("");
  };

  return (
    <Dialog open={open} handler={() => setOpen(false)} className="rounded-[30px]" size="xs">
      <DialogHeader className="flex flex-col items-center pt-8">
        <div className="bg-green-50 p-3 rounded-full mb-2">
          <KeyIcon className="h-8 w-8 text-green-600" />
        </div>
        <Typography variant="h5" color="blue-gray">Reset Password</Typography>
      </DialogHeader>
      <DialogBody className="px-8 text-center">
        <Typography className="text-sm text-gray-500 mb-6">
          Masukkan password baru untuk operator <span className="font-bold">{data?.username}</span>.
        </Typography>
        <Input 
          type="password" 
          label="Password Baru" 
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />
      </DialogBody>
      <DialogFooter className="px-8 pb-8 pt-6 flex-col gap-2">
        <Button className="bg-green-600 w-full rounded-xl py-3" onClick={handleReset}>Perbarui Password</Button>
        <Button variant="text" color="blue-gray" className="w-full" onClick={() => setOpen(false)}>Batal</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ResetPasswordModal;