import React, { useState } from "react";
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
import { CalendarIcon, ChevronRightIcon, ChevronLeftIcon, XMarkIcon, TruckIcon, MapPinIcon, ChartPieIcon } from "@heroicons/react/24/outline";

const CreateModal = ({ open, handleOpen }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewDate, setViewDate] = useState(new Date(2026, 3)); 

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const getDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay(); 
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
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
    <Dialog open={open} handler={handleOpen} size="sm" className="rounded-[28px] overflow-visible border border-blue-50/50 shadow-2xl">
      {/* HEADER SECTION */}
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
      
      <DialogBody className="px-8 py-6 space-y-7">
        {/* INPUT GROUP 1: IDENTITAS */}
        <div className="space-y-4">
          <div className="relative group">
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 mb-2 tracking-widest opacity-70">Detail Kendaraan</Typography>
            <Input 
              label="Truck ID" 
              placeholder="Misal: eco-v1-001" 
              icon={<TruckIcon className="h-4 w-4 text-gray-300" />}
              className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl !bg-gray-50/30"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="relative">
            <Input 
              label="Lokasi Operasi" 
              placeholder="Wilayah atau Titik Lokasi" 
              icon={<MapPinIcon className="h-4 w-4 text-gray-300" />}
              className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl !bg-gray-50/30"
              labelProps={{ className: "hidden" }}
            />
          </div>
        </div>

        {/* INPUT GROUP 2: STATUS & SERVIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="space-y-2">
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 tracking-widest opacity-70">Status Awal</Typography>
            <Input 
              type="number" 
              placeholder="Fill Level (%)"
              icon={<ChartPieIcon className="h-4 w-4 text-gray-300" />} 
              className="!border-blue-gray-100 focus:!border-[#2b6cb0] !rounded-xl"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="space-y-2">
            <Typography className="text-[11px] font-black text-[#2b6cb0] uppercase ml-1 tracking-widest opacity-70">Periode Servis</Typography>
            <button 
              type="button"
              onClick={() => setShowCalendar(true)}
              className="flex items-center justify-between w-full h-[40px] px-4 bg-white border border-blue-gray-100 rounded-xl hover:border-[#2b6cb0] transition-all group shadow-sm active:scale-95"
            >
              <div className="flex items-center gap-2 truncate text-xs font-semibold">
                <CalendarIcon className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className={startDate ? 'text-blue-900' : 'text-gray-400'}>
                  {startDate ? (endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : formatDate(startDate)) : "Set Periode"}
                </span>
              </div>
              <ChevronRightIcon className="h-3 w-3 text-gray-300" />
            </button>
          </div>
        </div>

        {/* CALENDAR POPUP */}
        {showCalendar && (
          <>
            <div className="fixed inset-0 z-[998] bg-blue-900/10 backdrop-blur-[4px] animate-in fade-in duration-200" onClick={() => setShowCalendar(false)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] bg-white shadow-2xl rounded-[32px] border border-blue-50 p-6 w-[340px] animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <Typography className="font-bold text-lg text-blue-900">{months[viewDate.getMonth()]} {viewDate.getFullYear()}</Typography>
                <div className="flex gap-1">
                  <IconButton variant="text" size="sm" onClick={() => changeMonth(-1)} className="rounded-full"><ChevronLeftIcon className="h-5 w-5 text-blue-700 stroke-[3]" /></IconButton>
                  <IconButton variant="text" size="sm" onClick={() => changeMonth(1)} className="rounded-full"><ChevronRightIcon className="h-5 w-5 text-blue-700 stroke-[3]" /></IconButton>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center text-[10px] font-black text-blue-200 uppercase mb-4 tracking-tighter">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center text-sm font-semibold">
                {getDaysInMonth().map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} />;
                  const isStart = startDate?.toDateString() === date.toDateString();
                  const isEnd = endDate?.toDateString() === date.toDateString();
                  const isBetween = startDate && endDate && date > startDate && date < endDate;
                  return (
                    <div key={i} onClick={() => handleDateClick(date)} className={`py-2.5 cursor-pointer transition-all rounded-lg ${isStart || isEnd ? 'bg-[#2b6cb0] text-white' : isBetween ? 'bg-blue-50 text-blue-800 rounded-none' : 'hover:bg-blue-50 text-gray-500'}`}>
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
              <Button fullWidth className="mt-6 bg-[#2b6cb0] rounded-2xl py-3.5 normal-case font-bold shadow-none" onClick={() => setShowCalendar(false)}>Selesai</Button>
            </div>
          </>
        )}
      </DialogBody>

      <DialogFooter className="flex items-center justify-end gap-3 px-8 pb-8 pt-2">
        <Button variant="text" color="blue-gray" onClick={handleOpen} className="normal-case font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors">Batal</Button>
        <Button className="bg-[#2b6cb0] px-8 py-3 rounded-xl normal-case font-bold shadow-none active:scale-95 transition-all" onClick={handleOpen}>
          Simpan Data Armada
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateModal;