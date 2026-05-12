import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import MainLayout from "../MainLayout";
import EditMachineModal from "./EditMachineModal";
// 1. IMPORT MODAL DETAIL OPERATOR
import DetailModalOperator from "./DetailModalOperator"; 
import { 
  Card, Typography, Button, Spinner, Progress, Chip 
} from "@material-tailwind/react";
import { 
  CpuChipIcon, ArrowPathIcon, PencilSquareIcon, MapPinIcon, EyeIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const SmartContainerIndex = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Edit (yang lama)
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  // 2. STATE UNTUK DETAIL (baru)
  const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const token = localStorage.getItem("token");

  const fetchMachines = useCallback(async (isManual = false) => {
    if (!token) return;
    setLoading(true);
    const loadToast = isManual ? toast.loading("Sinkronisasi data...") : null;

    try {
      const response = await api.get("/machines/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = response.data.data || [];
      setMachines(result);
      if (isManual) toast.success("Data berhasil diperbarui", { id: loadToast });
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      if (isManual) toast.error(`Gagal sinkronisasi: ${errMsg}`, { id: loadToast });
      else toast.error("Gagal memuat data mesin");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  // Fungsi pembuka modal detail
  const handleShowDetail = (item) => {
    setDetailData(item);
    setOpenDetail(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "OPERATING": return "green";
      case "BROKEN": return "red";
      case "MAINTENANCE": return "amber";
      default: return "blue-gray";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8 pb-10">
        {/* HEADER TETAP SAMA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2 mt-4">
          <div>
            <Typography variant="h3" className="text-blue-900 font-black flex items-center gap-3 text-2xl md:text-3xl uppercase italic">
              <CpuChipIcon className="h-10 w-10 text-blue-600" />
              Monitoring AIoT
            </Typography>
          </div>
          <Button 
            onClick={() => fetchMachines(true)} 
            className="flex items-center gap-3 bg-blue-600 rounded-2xl normal-case py-3 px-6 font-black"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} /> Sync Unit
          </Button>
        </div>

        {/* DAFTAR MESIN */}
        {loading && machines.length === 0 ? (
          <div className="p-20 text-center"><Spinner className="h-12 w-12 mx-auto text-blue-600" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((item) => (
              <Card key={item.id} className="p-6 rounded-[2.5rem] border border-white bg-white/80 shadow-xl overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                    <CpuChipIcon className="h-8 w-8" />
                  </div>
                  <Chip value={item.status || "UNKNOWN"} color={getStatusColor(item.status)} className="rounded-full" />
                </div>

                <div className="mb-6 cursor-pointer" onClick={() => handleShowDetail(item)}>
                  <Typography className="text-[11px] font-black text-blue-600 uppercase italic">Kode: {item.machineCode}</Typography>
                  <Typography variant="h5" className="text-blue-900 font-black uppercase group-hover:text-blue-600 transition-colors">{item.name}</Typography>
                  <div className="flex items-center gap-1 text-gray-500 italic"><MapPinIcon className="h-3 w-3" /><Typography className="text-[10px] font-bold uppercase">{item.placeName || "No Location"}</Typography></div>
                </div>

                {/* PROGRESS BAR */}
                <div className="bg-blue-50/50 p-4 rounded-2xl mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <Typography className="text-[10px] font-black text-blue-800 uppercase">Volume Sampah</Typography>
                    <Typography className="text-xl font-black text-blue-900">{item.totalWeight || 0}%</Typography>
                  </div>
                  <Progress value={Number(item.totalWeight) || 0} color={item.totalWeight >= 85 ? "red" : "blue"} className="h-2" />
                </div>

                {/* DUA TOMBOL: DETAIL & EDIT */}
                <div className="grid grid-cols-2 gap-3">
                    <Button 
                        variant="outlined"
                        className="rounded-xl py-3 border-2 border-blue-600 text-blue-600 font-black flex items-center justify-center gap-2 uppercase text-[10px]"
                        onClick={() => handleShowDetail(item)}
                    >
                        <EyeIcon className="h-4 w-4" /> Detail
                    </Button>
                    <Button 
                        className="rounded-xl py-3 bg-blue-600 font-black flex items-center justify-center gap-2 uppercase text-[10px]"
                        onClick={() => { setSelectedMachine(item); setOpenEdit(true); }}
                    >
                        <PencilSquareIcon className="h-4 w-4" /> Status
                    </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 3. KOMPONEN MODAL DETAIL OPERATOR */}
      <DetailModalOperator 
        open={openDetail} 
        handleOpen={() => setOpenDetail(false)} 
        data={detailData} 
      />

      {/* MODAL EDIT TETAP ADA */}
      {selectedMachine && (
        <EditMachineModal 
          open={openEdit} 
          handleOpen={() => setOpenEdit(false)} 
          data={selectedMachine} 
          refreshData={() => fetchMachines(false)} 
        />
      )}
    </MainLayout>
  );
};

export default SmartContainerIndex;