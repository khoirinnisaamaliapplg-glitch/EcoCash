import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Input, Button, Typography, Spinner, Select, Option 
} from "@material-tailwind/react";
import { PencilSquareIcon, BanknotesIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify"; // Import Toast

const EditWastePriceModal = ({ open, handleOpen, data, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 
  
  const [areas, setAreas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    areaId: "",
    wasteTypeId: "",
    pricePerKg: "",
  });

  // 1. Load Data Dropdown
  useEffect(() => {
    if (open) {
      setIsSuccess(false); 
      const loadDropdownData = async () => {
        setLoadingData(true);
        try {
          const token = localStorage.getItem("token");
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const [areaRes, wasteRes] = await Promise.all([
            axios.get("http://localhost:3000/api/areas", config),
            axios.get("http://localhost:3000/api/waste-types", config)
          ]);
          
          const aData = areaRes.data.data || areaRes.data;
          const wData = wasteRes.data.data || wasteRes.data;

          setAreas(Array.isArray(aData) ? aData.filter(a => a.isActive) : []);
          setCategories(Array.isArray(wData) ? wData.filter(c => c.isActive) : []);
        } catch (error) {
          console.error("Gagal load dropdown:", error);
          toast.error("Gagal memuat data wilayah atau kategori.");
        } finally {
          setLoadingData(false);
        }
      };
      loadDropdownData();
    }
  }, [open]);

  // 2. Sinkronisasi Data Awal
  useEffect(() => {
    if (data && open) {
      setFormData({
        areaId: data.areaId ? String(data.areaId) : "",
        wasteTypeId: data.wasteTypeId ? String(data.wasteTypeId) : "",
        pricePerKg: data.pricePerKg || "",
      });
    }
  }, [data, open]);

  const handleUpdate = async () => {
    if (!formData.areaId || !formData.wasteTypeId || !formData.pricePerKg) {
      return toast.warning("Mohon lengkapi semua data!");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/api/waste-prices/${data.id}`, 
        {
          areaId: Number(formData.areaId),
          wasteTypeId: Number(formData.wasteTypeId),
          pricePerKg: parseFloat(formData.pricePerKg),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Harga berhasil diperbarui!");
      if (refreshData) refreshData();
      setIsSuccess(true); 
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal memperbarui data";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={loading ? () => {} : handleOpen} 
      size="sm" 
      className="rounded-[32px] overflow-visible shadow-2xl min-w-[90%] md:min-w-[450px]"
    >
      {isSuccess ? (
        <DialogBody className="flex flex-col items-center p-10 text-center">
          <div className="bg-green-50 p-5 rounded-full mb-4">
            <CheckCircleIcon className="h-20 w-20 text-green-500" />
          </div>
          <Typography variant="h4" className="text-blue-900 font-black mb-2">
            Berhasil Diperbarui!
          </Typography>
          <Typography className="text-gray-600 font-medium mb-8">
            Data standar harga untuk wilayah <span className="text-blue-700">{data?.area?.name}</span> telah berhasil disimpan.
          </Typography>
          <Button 
            fullWidth 
            className="bg-blue-700 py-4 rounded-2xl shadow-none normal-case text-base"
            onClick={handleOpen}
          >
            Selesai
          </Button>
        </DialogBody>
      ) : (
        <>
          <DialogHeader className="px-6 md:px-10 pt-8 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <PencilSquareIcon className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <Typography variant="h5" className="text-blue-900 font-black">Edit Harga</Typography>
                <Typography className="text-[12px] text-gray-500 font-medium italic">Ubah parameter harga operasional</Typography>
              </div>
            </div>
          </DialogHeader>
          
          <DialogBody className="px-6 md:px-10 py-6 overflow-visible">
            {loadingData ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <Spinner color="blue" className="h-10 w-10" />
                <Typography className="text-blue-gray-300 font-medium animate-pulse">Menghubungkan ke database...</Typography>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Typography variant="small" className="text-blue-900 font-bold mb-2 ml-1">Wilayah</Typography>
                  <Select 
                    label="Pilih Wilayah"
                    value={formData.areaId}
                    onChange={(val) => setFormData({ ...formData, areaId: val })}
                    disabled={loading}
                  >
                    {areas.map((a) => <Option key={a.id} value={String(a.id)}>{a.name}</Option>)}
                  </Select>
                </div>

                <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
                  <div>
                    <Typography variant="small" className="text-blue-900 font-bold mb-2 ml-1">Kategori</Typography>
                    <Select 
                      label="Pilih Jenis"
                      value={formData.wasteTypeId}
                      onChange={(val) => setFormData({ ...formData, wasteTypeId: val })}
                      disabled={loading}
                    >
                      {categories.map((c) => <Option key={c.id} value={String(c.id)}>{c.name}</Option>)}
                    </Select>
                  </div>
                  <div>
                    <Typography variant="small" className="text-blue-900 font-bold mb-2 ml-1">Harga (Rp/Kg)</Typography>
                    <Input 
                      type="number"
                      value={formData.pricePerKg}
                      onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                      icon={<BanknotesIcon className="h-5 w-5 text-green-500" />}
                      className="!rounded-xl border-t-blue-gray-200 focus:!border-blue-500"
                      labelProps={{ className: "hidden" }}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter className="px-6 md:px-10 pb-10 pt-2 flex flex-col-reverse md:flex-row gap-4">
            <Button 
              variant="text" 
              color="blue-gray" 
              onClick={handleOpen} 
              className="w-full md:w-auto normal-case font-bold"
              disabled={loading}
            >
              Batal
            </Button>
            <Button 
              className="bg-blue-700 w-full md:flex-1 rounded-2xl py-4 flex justify-center items-center shadow-lg shadow-blue-100 normal-case text-base" 
              onClick={handleUpdate} 
              disabled={loading || loadingData}
            >
              {loading ? <Spinner className="h-5 w-5" /> : "Update Sekarang"}
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
};

export default EditWastePriceModal;