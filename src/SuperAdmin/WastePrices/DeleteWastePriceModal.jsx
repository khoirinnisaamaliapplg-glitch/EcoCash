import React, { useState } from "react";
import axios from "axios";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography, Spinner } from "@material-tailwind/react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify"; // Import Toast

const DeleteWastePriceModal = ({ open, handleOpen, data, refreshData }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!data?.id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token"); 
      
      await axios.delete(`http://localhost:3000/api/waste-prices/${data.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success("Harga sampah berhasil dihapus!");
      if (refreshData) refreshData(); 
      handleOpen();  
    } catch (error) {
      console.error("Delete Error:", error.response?.data);
      const msg = error.response?.data?.message || "Gagal menghapus data";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={loading ? () => {} : handleOpen} 
      size="xs" 
      className="rounded-[28px]"
    >
      <DialogHeader className="flex flex-col items-center pt-8">
        <div className="p-4 bg-red-50 rounded-full mb-3">
          <ExclamationCircleIcon className="h-10 w-10 text-red-500" />
        </div>
        <Typography variant="h5" className="text-blue-900 font-bold text-center">
          Konfirmasi Hapus
        </Typography>
      </DialogHeader>
      
      <DialogBody className="px-8 text-center">
        <Typography className="text-gray-600 font-medium">
          Apakah Anda yakin ingin menghapus harga sampah 
          <span className="text-blue-700 font-bold"> {data?.wasteType?.name}</span> di wilayah 
          <span className="text-blue-700 font-bold"> {data?.area?.name}</span>?
        </Typography>
        <Typography className="text-[11px] text-red-400 mt-2 italic">
          Tindakan ini akan menyembunyikan data dari daftar aktif.
        </Typography>
      </DialogBody>

      <DialogFooter className="flex flex-col gap-2 p-8 pt-4">
        <Button 
          fullWidth 
          className="bg-[#ef5350] py-3.5 rounded-xl normal-case font-bold shadow-none flex justify-center items-center" 
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? <Spinner className="h-4 w-4 mr-2" /> : "Ya, Hapus Sekarang"}
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          color="blue-gray" 
          className="py-3.5 normal-case font-bold rounded-xl" 
          onClick={handleOpen}
          disabled={loading}
        >
          Batalkan
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteWastePriceModal;