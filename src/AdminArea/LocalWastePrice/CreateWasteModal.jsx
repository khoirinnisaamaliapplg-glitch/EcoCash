import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Input, Button, Typography, Select, Option, Spinner 
} from "@material-tailwind/react";
import { BanknotesIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

const CreateWasteModal = ({ open, handleOpen, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ 
    wasteTypeId: "", 
    pricePerKg: "" 
  });

  // Ambil data user untuk mendapatkan areaId secara otomatis
  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    if (open) {
      const loadWasteTypes = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem("token");
          const config = { headers: { Authorization: `Bearer ${token}` } };

          // Hanya fetch waste-types karena areaId sudah didapat dari login
          const wasteRes = await axios.get("http://localhost:3000/api/waste-types", config);
          const wData = Array.isArray(wasteRes.data) ? wasteRes.data : (wasteRes.data.data || []);

          setCategories(wData.filter(c => c.isActive));
        } catch (error) {
          console.error("Fetch Waste Types Error:", error);
        } finally {
          setLoadingData(false);
        }
      };
      loadWasteTypes();
    }
  }, [open]);

  const handleSubmit = async () => {
    // Validasi: Pastikan jenis sampah, harga, dan areaId user tersedia
    if (!formData.wasteTypeId || !formData.pricePerKg) return alert("Harap isi semua field!");
    if (!userData?.areaId) return alert("Error: ID Wilayah tidak ditemukan pada akun Anda.");
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/api/waste-prices", 
        {
          areaId: Number(userData.areaId), // Otomatis dari user login
          wasteTypeId: Number(formData.wasteTypeId),
          pricePerKg: parseFloat(formData.pricePerKg)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      refreshData(); // Refresh list di halaman utama
      handleOpen();  // Tutup modal
      setFormData({ wasteTypeId: "", pricePerKg: "" }); // Reset form
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan harga");
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
            {/* Jenis Sampah */}
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

            {/* Harga per Kg */}
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
                className="!border-t-blue-gray-200 focus:!border-blue-500"
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