import React, { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Input, Spinner } from "@material-tailwind/react";
import axios from "axios";
import { toast } from "react-toastify"; // Import Toast

const AddWasteTypeModal = ({ open, handleOpen, refreshData, apiUrl }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      return toast.warning("Nama kategori harus diisi!");
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        apiUrl, 
        { name: name.trim() }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Kategori sampah berhasil ditambahkan!");
      setName("");
      handleOpen();
      if (refreshData) refreshData();
    } catch (error) {
      console.error("Add Waste Type Error:", error);
      if (error.response?.status === 401) {
        toast.error("Sesi habis, silakan login kembali.");
      } else {
        const msg = error.response?.data?.message || "Gagal menambah data";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    handleOpen();
  };

  return (
    <Dialog 
      open={open} 
      handler={loading ? () => {} : handleClose} 
      size="xs" 
      className="rounded-2xl"
    >
      <DialogHeader className="text-[#2b6cb0] font-bold">Add Waste Type</DialogHeader>
      <DialogBody>
        <Input 
          label="Category Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          color="blue"
          disabled={loading}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </DialogBody>
      <DialogFooter className="gap-2">
        <Button 
          variant="text" 
          color="red" 
          onClick={handleClose} 
          className="normal-case"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          className="bg-[#2b6cb0] normal-case flex items-center gap-2" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Save"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddWasteTypeModal;