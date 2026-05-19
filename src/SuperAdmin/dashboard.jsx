import React, { useState, useEffect } from "react";
import api from "../utils/api"; 
import MainLayout from "./MainLayout";

// UI Components
import { Card, Typography, Chip, Progress } from "@material-tailwind/react";
import { UserGroupIcon, ScaleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- IMPORT LEAFLET ---
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Marker Icon Leaflet menggunakan pin.png dari folder assets
import pinIcon from "../assets/pin.png"; 

// Komponen Helper untuk mendengarkan perubahan Zoom global dan meresize peta agar tidak blank
const MapController = ({ setZoomLevel }) => {
  const map = useMapEvents({
    zoomend() {
      setZoomLevel(map.getZoom());
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

// --- KOMPONEN: LANGSUNG MEMBAWA PETA KE ZOOM FOKUS MAKSIMAL SAAT DIKLIK ---
const MarkerWithFlyTo = ({ position, icon, children }) => {
  const map = useMap();

  return (
    <Marker 
      position={position} 
      icon={icon}
      eventHandlers={{
        click: () => {
          // Langkap langsung mengarah ke target koordinat dengan level zoom fokus (Level 16)
          map.flyTo(position, 16, {
            animate: true,
            duration: 0.8 
          });
        }
      }}
    >
      {children}
    </Marker>
  );
};

const chartData = [
  { name: 'Jan', reduction: 4.5 },
  { name: 'Feb', reduction: 3.2 },
  { name: 'Mart', reduction: 7.5 },
  { name: 'April', reduction: 3.5 },
];

const Dashboard = () => {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [machines, setMachines] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Set default awal zoom sesuai dengan properti zoom pada MapContainer (yaitu 13)
  const [zoomLevel, setZoomLevel] = useState(13);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resWaste, resMachines, resUsers] = await Promise.all([
          api.get("/waste-types/"),
          api.get("/machines/"),
          api.get("/admin/users/"),
        ]);
        
        const extract = (res) => Array.isArray(res.data) ? res.data : (res.data.data || []);
        setWasteTypes(extract(resWaste));
        setMachines(extract(resMachines));
        setUsers(extract(resUsers));
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- OPTIMASI RUMUS UKURAN PIN (JAUH LEBIH BESAR) ---
  const getDynamicIcon = (currentZoom) => {
    const baseSize = 90; // <-- Base size dinaikkan ke 90px agar mencolok dari awal
    
    // Multiplier eksponensial dipertajam menjadi 1.22 agar saat di-zoom in ukurannya melesat naik
    const dynamicSize = Math.max(35, baseSize * Math.pow(1.22, currentZoom - 13)); 
    
    return new L.Icon({
        iconUrl: pinIcon,
        iconSize: [dynamicSize, dynamicSize],       
        iconAnchor: [dynamicSize / 2, dynamicSize], 
        popupAnchor: [0, -dynamicSize]             
    });
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Typography className="animate-pulse font-black text-blue-600 uppercase italic">Syncing EcoCash Data...</Typography>
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* SECTION 1: MONITORING MAPS */}
        <section>
          <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3 mb-4">
            <Typography variant="h5" className="font-bold text-blue-gray-900 uppercase italic">
              Monitoring Unit Kontainer AI-IoT
            </Typography>
          </div>

          <Card className="w-full h-[400px] rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-gray-100 z-0 relative">
            <MapContainer 
              center={[-7.3333, 108.2225]} 
              zoom={13} 
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapController setZoomLevel={setZoomLevel} />

              {machines.map((m) => {
                const lat = parseFloat(m.latitude);
                const lng = parseFloat(m.longitude);
                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                  <MarkerWithFlyTo 
                    key={m.id} 
                    position={[lat, lng]} 
                    icon={getDynamicIcon(zoomLevel)}
                  >
                    <Popup minWidth={200} className="custom-popup">
                      <div className="p-1">
                        <Typography className="font-black text-blue-600 text-[10px] uppercase">{m.machineCode}</Typography>
                        <Typography className="font-bold text-blue-gray-900 text-sm">{m.name}</Typography>
                        <Typography className="text-[10px] text-gray-500 mb-2 italic">{m.placeName || m.address}</Typography>
                        
                        <div className="space-y-1 mt-2 border-t pt-2">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>Kapasitas</span>
                            <span>{m.fillPercentage || 0}%</span>
                          </div>
                          <Progress 
                            value={m.fillPercentage || 0} 
                            size="sm" 
                            color={(m.fillPercentage || 0) > 80 ? "red" : "blue"} 
                          />
                        </div>
                      </div>
                    </Popup>
                  </MarkerWithFlyTo>
                );
              })}
            </MapContainer>

            {/* Overlay Label */}
            <div className="absolute top-4 right-4 z-[1000]">
              <Chip value="LIVE MONITORING" className="bg-blue-600 px-4 shadow-lg text-[10px] font-black" />
            </div>
          </Card>
        </section>

        {/* SECTION 2: STATISTIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Waste Collected" value="12.5 Kg" subValue="+80% VS LAST MONTH" color="bg-green-500" icon={<ScaleIcon className="h-6 w-6 text-white" />} />
          <StatCard title="Users Active" value={users.length} subValue="TOTAL SUPERVISED" color="bg-blue-500" icon={<UserGroupIcon className="h-6 w-6 text-white" />} />
          <StatCard title="Containers" value={machines.length} subValue="UNIT AKTIF" color="bg-teal-500" icon={<TrashIcon className="h-6 w-6 text-white" />} />
        </div>

        {/* SECTION 3: DATA & CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          <Card className="p-6 border border-gray-100 shadow-sm rounded-[2rem] bg-white">
            <Typography className="font-black text-blue-900 mb-4 text-xs uppercase italic tracking-widest">Waste Prices</Typography>
            <div className="space-y-3">
               {wasteTypes.map(t => (
                 <PriceRow key={t.id} label={t.name} price={`Rp.${t.price_per_kg || 0}/kg`} />
               ))}
            </div>
          </Card>

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
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
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

// Komponen Pendukung
const StatCard = ({ title, value, subValue, icon, color }) => (
  <Card className="p-5 flex flex-row items-center justify-between rounded-[1.5rem] bg-white border border-gray-100 shadow-sm">
    <div>
      <Typography className="text-gray-500 text-[10px] font-black uppercase tracking-tighter">{title}</Typography>
      <Typography variant="h3" className="text-blue-900 font-black">{value}</Typography>
      <Typography className="text-blue-500 text-[9px] font-black italic">{subValue}</Typography>
    </div>
    <div className={`${color} p-4 rounded-2xl shadow-lg`}>{icon}</div>
  </Card>
);

const PriceRow = ({ label, price }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 px-1">
    <Typography className="text-[11px] font-bold text-gray-700 uppercase">{label}</Typography>
    <Typography className="text-[11px] font-black text-blue-600">{price}</Typography>
  </div>
);

export default Dashboard;