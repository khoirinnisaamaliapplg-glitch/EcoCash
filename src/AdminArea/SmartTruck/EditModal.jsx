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

const EditModal = ({ open, handleOpen, data, onRefresh }) => {
  // State form utama
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

  // 1. Memuat daftar wilayah untuk opsi dropdown
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

  // 2. Mapping data dari baris tabel ke dalam field input modal
  useEffect(() => {
    if (data && open) {
      // Mengambil ID wilayah lama dari segala kemungkinan format properti di database
      const extractedAreaId = data.areaId || data.area_id || data.area?.id || "";

      setFormData({
        id: data.id ? String(data.id) : "",
        truckCode: data.truckCode || "",
        plateNumber: data.plateNumber || "",
        name: data.name || "",
        capacityKg: data.capacityKg || "",
        status: data.status || "ACTIVE",
        areaId: extractedAreaId ? String(extractedAreaId) : "" // Wajib bertipe String untuk elemen <select> HTML
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

  // 3. Eksekusi pengiriman data perubahan via PATCH
  const handleSaveChanges = async () => {
    if (!formData.truckCode?.trim() || !formData.plateNumber?.trim() || !formData.capacityKg || !formData.areaId) {
      alert("Field utama Kode, Pelat, Kapasitas, dan Wilayah Operasional tidak boleh kosong!");
      return;
    }

    setSubmitting(true);
    try {
      const targetAreaId = Number(formData.areaId);

      // TAKTIK FRONTEND UNTUK PATCH TANPA UBAH BACKEND:
      // Kita kirimkan data wilayah operasional ke dalam bentuk camelCase, snake_case, 
      // sekaligus nested object 'connect' khas ORM (Prisma/Sequelize).
      // Backend akan otomatis mengambil format yang sesuai dengan skemanya tanpa memicu error.
      const payload = {
        truckCode: formData.truckCode.trim(),
        plateNumber: formData.plateNumber.trim(),
        name: formData.name.trim(),
        capacityKg: Number(formData.capacityKg), 
        status: formData.status,
        
        // Pilihan format 1: Kolom database camelCase
        areaId: targetAreaId,  
        
        // Pilihan format 2: Kolom database snake_case
        area_id: targetAreaId, 
        
        // Pilihan format 3: Struktur nested object untuk relasi ORM jika backend mendestructure secara mentah
        area: {
          id: targetAreaId,
          connect: { id: targetAreaId }
        }
      };

      // Menembak endpoint menggunakan metode PATCH sesuai permintaan Anda
      await api.patch(`/trucks/${formData.id}`, payload);
      
      onRefresh();  // Memperbarui daftar baris tabel utama
      handleOpen(); // Menutup modal
    } catch (error) {
      console.error("Gagal memperbarui armada:", error);
      // Membaca pesan kesalahan asli dari log sistem backend jika modifikasi Anda ditolak
      alert(error.response?.data?.message || "Terjadi kegagalan saat memperbarui data armada wilayah.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper Kalender
  const getDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    for (let i = 0; i < date.getDay(); i++) days.push(null);
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const changeMonth = (offset) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));

  const handleDateClick = (date) => {
    if (!date) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (date < startDate) {
      setStartDate(date);
      setEndDate(null);
    } else {
      setEndDate(date);
    }
  };

  const formatDate = (date) => date ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "";

  return (
    <Dialog open={open} handler={handleOpen} size="sm" className="rounded-[28px] overflow-visible shadow-2xl border border-blue-50/50">
      {/* HEADER */}
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
        {/* ROW 1: ID & KODE TRUK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">ID Kendaraan (Sistem)</Typography>
            <Input 
              disabled 
              value={formData.id} 
              icon={<LockClosedIcon className="h-4 w-4 text-gray-400" />}
              className="!border-blue-gray-100 !bg-gray-100/50 !rounded-xl !text-gray-500 cursor-not-allowed"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Kode Truk</Typography>
            <Input 
              name="truckCode"
              value={formData.truckCode}
              onChange={handleInputChange}
              icon={<TruckIcon className="h-4 w-4 text-gray-300" />}
              className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl"
              labelProps={{ className: "hidden" }}
            />
          </div>
        </div>

        {/* ROW 2: NOMOR PELAT & NAMA TRUK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Nomor Pelat</Typography>
            <Input 
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleInputChange}
              icon={<TruckIcon className="h-4 w-4 text-gray-300" />}
              className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Nama / Deskripsi Kendaraan</Typography>
            <Input 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              icon={<TruckIcon className="h-4 w-4 text-gray-300" />}
              className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl"
              labelProps={{ className: "hidden" }}
            />
          </div>
        </div>

        {/* ROW 3: KAPASITAS & DROPDOWN WILAYAH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Kapasitas Maksimal (Kg)</Typography>
            <Input 
              name="capacityKg"
              type="number" 
              value={formData.capacityKg}
              onChange={handleInputChange}
              icon={<ChartPieIcon className="h-4 w-4 text-gray-300" />} 
              className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div>
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Wilayah Operasional</Typography>
            <div className="relative">
              <select
                name="areaId"
                value={formData.areaId}
                onChange={handleInputChange}
                className="w-full h-[40px] px-3 text-sm text-gray-700 bg-transparent border border-blue-gray-100 rounded-xl outline-none focus:border-[#2b6cb0] transition-all appearance-none pr-8 font-medium focus:bg-white"
              >
                <option value="" disabled hidden>Pilih Wilayah</option>
                {areas.map((area) => (
                  <option key={area.id} value={String(area.id)}>
                    {area.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            {loadingAreas && <span className="text-[10px] text-blue-500 italic block mt-0.5">Memuat wilayah operasional...</span>}
          </div>
        </div>

        {/* ROW 4: STATUS ARMADA */}
        <div>
          <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Status Armada</Typography>
          <div className="relative">
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full h-[40px] px-3 text-sm text-gray-700 bg-transparent border border-blue-gray-100 rounded-xl outline-none focus:border-[#2b6cb0] transition-all appearance-none pr-8 font-medium focus:bg-white"
            >
              <option value="ACTIVE">ACTIVE (Beroperasi)</option>
              <option value="MAINTENANCE">MAINTENANCE (Perbaikan)</option>
              <option value="FULL">FULL (Muatan Penuh)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChartPieIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* JADWAL SERVIS ELEMENT */}
        <div className="space-y-2 pt-2">
          <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 tracking-widest opacity-70">Rencana Servis (Catatan Ekstra)</Typography>
          <button 
            type="button"
            onClick={() => setShowCalendar(true)}
            className="flex items-center justify-between w-full h-[40px] px-4 bg-white border border-blue-gray-100 rounded-xl hover:border-[#2b6cb0] transition-all group shadow-sm active:scale-95"
          >
            <div className="flex items-center gap-2 truncate text-xs font-semibold">
              <CalendarIcon className="h-4 w-4 text-blue-500" />
              <span className={startDate ? 'text-blue-900' : 'text-gray-400'}>
                {startDate ? (endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : formatDate(startDate)) : "Set Ulang Jadwal Servis"}
              </span>
            </div>
            <ChevronRightIcon className="h-3 w-3 text-gray-300" />
          </button>
        </div>

        {/* CALENDAR POPUP */}
        {showCalendar && (
          <>
            <div className="fixed inset-0 z-[998] bg-blue-900/10 backdrop-blur-[4px]" onClick={() => setShowCalendar(false)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] bg-white shadow-2xl rounded-[32px] border border-blue-50 p-6 w-[340px]">
              <div className="flex justify-between items-center mb-6 px-1">
                <Typography className="font-bold text-lg text-blue-900">{months[viewDate.getMonth()]} {viewDate.getFullYear()}</Typography>
                <div className="flex gap-1">
                  <IconButton variant="text" size="sm" onClick={() => changeMonth(-1)} className="rounded-full"><ChevronLeftIcon className="h-5 w-5 text-blue-700 stroke-[3]" /></IconButton>
                  <IconButton variant="text" size="sm" onClick={() => changeMonth(1)} className="rounded-full"><ChevronRightIcon className="h-5 w-5 text-blue-700 stroke-[3]" /></IconButton>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center text-[10px] font-black text-blue-200 uppercase mb-4">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center text-sm font-semibold">
                {getDaysInMonth().map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} />;
                  const isStart = startDate?.toDateString() === date.toDateString();
                  const isEnd = endDate?.toDateString() === date.toDateString();
                  const isBetween = startDate && endDate && date > startDate && date < endDate;
                  return (
                    <div key={i} onClick={() => handleDateClick(date)} className={`py-2.5 cursor-pointer transition-all rounded-lg ${isStart || isEnd ? 'bg-[#2b6cb0] text-white shadow-md' : isBetween ? 'bg-blue-50 text-blue-800 rounded-none' : 'hover:bg-blue-50 text-gray-500'}`}>
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
              <Button fullWidth className="mt-6 bg-[#2b6cb0] rounded-2xl py-3.5 normal-case font-bold shadow-none" onClick={() => setShowCalendar(false)}>Konfirmasi Jadwal</Button>
            </div>
          </>
        )}
      </DialogBody>

      {/* FOOTER */}
      <DialogFooter className="flex items-center justify-end gap-3 px-8 pb-8 pt-2">
        <Button variant="text" color="blue-gray" onClick={handleOpen} disabled={submitting} className="normal-case font-bold px-6 py-3 rounded-xl hover:bg-gray-100">Batal</Button>
        <Button 
          className="bg-[#66bb6a] px-8 py-3 rounded-xl normal-case font-bold shadow-none active:scale-95 transition-all" 
          onClick={handleSaveChanges}
          disabled={submitting}
        >
          {submitting ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditModal;