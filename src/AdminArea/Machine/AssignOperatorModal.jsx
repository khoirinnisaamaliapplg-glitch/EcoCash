import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  IconButton,
  Select,
  Option,
  Spinner,
} from "@material-tailwind/react";
import { XMarkIcon, UserGroupIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";

const AssignOperatorModal = ({ open, handleOpen, machineData, refreshData }) => {
  const [operators, setOperators] = useState([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorInfo, setErrorInfo] = useState("");

  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;

  // 1. Fetch Operator yang tersedia di area yang sama
  useEffect(() => {
    if (open && userData?.areaId) {
      const fetchOperators = async () => {
        setFetching(true);
        setErrorInfo("");
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`http://localhost:3000/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Menangani struktur response backend (response.data.data)
          const allUsers = response.data.data || [];
          
          if (Array.isArray(allUsers)) {
            // Filter hanya MACHINE_OPERATOR dan yang satu Area ID
            const filtered = allUsers.filter(user => 
              user.role === "MACHINE_OPERATOR" && 
              Number(user.areaId) === Number(userData.areaId)
            );
            setOperators(filtered);
          }
        } catch (err) {
          console.error("Gagal ambil operator:", err);
          if (err.response?.status === 403) {
            setErrorInfo("Akses Ditolak: Anda tidak punya izin melihat daftar user.");
          } else {
            setErrorInfo("Gagal memuat data petugas.");
          }
        } finally {
          setFetching(false);
        }
      };
      fetchOperators();
    }
    
    // Set default select jika mesin sudah punya operator sebelumnya
    if (machineData?.operatorId) {
      setSelectedOperatorId(machineData.operatorId.toString());
    } else {
      setSelectedOperatorId("");
    }
  }, [open, machineData, userData?.areaId]);

  // 2. Fungsi Assign menggunakan PATCH dengan ID Mesin Dinamis
  const handleAssign = async () => {
    // Validasi: Harus ada operator terpilih dan ID Mesin harus valid
    if (!selectedOperatorId || !machineData?.id) {
      alert("Pilih operator terlebih dahulu!");
      return;
    };

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Sesuai instruksi backend: /api/machines/{id}/assign-operator
      await axios.patch(
        `http://localhost:3000/api/machines/${machineData.id}/assign-operator`,
        { operatorId: parseInt(selectedOperatorId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus("success");
      
      // Beri jeda 1.5 detik agar user bisa melihat feedback "Berhasil"
      setTimeout(() => {
        setStatus(null);
        handleOpen(); // Tutup Modal
        if (refreshData) refreshData(); // Refresh tabel mesin di halaman utama
      }, 1500);
    } catch (error) {
      console.error("Patch Error:", error.response?.data);
      alert(error.response?.data?.message || "Gagal memperbarui operator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={handleOpen} size="xs" className="rounded-2xl">
      <DialogHeader className="flex justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
          </div>
          <Typography variant="h5" color="blue-gray">Assign Operator</Typography>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen}>
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="px-6 py-8">
        {status === "success" ? (
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mb-2" />
            <Typography variant="h5" color="green">Berhasil Disimpan!</Typography>
            <Typography className="text-sm text-gray-500">Operator mesin telah diperbarui.</Typography>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Info Mesin yang dipilih */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-1 font-bold">Mesin Terpilih</Typography>
              <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Typography className="text-sm font-bold text-blue-900">{machineData?.machineCode || "Tanpa Kode"}</Typography>
                <Typography className="text-xs text-gray-600">{machineData?.name || "Unit Mesin"}</Typography>
              </div>
            </div>

            {/* Dropdown Pemilihan Operator */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-bold">Pilih Petugas Lapangan</Typography>
              
              {fetching ? (
                <div className="flex justify-center p-4"><Spinner color="blue" /></div>
              ) : errorInfo ? (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-center">
                   <Typography className="text-[11px] text-red-700">{errorInfo}</Typography>
                </div>
              ) : operators.length > 0 ? (
                <Select 
                  label="Daftar Operator" 
                  value={selectedOperatorId} 
                  onChange={(v) => setSelectedOperatorId(v)}
                  color="blue"
                >
                  {operators.map((op) => (
                    <Option key={op.id} value={op.id.toString()}>
                      {op.name}
                    </Option>
                  ))}
                </Select>
              ) : (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-center">
                   <Typography className="text-[11px] text-orange-700 italic">
                     Tidak ditemukan operator di Area ID: {userData?.areaId}
                   </Typography>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="border-t border-gray-100 p-4 gap-2">
        <Button variant="text" color="red" onClick={handleOpen} className="normal-case">Batal</Button>
        <Button 
          variant="gradient" 
          color="blue" 
          onClick={handleAssign} 
          disabled={loading || !selectedOperatorId || operators.length === 0 || status === "success"}
          className="flex items-center gap-2 normal-case"
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Simpan Perubahan"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AssignOperatorModal;