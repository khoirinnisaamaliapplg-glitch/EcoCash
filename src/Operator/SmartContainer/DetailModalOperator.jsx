import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogBody,
  IconButton,
  Typography,
  Button,
  Spinner,
  Progress,
  Chip,
} from "@material-tailwind/react";
import { 
  XMarkIcon, 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import Chart from "react-apexcharts";

const DetailModalOperator = ({ open, handleOpen, data }) => {
  const [machineDetail, setMachineDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setIsRendered(true), 400);
      return () => clearTimeout(timer);
    } else {
      setIsRendered(false);
    }
  }, [open]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (open && data?.id) {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const response = await api.get(`/machines/${data.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const result = response.data;
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

  // Konfigurasi Chart Radial untuk Kapasitas (Lebih cocok untuk Operator)
  const chartConfig = {
    type: "bar",
    height: 220,
    series: [{ 
      name: "Volume Saat Ini", 
      data: activeData?.categories?.map(c => c.weight) || [30, 40, 15, 60, 20, 10, 5] 
    }],
    options: {
      chart: { toolbar: { show: false } },
      plotOptions: {
        bar: { borderRadius: 8, distributed: true, columnWidth: '60%' }
      },
      colors: ["#2b6cb0", "#38a169", "#d69e2e", "#e53e3e", "#805ad5", "#3182ce", "#718096"],
      xaxis: {
        categories: ["Plastik", "Organik", "Kaca", "Kaleng", "Kertas", "Logam", "Lainnya"],
        labels: { style: { fontSize: "10px", fontWeight: 700 } }
      },
      legend: { show: false },
      dataLabels: { enabled: true, formatter: (val) => `${val}kg`, style: { fontSize: '10px' } }
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} handler={handleOpen} size="xl" className="rounded-[32px] outline-none">
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50">
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${activeData?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
            <Typography variant="h5" className="text-[#2b6cb0] font-black uppercase italic">
            STATUS UNIT: {activeData?.machineCode || "N/A"}
            </Typography>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen} className="rounded-full">
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </div>

      <DialogBody className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto max-h-[85vh]">
        {loading ? (
          <div className="col-span-12 flex justify-center py-20"><Spinner className="h-12 w-12 text-blue-500" /></div>
        ) : (
          <>
            {/* KIRI: MONITORING VOLUME */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                <Typography className="text-xs font-black text-blue-900 uppercase mb-4 italic tracking-widest">Data Volume Per Kategori</Typography>
                {isRendered ? <Chart {...chartConfig} /> : <div className="h-[220px] flex items-center justify-center"><Spinner /></div>}
              </div>

              {/* ACTION BUTTON UNTUK OPERATOR */}
              <div className="grid grid-cols-2 gap-4">
                <Button className="flex items-center justify-center gap-3 bg-blue-700 py-4 rounded-2xl normal-case">
                    <ArrowPathIcon className="h-5 w-5" /> Reset Sensor
                </Button>
                <Button variant="outlined" className="flex items-center justify-center gap-3 border-blue-700 text-blue-700 py-4 rounded-2xl normal-case">
                    <ExclamationTriangleIcon className="h-5 w-5" /> Lapor Kerusakan
                </Button>
              </div>
            </div>

            {/* KANAN: TECHNICAL INFO */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-blue-900 p-6 rounded-[24px] text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <Typography className="text-[10px] font-bold uppercase opacity-60 mb-1">Total Kapasitas Terisi</Typography>
                    <div className="flex items-end gap-2 mb-4">
                        <Typography className="text-5xl font-black">{activeData?.fill ?? 0}%</Typography>
                        <Typography className="text-sm font-bold mb-2">Full</Typography>
                    </div>
                    <Progress value={activeData?.fill ?? 0} color="green" size="sm" className="bg-blue-800" />
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                    <ArrowPathIcon className="h-24 w-24" />
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 space-y-4">
                <Typography className="text-xs font-black text-gray-500 uppercase italic">Log Teknis Terakhir</Typography>
                
                <div className="space-y-4">
                    <TechnicalRow 
                        label="Pembersihan Terakhir" 
                        value={activeData?.lastEmptied || "Hari ini, 08:00"} 
                        icon={<CheckCircleIcon className="h-4 w-4 text-green-500" />}
                    />
                    <TechnicalRow 
                        label="Suhu Perangkat" 
                        value={`${activeData?.temperature || '32'}°C`} 
                        icon={<div className="w-2 h-2 rounded-full bg-orange-500" />}
                    />
                    <TechnicalRow 
                        label="Sinyal GSM/WiFi" 
                        value={activeData?.signal || "Kuat (80%)"} 
                        icon={<div className="w-2 h-2 rounded-full bg-blue-500" />}
                    />
                </div>

                <hr className="border-gray-200" />

                <div className="pt-2">
                    <Typography className="text-[10px] font-black text-gray-400 uppercase mb-2">Lokasi Unit</Typography>
                    <Typography className="text-sm font-bold text-blue-900">{activeData?.placeName || "Area Parkir Timur"}</Typography>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogBody>
    </Dialog>
  );
};

// Sub-komponen untuk baris teknis
const TechnicalRow = ({ label, value, icon }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            {icon}
            <Typography className="text-xs font-medium text-gray-600">{label}</Typography>
        </div>
        <Typography className="text-xs font-bold text-blue-900">{value}</Typography>
    </div>
);

export default DetailModalOperator;