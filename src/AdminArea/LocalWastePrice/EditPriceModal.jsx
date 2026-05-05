import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Input, Button, Typography, Spinner 
} from "@material-tailwind/react";
import { BanknotesIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
// 1. Import toast
import { toast } from "react-hot-toast";

const EditPriceModal = ({ open, handleOpen, data, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState("");

  // Sinkronisasi data saat modal dibuka
  useEffect(() => {
    if (open && data) {
      setPrice(data.pricePerKg || "");
    }
  }, [data, open]);

  const handlePatch = async () => {
    // 2. Validasi dengan Toast Error
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      return toast.error("Harap masukkan harga yang valid dan lebih dari 0!");
    }
    
    setLoading(true);
    // 3. Gunakan loading toast untuk memberikan feedback instan
    const toastId = toast.loading("Sedang memperbarui harga...");

    try {
      const token = localStorage.getItem("token");
      
      await axios.patch(`http://localhost:3000/api/waste-prices/${data.id}`, 
        {
          pricePerKg: parseFloat(price)
        },
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      
      // 4. Toast Sukses
      toast.success("Harga berhasil diperbarui!", { id: toastId });
      
      refreshData(); 
      handleOpen();  
    } catch (error) {
      console.error("Patch Error:", error);
      const errorMsg = error.response?.data?.message || "Gagal memperbarui harga sampah";
      
      // 5. Toast Gagal
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
      className="rounded-[25px] md:rounded-[35px] shadow-2xl overflow-hidden mx-4 md:mx-0"
    >
      <DialogHeader className="flex flex-col items-start gap-1 pt-8 px-6 md:px-10">
        <div className="bg-green-50 p-3 rounded-2xl mb-2">
          <PencilSquareIcon className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
        </div>
        <Typography variant="h4" className="text-blue-900 font-black text-xl md:text-2xl">
          Edit Harga Sampah
        </Typography>
        <Typography className="text-gray-500 font-medium text-xs md:text-sm">
          Ubah harga untuk kategori: <span className="text-blue-600 font-bold">{data?.wasteType?.name || "N/A"}</span>
        </Typography>
      </DialogHeader>

      <DialogBody className="px-6 md:px-10 py-4">
        <div className="space-y-2">
          <Typography variant="small" className="font-bold text-blue-gray-700 ml-1">
            Harga Baru (Rp/Kg)
          </Typography>
          <Input 
            size="lg" 
            type="number"
            placeholder="Contoh: 5500"
            className="rounded-xl font-black text-blue-700 !border-t-blue-gray-200 focus:!border-green-500" 
            labelProps={{ className: "hidden" }} 
            icon={<BanknotesIcon className="h-5 w-5 text-green-500" />}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </DialogBody>

      <DialogFooter className="px-6 md:px-10 pb-8 md:pb-10 pt-4 flex flex-col-reverse md:flex-row gap-3">
        <Button 
          variant="text" 
          color="red" 
          onClick={handleOpen} 
          disabled={loading}
          className="w-full md:w-auto rounded-xl font-bold normal-case py-3"
        >
          Batal
        </Button>
        <Button 
          className="bg-green-600 w-full md:flex-1 rounded-xl shadow-green-100 shadow-lg font-black py-3 normal-case flex justify-center items-center" 
          onClick={handlePatch}
          disabled={loading}
        >
          {loading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditPriceModal;