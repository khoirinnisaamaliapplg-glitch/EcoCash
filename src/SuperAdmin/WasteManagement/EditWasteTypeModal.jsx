import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Input } from "@material-tailwind/react";
import axios from "axios";

const EditWasteTypeModal = ({ open, handleOpen, data, refreshData, apiUrl }) => {
  const [name, setName] = useState("");

  // Sinkronisasi data saat modal dibuka
  useEffect(() => {
    if (data) setName(data.name);
  }, [data]);

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Nama tidak boleh kosong!");
    
    try {
      // 1. Ambil token dari localStorage
      const token = localStorage.getItem("token");

      // 2. Kirim request PATCH dengan header token
      // Pastikan apiUrl tidak memiliki double slash (//)
      const cleanUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      await axios.patch(
        `${cleanUrl}/${data.id}`, 
        { name: name.trim() }, 
        {
          headers: {
            Authorization: `Bearer ${token}`, // WAJIB
          },
        }
      );

      handleOpen();
      refreshData();
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Sesi login berakhir. Silakan login kembali.");
      } else {
        alert(error.response?.data?.message || "Gagal update data");
      }
    }
  };

  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-2xl">
      <DialogHeader className="text-[#2b6cb0] font-bold">Edit Waste Type</DialogHeader>
      <DialogBody>
        <Input 
          label="Waste Type Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          color="blue"
        />
      </DialogBody>
      <DialogFooter className="gap-2">
        <Button variant="text" color="red" onClick={handleOpen} className="normal-case">
          Cancel
        </Button>
        <Button className="bg-[#2b6cb0] normal-case" onClick={handleSubmit}>
          Update Changes
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditWasteTypeModal;