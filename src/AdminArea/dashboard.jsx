import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MainLayout from "../AdminArea/MainLayout"; 
import { Card, Typography, Chip, Spinner } from "@material-tailwind/react";
import { 
  MapPinIcon, UserGroupIcon, ScaleIcon, 
  TrashIcon, CpuChipIcon 
} from "@heroicons/react/24/outline";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Leaflet Imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Konfigurasi Marker Icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const FixMapLayout = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => { map.invalidateSize(); }, 600);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const DashboardArea = () => {
  const [machines, setMachines] = useState([]);
  const [users, setUsers] = useState([]);
  const [wastePrices, setWastePrices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data Auth
  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;
  const token = localStorage.getItem("token");
  const myAreaId = userData?.areaId;

  const fetchData = useCallback(async () => {
    if (!token || !myAreaId) return setLoading(false);
    
    const config = { headers: { Authorization: `Bearer ${token}` } };
    setLoading(true);

    try {
      // Hit 3 API sesuai yang kamu berikan
      const [resUsers, resPrices, resMachines] = await Promise.all([
        axios.get("http://localhost:3000/api/users", config),
        axios.get("http://localhost:3000/api/waste-prices", config),
        axios.get("http://localhost:3000/api/machines", config)
      ]);

      // Helper untuk ekstrak data array
      const extract = (res) => Array.isArray(res.data) ? res.data : (res.data.data || []);

      // Filter data agar HANYA menampilkan yang sesuai dengan areaId Admin ini
      const allUsers = extract(resUsers);
      const allMachines = extract(resMachines);

      setUsers(allUsers.filter(u => u.areaId === myAreaId));
      setMachines(allMachines.filter(m => m.areaId === myAreaId));
      setWastePrices(extract(resPrices)); // Harga biasanya global atau sesuaikan filter jika ada areaId

    } catch (error) {
      console.error("Gagal sinkronisasi API Dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [token, myAreaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <MainLayout>
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <Spinner className="h-12 w-12 text-blue-600" />
          <Typography className="font-black text-blue-900 animate-pulse uppercase italic">
            Sinkronisasi Data Wilayah...
          </Typography>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">
        
        {/* SECTION 1: MAPS */}
        <section>
          <div className="flex justify-between items-end mb-4 px-2">
            <div>
              <Typography variant="h4" className="text-blue-900 font-black uppercase italic tracking-tight">
                Monitoring Area: {userData?.area?.name || "Wilayah Saya"}
              </Typography>
              <Typography className="text-gray-500 text-sm font-medium">
                Visualisasi Unit AIoT & Sebaran Lokasi
              </Typography>
            </div>
            <Chip value="LIVE SATELLITE" className="bg-blue-600 rounded-full" />
          </div>

          <Card className="w-full h-[350px] overflow-hidden border-4 border-white shadow-xl relative rounded-[2rem] z-0">
            <MapContainer 
              center={[-7.33, 108.20]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              <FixMapLayout />
              
              {machines.map((m) => (
                <Marker key={m.id} position={[m.latitude || -7.33, m.longitude || 108.20]}>
                  <Popup>
                    <div className="text-center font-bold">
                      <p className="text-blue-600 uppercase text-xs">{m.name}</p>
                      <p className="text-[10px] text-gray-500">Kapasitas: {m.capacity || 0} Kg</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card>
        </section>

        {/* SECTION 2: STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="User Terdaftar" 
            value={users.length} 
            subValue="DI WILAYAH ANDA" 
            icon={<UserGroupIcon className="h-6 w-6 text-white" />} 
            color="bg-blue-800" 
          />
          <StatCard 
            title="Unit AIoT" 
            value={machines.length} 
            subValue="UNIT AKTIF" 
            icon={<CpuChipIcon className="h-6 w-6 text-white" />} 
            color="bg-blue-600" 
          />
          <StatCard 
            title="Total Waste" 
            value="12.5 Kg" 
            subValue="DIPERBARUI LIVE" 
            icon={<ScaleIcon className="h-6 w-6 text-white" />} 
            color="bg-blue-400" 
          />
        </div>

        {/* SECTION 3: DETAIL CAPACITY & PRICES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border border-gray-100 shadow-sm rounded-[2rem] bg-white">
            <Typography className="font-black text-blue-900 mb-6 uppercase text-xs tracking-widest italic flex items-center gap-2">
               <TrashIcon className="h-4 w-4 text-blue-600" /> Kapasitas Penampungan
            </Typography>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
              {machines.map(m => (
                <CapacityItem key={m.id} name={m.name} capacity={`${m.capacity || 0} Kg`} />
              ))}
              {machines.length === 0 && <p className="text-xs italic text-gray-400">Tidak ada mesin di wilayah ini.</p>}
            </div>

            <Typography className="font-black text-blue-900 mt-10 mb-4 uppercase text-xs tracking-widest italic">
               Daftar Harga Wilayah
            </Typography>
            <div className="space-y-3">
               {wastePrices.map(price => (
                 <PriceRow key={price.id} label={price.name} price={`Rp. ${price.price || 0}/kg`} />
               ))}
            </div>
          </Card>

          {/* Dummy Grafik untuk Visualisasi */}
          <Card className="p-6 border border-gray-100 shadow-sm bg-white rounded-[2rem]">
            <Typography className="font-black text-blue-900 mb-4 uppercase text-xs tracking-widest italic">Progres Mingguan</Typography>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{name: 'M1', val: 400}, {name: 'M2', val: 300}, {name: 'M3', val: 600}, {name: 'M4', val: 800}]}>
                  <defs>
                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2b6cb0" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2b6cb0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="val" stroke="#2b6cb0" strokeWidth={4} fill="url(#colorBlue)" />
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
  <Card className="p-5 border border-white bg-white/50 backdrop-blur-md shadow-sm flex flex-row items-center justify-between rounded-2xl">
    <div>
      <Typography className="text-gray-400 text-[10px] font-black mb-1 uppercase tracking-widest">{title}</Typography>
      <Typography variant="h3" className="text-blue-900 font-black">{value}</Typography>
      <Typography className="text-blue-600 text-[9px] font-bold mt-1 italic uppercase">{subValue}</Typography>
    </div>
    <div className={`${color} p-4 rounded-2xl shadow-lg`}>{icon}</div>
  </Card>
);

const CapacityItem = ({ name, capacity }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border bg-blue-50/50 border-blue-100">
    <div className="flex items-center gap-3">
      <MapPinIcon className="h-4 w-4 text-blue-600" />
      <Typography className="text-xs font-bold text-blue-900">{name}</Typography>
    </div>
    <Typography className="text-[10px] font-black text-gray-600 uppercase">Limit: {capacity}</Typography>
  </div>
);

const PriceRow = ({ label, price }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 px-1">
    <Typography className="text-xs font-bold text-gray-600">{label}</Typography>
    <div className="flex items-center gap-4">
      <Typography className="text-xs font-black text-blue-900">{price}</Typography>
      <button className="text-[9px] font-black border border-blue-200 text-blue-600 px-3 py-1 rounded-lg uppercase">Ubah</button>
    </div>
  </div>
);

export default DashboardArea;