import React, { useState } from "react";
import axios from "axios";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Button, Typography, Spinner 
} from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/outline";
// 1. Import toast
import { toast } from "react-hot-toast";

const DeleteWasteModal = ({ open, handleOpen, data, refreshData }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!data?.id) return;

    // 2. Tampilkan toast loading
    const toastId = toast.loading("Sedang menghapus data harga...");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(`http://localhost:3000/api/waste-prices/${data.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 3. Update toast menjadi sukses
      toast.success("Data harga berhasil dihapus!", { id: toastId });
      
      refreshData(); // Refresh list data di halaman utama
      handleOpen();  // Tutup modal
    } catch (error) {
      console.error("Delete Error:", error);
      const errorMsg = error.response?.data?.message || "Gagal menghapus data harga";
      
      // 4. Update toast menjadi error
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={handleOpen} 
      size="xs" 
      className="rounded-[30px] mx-4 md:mx-0 shadow-2xl"
    >
      <DialogHeader className="flex flex-col items-center justify-center pt-10 px-8">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <TrashIcon className="h-10 w-10 text-red-600 stroke-2" />
        </div>
        <Typography variant="h4" className="text-gray-900 font-black text-center">
          Hapus Harga?
        </Typography>
      </DialogHeader>

      <DialogBody className="px-8 py-2 text-center">
        <Typography className="text-gray-600 font-medium">
          Anda akan menghapus data harga untuk kategori <span className="font-black text-red-600">{data?.wasteType?.name || "N/A"}</span>.
          <br />
          <span className="text-xs text-gray-400 mt-2 block italic">Tindakan ini tidak dapat dibatalkan.</span>
        </Typography>
      </DialogBody>

      <DialogFooter className="flex flex-col gap-2 p-8 pt-6">
        <Button 
          color="red" 
          fullWidth
          className="bg-red-600 rounded-xl font-bold py-3.5 shadow-md shadow-red-100 flex justify-center items-center"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            "Ya, Hapus Harga"
          )}
        </Button>
        <Button 
          variant="text" 
          color="blue-gray" 
          fullWidth
          onClick={handleOpen}
          disabled={loading}
          className="rounded-xl font-bold py-3"
        >
          Batal
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteWasteModal;