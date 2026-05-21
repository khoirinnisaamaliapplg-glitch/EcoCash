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
import { 
  CalendarIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon, 
  XMarkIcon, 
  PencilSquareIcon,
  TruckIcon,
  ChartPieIcon,
  LockClosedIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

// Import Toastify
import { toast } from 'react-toastify';

const EditModal = ({ open, handleOpen, data, onRefresh }) => {
  const [formData, setFormData] = useState({
    id: "",
    truckCode: "",
    plateNumber: "",
    name: "",
    capacityKg: "",
    status: "",
    areaId: "" 
  });
  
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewDate, setViewDate] = useState(new Date(2026, 3));

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

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
        console.error("Gagal memuat daftar area:", error);
      } finally {
        setLoadingAreas(false);
      }
    };
    fetchAreas();
  }, [open]);

  useEffect(() => {
    if (data && open) {
      const extractedAreaId = data.areaId || data.area_id || data.area?.id || "";
      setFormData({
        id: data.id ? String(data.id) : "",
        truckCode: data.truckCode || "",
        plateNumber: data.plateNumber || "",
        name: data.name || "",
        capacityKg: data.capacityKg || "",
        status: data.status || "ACTIVE",
        areaId: extractedAreaId ? String(extractedAreaId) : ""
      });
      setStartDate(null);
      setEndDate(null);
    }
  }, [data, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    // Validasi menggunakan Toast
    if (!formData.truckCode?.trim() || !formData.plateNumber?.trim() || !formData.capacityKg || !formData.areaId) {
      toast.error("Field utama Kode, Pelat, Kapasitas, dan Wilayah Operasional tidak boleh kosong!");
      return;
    }

    setSubmitting(true);
    try {
      const targetAreaId = Number(formData.areaId);
      const payload = {
        truckCode: formData.truckCode.trim(),
        plateNumber: formData.plateNumber.trim(),
        name: formData.name.trim(),
        capacityKg: Number(formData.capacityKg), 
        status: formData.status,
        areaId: targetAreaId, 
        area_id: targetAreaId, 
        area: {
          id: targetAreaId,
          connect: { id: targetAreaId }
        }
      };

      await api.patch(`/trucks/${formData.id}`, payload);
      
      toast.success("Data armada berhasil diperbarui!"); // Toast Sukses
      onRefresh();  
      handleOpen(); 
    } catch (error) {
      console.error("Gagal memperbarui armada:", error);
      // Toast Error dari API
      toast.error(error.response?.data?.message || "Terjadi kegagalan saat memperbarui data armada.");
    } finally {
      setSubmitting(false);
    }
  };

  // ... (Sisa komponen UI seperti <Dialog>, <DialogHeader>, dst tetap sama)
  // [Pastikan untuk tetap menyertakan UI rendering Anda di sini]

  return (
    <Dialog open={open} handler={handleOpen} size="sm" className="rounded-[28px] overflow-visible shadow-2xl border border-blue-50/50">
      <DialogHeader className="flex items-center justify-between px-8 pt-8 pb-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-2xl">
            <PencilSquareIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <Typography variant="h5" className="text-blue-900 font-bold leading-tight">Edit Smart Truck</Typography>
            <Typography className="text-[12px] text-gray-400 font-medium italic">Perbarui informasi armada EcoCash</Typography>
          </div>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen} className="rounded-full hover:bg-red-50 hover:text-red-500">
          <XMarkIcon className="h-5 w-5 stroke-2" />
        </IconButton>
      </DialogHeader>
      
      <DialogBody className="px-8 py-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">ID Kendaraan (Sistem)</Typography>
            <Input disabled value={formData.id} icon={<LockClosedIcon className="h-4 w-4 text-gray-400" />} className="!border-blue-gray-100 !bg-gray-100/50 !rounded-xl !text-gray-500 cursor-not-allowed" labelProps={{ className: "hidden" }} />
          </div>
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Kode Truk</Typography>
            <Input name="truckCode" value={formData.truckCode} onChange={handleInputChange} icon={<TruckIcon className="h-4 w-4 text-gray-300" />} className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl" labelProps={{ className: "hidden" }} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Nomor Pelat</Typography>
            <Input name="plateNumber" value={formData.plateNumber} onChange={handleInputChange} icon={<TruckIcon className="h-4 w-4 text-gray-300" />} className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl" labelProps={{ className: "hidden" }} />
          </div>
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Nama / Deskripsi Kendaraan</Typography>
            <Input name="name" value={formData.name} onChange={handleInputChange} icon={<TruckIcon className="h-4 w-4 text-gray-300" />} className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl" labelProps={{ className: "hidden" }} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Kapasitas Maksimal (Kg)</Typography>
            <Input name="capacityKg" type="number" value={formData.capacityKg} onChange={handleInputChange} icon={<ChartPieIcon className="h-4 w-4 text-gray-300" />} className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl" labelProps={{ className: "hidden" }} />
          </div>
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Wilayah Operasional</Typography>
            <div className="relative">
              <select name="areaId" value={formData.areaId} onChange={handleInputChange} className="w-full h-[40px] px-3 text-sm text-gray-700 bg-transparent border border-blue-gray-100 rounded-xl outline-none focus:border-[#2b6cb0] transition-all appearance-none pr-8 font-medium focus:bg-white">
                <option value="" disabled hidden>Pilih Wilayah</option>
                {areas.map((area) => (<option key={area.id} value={String(area.id)}>{area.name}</option>))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"><MapPinIcon className="h-4 w-4 text-gray-400" /></div>
            </div>
          </div>
        </div>
        <div>
          <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Status Armada</Typography>
          <div className="relative">
            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full h-[40px] px-3 text-sm text-gray-700 bg-transparent border border-blue-gray-100 rounded-xl outline-none focus:border-[#2b6cb0] transition-all appearance-none pr-8 font-medium focus:bg-white">
              <option value="ACTIVE">ACTIVE (Beroperasi)</option>
              <option value="MAINTENANCE">MAINTENANCE (Perbaikan)</option>
              <option value="FULL">FULL (Muatan Penuh)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"><ChartPieIcon className="h-4 w-4 text-gray-400" /></div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="flex items-center justify-end gap-3 px-8 pb-8 pt-2">
        <Button variant="text" color="blue-gray" onClick={handleOpen} disabled={submitting} className="normal-case font-bold px-6 py-3 rounded-xl hover:bg-gray-100">Batal</Button>
        <Button className="bg-[#66bb6a] px-8 py-3 rounded-xl normal-case font-bold shadow-none active:scale-95 transition-all" onClick={handleSaveChanges} disabled={submitting}>
          {submitting ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditModal;