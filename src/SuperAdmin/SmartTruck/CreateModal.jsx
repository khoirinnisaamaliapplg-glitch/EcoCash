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
import { XMarkIcon, TruckIcon, MapPinIcon, ChartPieIcon } from "@heroicons/react/24/outline";

// Import Toastify
import { toast } from 'react-toastify';

const CreateModal = ({ open, handleOpen, onRefresh }) => {
  const [formData, setFormData] = useState({
    truckCode: "",
    plateNumber: "",
    name: "",
    capacityKg: "",
    areaId: "" 
  });
  
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAreas = async () => {
      if (!open) return;
      setLoadingAreas(true);
      try {
        const response = await api.get("/areas");
        const fetchedData = response?.data?.data || response?.data || [];
        const activeAreas = fetchedData.filter(area => area.isActive !== false);
        setAreas(activeAreas);
      } catch (error) {
        console.error("Gagal memuat daftar area operasional:", error);
      } finally {
        setLoadingAreas(false);
      }
    };

    fetchAreas();
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validasi menggunakan Toast
    if (!formData.truckCode.trim() || !formData.plateNumber.trim() || !formData.capacityKg || !formData.areaId) {
      toast.error("Semua field termasuk Wilayah Operasional wajib ditentukan!");
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
      
      setFormData({ truckCode: "", plateNumber: "", name: "", capacityKg: "", areaId: "" });
      
      onRefresh();  
      handleOpen(); 
    } catch (error) {
      console.error("Gagal mengirim data armada:", error);
      // Menampilkan error dari API menggunakan Toast
      toast.error(error.response?.data?.message || "Terjadi kegagalan saat registrasi armada baru.");
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
        {/* ... (Form input tetap sama seperti sebelumnya) ... */}
        <div className="space-y-4">
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Kode Truk</Typography>
            <Input name="truckCode" value={formData.truckCode} onChange={handleInputChange} placeholder="Misal: TRK-001" icon={<TruckIcon className="h-4 w-4 text-gray-300" />} className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl !bg-gray-50/30" labelProps={{ className: "hidden" }} />
          </div>
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Nomor Pelat</Typography>
            <Input name="plateNumber" value={formData.plateNumber} onChange={handleInputChange} placeholder="Misal: B 1234 CKN" icon={<TruckIcon className="h-4 w-4 text-gray-300" />} className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl !bg-gray-50/30" labelProps={{ className: "hidden" }} />
          </div>
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Nama / Deskripsi Truk</Typography>
            <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Misal: Isuzu Elf Bak Terbuka" icon={<TruckIcon className="h-4 w-4 text-gray-300" />} className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl !bg-gray-50/30" labelProps={{ className: "hidden" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Kapasitas (Kg)</Typography>
              <Input name="capacityKg" type="number" value={formData.capacityKg} onChange={handleInputChange} placeholder="Misal: 1500" icon={<ChartPieIcon className="h-4 w-4 text-gray-300" />} className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl" labelProps={{ className: "hidden" }} />
            </div>
            <div>
              <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Wilayah Operasional</Typography>
              <div className="relative">
                <select name="areaId" value={formData.areaId} onChange={handleInputChange} className="w-full h-[40px] px-3 text-sm text-gray-700 bg-transparent border border-blue-gray-100 rounded-xl outline-none focus:border-[#2b6cb0] transition-all appearance-none pr-8 font-medium">
                  <option value="" disabled hidden>{loadingAreas ? "Memuat wilayah..." : "Pilih Area"}</option>
                  {areas.map((area) => (<option key={area.id} value={area.id}>{area.name} (ID: {area.id})</option>))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"><MapPinIcon className="h-4 w-4 text-gray-400" /></div>
              </div>
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="flex items-center justify-end gap-3 px-8 pb-8 pt-2">
        <Button variant="text" color="blue-gray" onClick={handleOpen} disabled={submitting} className="normal-case font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors">Batal</Button>
        <Button className="bg-[#2b6cb0] px-8 py-3 rounded-xl normal-case font-bold shadow-none active:scale-95 transition-all" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Memproses..." : "Simpan Data Armada"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateModal;