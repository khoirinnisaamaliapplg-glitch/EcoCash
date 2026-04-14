import React from "react";
import MainLayout from "../AdminArea/MainLayout"; 
import { Card, Typography, Chip } from "@material-tailwind/react";
import { 
  MapPinIcon, 
  UserGroupIcon, 
  CpuChipIcon, 
  ArrowTrendingUpIcon, 
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Minggu 1', amount: 450 },
  { name: 'Minggu 2', amount: 320 },
  { name: 'Minggu 3', amount: 750 },
  { name: 'Minggu 4', amount: 980 },
];

const DashboardArea = () => {
  return (
    <MainLayout>
      <div className="space-y-6 pb-10">
        
        {/* SECTION 1: AREA STATUS */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Typography variant="h4" className="text-blue-900 font-black tracking-tight">
              Area Monitoring: Tasikmalaya
            </Typography>
            <Typography className="text-gray-500 text-sm font-medium">
              Data operasional unit AIoT di wilayah koordinasi Anda.
            </Typography>
          </div>
          <Chip 
            value="Area System Online" 
            className="bg-blue-500 px-4 py-2 normal-case font-bold shadow-md shadow-blue-100" 
          />
        </section>

        {/* SECTION 2: STATISTIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Waste Collected" 
            value="1.2 Tons" 
            subValue="+15% from last week" 
            icon={<ArrowTrendingUpIcon className="h-6 w-6 text-white" />}
            color="bg-blue-700"
          />
          <StatCard 
            title="Local Operators" 
            value="5" 
            subValue="3 Online / 2 Offline" 
            icon={<UserGroupIcon className="h-6 w-6 text-white" />}
            color="bg-blue-500"
          />
          <StatCard 
            title="Active Machines" 
            value="2" 
            subValue="Unit CN-01, Unit CN-02" 
            icon={<CpuChipIcon className="h-6 w-6 text-white" />}
            color="bg-blue-400"
          />
        </div>

        {/* SECTION 3: DETAIL & CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sisi Kiri: Machine Status */}
          <Card className="p-6 border border-gray-100 shadow-sm rounded-[30px] bg-white">
            <Typography className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CpuChipIcon className="h-5 w-5 text-blue-600" /> Machine Status & Capacity
            </Typography>
            <div className="space-y-4">
              <CapacityItem name="Unit CN-01 (Pasar Cikurubuk)" capacity="85%" status="Full" />
              <CapacityItem name="Unit CN-02 (Sukarame)" capacity="30%" status="Safe" />
            </div>

            <Typography className="font-bold text-gray-800 mt-10 mb-4">Local Waste Price Adjustment</Typography>
            <div className="space-y-3">
               <PriceRow label="Plastik PET" price="Rp. 1.200/kg" />
               <PriceRow label="Logam/Aluminium" price="Rp. 2.500/kg" />
               <PriceRow label="Kertas/Kardus" price="Rp. 800/kg" />
            </div>
          </Card>

          {/* Sisi Kanan: Chart (Gradasi Biru) */}
          <Card className="p-6 border border-gray-100 shadow-sm bg-white rounded-[30px]">
            <div className="mb-6">
              <Typography className="font-bold text-gray-800">Weekly Collection Progress</Typography>
              <Typography className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Kg / Week</Typography>
            </div>
            
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBlueArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2b6cb0" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2b6cb0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                    tickFormatter={(val) => `${val}kg`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#2b6cb0" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorBlueArea)" 
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#2b6cb0' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>
      </div>
    </MainLayout>
  );
};

// --- SUB KOMPONEN ---

const StatCard = ({ title, value, subValue, icon, color }) => (
  <Card className="p-6 border border-gray-100 shadow-sm flex flex-row items-center justify-between rounded-[25px] bg-white">
    <div>
      <Typography className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</Typography>
      <Typography variant="h3" className="text-gray-900 font-black">{value}</Typography>
      <Typography className="text-blue-600 text-[10px] font-bold mt-1">{subValue}</Typography>
    </div>
    <div className={`${color} p-4 rounded-2xl shadow-lg shadow-blue-100`}>
      {icon}
    </div>
  </Card>
);

const CapacityItem = ({ name, capacity, status }) => (
  <div className="flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${status === 'Full' ? 'bg-red-50' : 'bg-blue-50'}`}>
        <MapPinIcon className={`h-4 w-4 ${status === 'Full' ? 'text-red-500' : 'text-blue-600'}`} />
      </div>
      <div>
        <Typography className="text-xs font-bold text-gray-800">{name}</Typography>
        <Typography className="text-[10px] font-bold text-gray-400">Capacity: {capacity}</Typography>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Chip 
        size="sm" 
        value={status} 
        className={`${status === 'Full' ? 'bg-red-500' : 'bg-blue-500'} py-0.5 px-2 text-[9px]`} 
      />
      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
    </div>
  </div>
);

const PriceRow = ({ label, price }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 group">
    <Typography className="text-xs font-bold text-gray-600 group-hover:text-blue-700 transition-colors">{label}</Typography>
    <div className="flex items-center gap-4">
      <Typography className="text-xs font-black text-gray-900">{price}</Typography>
      <button className="text-[10px] font-black bg-white border border-blue-200 text-blue-600 px-4 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-tighter">
        Update
      </button>
    </div>
  </div>
);

export default DashboardArea;