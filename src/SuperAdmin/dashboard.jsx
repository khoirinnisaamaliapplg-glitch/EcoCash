import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "./MainLayout";
import { Card, Typography, Chip } from "@material-tailwind/react";
import { MapPinIcon, UserGroupIcon, ScaleIcon, TrashIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Import Leaflet & React Leaflet
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

// Komponen Helper: Memperbaiki Peta Patah & Menghilangkan Logo Leaflet/Esri
const FixMapLayout = () => {
  const map = useMap();
  useEffect(() => {
    // Memaksa peta menyesuaikan ukuran setelah layout dashboard stabil
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
        const token = localStorage.getItem("token");
        if (!token) return setLoading(false);

        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [resWaste, resAreas, resMachines, resUsers] = await Promise.all([
          axios.get("http://localhost:3000/api/waste-types/", config),
          axios.get("http://localhost:3000/api/areas/", config),
          axios.get("http://localhost:3000/api/machines/", config),
          axios.get("http://localhost:3000/api/users/", config),
        ]);

        const extract = (res) => Array.isArray(res.data) ? res.data : (res.data.data || []);
        
        setWasteTypes(extract(resWaste));
        setAreas(extract(resAreas));
        setMachines(extract(resMachines));
        setUsers(extract(resUsers));
      } catch (error) {
        console.error("Gagal ambil data API (401/404):", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-[#2b6cb0]">Syncing EcoCash Data...</div>;

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* SECTION 1: CONTAINER MAPS */}
        <section>
          <Typography variant="h5" className="text-[#2b6cb0] font-bold mb-4">
            Container Maps
          </Typography>
          <Card className="w-full h-[300px] overflow-hidden border border-gray-100 shadow-sm relative rounded-xl z-0">
            <MapContainer 
              center={[-7.3333, 108.2000]} 
              zoom={13} 
              style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
              zoomControl={false}
              attributionControl={false} // MENGHILANGKAN LOGO LEAFLET/ESRI
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              
              <FixMapLayout />
              
              {areas?.map((area) => (
                <Marker key={area.id} position={[area.latitude || -7.33, area.longitude || 108.20]}>
                  <Popup>
                    <div className="text-center font-bold text-xs uppercase">
                      {area.name} <br />
                      <span className="text-blue-500 font-normal">EcoCash Unit</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            
            <div className="absolute top-4 right-4 z-[1000]">
              <Chip value="LIVE SATELLITE" className="bg-[#2b6cb0] px-4 shadow-lg text-[10px]" />
            </div>
          </Card>
        </section>

        {/* SECTION 2: STATISTIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Waste Collected" value="12.5 Kg" subValue="+80% VS LAST MONTH" icon={<ScaleIcon className="h-6 w-6 text-white" />} color="bg-green-500" />
          <StatCard title="Users Active" value={users?.length || 0} subValue="TOTAL SUPERVISED" icon={<UserGroupIcon className="h-6 w-6 text-white" />} color="bg-blue-500" />
          <StatCard title="Containers" value={machines?.length || 0} subValue={`${areas?.length || 0} LOKASI`} icon={<TrashIcon className="h-6 w-6 text-white" />} color="bg-teal-500" />
        </div>

        {/* SECTION 3: DATA & CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          {/* Capacity & Price List */}
          <Card className="p-6 border border-gray-100 shadow-sm rounded-xl">
            <Typography className="font-bold text-gray-700 mb-4 text-sm">Container Capacity</Typography>
            <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2">
              {machines?.length > 0 ? machines.map(m => (
                <CapacityItem key={m.id} name={m.name || `Unit ${m.id}`} capacity={`${m.capacity || 0} kg`} />
              )) : <p className="text-xs text-gray-400 italic">No machine data available.</p>}
            </div>

            <Typography className="font-bold text-gray-700 mt-8 mb-4 text-sm">Waste Prices</Typography>
            <div className="space-y-3">
               {wasteTypes?.map(t => (
                 <PriceRow key={t.id} label={t.name} price={`Rp.${t.price_per_kg || t.price}/kg`} />
               ))}
            </div>
          </Card>

          {/* Emissions Chart */}
          <Card className="p-6 border border-gray-100 shadow-sm bg-white rounded-xl">
            <Typography className="font-bold text-gray-700 mb-2 text-sm">Carbon Reduction Trend</Typography>
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
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} tickFormatter={(v)=>`${v}%`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="reduction" stroke="#10b981" strokeWidth={3} fill="url(#colorGreen)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

// --- KOMPONEN UI ---
const StatCard = ({ title, value, subValue, icon, color }) => (
  <Card className="p-5 border border-gray-100 shadow-sm flex flex-row items-center justify-between rounded-xl">
    <div>
      <Typography className="text-gray-500 text-[10px] font-bold mb-1 uppercase">{title}</Typography>
      <Typography variant="h4" className="text-gray-900 font-black">{value}</Typography>
      <Typography className="text-blue-500 text-[9px] font-bold mt-1 uppercase">{subValue}</Typography>
    </div>
    <div className={`${color} p-3.5 rounded-xl shadow-lg`}>{icon}</div>
  </Card>
);

const CapacityItem = ({ name, capacity }) => (
  <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
    <div className="flex items-center gap-3">
      <MapPinIcon className="h-4 w-4 text-[#2b6cb0]" />
      <Typography className="text-xs font-bold text-[#2b6cb0]">{name}</Typography>
    </div>
    <Typography className="text-[10px] font-bold text-gray-600">{capacity}</Typography>
  </div>
);

const PriceRow = ({ label, price }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 px-1">
    <Typography className="text-xs font-bold text-gray-600">{label}</Typography>
    <div className="flex items-center gap-4">
      <Typography className="text-xs font-black text-[#2b6cb0]">{price}</Typography>
      <button className="text-[8px] font-bold bg-[#10b981] text-white px-3 py-1 rounded-md uppercase">Edit</button>
    </div>
  </div>
);

export default Dashboard;