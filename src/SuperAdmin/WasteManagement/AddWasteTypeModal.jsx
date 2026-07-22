import React, { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Input, Spinner } from "@material-tailwind/react";
import api from "../../utils/api"; 
import { toast } from "react-toastify";

const AddWasteTypeModal = ({ open, handleOpen, refreshData, apiUrl = "/waste-types" }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      return toast.warning("Nama kategori harus diisi!");
    }
    
    setLoading(true);
    try {
      // Interceptor di api.js sudah otomatis menambahkan token, 
      // jadi Anda tidak perlu mengirim header secara manual lagi.
      await api.post(apiUrl, { name: name.trim() });

      toast.success("Kategori sampah berhasil ditambahkan!");
      setName("");
      handleOpen();
      if (refreshData) refreshData();
    } catch (error) {
      console.error("Add Waste Type Error:", error);
      const msg = error.response?.data?.message || "Gagal menambah data";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={loading ? () => {} : handleOpen} size="xs" className="rounded-2xl">
      <DialogHeader className="text-[#2b6cb0] font-bold">Add Waste Type</DialogHeader>
      <DialogBody>
        <Input 
          label="Category Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          color="blue"
          disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </DialogBody>
      <DialogFooter className="gap-2">
        <Button variant="text" color="red" onClick={handleOpen} disabled={loading}>
          Cancel
        </Button>
        <Button className="bg-[#2b6cb0]" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : "Save"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddWasteTypeModal;