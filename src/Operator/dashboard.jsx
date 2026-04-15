import React from "react";
import MainLayout from "./MainLayout";
import { 
  Card, 
  Typography, 
  Avatar, 
  Chip, 
  Progress,
  Button
} from "@material-tailwind/react";
import { 
  ScaleIcon, 
  ArchiveBoxIcon, 
  BoltIcon, 
  SparklesIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";

// Komponen Card Statistik Kustom (Visual Premium)
const StatCard = ({ icon: Icon, color, title, value, unit, description }) => (
  <Card className="p-6 rounded-[2rem] border-none shadow-xl shadow-blue-900/5 bg-white group hover:scale-[1.03] hover:-translate-y-2 transition-all duration-300 cursor-default relative overflow-hidden">
    {/* Aksen Glassmorphism di Latar Belakang */}
    <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-10 blur-xl ${color}`}></div>
    <div className={`absolute -top-4 -left-4 w-20 h-20 rounded-full opacity-5 blur-xl ${color}`}></div>
    
    <div className="flex items-start justify-between relative">
      <div className={`p-4 rounded-xl text-white ${color} shadow-lg shrink-0`}>
        <Icon className="h-6 w-6 stroke-2" />
      </div>
      <div className="text-right flex flex-col items-end gap-1.5">
        <Typography className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">
          {title}
        </Typography>
        <div className="flex items-end gap-1 leading-none pt-1">
          <Typography variant="h2" className="text-blue-900 font-black leading-none">
            {value}
          </Typography>
          <Typography className="text-blue-700 font-black text-sm leading-none opacity-80 pb-1.5">
            {unit}
          </Typography>
        </div>
      </div>
    </div>
    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-1.5 opacity-70">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <Typography className="text-xs text-gray-500 font-medium italic">{description}</Typography>
    </div>
  </Card>
);

const OperatorDashboard = () => {
  // Data dummy - Ini nanti disambungkan ke State Management / API kamu, Mel
  const operatorName = "Budi Santoso";
  const joinDate = "Desember 2025";
  const wilayahTugas = "Cikini, Jakarta Pusat";

  return (
    <MainLayout>
      <div className="space-y-8 md:space-y-10 pb-12 px-2 md:px-0 mt-4">
        
        {/* --- SECTION 1: WELCOME & PROFILE HEADER (Premium Glass Effect) --- */}
        <Card className="p-6 md:p-8 rounded-[3rem] border-none shadow-xl shadow-blue-900/5 bg-white relative overflow-hidden hover:shadow-blue-900/10 transition-shadow">
          {/* Aksen Latar Belakang EcoCash */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-blue-100/30 opacity-70"></div>
          <div className="absolute top-0 right-0 h-40 w-40 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 grayscale invert"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                <div className="p-2.5 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl transition-transform duration-500 hover:scale-105">
                  <Avatar
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${operatorName}`}
                    alt="Budi"
                    className="h-28 w-28 rounded-[2rem] object-cover"
                  />
                </div>
                <div className="absolute bottom-1 right-1 p-2 bg-green-500 rounded-xl border-4 border-white text-white shadow-lg">
                  <SparklesIcon className="h-4 w-4 stroke-2" />
                </div>
              </div>
              
              <div className="flex flex-col items-center md:items-start gap-1">
                <Typography className="text-xs font-bold uppercase text-blue-600 tracking-widest leading-none">
                  Halo Lapangan,
                </Typography>
                <Typography variant="h3" className="text-blue-900 font-black tracking-tight leading-tight">
                  {operatorName}
                </Typography>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-2.5">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <MapPinIcon className="h-4 w-4 shrink-0" />
                    <Typography className="text-xs md:text-sm font-bold truncate">{wilayahTugas}</Typography>
                  </div>
                  <div className="hidden sm:block h-3 w-px bg-gray-200"></div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <CalendarDaysIcon className="h-4 w-4 shrink-0" />
                    <Typography className="text-xs md:text-sm font-bold">Gabung {joinDate}</Typography>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto shrink-0 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 pl-0 md:pl-8">
                <Chip value="Active" color="green" variant="gradient" className="rounded-full px-4 text-xs font-bold normal-case shadow-none" />
                <Typography className="text-[10px] font-black text-blue-800/40 uppercase tracking-widest">Op-ID: #EC-OPB11</Typography>
            </div>
          </div>
        </Card>

        {/* --- SECTION 2: STATISTIK PERFORMA (Desain Referensi) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <StatCard 
            icon={ScaleIcon} 
            color="bg-blue-600"
            title="Output Kamu Hari Ini"
            value="500"
            unit="Gram"
            description="Total daur ulang yang kamu proses"
          />
          <StatCard 
            icon={ArchiveBoxIcon} 
            color="bg-orange-600"
            title="Container Penuh Area"
            value="02"
            unit="Unit"
            description="Di wilayah tugas: Cikini"
          />
          <StatCard 
            icon={BoltIcon} 
            color="bg-green-600"
            title="Status Mesin Utama"
            value="A"
            unit="Aktif"
            description="MS001 - Smart Container AIoT"
          />
        </div>

        {/* --- SECTION 3: PERFORMA BULAN INI & AKTIVITAS container --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Performa Daur Ulang Bulanan */}
          <Card className="p-8 md:p-10 rounded-[2.5rem] border-none shadow-xl shadow-blue-900/5 bg-white space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <Typography variant="h5" className="text-blue-900 font-black uppercase tracking-tighter">
                  Performa Daur Ulang
                </Typography>
                <div className="text-center sm:text-right flex flex-col sm:items-end">
                    <Typography variant="small" className="font-bold text-gray-500 uppercase text-[10px] tracking-widest leading-none pb-0.5">April 2026</Typography>
                    <Typography className="text-sm font-black text-gray-700">Target Tercapai: 92%</Typography>
                </div>
            </div>
            
            <div className="text-center flex flex-col items-center py-2">
                <Typography variant="h1" className="text-blue-900 font-black text-6xl leading-none">1.8 <span className="text-xl text-blue-700 font-bold -ml-2 pb-2">Kg</span></Typography>
                <Typography className="text-xs font-medium text-gray-500 max-w-sm mt-3 leading-relaxed">Dari total target 2.0 Kg daur ulang bulan ini. <span className="text-green-600 font-black">Luar biasa Budi!</span> Sebentar lagi target kamu tercapai.</Typography>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <Progress value={92} color="blue" size="sm" className="rounded-full shadow-lg shadow-blue-100" />
              <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                <Typography>Target Bulan Ini: 2.0 Kg</Typography>
                <Typography className="text-blue-700">Tersisa: 200 Gram</Typography>
              </div>
            </div>
          </Card>
          
          {/* Quick Container Actions */}
          <Card className="p-8 md:p-10 rounded-[2.5rem] border-none shadow-xl shadow-blue-900/5 bg-white space-y-6">
            <div className="flex justify-between items-center mb-6">
                <Typography variant="h5" className="text-blue-900 font-black uppercase tracking-tighter">
                  Aktivitas container AIoT
                </Typography>
                <Typography className="text-[10px] font-bold text-blue-800 uppercase tracking-widest leading-none bg-blue-50 px-2 py-1 rounded-md">Smart Container</Typography>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Buka Pintu Container", desc: "Akses MS001" },
                  { label: "Check Masalah Mesin", desc: "MS001 Status Check" }
                ].map((action, i) => (
                    <Button key={i} variant="outlined" color="blue" className="rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50/50 flex flex-col items-center gap-2 p-6 normal-case hover:-translate-y-1 transition-transform shadow-none group">
                      <ArchiveBoxIcon className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                      <div className="text-center flex flex-col items-center">
                          <Typography className="text-xs font-black text-gray-700 group-hover:text-blue-700">{action.label}</Typography>
                          <Typography className="text-[10px] font-medium text-gray-400 -mt-1">{action.desc}</Typography>
                      </div>
                    </Button>
                ))}
            </div>

            <Button fullWidth className="mt-4 bg-green-600 rounded-xl normal-case font-black shadow-lg shadow-green-100 flex items-center justify-center gap-2 py-4 hover:shadow-green-300">
              <PlusIcon className="h-4 w-4 stroke-[3]" /> Tambah Output Daur Ulang
            </Button>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
};

export default OperatorDashboard;