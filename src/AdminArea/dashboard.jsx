import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api"; 
import MainLayout from "../AdminArea/MainLayout"; // Disesuaikan dengan folder layout Area Admin

// UI Components
import { Card, Typography, Chip, Progress, Spinner } from "@material-tailwind/react";
import { UserGroupIcon, ScaleIcon, TrashIcon, CpuChipIcon } from "@heroicons/react/24/outline";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- IMPORT LEAFLET ---
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Marker Icon Leaflet menggunakan pin dari assets
import pinIcon from "../assets/pin.png"; 

// Komponen Helper untuk mendengarkan perubahan Zoom global dan meresize peta agar tidak blank
const MapController = ({ setZoomLevel, mapCenter }) => {
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

  // Otomatis arahkan peta jika koordinat pusat area berubah setelah fetch API
  useEffect(() => {
    if (mapCenter) {
      map.setView(mapCenter, map.getZoom());
    }
  }, [mapCenter, map]);

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
          // Mengarah langsung ke target koordinat dengan level zoom fokus (Level 16)
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

// Dummy tren emisi untuk wilayah terkait
const chartData = [
  { name: 'Jan', reduction: 4.5 },
  { name: 'Feb', reduction: 3.2 },
  { name: 'Mar', reduction: 7.5 },
  { name: 'Apr', reduction: 3.5 },
];

const DashboardArea = () => {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [machines, setMachines] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [mapCenter, setMapCenter] = useState([-7.3333, 108.2225]); // Default pusat peta

  // Ambil data Auth & Wilayah Area Admin
  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;
  const token = localStorage.getItem("token");
  const myAreaId = userData?.areaId;

  const fetchData = useCallback(async () => {
    if (!token || !myAreaId) return setLoading(false);

    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      setLoading(true);
      const [resWaste, resMachines, resUsers] = await Promise.all([
        api.get("/waste-types/", config),
        api.get("/machines/", config),
        api.get("/admin/users/", config),
      ]);
      
      const extract = (res) => Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      const allMachines = extract(resMachines);
      const allUsers = extract(resUsers);

      // FILTER DATA: Hanya ambil data yang sesuai dengan areaId milik Area Admin ini
      const filteredMachines = allMachines.filter(m => m.areaId === myAreaId);
      const filteredUsers = allUsers.filter(u => u.areaId === myAreaId);

      setWasteTypes(extract(resWaste)); // Daftar harga tipe waste global atau regional
      setMachines(filteredMachines);
      setUsers(filteredUsers);

      // Jika wilayah admin memiliki mesin, arahkan titik pusat peta ke mesin pertama agar presisi
      if (filteredMachines.length > 0) {
        const firstLat = parseFloat(filteredMachines[0].latitude);
        const firstLng = parseFloat(filteredMachines[0].longitude);
        if (!isNaN(firstLat) && !isNaN(firstLng)) {
          setMapCenter([firstLat, firstLng]);
        }
      }
    } catch (error) {
      console.error("Gagal sinkronisasi data area dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [token, myAreaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // OPTIMASI RUMUS UKURAN PIN DINAMIS
  const getDynamicIcon = (currentZoom) => {
    const baseSize = 90; 
    const dynamicSize = Math.max(35, baseSize * Math.pow(1.22, currentZoom - 13)); 
    
    return new L.Icon({
        iconUrl: pinIcon,
        iconSize: [dynamicSize, dynamicSize],      
        iconAnchor: [dynamicSize / 2, dynamicSize], 
        popupAnchor: [0, -dynamicSize]             
    });
  };

  if (loading) return (
    <MainLayout>
      <div className="h-96 w-full flex flex-col items-center justify-center gap-4 bg-white/50">
        <Spinner className="h-12 w-12 text-blue-600" />
        <Typography className="animate-pulse font-black text-blue-900 uppercase italic">
          Sinkronisasi Data Wilayah...
        </Typography>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">
        
        {/* SECTION 1: MONITORING MAPS */}
        <section>
          <div className="flex justify-between items-end mb-4 px-2">
            <div>
              <Typography variant="h4" className="font-black text-blue-900 uppercase italic tracking-tight">
                Monitoring Area: {userData?.area?.name || "Wilayah Kontrol"}
              </Typography>
              <Typography className="text-gray-500 text-sm font-medium">
                Visualisasi Unit Smart Container AIoT Internal Wilayah
              </Typography>
            </div>
            <Chip value="LIVE MONITORING" className="bg-blue-600 px-4 shadow-lg text-[10px] font-black rounded-full" />
          </div>

          <Card className="w-full h-[400px] rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-gray-100 z-0 relative">
            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapController setZoomLevel={setZoomLevel} mapCenter={mapCenter} />

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
                    <Popup minWidth={220} className="custom-popup">
                      <div className="p-1">
                        <Typography className="font-black text-blue-600 text-[10px] uppercase">{m.machineCode || "AIOT-UNIT"}</Typography>
                        <Typography className="font-bold text-blue-gray-900 text-sm">{m.name}</Typography>
                        <Typography className="text-[10px] text-gray-500 mb-2 italic">{m.placeName || m.address || "No Address Listed"}</Typography>
                        
                        <div className="space-y-1 mt-2 border-t pt-2">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>Kapasitas Muatan</span>
                            <span>{m.fillPercentage || 0}%</span>
                          </div>
                          <Progress 
                            value={m.fillPercentage || 0} 
                            size="sm" 
                            color={(m.fillPercentage || 0) > 80 ? "red" : "blue"} 
                          />
                          <p className="text-[9px] text-gray-400 mt-1 text-right">Maks: {m.capacity || 0} Kg</p>
                        </div>
                      </div>
                    </Popup>
                  </MarkerWithFlyTo>
                );
              })}
            </MapContainer>
          </Card>
        </section>

        {/* SECTION 2: STATISTIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="User Terdaftar" 
            value={users.length} 
            subValue="DI WILAYAH ANDA" 
            color="bg-blue-800" 
            icon={<UserGroupIcon className="h-6 w-6 text-white" />} 
          />
          <StatCard 
            title="Unit AIoT Aktif" 
            value={machines.length} 
            subValue="TOTAL TERPASANG" 
            color="bg-blue-600" 
            icon={<CpuChipIcon className="h-6 w-6 text-white" />} 
          />
          <StatCard 
            title="Waste Terkumpul" 
            value="12.5 Kg" 
            subValue="LIVE UPDATE REGIONAL" 
            color="bg-blue-400" 
            icon={<ScaleIcon className="h-6 w-6 text-white" />} 
          />
        </div>

        {/* SECTION 3: DATA & CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Daftar Tipe Sampah & Kontrol Harga */}
          <Card className="p-6 border border-gray-100 shadow-sm rounded-[2rem] bg-white">
            <Typography className="font-black text-blue-900 mb-4 text-xs uppercase italic tracking-widest flex items-center gap-2">
               <TrashIcon className="h-4 w-4 text-blue-600" /> Daftar Nilai Tukar Kontrol Waste
            </Typography>
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
               {wasteTypes.map(t => (
                 <PriceRow key={t.id} label={t.name} price={`Rp.${t.price_per_kg || 0}/kg`} />
               ))}
               {wasteTypes.length === 0 && (
                 <p className="text-xs italic text-gray-400 py-4 text-center">Data kategori harga belum tersedia.</p>
               )}
            </div>
          </Card>

          {/* Tren Reduksi Karbon */}
          <Card className="p-6 border border-gray-100 shadow-sm bg-white rounded-[2rem]">
            <Typography className="font-black text-blue-900 mb-2 text-xs uppercase italic tracking-widest">Tren Reduksi Emisi Wilayah</Typography>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBlueTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2b6cb0" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2b6cb0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} />
                  <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="reduction" stroke="#2b6cb0" strokeWidth={4} fill="url(#colorBlueTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
        </div>
      </div>
    </MainLayout>
  );
};

// --- SUB KOMPONEN REUSABLE ---
const StatCard = ({ title, value, subValue, icon, color }) => (
  <Card className="p-5 flex flex-row items-center justify-between rounded-[1.5rem] bg-white border border-gray-100 shadow-sm">
    <div>
      <Typography className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</Typography>
      <Typography variant="h3" className="text-blue-900 font-black">{value}</Typography>
      <Typography className="text-blue-600 text-[9px] font-bold mt-1 italic uppercase">{subValue}</Typography>
    </div>
    <div className={`${color} p-4 rounded-2xl shadow-lg`}>{icon}</div>
  </Card>
);

const PriceRow = ({ label, price }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 px-1">
    <Typography className="text-xs font-bold text-gray-700 uppercase">{label}</Typography>
    <div className="flex items-center gap-4">
      <Typography className="text-xs font-black text-blue-900">{price}</Typography>
      <button className="text-[9px] font-black border border-blue-200 text-blue-600 px-3 py-1 rounded-lg uppercase hover:bg-blue-50 transition">
        Ubah
      </button>
    </div>
  </div>
);

export default DashboardArea;