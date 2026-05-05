import React, { useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Spinner,
} from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
// Menggunakan react-hot-toast agar konsisten dengan komponen Index & Edit sebelumnya
import { toast } from "react-hot-toast";

const DeleteStoreModal = ({ open, handleOpen, data, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!data?.id) {
      toast.error("Gagal menghapus: ID Toko tidak ditemukan.");
      return;
    }

    setLoading(true);
    try {
      // Kita memanggil onConfirm yang dikirim dari StoreIndex.jsx
      // onConfirm di Index biasanya sudah menangani axios.patch/delete dan toast internal
      await onConfirm(); 
      
      // Note: Jika onConfirm di StoreIndex tidak return promise, 
      // pastikan handleOpen() tetap terpanggil melalui flow di parent.
    } catch (error) {
      // Error handling tambahan jika fungsi onConfirm melempar error
      console.error("Delete Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={loading ? () => {} : handleOpen} 
      size="xs" 
      className="rounded-[28px] shadow-2xl border border-red-50"
    >
      <DialogBody className="text-center p-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
        </div>
        
        <Typography variant="h5" className="text-red-900 font-bold mb-3">
          Konfirmasi Hapus Toko
        </Typography>
        
        <Typography className="font-normal text-gray-600">
          Apakah Anda yakin ingin menonaktifkan toko <br />
          <strong className="text-red-700 font-bold text-lg">
            {data?.name || "ini"}
          </strong>?
        </Typography>
        
        <div className="mt-6 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Typography variant="small" className="text-gray-500 font-mono">
            ID Unit: #{data?.id}
          </Typography>
        </div>

        <Typography className="text-[10px] text-gray-400 mt-4 italic">
          *Data tidak akan dihapus permanen, hanya diubah status menjadi non-aktif.
        </Typography>
      </DialogBody>

      <DialogFooter className="flex justify-center gap-3 pb-10 px-8">
        <Button 
          variant="text" 
          color="blue-gray" 
          onClick={handleOpen} 
          disabled={loading}
          className="capitalize font-bold"
        >
          Batal
        </Button>
        <Button 
          variant="gradient"
          color="red" 
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-2 capitalize font-bold shadow-red-200 shadow-lg"
        >
          {loading ? (
            <>
              <Spinner className="h-4 w-4" /> Memproses...
            </>
          ) : (
            "Ya, Nonaktifkan"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteStoreModal;