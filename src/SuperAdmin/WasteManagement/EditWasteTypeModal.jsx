import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Input, Spinner } from "@material-tailwind/react";
import axios from "axios";
import { toast } from "react-toastify"; // Import Toast

const EditWasteTypeModal = ({ open, handleOpen, data, refreshData, apiUrl }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Sinkronisasi data saat modal dibuka
  useEffect(() => {
    if (data) setName(data.name);
  }, [data]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.warning("Nama tidak boleh kosong!");
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Pastikan apiUrl tidak memiliki double slash (//)
      const cleanUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      await axios.patch(
        `${cleanUrl}/${data.id}`, 
        { name: name.trim() }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Kategori sampah berhasil diperbarui!");
      handleOpen();
      if (refreshData) refreshData();
    } catch (error) {
      console.error("Update Error:", error);
      if (error.response?.status === 401) {
        toast.error("Sesi login berakhir. Silakan login kembali.");
      } else {
        const msg = error.response?.data?.message || "Gagal update data";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={loading ? () => {} : handleOpen} 
      size="xs" 
      className="rounded-2xl"
    >
      <DialogHeader className="text-[#2b6cb0] font-bold">Edit Waste Type</DialogHeader>
      <DialogBody>
        <Input 
          label="Waste Type Name" 
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
          onClick={handleOpen} 
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
          {loading ? <Spinner className="h-4 w-4" /> : "Update Changes"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditWasteTypeModal;