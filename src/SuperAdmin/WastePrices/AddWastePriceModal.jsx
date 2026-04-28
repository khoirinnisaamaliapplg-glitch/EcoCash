import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Input, Button, Typography, Select, Option, Spinner 
} from "@material-tailwind/react";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify"; // Import Toast

const AddWastePriceModal = ({ open, handleOpen, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const [areas, setAreas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ areaId: "", wasteTypeId: "", pricePerKg: "" });

  useEffect(() => {
    if (open) {
      const loadDropdowns = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem("token");
          const config = { headers: { Authorization: `Bearer ${token}` } };

          const [areaRes, wasteRes] = await Promise.all([
            axios.get("http://localhost:3000/api/areas", config),
            axios.get("http://localhost:3000/api/waste-types", config)
          ]);

          const aData = Array.isArray(areaRes.data) ? areaRes.data : (areaRes.data.data || []);
          const wData = Array.isArray(wasteRes.data) ? wasteRes.data : (wasteRes.data.data || []);

          // Filter yang aktif saja
          setAreas(aData.filter(a => a.isActive));
          setCategories(wData.filter(c => c.isActive));
        } catch (error) {
          console.error("Fetch Error:", error);
          toast.error("Gagal mengambil data referensi wilayah/kategori.");
        } finally {
          setLoadingData(false);
        }
      };
      loadDropdowns();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.areaId || !formData.wasteTypeId || !formData.pricePerKg) {
      return toast.warning("Semua kolom wajib diisi!");
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/api/waste-prices", 
        {
          areaId: Number(formData.areaId),
          wasteTypeId: Number(formData.wasteTypeId),
          pricePerKg: parseFloat(formData.pricePerKg)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Harga baru berhasil disimpan!");
      setFormData({ areaId: "", wasteTypeId: "", pricePerKg: "" });
      if (refreshData) refreshData();
      handleOpen();
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal menyimpan data harga";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ areaId: "", wasteTypeId: "", pricePerKg: "" });
      handleOpen();
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={handleClose} 
      size="sm" 
      className="rounded-[24px] overflow-visible min-w-[90%] md:min-w-[450px]"
    >
      <DialogHeader className="px-6 md:px-8 pt-8">
        <Typography variant="h5" className="text-blue-900 font-bold text-xl md:text-2xl">
          Tambah Harga
        </Typography>
      </DialogHeader>
      
      <DialogBody className="px-6 md:px-8 py-4 overflow-visible">
        {loadingData ? (
          <div className="flex justify-center py-10">
            <Spinner color="green" className="h-10 w-10" />
          </div>
        ) : (
          <div className="space-y-5 md:space-y-6">
            <div className="w-full">
              <Typography variant="small" className="font-bold mb-2 text-blue-gray-700">Lokasi Wilayah</Typography>
              <Select 
                label="Pilih Lokasi" 
                value={formData.areaId} 
                onChange={(val) => setFormData({...formData, areaId: val})}
                disabled={loading}
              >
                {areas.map(item => (
                  <Option key={item.id} value={String(item.id)}>{item.name}</Option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-2 gap-5 md:gap-4">
              <div className="w-full">
                <Typography variant="small" className="font-bold mb-2 text-blue-gray-700">Jenis Sampah</Typography>
                <Select 
                  label="Pilih Jenis" 
                  value={formData.wasteTypeId} 
                  onChange={(val) => setFormData({...formData, wasteTypeId: val})}
                  disabled={loading}
                >
                  {categories.map(item => (
                    <Option key={item.id} value={String(item.id)}>{item.name}</Option>
                  ))}
                </Select>
              </div>
              <div className="w-full">
                <Typography variant="small" className="font-bold mb-2 text-blue-gray-700">Harga / Kg</Typography>
                <Input 
                  type="number" 
                  placeholder="Contoh: 5000"
                  value={formData.pricePerKg} 
                  onChange={(e) => setFormData({...formData, pricePerKg: e.target.value})}
                  icon={<BanknotesIcon className="h-5 w-5 text-green-500" />}
                  className="!border-t-blue-gray-200 focus:!border-green-500"
                  labelProps={{ className: "hidden" }}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="px-6 md:px-8 pb-8 pt-4 flex flex-col-reverse md:flex-row gap-3">
        <Button 
          variant="text" 
          color="red" 
          onClick={handleClose} 
          className="w-full md:w-auto normal-case"
          disabled={loading}
        >
          Batal
        </Button>
        <Button 
          className="bg-green-500 w-full md:flex-1 py-3 flex justify-center items-center shadow-none hover:shadow-green-200 normal-case" 
          onClick={handleSubmit} 
          disabled={loading || loadingData}
        >
          {loading ? <Spinner className="h-4 w-4 mr-2" /> : "Simpan Harga"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddWastePriceModal;