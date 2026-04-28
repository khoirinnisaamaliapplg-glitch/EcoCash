import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogBody,
  IconButton,
  Typography,
  Button,
  Spinner,
} from "@material-tailwind/react";
import { 
  XMarkIcon, 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from "@heroicons/react/24/outline";
import Chart from "react-apexcharts";

const DetailModal = ({ open, handleOpen, data }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [machineDetail, setMachineDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewDate, setViewDate] = useState(new Date(2026, 3));

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setIsRendered(true), 400);
      return () => clearTimeout(timer);
    } else {
      setIsRendered(false);
      setShowCalendar(false);
    }
  }, [open]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (open && data?.id) {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`http://localhost:3000/api/machines/${data.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const result = await response.json();
          setMachineDetail(result.data || result);
        } catch (error) {
          console.error("Gagal load detail:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDetail();
  }, [open, data?.id]);

  const activeData = machineDetail || data;

  const chartConfig = {
    type: "area",
    height: 180,
    series: [{ 
      name: "Berat (Gram)", 
      data: (activeData?.history && Array.isArray(activeData.history)) 
            ? activeData.history 
            : [0, 0, 0, 0, 0, 0, 0] 
    }],
    options: {
      chart: { toolbar: { show: false }, zoom: { enabled: false } },
      stroke: { curve: "smooth", width: 3, colors: ["#2b6cb0"] },
      xaxis: {
        categories: ["Plastik", "Organik", "Kaca", "Kaleng", "Kertas", "Wallet", "Jelantah"],
        labels: { style: { colors: "#9e9e9e", fontSize: "10px" } }
      },
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0 }
      },
      dataLabels: { enabled: false },
      tooltip: { theme: "light" }
    }
  };

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
    if (!date) return "Pilih Tanggal";
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };

  if (!open) return null;

  return (
    <Dialog open={open} handler={handleOpen} size="lg" className="rounded-[32px] outline-none">
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50">
        <Typography variant="h5" className="text-[#2b6cb0] font-bold">
          {loading ? "Memuat..." : `Smart Kontainer ${activeData?.machineCode || ""}`}
        </Typography>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen} className="rounded-full">
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </div>

      <DialogBody className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 overflow-y-auto max-h-[80vh]">
        {loading ? (
          <div className="col-span-12 flex justify-center py-20">
            <Spinner className="h-12 w-12 text-blue-500" />
          </div>
        ) : (
          <>
            <div className="md:col-span-8 space-y-8">
              <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm min-h-[220px] flex items-center justify-center">
                {isRendered ? <Chart {...chartConfig} className="w-full" /> : <Spinner className="h-6 w-6 text-blue-50" />}
              </div>

              {/* FILTER TANGGAL TERPISAH */}
              <div className="space-y-4">
                <Typography variant="small" className="font-bold text-[#2b6cb0] ml-1 uppercase text-[11px] tracking-wider">
                  Filter Riwayat Berdasarkan Tanggal
                </Typography>
                
                <div className="flex flex-col md:flex-row items-center gap-4">
                  {/* Start Date Box */}
                  <div 
                    onClick={() => setShowCalendar(true)}
                    className="flex flex-col flex-1 w-full p-3 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:border-blue-300 transition-colors shadow-sm"
                  >
                    <Typography className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Dari Tanggal</Typography>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-blue-500" />
                      <Typography className={`text-sm font-semibold ${startDate ? 'text-blue-900' : 'text-gray-400'}`}>
                        {formatDate(startDate)}
                      </Typography>
                    </div>
                  </div>

                  <div className="hidden md:block text-gray-300 font-bold">—</div>

                  {/* End Date Box */}
                  <div 
                    onClick={() => setShowCalendar(true)}
                    className="flex flex-col flex-1 w-full p-3 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:border-blue-300 transition-colors shadow-sm"
                  >
                    <Typography className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Sampai Tanggal</Typography>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-blue-500" />
                      <Typography className={`text-sm font-semibold ${endDate ? 'text-blue-900' : 'text-gray-400'}`}>
                        {formatDate(endDate)}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 space-y-4">
              <div className="bg-blue-50/50 p-6 rounded-[24px] border border-blue-50">
                <Typography className="text-[10px] text-gray-500 font-bold uppercase mb-1">Lokasi Terdaftar</Typography>
                <Typography className="font-bold text-blue-900 mb-4">{activeData?.placeName || activeData?.location || "-"}</Typography>
                <Typography className="text-[10px] text-gray-500 font-bold uppercase mb-1">Kapasitas Saat Ini</Typography>
                <div className="flex items-end gap-1">
                  <Typography className="text-4xl font-black text-blue-900">{activeData?.fill ?? 0}</Typography>
                  <Typography className="text-xl font-bold text-blue-600 mb-1">%</Typography>
                </div>
              </div>
            </div>
          </>
        )}

        {showCalendar && (
          <>
            <div className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-sm" onClick={() => setShowCalendar(false)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] bg-white shadow-2xl rounded-[32px] p-7 w-[340px]">
              <div className="flex justify-between items-center mb-6">
                <Typography className="font-bold text-lg text-blue-900">{months[viewDate.getMonth()]} {viewDate.getFullYear()}</Typography>
                <div className="flex gap-1">
                  <IconButton variant="text" size="sm" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}><ChevronLeftIcon className="h-5 w-5"/></IconButton>
                  <IconButton variant="text" size="sm" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}><ChevronRightIcon className="h-5 w-5"/></IconButton>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center text-[11px] font-black text-blue-200 uppercase mb-4">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center">
                {getDaysInMonth().map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} />;
                  const isStart = startDate && startDate.toDateString() === date.toDateString();
                  const isEnd = endDate && endDate.toDateString() === date.toDateString();
                  const isBetween = startDate && endDate && date > startDate && date < endDate;
                  return (
                    <div 
                      key={i} 
                      onClick={() => handleDateClick(date)}
                      className={`py-3 cursor-pointer text-sm font-semibold rounded-xl
                      ${isStart || isEnd ? 'bg-blue-700 text-white shadow-lg' : 'text-gray-600'}
                      ${isBetween ? 'bg-blue-50 text-blue-800 rounded-none' : 'hover:bg-gray-100'}`}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
              <Button fullWidth className="mt-8 bg-[#2b6cb0] rounded-2xl py-4 normal-case" onClick={() => setShowCalendar(false)}>Terapkan Filter</Button>
            </div>
          </>
        )}
      </DialogBody>
    </Dialog>
  );
};

export default DetailModal;