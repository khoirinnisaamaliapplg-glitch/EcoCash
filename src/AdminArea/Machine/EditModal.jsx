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

// --- IMPORT GAMBAR PIN KUSTOM (SAMA SEPERTI CREATE) ---
// Silakan ganti path di bawah ini dengan lokasi file gambar pin kamu yang sebenarnya
import pinImage from "../../assets/pin.png"; 
import shadowImage from "leaflet/dist/images/marker-shadow.png";

// Inisialisasi Icon menggunakan variabel gambar hasil import
const customPinIcon = L.icon({
  iconUrl: pinImage,
  shadowUrl: shadowImage,
  iconSize: [38, 38],       // Sesuaikan ukuran dimensi gambar pin [width, height] kamu
  iconAnchor: [19, 38],     // Titik tumpu bawah (setengah width, full height) agar pas di koordinat GPS
  popupAnchor: [0, -34],
  shadowSize: [41, 41]
});

const defaultCenter = { lat: -7.3333, lng: 108.2225 }; // Tasikmalaya

const EditModal = ({ open, handleOpen, data, refreshData }) => {
  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [markerPos, setMarkerPos] = useState(defaultCenter);

  // 1. REVERSE GEOCODING NOMINATIM
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

  // 2. HANDLER MAP EVENTS
  const MapEvents = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPos({ lat, lng });
        fetchAddressInfo(lat, lng);
      },
    });

    useEffect(() => {
      if (open && markerPos) {
        map.flyTo([markerPos.lat, markerPos.lng], map.getZoom());
      }
    }, [markerPos, map]);

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

  // 4. LOGIKA PIN GEOLOCATION & FALLBACK KE DEVICE GPS
  useEffect(() => {
    if (data && open) {
      const cleanId = parseInt(data.id);
      const machineLat = parseFloat(data.latitude);
      const machineLng = parseFloat(data.longitude);
      
      const hasValidCoords = !isNaN(machineLat) && machineLat !== 0 && !isNaN(machineLng) && machineLng !== 0;

      const initFormAndMarker = (lat, lng) => {
        setMarkerPos({ lat, lng });
        setFormData({
          id: cleanId,
          machineCode: data.machineCode || "",
          name: data.name || "",
          areaId: userData?.areaId || data.areaId?.toString() || "",
          machineType: data.machineType || "BOX",
          locationType: data.locationType || "OTHER",
          placeName: data.placeName || "",
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          address: data.address || "",
          district: data.district || "",
          subdistrict: data.subdistrict || "",
          description: data.description || "",
        });
      };

      if (hasValidCoords) {
        initFormAndMarker(machineLat, machineLng);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const currentDeviceLat = pos.coords.latitude;
            const currentDeviceLng = pos.coords.longitude;
            initFormAndMarker(currentDeviceLat, currentDeviceLng);
            fetchAddressInfo(currentDeviceLat, currentDeviceLng);
          },
          (err) => {
            initFormAndMarker(defaultCenter.lat, defaultCenter.lng);
            fetchAddressInfo(defaultCenter.lat, defaultCenter.lng);
          }
        );
      } else {
        initFormAndMarker(defaultCenter.lat, defaultCenter.lng);
        fetchAddressInfo(defaultCenter.lat, defaultCenter.lng);
      }
    }
  }, [data, open, fetchAddressInfo]);

  // 5. UPDATE DATA VIA PATCH
  const handleUpdate = async () => {
    if (!formData.id || isNaN(formData.id)) {
      toast.error("ID Mesin tidak valid.");
      return;
    }

    if (!formData.name?.trim()) {
      toast.warning("Nama tampilan mesin wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        machineCode: formData.machineCode?.trim().toUpperCase(),
        name: formData.name?.trim(),
        areaId: Number(formData.areaId),
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
      toast.success("Spesifikasi unit AIoT berhasil diperbarui!");
      handleOpen(); 
      if (refreshData) refreshData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal memperbarui data mesin.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const locationOptions = ["OFFICE", "HOTEL", "MALL", "MARKET", "SCHOOL_CAMPUS", "RT_RW", "PARK", "HOSPITAL", "OTHER"];

  return (
    <Dialog open={open} handler={handleOpen} size="xl" className="rounded-xl flex flex-col max-h-[95vh] overflow-hidden font-sans shadow-2xl">
      <DialogHeader className="flex justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <CpuChipIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <Typography variant="h5" className="font-bold text-blue-gray-900">
              Modifikasi Spesifikasi Unit AIoT
            </Typography>
            <Typography className="text-xs text-blue-600 font-black uppercase tracking-tight">
              Area Kontrol: {userData?.areaName || userData?.area?.name || "Wilayah Tugas"} (ID: {formData.areaId})
            </Typography>
          </div>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen}>
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="overflow-y-auto px-6 py-4 flex-grow bg-gray-50/20 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* KOLOM KIRI: MAP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-green-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Ubah Posisi Koordinat GPS</Typography>
            </div>
            
            <div className="h-[350px] w-full rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-gray-100 z-0 relative">
              {open && (
                <MapContainer 
                  center={[markerPos.lat, markerPos.lng]} 
                  zoom={15} 
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapEvents />
                  {/* MARKER MENGGUNAKAN ICON DARI HASIL IMPORT GAMBAR */}
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
              <Input label="Latitude (Otomatis)" name="latitude" value={formData.latitude || ""} readOnly className="bg-gray-50 font-mono text-xs" />
              <Input label="Longitude (Otomatis)" name="longitude" value={formData.longitude || ""} readOnly className="bg-gray-50 font-mono text-xs" />
            </div>
          </div>

          {/* KOLOM KANAN: FORM INFO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Informasi & Kategori Perangkat</Typography>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col">
                <Typography className="text-[10px] uppercase font-black text-blue-500 tracking-wider">Wilayah Terkunci Unit</Typography>
                <Typography className="text-sm font-black text-blue-900 mt-0.5">
                  {userData?.areaName || userData?.area?.name || "Wilayah Otoritas Anda"}
                </Typography>
              </div>

              <Input label="Kode Mesin (Unik)" name="machineCode" value={formData.machineCode || ""} onChange={handleChange} color="blue" />
              <Input label="Nama Tampilan Mesin" name="name" value={formData.name || ""} onChange={handleChange} color="blue" />
              
              <div className="grid grid-cols-2 gap-4">
                <Select label="Tipe Perangkat Sistem" value={formData.machineType || "BOX"} onChange={(v) => handleSelectChange("machineType", v)}>
                  <Option value="BOX">BOX SYSTEM</Option>
                  <Option value="CONTAINER">CONTAINER SYSTEM</Option>
                </Select>
                <Select label="Kategori Lokasi" value={formData.locationType || "OTHER"} onChange={(v) => handleSelectChange("locationType", v)}>
                  {locationOptions.map((opt) => (
                    <Option key={opt} value={opt}>{opt.replace("_", " ")}</Option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Kecamatan (Otomatis)" name="district" value={formData.district || ""} onChange={handleChange} />
                <Input label="Kelurahan (Otomatis)" name="subdistrict" value={formData.subdistrict || ""} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* LAYOUT ALAMAT */}
          <div className="lg:col-span-2 pt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Tempat (Gedung/Toko)" name="placeName" value={formData.placeName || ""} onChange={handleChange} />
            <Textarea label="Alamat Lengkap Unit" name="address" rows={1} value={formData.address || ""} onChange={handleChange} />
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 border-l-4 border-orange-400 pl-3 mb-3">
                <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Logistik Internal</Typography>
              </div>
              <Textarea label="Catatan Tambahan Kondisi Lapangan Unit" name="description" rows={2} value={formData.description || ""} onChange={handleChange} />
            </div>
          </div>

        </div>
      </DialogBody>

      <DialogFooter className="border-t border-gray-100 p-4 gap-2 bg-white">
        <Button variant="text" color="gray" onClick={handleOpen} disabled={loading} className="normal-case">
          Batal
        </Button>
        <Button 
          variant="gradient" 
          color="blue" 
          onClick={handleUpdate} 
          disabled={loading}
          className="px-10 normal-case flex items-center gap-2"
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Simpan Perubahan"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditModal;