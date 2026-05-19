import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog, DialogHeader, DialogBody, DialogFooter,
  Input, Button, Typography, IconButton, Textarea, Spinner, Select, Option,
} from "@material-tailwind/react";
import { XMarkIcon, CpuChipIcon } from "@heroicons/react/24/outline";
import api from "../../utils/api";
import { toast } from 'react-toastify';

// --- IMPORT LEAFLET UNTUK OPENSTREETMAP ---
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix asset icon marker Leaflet agar muncul normal di React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const defaultCenter = { lat: -7.3333, lng: 108.2225 }; // Tasikmalaya

const CreateModal = ({ open, handleOpen, refreshData }) => {
  // Ambil data Auth & Wilayah Area Admin
  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;

  const initialState = {
    machineCode: "", 
    name: "", 
    areaId: userData?.areaId || "", 
    machineType: "BOX",
    locationType: "OTHER", 
    latitude: "-7.3333", 
    longitude: "108.2225",
    district: "", 
    subdistrict: "", 
    address: "", 
    placeName: "", 
    description: "",
  };

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [markerPos, setMarkerPos] = useState(defaultCenter);

  // Mengunci / sinkronisasi areaId setiap kali modal dibuka kembali
  useEffect(() => {
    if (open && userData?.areaId) {
      setForm(prev => ({ ...prev, areaId: userData.areaId }));
    }
  }, [open]);

  // 1. REVERSE GEOCODING MENGGUNAKAN NOMINATIM (OSM FREE API)
  const fetchAddressInfo = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (!response.ok) throw new Error("Gagal mengambil data alamat");
      
      const data = await response.json();
      
      if (data && data.address) {
        const district = data.address.subdistrict || data.address.city_district || ""; // Setara Kecamatan
        const subdistrict = data.address.village || data.address.suburb || data.address.neighbourhood || ""; // Setara Kelurahan/Desa
        const fullAddress = data.display_name || "";

        setForm(prev => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          address: fullAddress,
          district: district || prev.district,
          subdistrict: subdistrict || prev.subdistrict
        }));
      }
    } catch (error) {
      console.error("Geocoding Error:", error);
      setForm(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }));
    }
  }, []);

  // 2. HANDLER KLIK PETA UNTUK LEAFLET
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPos({ lat, lng });
        fetchAddressInfo(lat, lng);
      },
    });
    return null;
  };

  // 3. HANDLER DRAG MARKER UNTUK LEAFLET
  const markerEventHandlers = useMemo(() => ({
    dragend(e) {
      const marker = e.target;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        setMarkerPos({ lat, lng });
        fetchAddressInfo(lat, lng);
      }
    },
  }), [fetchAddressInfo]);

  // 4. LOAD GEOLOCATION SAAT MODAL DIBUKA
  useEffect(() => {
    if (open) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setMarkerPos(userPos);
          fetchAddressInfo(userPos.lat, userPos.lng);
        }, (err) => {
          fetchAddressInfo(defaultCenter.lat, defaultCenter.lng);
        });
      } else {
        fetchAddressInfo(defaultCenter.lat, defaultCenter.lng);
      }
    }
  }, [open, fetchAddressInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.machineCode.trim() || !form.name.trim() || !form.areaId) {
      toast.warning("Harap isi Kode Mesin dan Nama Mesin!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...form,
        machineCode: form.machineCode.trim().toUpperCase(),
        areaId: Number(form.areaId),
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0,
      };

      await api.post("/machines", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Mesin AIoT berhasil didaftarkan di area Anda!");
      handleClose();
      if (refreshData) refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan server.");
    } finally { 
      setLoading(false); 
    }
  };

  const handleClose = () => {
    setForm(initialState);
    setMarkerPos(defaultCenter);
    handleOpen(); 
  };

  const locationOptions = ["OFFICE", "HOTEL", "MALL", "MARKET", "SCHOOL_CAMPUS", "RT_RW", "PARK", "HOSPITAL", "OTHER"];

  return (
    <Dialog open={open} handler={handleClose} size="xl" className="rounded-xl max-h-[95vh] flex flex-col overflow-hidden font-sans">
      <DialogHeader className="flex justify-between items-center border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <CpuChipIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <Typography variant="h5" className="font-bold text-blue-gray-900">Registrasi Unit AIoT Baru</Typography>
            <Typography className="text-xs text-blue-600 font-black uppercase tracking-tight">
              Area Kontrol: {userData?.areaName || userData?.area?.name || "Wilayah Tugas"} (ID: {userData?.areaId})
            </Typography>
          </div>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleClose}>
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="overflow-y-auto px-6 py-4 flex-grow custom-scrollbar bg-gray-50/20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* KOLOM KIRI: MAPS MONITORING POSITION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-green-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Pinpoint Lokasi Gps</Typography>
            </div>
            
            <div className="h-[350px] w-full rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-gray-100 z-0 relative">
              {open && (
                <MapContainer 
                  center={[markerPos.lat, markerPos.lng]} 
                  zoom={15} 
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapEvents />
                  <Marker 
                    position={[markerPos.lat, markerPos.lng]} 
                    draggable={true}
                    eventHandlers={markerEventHandlers}
                  />
                </MapContainer>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <Input label="Latitude (Otomatis)" name="latitude" value={form.latitude} readOnly className="bg-gray-50 font-mono text-xs" />
               <Input label="Longitude (Otomatis)" name="longitude" value={form.longitude} readOnly className="bg-gray-50 font-mono text-xs" />
            </div>
          </div>

          {/* KOLOM KANAN: FORM IDENTITAS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Spesifikasi Unit & Alamat</Typography>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Kunci Informasi Wilayah Terbaca (Read Only) */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col">
                <Typography className="text-[10px] uppercase font-black text-blue-500 tracking-wider">Otoritas Wilayah Registrasi</Typography>
                <Typography className="text-sm font-black text-blue-900 mt-0.5">
                  {userData?.areaName || userData?.area?.name || "Wilayah Tugas"} (ID: {userData?.areaId})
                </Typography>
              </div>

              <Input label="Kode Mesin (Unik)" name="machineCode" value={form.machineCode} onChange={handleChange} color="blue" />
              <Input label="Nama Tampilan Unit" name="name" value={form.name} onChange={handleChange} color="blue" />
              
              <div className="grid grid-cols-2 gap-4">
                <Select label="Tipe Perangkat" value={form.machineType} onChange={(v) => handleSelectChange("machineType", v)}>
                  <Option value="BOX">SISTEM BOX</Option>
                  <Option value="CONTAINER">SISTEM KONTAINER</Option>
                </Select>
                <Select label="Kategori Lokasi" value={form.locationType} onChange={(v) => handleSelectChange("locationType", v)}>
                  {locationOptions.map((opt) => (
                    <Option key={opt} value={opt}>{opt.replace("_", " ")}</Option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Kecamatan" name="district" value={form.district} onChange={handleChange} />
                <Input label="Kelurahan" name="subdistrict" value={form.subdistrict} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* SECTION BAWAH COMPLEMENTARY */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
             <Input label="Nama Tempat / Nama Gedung Detail" name="placeName" value={form.placeName} onChange={handleChange} />
             <Textarea label="Detail Alamat Lengkap & Patokan Kantor" name="address" rows={1} value={form.address} onChange={handleChange} />
             <div className="md:col-span-2">
               <Textarea label="Catatan Deskripsi Internal Logistik Unit" name="description" rows={2} value={form.description} onChange={handleChange} />
             </div>
          </div>

        </div>
      </DialogBody>

      <DialogFooter className="border-t p-4 gap-2 bg-white">
        <Button variant="text" color="gray" onClick={handleClose} className="normal-case">
          Batal
        </Button>
        <Button variant="gradient" color="blue" onClick={handleSubmit} disabled={loading} className="px-10 normal-case flex items-center gap-2">
          {loading ? <Spinner className="h-4 w-4" /> : "Simpan Unit Baru"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateModal;