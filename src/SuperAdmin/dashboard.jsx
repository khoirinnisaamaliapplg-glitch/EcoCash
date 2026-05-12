import React, { useState, useEffect } from "react";
// 1. IMPORT API (KANTOR PUSAT)
import api from "../utils/api"; 
import MainLayout from "./MainLayout";
import { Card, Typography, Chip } from "@material-tailwind/react";
import { MapPinIcon, UserGroupIcon, ScaleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Import Leaflet
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import Marker Icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Konfigurasi Icon Default Leaflet
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Komponen Helper: Memperbaiki Peta Patah
const FixMapLayout = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 600);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const chartData = [
  { name: 'Jan', reduction: 4.5 },
  { name: 'Feb', reduction: 3.2 },
  { name: 'Mart', reduction: 7.5 },
  { name: 'April', reduction: 3.5 },
];

const Dashboard = () => {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [machines, setMachines] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 2. CUKUP TULIS ENDPOINT-NYA SAJA (Token otomatis terpasang)
        const [resWaste, resAreas, resMachines, resUsers] = await Promise.all([
          api.get("/waste-types/"),
          api.get("/areas/"),
          api.get("/machines/"),
          api.get("/admin/users/"),
        ]);

        const extract = (res) => Array.isArray(res.data) ? res.data : (res.data.data || []);
        
        setWasteTypes(extract(resWaste));
        setAreas(extract(resAreas));
        setMachines(extract(resMachines));
        setUsers(extract(resUsers));
      } catch (error) {
        console.error("Gagal ambil data API:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
         <Typography className="animate-pulse font-black text-blue-600 uppercase italic tracking-widest">
            Syncing EcoCash Data...
         </Typography>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* SECTION 1: CONTAINER MAPS */}
        <section>
          <Typography variant="h5" className="text-[#2b6cb0] font-black mb-4 uppercase italic">
            Monitoring Unit AIoT
          </Typography>
          <Card className="w-full h-[300px] overflow-hidden border border-gray-100 shadow-sm relative rounded-[2rem] z-0">
            <MapContainer 
              center={[-7.3333, 108.2000]} 
              zoom={13} 
              style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              <FixMapLayout />
              
              {areas?.map((area) => (
                <Marker key={area.id} position={[area.latitude || -7.33, area.longitude || 108.20]}>
                  <Popup>
                    <div className="text-center font-bold text-xs uppercase">
                      {area.name} <br />
                      <span className="text-blue-500 font-normal italic">EcoCash Unit Active</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            
            <div className="absolute top-4 right-4 z-[1000]">
              <Chip value="LIVE SATELLITE" className="bg-blue-600 px-4 shadow-lg text-[10px] font-black" />
            </div>
          </Card>
        </section>

        {/* SECTION 2: STATISTIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Waste Collected" value="12.5 Kg" subValue="+80% VS LAST MONTH" icon={<ScaleIcon className="h-6 w-6 text-white" />} color="bg-green-500" />
          <StatCard title="Users Active" value={users?.length || 0} subValue="TOTAL SUPERVISED" icon={<UserGroupIcon className="h-6 w-6 text-white" />} color="bg-blue-500" />
          <StatCard title="Containers" value={machines?.length || 0} subValue={`${areas?.length || 0} LOKASI TERDAFTAR`} icon={<TrashIcon className="h-6 w-6 text-white" />} color="bg-teal-500" />
        </div>

        {/* SECTION 3: DATA & CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          {/* Capacity & Price List */}
          <Card className="p-6 border border-gray-100 shadow-sm rounded-[2rem] bg-white/80 backdrop-blur-md">
            <Typography className="font-black text-blue-900 mb-4 text-xs uppercase italic tracking-widest">Container Capacity</Typography>
            <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              {machines?.length > 0 ? machines.map(m => (
                <CapacityItem key={m.id} name={m.name || `Unit ${m.id}`} capacity={`${m.capacity || 0} kg`} />
              )) : <p className="text-xs text-gray-400 italic">No machine data available.</p>}
            </div>

            <Typography className="font-black text-blue-900 mt-8 mb-4 text-xs uppercase italic tracking-widest">Waste Prices</Typography>
            <div className="space-y-3">
               {wasteTypes?.map(t => (
                 <PriceRow key={t.id} label={t.name} price={`Rp.${t.price_per_kg || t.price || 0}/kg`} />
               ))}
            </div>
          </Card>

          {/* Emissions Chart */}
          <Card className="p-6 border border-gray-100 shadow-sm bg-white rounded-[2rem]">
            <Typography className="font-black text-blue-900 mb-2 text-xs uppercase italic tracking-widest">Carbon Reduction Trend</Typography>
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
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} tickFormatter={(v)=>`${v}%`} />
                  <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="reduction" stroke="#10b981" strokeWidth={4} fill="url(#colorGreen)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

// --- KOMPONEN UI INTERNAL ---
const StatCard = ({ title, value, subValue, icon, color }) => (
  <Card className="p-5 border border-gray-100 shadow-sm flex flex-row items-center justify-between rounded-[1.5rem] bg-white hover:shadow-md transition-shadow">
    <div>
      <Typography className="text-gray-500 text-[10px] font-black mb-1 uppercase tracking-tighter">{title}</Typography>
      <Typography variant="h3" className="text-blue-900 font-black">{value}</Typography>
      <Typography className="text-blue-500 text-[9px] font-black mt-1 uppercase italic">{subValue}</Typography>
    </div>
    <div className={`${color} p-4 rounded-2xl shadow-lg shadow-gray-200`}>{icon}</div>
  </Card>
);

const CapacityItem = ({ name, capacity }) => (
  <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-2xl border border-blue-100/30">
    <div className="flex items-center gap-3">
      <MapPinIcon className="h-4 w-4 text-blue-600" />
      <Typography className="text-[11px] font-black text-blue-900 uppercase">{name}</Typography>
    </div>
    <Typography className="text-[10px] font-black text-gray-500 italic">{capacity}</Typography>
  </div>
);

const PriceRow = ({ label, price }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 px-1 hover:bg-gray-50/50 transition-colors rounded-lg">
    <Typography className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">{label}</Typography>
    <div className="flex items-center gap-4">
      <Typography className="text-[11px] font-black text-blue-600">{price}</Typography>
      <button className="text-[8px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase shadow-sm active:scale-95 transition-transform">Update</button>
    </div>
  </div>
);

export default Dashboard;