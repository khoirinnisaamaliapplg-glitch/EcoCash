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
// 1. Import toast
import { toast } from "react-hot-toast";

const DeleteModal = ({ open, setOpen, data, setOperators, operators }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (data?.id) {
      setLoading(true);
      
      // Simulasi delay sedikit agar UX terasa lebih mantap saat menghapus
      try {
        // Logika hapus state lokal
        setOperators(operators.filter((op) => op.id !== data.id));
        
        // 2. Tampilkan Toast Berhasil
        toast.success(`Akun ${data?.nama} berhasil dihapus`, {
          icon: '🗑️',
          style: {
            borderRadius: '15px',
            background: '#333',
            color: '#fff',
          },
        });

        setOpen(false);
      } catch (error) {
        toast.error("Gagal menghapus operator");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={() => !loading && setOpen(false)} 
      size="xs" 
      className="rounded-[30px]"
    >
      <DialogHeader className="flex flex-col items-center pt-8">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
        </div>
        <Typography variant="h4" className="text-center text-blue-900 font-black">
          Hapus Operator?
        </Typography>
      </DialogHeader>

      <DialogBody className="px-8 text-center">
        <Typography className="text-gray-600">
          Apakah Anda yakin ingin menghapus akun <span className="font-bold text-red-600">{data?.nama}</span>? 
          Akses operator ini ke sistem akan segera dicabut secara permanen.
        </Typography>
      </DialogBody>

      <DialogFooter className="flex flex-col gap-2 p-8 pt-6">
        <Button 
          color="red" 
          fullWidth 
          className="rounded-xl py-3.5 flex justify-center items-center gap-2" 
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Ya, Hapus Akun"}
        </Button>
        
        <Button 
          variant="text" 
          color="blue-gray" 
          fullWidth 
          className="rounded-xl" 
          onClick={() => setOpen(false)}
          disabled={loading}
        >
          Batal
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteModal;