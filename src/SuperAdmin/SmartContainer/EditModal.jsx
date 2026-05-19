import React, { useEffect, useState, useCallback, useMemo } from "react";
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

// Inisialisasi Kustom Pin Icon menggunakan gambar kustom pilihan Anda
const customPinIcon = L.icon({
  iconUrl: pinImage,
  shadowUrl: shadowImage,
  iconSize: [38, 38],       // Dimensi ukuran gambar [lebar, tinggi]
  iconAnchor: [19, 38],     // Titik tumpu bawah (setengah lebar, tinggi penuh) agar presisi dengan koordinat GPS
  popupAnchor: [0, -34],
  shadowSize: [41, 41]
});

const defaultCenter = { lat: -7.3333, lng: 108.2225 }; // Tasikmalaya

const EditModal = ({ open, handleOpen, data, refreshData }) => {
  const [formData, setFormData] = useState({});
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  
  // State untuk mengontrol posisi koordinat marker pada peta OSM
  const [markerPos, setMarkerPos] = useState(defaultCenter);

  // 1. REVERSE GEOCODING MENGGUNAKAN NOMINATIM (OSM FREE API)
  const fetchAddressInfo = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (!response.ok) throw new Error("Gagal mengambil data alamat");
      
      const resData = await response.json();
      
      if (resData && resData.address) {
        const district = resData.address.subdistrict || resData.address.city_district || ""; 
        const subdistrict = resData.address.village || resData.address.suburb || resData.address.neighbourhood || ""; 
        const fullAddress = resData.display_name || "";

        setFormData(prev => ({
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
      setFormData(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }));
    }
  }, []);

  // 2. HANDLER MAP EVENTS (KLIK & UPDATE CENTER)
  const MapEvents = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPos({ lat, lng });
        fetchAddressInfo(lat, lng);
      },
    });

    // Efek agar peta otomatis pindah fokus (flyTo) saat koordinat data masuk pertama kali
    useEffect(() => {
      if (open && markerPos) {
        map.flyTo([markerPos.lat, markerPos.lng], map.getZoom());
      }
    }, [markerPos, map]);

    return null;
  };

  // 3. HANDLER GESER/DRAG MARKER
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

  // 4. SET FORM DATA DAN SIMPAN POSISI MARKER AWAL SAAT MODAL DIBUKA
  useEffect(() => {
    if (data && open) {
      const cleanId = parseInt(data.id);
      const initialLat = parseFloat(data.latitude) || defaultCenter.lat;
      const initialLng = parseFloat(data.longitude) || defaultCenter.lng;

      setMarkerPos({ lat: initialLat, lng: initialLng });
      
      setFormData({
        id: cleanId,
        machineCode: data.machineCode || "",
        name: data.name || "",
        areaId: data.areaId?.toString() || "",
        machineType: data.machineType || "BOX",
        locationType: data.locationType || "OTHER",
        placeName: data.placeName || "",
        latitude: initialLat.toString(),
        longitude: initialLng.toString(),
        address: data.address || "",
        district: data.district || "",
        subdistrict: data.subdistrict || "",
        description: data.description || "",
      });
    }
  }, [data, open]);

  // 5. LOAD LIST AREAS
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
          toast.error("Gagal memuat daftar area.");
        } finally {
          setLoadingAreas(false);
        }
      };
      fetchAreas();
    }
  }, [open]);

  // 6. SUBMIT PERUBAHAN KE BACKEND
  const handleUpdate = async () => {
    if (!formData.id || isNaN(formData.id)) {
      toast.error("ID Unit tidak valid.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        machineCode: formData.machineCode?.trim().toUpperCase(),
        name: formData.name?.trim(),
        areaId: parseInt(formData.areaId),
        machineType: formData.machineType,
        locationType: formData.locationType,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        address: formData.address,
        placeName: formData.placeName,
        district: formData.district,
        subdistrict: formData.subdistrict,
        description: formData.description
      };

      await api.patch(`/machines/${formData.id}`, payload);

      toast.success("Perubahan berhasil disimpan!");
      handleOpen(); 
      if (refreshData) refreshData();
    } catch (error) {
      console.error("PATCH ERROR:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || "Gagal memperbarui data unit AIoT.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const locationOptions = ["OFFICE", "HOTEL", "MALL", "MARKET", "SCHOOL_CAMPUS", "RT_RW", "PARK", "HOSPITAL", "OTHER"];

  return (
    <Dialog open={open} handler={handleOpen} size="xl" className="rounded-xl flex flex-col max-h-[95vh] overflow-hidden">
      <DialogHeader className="flex justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <CpuChipIcon className="h-6 w-6 text-blue-600" />
          <Typography variant="h5" className="font-bold text-blue-gray-900">
            Edit Unit AIoT: {formData.machineCode}
          </Typography>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen}>
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="overflow-y-auto px-6 py-4 flex-grow bg-gray-50/20 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* KOLOM KIRI: PETA OPENSTREETMAP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-green-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs">Ubah Posisi Koordinat</Typography>
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
                  {/* Marker Menggunakan customPinIcon Kustom Hasil Gambar Anda */}
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
              <Input label="Latitude" name="latitude" value={formData.latitude || ""} readOnly className="bg-white" />
              <Input label="Longitude" name="longitude" value={formData.longitude || ""} readOnly className="bg-white" />
            </div>
          </div>

          {/* KOLOM KANAN: FORM DATA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Informasi & Alamat</Typography>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Select 
                label="Area" 
                value={formData.areaId || ""} 
                onChange={(v) => setFormData(p => ({...p, areaId: v}))}
                disabled={loadingAreas}
              >
                {areas.map(a => <Option key={a.id} value={a.id.toString()}>{a.name}</Option>)}
              </Select>
              <Input label="Kode Mesin" name="machineCode" value={formData.machineCode || ""} onChange={handleChange} />
              <Input label="Nama Mesin" name="name" value={formData.name || ""} onChange={handleChange} />
              
              <div className="grid grid-cols-2 gap-4">
                <Select label="Tipe Mesin" value={formData.machineType || "BOX"} onChange={(v) => setFormData(p => ({...p, machineType: v}))}>
                  <Option value="BOX">BOX</Option>
                  <Option value="CONTAINER">CONTAINER</Option>
                </Select>
                <Select label="Kategori Lokasi" value={formData.locationType || "OTHER"} onChange={(v) => setFormData(p => ({...p, locationType: v}))}>
                  {locationOptions.map((opt) => <Option key={opt} value={opt}>{opt.replace("_", " ")}</Option>)}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Kecamatan (Otomatis)" name="district" value={formData.district || ""} onChange={handleChange} />
                <Input label="Kelurahan (Otomatis)" name="subdistrict" value={formData.subdistrict || ""} onChange={handleChange} />
              </div>
              
              <Input label="Nama Tempat (Gedung/Toko)" name="placeName" value={formData.placeName || ""} onChange={handleChange} />
              <Textarea label="Alamat Lengkap" name="address" rows={2} value={formData.address || ""} onChange={handleChange} />
            </div>
          </div>

        </div>
      </DialogBody>

      <DialogFooter className="border-t p-4 gap-2 bg-white">
        <Button variant="text" color="red" onClick={handleOpen}>Batal</Button>
        <Button 
          variant="gradient" 
          color="blue" 
          onClick={handleUpdate} 
          disabled={loading}
          className="px-10"
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Simpan Perubahan"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditModal;