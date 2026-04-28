import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MainLayout from "../MainLayout";
import EditMachineModal from "./EditMachineModal";
import { 
  Card, Typography, Button, Spinner, Progress, Chip 
} from "@material-tailwind/react";
import { 
  CpuChipIcon, ArrowPathIcon, PencilSquareIcon, MapPinIcon 
} from "@heroicons/react/24/outline";

const SmartContainerIndex = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  const token = localStorage.getItem("token");

  const fetchMachines = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/machines/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = response.data.data || [];
      setMachines(result);
    } catch (err) {
      console.error("Kesalahan pengambilan data:", err.response?.data?.message || err.message);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setMachines([]);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "OPERATING": return "green";
      case "BROKEN": return "red";
      case "MAINTENANCE": return "amber";
      default: return "blue-gray";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case "OPERATING": return "BEROPERASI";
      case "BROKEN": return "RUSAK";
      case "MAINTENANCE": return "PERBAIKAN";
      default: return "TIDAK DIKETAHUI";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8 pb-10">
        
        {/* HEADER - Nama Petugas & ID sudah dihapus */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2 mt-4">
          <div>
            <Typography variant="h3" className="text-blue-900 font-black flex items-center gap-3 text-2xl md:text-3xl uppercase">
              <CpuChipIcon className="h-10 w-10 text-blue-600" />
              Monitoring Unit AIoT
            </Typography>
            <Typography className="text-gray-500 font-medium text-sm mt-1 uppercase tracking-wider">
              Status Operasional Perangkat
            </Typography>
          </div>
          
          <Button 
            onClick={fetchMachines} 
            variant="outline"
            className="flex items-center gap-3 border-2 border-blue-600 text-blue-600 rounded-2xl normal-case py-3 px-6 font-black"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} /> Perbarui Data
          </Button>
        </div>

        {/* DAFTAR MESIN */}
        {loading ? (
          <div className="p-20 text-center">
            <Spinner className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <Typography className="animate-pulse font-bold text-blue-900">Mensinkronisasi...</Typography>
          </div>
        ) : machines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((item) => (
              <Card key={item.id} className="p-6 rounded-[2.5rem] border border-white bg-white/80 backdrop-blur-md shadow-xl shadow-blue-900/5">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <CpuChipIcon className="h-8 w-8" />
                  </div>
                  <Chip 
                    value={getStatusLabel(item.status)} 
                    color={getStatusColor(item.status)}
                    className="rounded-full"
                  />
                </div>

                <div className="mb-6">
                  <Typography className="text-[11px] font-black text-blue-600 uppercase tracking-widest italic">
                    Kode Unit: {item.machineCode}
                  </Typography>
                  <Typography variant="h5" className="text-blue-900 font-black uppercase">
                    {item.name}
                  </Typography>
                  <div className="flex items-center gap-1 mt-1 text-gray-500">
                    <MapPinIcon className="h-3 w-3" />
                    <Typography className="text-[12px] font-bold uppercase">
                      {item.placeName || "Lokasi Belum Diatur"}
                    </Typography>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-2xl mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <Typography className="text-[10px] font-black text-blue-800/60 uppercase">Beban Muatan</Typography>
                    <Typography className="text-xl font-black text-blue-900">{item.totalWeight || 0}%</Typography>
                  </div>
                  <Progress 
                    value={Number(item.totalWeight) || 0} 
                    color={item.totalWeight >= 90 ? "red" : "blue"} 
                    className="h-2"
                  />
                </div>

                <Button 
                  fullWidth 
                  color="blue" 
                  className="rounded-xl py-3 font-black shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  onClick={() => { setSelectedMachine(item); setOpenEdit(true); }}
                >
                  <PencilSquareIcon className="h-4 w-4" /> Perbarui Status
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-20 text-center rounded-[2.5rem] border-2 border-dashed border-gray-200 bg-gray-50/50">
             <Typography className="text-gray-400 italic font-medium uppercase tracking-widest text-sm">
                Tidak ada mesin yang ditugaskan untuk Anda.
             </Typography>
          </Card>
        )}
      </div>

      {selectedMachine && (
        <EditMachineModal 
          open={openEdit} 
          handleOpen={() => setOpenEdit(false)} 
          data={selectedMachine} 
          refreshData={fetchMachines} 
        />
      )}
    </MainLayout>
  );
};

export default SmartContainerIndex;