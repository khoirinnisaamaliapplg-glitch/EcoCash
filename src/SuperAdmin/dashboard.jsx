import React from "react";
import MainLayout from "./MainLayout";
import { Card, Typography, Chip } from "@material-tailwind/react";
import { MapPinIcon, UserGroupIcon, ScaleIcon, TrashIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Data untuk Grafik Gelombang
const chartData = [
  { name: 'Jan', reduction: 4.5 },
  { name: 'Feb', reduction: 3.2 },
  { name: 'Mart', reduction: 7.5 },
  { name: 'April', reduction: 3.5 },
];

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* SECTION 1: CONTAINER MAPS */}
        <section>
          <Typography variant="h5" className="text-[#2b6cb0] font-bold mb-4">
            Container Maps
          </Typography>
          <Card className="w-full h-[300px] overflow-hidden border border-gray-100 shadow-sm relative rounded-xl">
             <div className="w-full h-full bg-blue-50 relative">
                {/* Kamu bisa ganti img ini dengan komponen react-leaflet yang kita bahas tadi */}
                <img 
                  src="https://images.squarespace-cdn.com/content/v1/54ffbb98e4b0162590211f44/1495000579732-J160QW1Z0V8QZ2Z9Z9Z9/image-asset.jpeg" 
                  alt="Map" 
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Chip value="Live Tracking Map Active" className="bg-[#2b6cb0] px-4" />
                </div>
             </div>
          </Card>
        </section>

        {/* SECTION 2: STATISTIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Global Waste Collected (kg)" 
            value="12.5 Kg" 
            subValue="+80% VS Last Month" 
            icon={<ScaleIcon className="h-6 w-6 text-white" />}
            color="bg-green-500"
          />
          <StatCard 
            title="Users Active" 
            value="50" 
            subValue="500 Users" 
            icon={<UserGroupIcon className="h-6 w-6 text-white" />}
            color="bg-blue-500"
          />
          <StatCard 
            title="Total Containers" 
            value="2" 
            subValue="2 lokasi" 
            icon={<TrashIcon className="h-6 w-6 text-white" />}
            color="bg-teal-500"
          />
        </div>

        {/* SECTION 3: CAPACITY & EMISSIONS CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          
          {/* Sisi Kiri: Capacity & Prices */}
          <Card className="p-6 border border-gray-100 shadow-sm rounded-xl">
            <Typography className="font-bold text-gray-700 mb-4">Remaining Container Capacity</Typography>
            <div className="space-y-4">
              <CapacityItem name="Container Cikini 1" capacity="120 kg" />
              <CapacityItem name="Container Cikini 2" capacity="120 kg" />
            </div>

            <Typography className="font-bold text-gray-700 mt-8 mb-4">Waste Prices</Typography>
            <div className="space-y-3">
               <PriceRow label="Plastik" price="Rp.1000/kg" />
               <PriceRow label="Kaleng" price="Rp.2000/kg" />
               <PriceRow label="Kaca" price="Rp.3000/kg" />
               <PriceRow label="Kertas" price="Rp.1000/kg" />
            </div>
          </Card>

          {/* Sisi Kanan: Smooth Area Chart (Carbon Emissions) */}
          <Card className="p-6 border border-gray-100 shadow-sm bg-white rounded-xl">
            <Typography className="font-bold text-gray-700 mb-2">Reduction of Carbon emissions</Typography>
            <Typography className="text-xs font-bold text-blue-900 mb-6">Reduction</Typography>
            
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="reduction" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorGreen)" 
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#10b981' }}
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
  <Card className="p-5 border border-gray-100 shadow-sm flex flex-row items-center justify-between rounded-xl">
    <div>
      <Typography className="text-gray-500 text-xs font-bold mb-1">{title}</Typography>
      <Typography variant="h4" className="text-gray-900 font-black">{value}</Typography>
      <Typography className="text-blue-500 text-[10px] font-bold mt-1">{subValue}</Typography>
    </div>
    <div className={`${color} p-3 rounded-xl shadow-lg shadow-gray-200`}>
      {icon}
    </div>
  </Card>
);

const CapacityItem = ({ name, capacity }) => (
  <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
    <div className="flex items-center gap-3">
      <MapPinIcon className="h-4 w-4 text-[#2b6cb0]" />
      <Typography className="text-xs font-bold text-[#2b6cb0]">{name}</Typography>
    </div>
    <div className="flex items-center gap-2">
      <Typography className="text-[10px] font-bold text-gray-600">{capacity}</Typography>
      <ChevronDownIcon className="h-3 w-3 text-gray-400" />
    </div>
  </div>
);

const PriceRow = ({ label, price }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <Typography className="text-xs font-bold text-gray-600">{label}</Typography>
    <div className="flex items-center gap-4">
      <Typography className="text-xs font-bold text-[#2b6cb0]">{price}</Typography>
      <button className="text-[9px] font-bold bg-[#10b981] text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors uppercase tracking-wider">
        Edit
      </button>
    </div>
  </div>
);

export default Dashboard;