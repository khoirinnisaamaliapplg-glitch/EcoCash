import React, { useState, useEffect } from "react";
import {
  Dialog, DialogHeader, DialogBody, DialogFooter,
  Input, Button, Typography, IconButton, Textarea, Spinner, Select, Option,
} from "@material-tailwind/react";
import { 
  XMarkIcon, CheckCircleIcon, XCircleIcon, 
  CpuChipIcon 
} from "@heroicons/react/24/outline";
import axios from "axios";

const CreateModal = ({ open, handleOpen, refreshData }) => {
  const initialState = {
    machineCode: "",
    name: "",
    areaId: "",
    machineType: "BOX",
    locationType: "OTHER",
    latitude: "",
    longitude: "",
    district: "",
    subdistrict: "",
    address: "",
    placeName: "",
    description: "",
  };

  const [form, setForm] = useState(initialState);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorDetails, setErrorDetails] = useState("");

  // Ambil data area untuk dropdown
  useEffect(() => {
    if (open) {
      const fetchAreas = async () => {
        try {
          setLoadingAreas(true);
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:3000/api/areas", {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Pastikan hanya mengambil area yang aktif
          const areaData = response.data.data || response.data;
          setAreas(Array.isArray(areaData) ? areaData.filter(a => a.isActive) : []);
        } catch (err) {
          console.error("Gagal load area:", err);
        } finally {
          setLoadingAreas(false);
        }
      };
      fetchAreas();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    // Validasi Dasar (Sesuai requirement Backend)
    if (!form.machineCode.trim() || !form.name.trim() || !form.areaId) {
      alert("Harap isi kolom wajib (Machine Code, Name, Area)");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Sinkronisasi tipe data dengan Controller Express
      const payload = {
        ...form,
        machineCode: form.machineCode.trim().toUpperCase(),
        name: form.name.trim(),
        areaId: Number(form.areaId),
        // Pastikan latitude/longitude dikirim sebagai number/string yang valid untuk Prisma.Decimal
        latitude: form.latitude ? parseFloat(form.latitude) : 0,
        longitude: form.longitude ? parseFloat(form.longitude) : 0,
      };

      const response = await axios.post("http://localhost:3000/api/machines/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        setStatus("success");
        setTimeout(() => { 
          handleClose(); 
          if (refreshData) refreshData(); 
        }, 1500);
      }
    } catch (error) {
      setStatus("error");
      // Menangkap pesan error spesifik dari backend (misal: "Machine code already exists")
      setErrorDetails(error.response?.data?.message || "Gagal menyimpan data ke server.");
    } finally { 
      setLoading(false); 
    }
  };

  const handleClose = () => {
    setForm(initialState);
    setStatus(null);
    setErrorDetails("");
    handleOpen(); // Menutup modal melalui props parent
  };

  const locationOptions = ["OFFICE", "HOTEL", "MALL", "MARKET", "SCHOOL_CAMPUS", "RT_RW", "PARK", "HOSPITAL", "OTHER"];

  return (
    <Dialog 
      open={open} 
      handler={handleClose} 
      size="xl" 
      className="rounded-xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col"
    >
      <DialogHeader className="flex justify-between items-center border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <CpuChipIcon className="h-6 w-6 text-blue-600" />
          </div>
          <Typography variant="h5" color="blue-gray" className="font-bold">
            Add New Machine
          </Typography>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleClose}>
          <XMarkIcon className="h-5 w-5" strokeWidth={2} />
        </IconButton>
      </DialogHeader>

      <DialogBody className="overflow-y-auto px-6 py-4 flex-grow custom-scrollbar">
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4" />
            <Typography variant="h4" className="text-green-700 font-bold">Machine Created!</Typography>
            <Typography className="text-gray-500">Database has been updated successfully.</Typography>
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <XCircleIcon className="h-20 w-20 text-red-500 mb-4" />
            <Typography variant="h5" color="red" className="font-bold">Registration Failed</Typography>
            <Typography color="red" className="mt-2">{errorDetails}</Typography>
            <Button variant="outlined" color="red" onClick={() => setStatus(null)} className="mt-6">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLUMN 1: UNIT INFO */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Unit Information</Typography>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Select 
                  label="Select Area" 
                  value={form.areaId.toString()} 
                  onChange={(v) => handleSelectChange("areaId", v)}
                  disabled={loadingAreas}
                >
                  {areas.length > 0 ? areas.map((area) => (
                    <Option key={area.id} value={area.id.toString()}>{area.name}</Option>
                  )) : (
                    <Option disabled>No Active Area Found</Option>
                  )}
                </Select>
                <Input label="Machine Code (e.g. MC-01)" name="machineCode" value={form.machineCode} onChange={handleChange} />
                <Input label="Machine Name" name="name" value={form.name} onChange={handleChange} />
                <Select label="Machine Type" value={form.machineType} onChange={(v) => handleSelectChange("machineType", v)}>
                  <Option value="BOX">BOX</Option>
                  <Option value="CONTAINER">CONTAINER</Option>
                </Select>
              </div>
            </div>

            {/* COLUMN 2: LOCATION */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-l-4 border-green-500 pl-3">
                <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Placement Details</Typography>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Place Name (Building/Spot)" name="placeName" value={form.placeName} onChange={handleChange} />
                  <Select label="Location Category" value={form.locationType} onChange={(v) => handleSelectChange("locationType", v)}>
                    {locationOptions.map((opt) => (
                      <Option key={opt} value={opt}>{opt.replace("_", " ")}</Option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Latitude" name="latitude" type="number" value={form.latitude} onChange={handleChange} />
                  <Input label="Longitude" name="longitude" type="number" value={form.longitude} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="District (Kecamatan)" name="district" value={form.district} onChange={handleChange} />
                  <Input label="Subdistrict (Kelurahan)" name="subdistrict" value={form.subdistrict} onChange={handleChange} />
                </div>
                <Textarea label="Full Address" name="address" rows={2} value={form.address} onChange={handleChange} />
              </div>
            </div>

            {/* FULL WIDTH SECTION */}
            <div className="lg:col-span-2 pt-2">
              <div className="flex items-center gap-2 border-l-4 border-orange-400 pl-3 mb-4">
                <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">Internal Notes</Typography>
              </div>
              <Textarea label="Machine Description" name="description" rows={2} value={form.description} onChange={handleChange} />
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="border-t border-gray-100 p-4 gap-2 flex-col sm:flex-row">
        {!status && (
          <>
            <Button variant="text" color="gray" onClick={handleClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              variant="gradient" 
              color="blue" 
              onClick={handleSubmit} 
              disabled={loading} 
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              {loading ? <Spinner className="h-4 w-4" /> : "Save Machine"}
            </Button>
          </>
        )}
      </DialogFooter>
    </Dialog>
  );
};

export default CreateModal;