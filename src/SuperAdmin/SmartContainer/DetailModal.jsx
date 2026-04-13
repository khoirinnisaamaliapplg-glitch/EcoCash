import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  IconButton,
  Typography,
  Button,
} from "@material-tailwind/react";
import { XMarkIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Chart from "react-apexcharts";

const DetailModal = ({ open, handleOpen, data }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  
  // State Kalender Riil
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewDate, setViewDate] = useState(new Date(2026, 3)); // Default April 2026

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Logika Kalender Riil
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

  const changeMonth = (offset) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

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

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const chartConfig = {
    type: "area",
    height: 180,
    series: [{ name: "Weight (gram)", data: [650, 400, 550, 900, 700, 300, 450] }],
    options: {
      chart: { toolbar: { show: false } },
      stroke: { curve: "smooth", width: 3, colors: ["#2b6cb0"] },
      xaxis: {
        categories: ["Plastik", "Organik", "Kaca", "Kaleng", "Kertas", "Wallet", "Jelantah"],
        labels: { style: { colors: "#9e9e9e", fontSize: "10px" } }
      },
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0 }
      }
    }
  };

  return (
    <Dialog open={open} handler={handleOpen} size="lg" className="rounded-[32px] overflow-visible">
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50">
        <Typography variant="h5" className="text-[#2b6cb0] font-bold">Smart Kontainer {data?.id}</Typography>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen} className="rounded-full">
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </div>

      <DialogBody className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 overflow-y-auto max-h-[80vh]">
        <div className="md:col-span-8 space-y-8">
          {/* Chart Section */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
             <Chart {...chartConfig} />
          </div>

          {/* Date Picker Section */}
          <div className="space-y-3">
            <Typography variant="small" className="font-bold text-[#2b6cb0] ml-1 uppercase text-[11px] tracking-wider">
              Filter Riwayat Berdasarkan Tanggal
            </Typography>
            
            <div className="relative inline-block w-full md:w-80">
              <button 
                type="button"
                onClick={() => setShowCalendar(true)}
                className="flex items-center justify-between w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-400 transition-all text-sm shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className={`font-semibold ${startDate ? 'text-blue-900' : 'text-gray-400'}`}>
                    {startDate ? (endDate ? `${formatDate(startDate)} — ${formatDate(endDate)}` : formatDate(startDate)) : "Pilih Rentang Tanggal"}
                  </span>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info Ringkas */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-blue-50/50 p-6 rounded-[24px] border border-blue-50">
             <Typography className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-widest">Lokasi Terdaftar</Typography>
             <Typography className="font-bold text-blue-900 mb-4">{data?.location}</Typography>
             <Typography className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-widest">Kapasitas Saat Ini</Typography>
             <div className="flex items-end gap-1">
                <Typography className="text-4xl font-black text-blue-900">{data?.fill}</Typography>
                <Typography className="text-xl font-bold text-blue-600 mb-1">%</Typography>
             </div>
          </div>
        </div>

        {/* MODAL KALENDER KUSTOM (FIXED DI TENGAH) */}
        {showCalendar && (
          <>
            <div 
              className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-sm" 
              onClick={() => setShowCalendar(false)} 
            />
            
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] bg-white shadow-2xl rounded-[32px] border border-blue-50 p-7 w-[340px] animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <Typography className="font-bold text-lg text-blue-900">
                  {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                </Typography>
                <div className="flex gap-1">
                  <IconButton variant="text" size="sm" onClick={() => changeMonth(-1)} className="rounded-full">
                    <ChevronLeftIcon className="h-5 w-5 text-blue-700 stroke-[3]" />
                  </IconButton>
                  <IconButton variant="text" size="sm" onClick={() => changeMonth(1)} className="rounded-full">
                    <ChevronRightIcon className="h-5 w-5 text-blue-700 stroke-[3]" />
                  </IconButton>
                </div>
              </div>
              
              <div className="grid grid-cols-7 text-center text-[11px] font-black text-blue-200 uppercase mb-4 tracking-tighter">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-semibold">
                {getDaysInMonth().map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} />;
                  
                  const isStart = startDate && startDate.toDateString() === date.toDateString();
                  const isEnd = endDate && endDate.toDateString() === date.toDateString();
                  const isBetween = startDate && endDate && date > startDate && date < endDate;

                  return (
                    <div 
                      key={i} 
                      onClick={() => handleDateClick(date)}
                      className={`py-3 cursor-pointer transition-all rounded-xl relative
                      ${isStart || isEnd ? 'bg-blue-700 text-white shadow-lg z-10 scale-105' : ''}
                      ${isBetween ? 'bg-blue-50 text-blue-800 rounded-none' : 'hover:bg-gray-50 rounded-xl text-gray-600'}`}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
              <Button 
                fullWidth 
                className="mt-8 bg-[#2b6cb0] rounded-2xl py-4 normal-case text-base shadow-none" 
                onClick={() => setShowCalendar(false)}
              >
                Terapkan Filter
              </Button>
            </div>
          </>
        )}
      </DialogBody>
    </Dialog>
  );
};

export default DetailModal;