import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Input, Button, Typography, Select, Option, Spinner 
} from "@material-tailwind/react";
import { BanknotesIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
// 1. Import toast
import { toast } from "react-hot-toast";

const CreateWasteModal = ({ open, handleOpen, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ 
    wasteTypeId: "", 
    pricePerKg: "" 
  });

  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    if (open) {
      const loadWasteTypes = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem("token");
          const config = { headers: { Authorization: `Bearer ${token}` } };

          const wasteRes = await axios.get("http://localhost:3000/api/waste-types", config);
          const wData = Array.isArray(wasteRes.data) ? wasteRes.data : (wasteRes.data.data || []);

          setCategories(wData.filter(c => c.isActive));
        } catch (error) {
          console.error("Fetch Waste Types Error:", error);
          toast.error("Gagal memuat kategori sampah");
        } finally {
          setLoadingData(false);
        }
      };
      loadWasteTypes();
    }
  }, [open]);

  const handleSubmit = async () => {
    // 2. Validasi Input dengan Toast
    if (!formData.wasteTypeId || !formData.pricePerKg) {
      return toast.error("Harap isi semua field!");
    }
    if (!userData?.areaId) {
      return toast.error("ID Wilayah tidak ditemukan pada akun Anda.");
    }
    
    setLoading(true);
    // 3. Tampilkan Loading Toast
    const toastId = toast.loading("Sedang menyimpan harga sampah...");

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/api/waste-prices", 
        {
          areaId: Number(userData.areaId),
          wasteTypeId: Number(formData.wasteTypeId),
          pricePerKg: parseFloat(formData.pricePerKg)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 4. Sukses Toast
      toast.success("Harga sampah berhasil ditambahkan!", { id: toastId });
      
      refreshData(); 
      handleOpen();  
      setFormData({ wasteTypeId: "", pricePerKg: "" }); 
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal menyimpan harga";
      // 5. Gagal Toast
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={handleOpen} 
      size="sm" 
      className="rounded-[24px] overflow-visible min-w-[90%] md:min-w-[450px]"
    >
      <DialogHeader className="px-6 md:px-8 pt-8 flex flex-col items-start gap-1">
        <div className="bg-blue-50 p-2 rounded-lg mb-2">
          <PlusCircleIcon className="h-6 w-6 text-blue-600" />
        </div>
        <Typography variant="h5" className="text-blue-900 font-bold text-xl">
          Tambah Harga Sampah
        </Typography>
        <Typography className="text-gray-500 text-xs font-normal">
          Menambahkan standar harga baru untuk wilayah: <span className="font-bold text-blue-600">{userData?.areaName || userData?.area?.name || "Wilayah Anda"}</span>
        </Typography>
      </DialogHeader>
      
      <DialogBody className="px-6 md:px-8 py-4 overflow-visible">
        {loadingData ? (
          <div className="flex justify-center py-10"><Spinner color="blue" className="h-10 w-10" /></div>
        ) : (
          <div className="space-y-6">
            <div className="w-full">
              <Typography variant="small" className="font-bold mb-2 text-blue-gray-700">
                Kategori Sampah
              </Typography>
              <Select 
                label="Pilih Jenis Sampah" 
                value={formData.wasteTypeId} 
                onChange={(val) => setFormData({...formData, wasteTypeId: val})}
                color="blue"
              >
                {categories.map(item => (
                  <Option key={item.id} value={String(item.id)}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="w-full">
              <Typography variant="small" className="font-bold mb-2 text-blue-gray-700">
                Harga Jual (per Kg)
              </Typography>
              <Input 
                type="number" 
                placeholder="Contoh: 5000"
                value={formData.pricePerKg} 
                onChange={(e) => setFormData({...formData, pricePerKg: e.target.value})}
                icon={<BanknotesIcon className="h-5 w-5 text-blue-500" />}
                className="!border-t-blue-gray-200 focus:!border-blue-500 font-bold"
                labelProps={{ className: "hidden" }}
              />
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="px-6 md:px-8 pb-8 pt-4 flex flex-col-reverse md:flex-row gap-3">
        <Button 
          variant="text" 
          color="red" 
          onClick={handleOpen} 
          disabled={loading}
          className="w-full md:w-auto normal-case font-bold"
        >
          Batal
        </Button>
        <Button 
          className="bg-blue-600 w-full md:flex-1 py-3 flex justify-center items-center shadow-lg shadow-blue-100 normal-case font-black" 
          onClick={handleSubmit} 
          disabled={loading || loadingData}
        >
          {loading ? <Spinner className="h-4 w-4 mr-2" /> : "Simpan Harga"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateWasteModal;