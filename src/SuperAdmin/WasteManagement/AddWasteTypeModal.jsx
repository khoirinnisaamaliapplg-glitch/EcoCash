import React, { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Input } from "@material-tailwind/react";
import axios from "axios";

const AddWasteTypeModal = ({ open, handleOpen, refreshData, apiUrl }) => {
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Nama kategori harus diisi!");
    
    try {
      // 1. Ambil token dari localStorage
      const token = localStorage.getItem("token");

      // 2. Kirim request dengan header Authorization
      await axios.post(
        apiUrl, 
        { name: name.trim() }, 
        {
          headers: {
            Authorization: `Bearer ${token}`, // WAJIB ADA
          },
        }
      );

      setName("");
      handleOpen();
      refreshData();
    } catch (error) {
      // Jika error 401, artinya token tidak valid/expired
      if (error.response?.status === 401) {
        alert("Sesi habis, silakan login kembali.");
      } else {
        alert(error.response?.data?.message || "Gagal menambah data");
      }
    }
  };

  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-2xl">
      <DialogHeader className="text-[#2b6cb0] font-bold">Add Waste Type</DialogHeader>
      <DialogBody>
        <Input 
          label="Category Name" 
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
          Save
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddWasteTypeModal;