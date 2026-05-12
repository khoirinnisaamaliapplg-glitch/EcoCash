import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import { 
  Dialog, DialogHeader, DialogBody, DialogFooter, 
  Input, Button, Typography, Textarea, Spinner, IconButton
} from "@material-tailwind/react";
import { XMarkIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// Gunakan variabel yang sama dengan yang ada di MachineModal agar tidak error
const GOOGLE_MAPS_API_KEY = "MASUKKAN_API_KEY_ASLI_KAMU_DISINI"; 
const LIBRARIES = ['places'];
const defaultCenter = { lat: -7.3333, lng: 108.2225 }; // Tasikmalaya

const CreateStoreModal = ({ open, handleOpen, onSuccess }) => {
  const initialState = {
    name: "", address: "", district: "", subdistrict: "",
    latitude: "", longitude: "", areaId: "",
    admin: { name: "", username: "", email: "", password: "", phoneNumber: "" }
  };

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [markerPos, setMarkerPos] = useState(defaultCenter);

  // 1. LOAD GOOGLE MAPS
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // 2. REVERSE GEOCODING (Ambil data alamat dari koordinat)
  const fetchAddressInfo = useCallback((lat, lng) => {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const addrComponents = results[0].address_components;
        let subdistrict = "";
        let district = "";

        addrComponents.forEach(comp => {
          if (comp.types.includes("administrative_area_level_3")) district = comp.long_name;
          if (comp.types.includes("administrative_area_level_4")) subdistrict = comp.long_name;
        });

        setFormData(prev => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          address: results[0].formatted_address,
          district: district || prev.district,
          subdistrict: subdistrict || prev.subdistrict
        }));
      }
    });
  }, []);

  const onMapClick = useCallback((e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setMarkerPos({ lat: newLat, lng: newLng });
    fetchAddressInfo(newLat, newLng);
  }, [fetchAddressInfo]);

  // 3. SET LOKASI AWAL (GPS)
  useEffect(() => {
    if (open && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMarkerPos(userPos);
        fetchAddressInfo(userPos.lat, userPos.lng);
      });
    }
  }, [open, fetchAddressInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("admin.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        admin: { ...prev.admin, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.areaId || !formData.admin.email) {
      toast.warn("Mohon isi: Nama Toko, ID Area, dan Email Admin");
      return;
    }

    const payload = {
      ...formData,
      areaId: Number(formData.areaId),
      latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0,
      admin: {
        ...formData.admin,
        username: formData.admin.username.toLowerCase().trim(),
        email: formData.admin.email.toLowerCase().trim(),
      }
    };

    setLoading(true);
    try {
      await api.post("/stores", payload);
      toast.success("Toko berhasil ditambahkan!");
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menambah toko");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialState);
    handleOpen();
  };

  return (
    <Dialog open={open} handler={handleClose} size="xl" className="rounded-xl flex flex-col max-h-[95vh] overflow-hidden">
      <DialogHeader className="px-8 pt-6 flex justify-between items-center border-b">
        <Typography variant="h5" color="blue-gray" className="font-black">
          Tambah Unit Toko Baru
        </Typography>
        <IconButton variant="text" color="blue-gray" onClick={handleClose}>
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="px-8 py-4 space-y-6 overflow-y-auto flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* BAGIAN KIRI: MAPS */}
          <div className="space-y-4">
            <Typography className="font-bold text-blue-600 border-l-4 border-blue-600 pl-2 text-xs uppercase italic">
              Titik Lokasi Toko
            </Typography>
            <div className="h-[300px] w-full rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={markerPos}
                  zoom={15}
                  onClick={onMapClick}
                >
                  <Marker position={markerPos} draggable onDragEnd={onMapClick} />
                </GoogleMap>
              ) : <div className="h-full w-full bg-gray-50 flex items-center justify-center italic">Memuat Peta...</div>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Latitude" name="latitude" value={formData.latitude} readOnly />
              <Input label="Longitude" name="longitude" value={formData.longitude} readOnly />
            </div>
          </div>

          {/* BAGIAN KANAN: FORM INFO TOKO */}
          <div className="space-y-4">
            <Typography className="font-bold text-blue-600 border-l-4 border-blue-600 pl-2 text-xs uppercase italic">
              Informasi Alamat
            </Typography>
            <Input label="Nama Toko" name="name" value={formData.name} onChange={handleChange} />
            <Input label="ID Area (Angka)" name="areaId" type="number" value={formData.areaId} onChange={handleChange} />
            
            <div className="grid grid-cols-2 gap-4">
              <Input label="Kecamatan (Otomatis)" name="district" value={formData.district} onChange={handleChange} />
              <Input label="Kelurahan (Otomatis)" name="subdistrict" value={formData.subdistrict} onChange={handleChange} />
            </div>
            <Textarea label="Alamat Lengkap (Otomatis)" name="address" rows={2} value={formData.address} onChange={handleChange} />
          </div>
        </div>

        {/* AKUN ADMIN TOKO */}
        <div className="space-y-4 pt-4 border-t">
          <Typography className="font-bold text-green-600 border-l-4 border-green-600 pl-2 text-xs uppercase italic">
            Registrasi Akun Admin Toko
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Lengkap Admin" name="admin.name" value={formData.admin.name} onChange={handleChange} />
            <Input label="Nomor WhatsApp" name="admin.phoneNumber" value={formData.admin.phoneNumber} onChange={handleChange} />
            <Input label="Username" name="admin.username" value={formData.admin.username} onChange={handleChange} />
            <Input label="Email Admin" name="admin.email" type="email" value={formData.admin.email} onChange={handleChange} />
            <div className="md:col-span-2">
              <Input label="Password Akun" name="admin.password" type="password" value={formData.admin.password} onChange={handleChange} />
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="px-8 pb-6 gap-3 border-t bg-gray-50/50">
        <Button variant="text" color="red" onClick={handleClose}>Batal</Button>
        <Button 
          className="bg-blue-700 px-10 rounded-full font-bold shadow-lg" 
          onClick={handleSubmit} 
          loading={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Toko"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateStoreModal;