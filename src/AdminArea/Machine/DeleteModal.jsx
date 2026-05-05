import React, { useState } from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Button, 
  Typography,
  Spinner 
} from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
// 1. Import toast
import { toast } from "react-hot-toast";

const DeleteModal = ({ open, handleOpen, data, refreshData }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!data?.id) return;

    setLoading(true);
    // 2. Loading Toast
    const toastId = toast.loading(`Sedang menghapus unit ${data.machineCode || data.id}...`);

    try {
      const token = localStorage.getItem("token");
      
      // Jika Anda menggunakan API asli, aktifkan baris di bawah:
      await axios.delete(`http://localhost:3000/api/machines/${data.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Success Toast
      toast.success("Unit berhasil dihapus dari sistem.", { id: toastId });
      
      handleOpen(); // Tutup modal
      if (refreshData) refreshData(); // Refresh list mesin di parent

    } catch (error) {
      console.error("DELETE ERROR:", error);
      const errorMsg = error.response?.data?.message || "Gagal menghapus mesin.";
      
      // 4. Error Toast
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
      className="rounded-[30px] shadow-2xl"
    >
      {/* Header dengan Ikon Peringatan Merah */}
      <DialogHeader className="flex flex-col items-center justify-center pt-8 px-8 pb-2">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-600 stroke-2" />
        </div>
        <Typography variant="h4" className="text-gray-900 font-black text-center">
          Hapus Unit Mesin?
        </Typography>
      </DialogHeader>

      {/* Body dengan Teks Konfirmasi */}
      <DialogBody className="px-8 py-2 text-center">
        <Typography className="text-gray-600 font-medium">
          Apakah Anda yakin ingin menghapus unit <br/>
          <span className="font-black text-red-600 uppercase">
            {data?.machineCode || data?.id}
          </span>? 
        </Typography>
        <Typography className="text-gray-500 text-sm mt-2">
          Tindakan ini bersifat permanen dan data mesin tidak dapat dikembalikan ke sistem.
        </Typography>
      </DialogBody>

      {/* Footer dengan Tombol Aksi */}
      <DialogFooter className="flex flex-col gap-2 p-8 pt-6">
        <Button 
          color="red" 
          fullWidth
          className="bg-red-600 rounded-xl normal-case font-bold py-3.5 shadow-md shadow-red-100 flex justify-center items-center gap-2"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Ya, Hapus Sekarang"}
        </Button>
        <Button 
          variant="text" 
          color="blue-gray" 
          fullWidth
          onClick={handleOpen}
          disabled={loading}
          className="rounded-xl normal-case font-bold py-3.5"
        >
          Batal
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteModal;