import React, { useState, useEffect } from "react";
import api from "../../utils/api"; 
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Input, 
  Button, 
  Typography,
  IconButton 
} from "@material-tailwind/react";
import { XMarkIcon, TruckIcon, ChartPieIcon, MapPinIcon } from "@heroicons/react/24/outline";

const CreateModal = ({ open, handleOpen, onRefresh }) => {
  // 1. AMBIL DATA USER DARI LOCALSTORAGE
  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;
  
  const userAreaId = userData?.areaId || ""; 
  const userAreaName = userData?.areaName || userData?.area?.name || "Area Anda";

  const [formData, setFormData] = useState({
    truckCode: "",
    plateNumber: "",
    name: "",
    capacityKg: "",
    areaId: userAreaId
  });
  
  const [submitting, setSubmitting] = useState(false);

  // 2. PASTIKAN AREA ID SELALU TERISI JIKA MODAL DIBUKA
  useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...prev,
        areaId: userAreaId
      }));
    }
  }, [open, userAreaId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.truckCode.trim() || !formData.plateNumber.trim() || !formData.capacityKg || !formData.areaId) {
      alert("Semua field wajib diisi!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        truckCode: formData.truckCode,
        plateNumber: formData.plateNumber,
        name: formData.name,
        capacityKg: Number(formData.capacityKg),
        areaId: Number(formData.areaId) 
      };

      await api.post("/trucks", payload);
      
      setFormData({ truckCode: "", plateNumber: "", name: "", capacityKg: "", areaId: userAreaId });
      
      onRefresh();  
      handleOpen(); 
    } catch (error) {
      console.error("Gagal mengirim data armada:", error);
      alert(error.response?.data?.message || "Terjadi kegagalan saat registrasi armada baru.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} handler={handleOpen} size="sm" className="rounded-[28px] overflow-visible border border-blue-50/50 shadow-2xl">
      <DialogHeader className="flex items-center justify-between px-8 pt-8 pb-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <TruckIcon className="h-6 w-6 text-[#2b6cb0]" />
          </div>
          <div>
            <Typography variant="h5" className="text-blue-900 font-bold leading-tight">Tambah Armada</Typography>
            <Typography className="text-[12px] text-gray-400 font-medium italic">Manajemen Smart Truck EcoCash</Typography>
          </div>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen} className="rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
          <XMarkIcon className="h-5 w-5 stroke-2" />
        </IconButton>
      </DialogHeader>
      
      <DialogBody className="px-8 py-6 space-y-5">
        <div className="space-y-4">
          {/* Truck Code */}
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Kode Truk</Typography>
            <Input 
              name="truckCode"
              value={formData.truckCode}
              onChange={handleInputChange}
              placeholder="Misal: TRK-001" 
              className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl"
              labelProps={{ className: "hidden" }}
            />
          </div>

          {/* Plate Number */}
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Nomor Pelat</Typography>
            <Input 
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleInputChange}
              placeholder="Misal: B 1234 CKN" 
              className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl"
              labelProps={{ className: "hidden" }}
            />
          </div>

          {/* Truck Name */}
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Nama / Deskripsi Truk</Typography>
            <Input 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Misal: Isuzu Elf Bak Terbuka" 
              className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kapasitas */}
            <div>
              <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Kapasitas (Kg)</Typography>
              <Input 
                name="capacityKg"
                type="number"
                value={formData.capacityKg}
                onChange={handleInputChange}
                placeholder="Misal: 1500" 
                className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl"
                labelProps={{ className: "hidden" }}
              />
            </div>

            {/* AREA TERKUNCI */}
            <div>
              <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Wilayah Operasional</Typography>
              <div className="relative">
                <select
                  name="areaId"
                  value={formData.areaId}
                  disabled
                  className="w-full h-[40px] px-3 text-sm text-gray-500 bg-gray-100 border border-blue-gray-100 rounded-xl outline-none appearance-none pr-8 font-medium cursor-not-allowed"
                >
                  <option value={userAreaId}>
                    {userAreaName} (ID: {userAreaId})
                  </option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="flex items-center justify-end gap-3 px-8 pb-8 pt-2">
        <Button variant="text" color="blue-gray" onClick={handleOpen} disabled={submitting} className="normal-case font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors">Batal</Button>
        <Button 
          className="bg-[#2b6cb0] px-8 py-3 rounded-xl normal-case font-bold shadow-none active:scale-95 transition-all" 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Memproses..." : "Simpan Data Armada"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateModal;