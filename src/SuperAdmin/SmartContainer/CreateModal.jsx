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

// --- IMPORT GAMBAR PIN KUSTOM (Mundur 3 tingkat ke src/assets) ---
import pinImage from "../../assets/pin.png";
import shadowImage from "leaflet/dist/images/marker-shadow.png";

// Inisialisasi Kustom Pin Icon menggunakan gambar yang di-import
const customPinIcon = L.icon({
  iconUrl: pinImage,
  shadowUrl: shadowImage,
  iconSize: [38, 38],       // Dimensi ukuran gambar [lebar, tinggi]
  iconAnchor: [19, 38],     // Titik tumpu bawah (setengah lebar, tinggi penuh) agar pas di koordinat GPS
  popupAnchor: [0, -34],
  shadowSize: [41, 41]
});

const defaultCenter = { lat: -7.3333, lng: 108.2225 }; // Tasikmalaya

const CreateModal = ({ open, handleOpen, refreshData }) => {
  const initialState = {
    machineCode: "", name: "", areaId: "", machineType: "BOX",
    locationType: "OTHER", latitude: "-7.3333", longitude: "108.2225",
    district: "", subdistrict: "", address: "", placeName: "", description: "",
  };

  const [form, setForm] = useState(initialState);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [markerPos, setMarkerPos] = useState(defaultCenter);

  // 1. REVERSE GEOCODING MENGGUNAKAN NOMINATIM
  const fetchAddressInfo = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (!response.ok) throw new Error("Gagal mengambil data alamat");
      
      const data = await response.json();
      
      if (data && data.address) {
        const district = data.address.subdistrict || data.address.city_district || ""; 
        const subdistrict = data.address.village || data.address.suburb || data.address.neighbourhood || ""; 
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

  // 2. HANDLER KLIK PETA
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

  // 3. HANDLER DRAG MARKER
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

  // 4. LOAD DATA AREA & GEOLOCATION GPS DEVICE
  useEffect(() => {
    if (open) {
      const fetchAreas = async () => {
        try {
          setLoadingAreas(true);
          const response = await api.get("/areas");
          const areaData = response.data.data || response.data;
          setAreas(Array.isArray(areaData) ? areaData.filter(a => a.isActive) : []);
        } catch (err) {
          console.error("Gagal load area:", err);
        } finally {
          setLoadingAreas(false);
        }
      };
      fetchAreas();

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

  const handleSubmit = async () => {
    if (!form.machineCode.trim() || !form.name.trim() || !form.areaId) {
      toast.warning("Harap isi Kode, Nama, dan Area!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        machineCode: form.machineCode.trim().toUpperCase(),
        areaId: Number(form.areaId),
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0,
      };
      await api.post("/machines", payload);
      toast.success("Mesin berhasil ditambahkan!");
      handleClose();
      if (refreshData) refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan server.");
    } finally { setLoading(false); }
  };

  const handleClose = () => {
    setForm(initialState);
    setMarkerPos(defaultCenter);
    handleOpen(); 
  };

  const locationOptions = ["OFFICE", "HOTEL", "MALL", "MARKET", "SCHOOL_CAMPUS", "RT_RW", "PARK", "HOSPITAL", "OTHER"];

  return (
    <Dialog open={open} handler={handleClose} size="xl" className="rounded-xl max-h-[95vh] flex flex-col overflow-hidden">
      <DialogHeader className="flex justify-between items-center border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <CpuChipIcon className="h-6 w-6 text-blue-600" />
          </div>
          <Typography variant="h5" className="font-bold text-blue-gray-900">Tambah Unit AIoT Baru</Typography>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleClose}>
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="overflow-y-auto px-6 py-4 flex-grow custom-scrollbar bg-gray-50/20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* KOLOM KIRI: PETA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-green-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs">Lokasi Penempatan</Typography>
            </div>
            
            <div className="h-[350px] w-full rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-gray-100 z-0 relative">
              {open && (
                <MapContainer 
                  center={[markerPos.lat, markerPos.lng]} 
                  zoom={15} 
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapEvents />
                  {/* Marker Menggunakan customPinIcon Hasil Import Gambar */}
                  <Marker 
                    position={[markerPos.lat, markerPos.lng]} 
                    draggable={true}
                    icon={customPinIcon}
                    eventHandlers={markerEventHandlers}
                  />
                </MapContainer>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <Input label="Latitude" name="latitude" value={form.latitude} readOnly className="bg-white" />
               <Input label="Longitude" name="longitude" value={form.longitude} readOnly className="bg-white" />
            </div>
          </div>

          {/* KOLOM KANAN: FORM DATA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Informasi & Alamat</Typography>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Select 
                label="Pilih Area Wilayah" 
                value={form.areaId ? form.areaId.toString() : ""} 
                onChange={(v) => setForm({...form, areaId: v})}
                disabled={loadingAreas}
              >
                {areas.map((area) => <Option key={area.id} value={area.id.toString()}>{area.name}</Option>)}
              </Select>
              <Input label="Kode Mesin" name="machineCode" value={form.machineCode} onChange={handleChange} />
              <Input label="Nama Mesin" name="name" value={form.name} onChange={handleChange} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Kecamatan (Otomatis)" name="district" value={form.district} onChange={handleChange} />
                <Input label="Kelurahan (Otomatis)" name="subdistrict" value={form.subdistrict} onChange={handleChange} />
              </div>
              <Textarea label="Alamat Lengkap" name="address" rows={3} value={form.address} onChange={handleChange} />
            </div>
          </div>

          {/* SECTION BAWAH */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input label="Nama Tempat (Gedung/Toko)" name="placeName" value={form.placeName} onChange={handleChange} />
             <Select label="Kategori Lokasi" value={form.locationType} onChange={(v) => setForm({...form, locationType: v})}>
                {locationOptions.map((opt) => <Option key={opt} value={opt}>{opt.replace("_", " ")}</Option>)}
             </Select>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="border-t p-4 gap-2 bg-white">
        <Button variant="text" color="red" onClick={handleClose}>Batal</Button>
        <Button variant="gradient" color="blue" onClick={handleSubmit} disabled={loading} className="px-10">
          {loading ? <Spinner className="h-4 w-4" /> : "Simpan Mesin"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateModal;