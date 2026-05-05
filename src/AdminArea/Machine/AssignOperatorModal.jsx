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
import { XMarkIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import axios from "axios";
// 1. Import toast
import { toast } from "react-hot-toast";

const AssignOperatorModal = ({ open, handleOpen, machineData, refreshData }) => {
  const [operators, setOperators] = useState([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");

  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;

  // 1. Fetch Operator yang tersedia
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

          const allUsers = response.data.data || [];
          
          if (Array.isArray(allUsers)) {
            const filtered = allUsers.filter(user => 
              user.role === "MACHINE_OPERATOR" && 
              Number(user.areaId) === Number(userData.areaId)
            );
            setOperators(filtered);
          }
        } catch (err) {
          console.error("Gagal ambil operator:", err);
          const msg = err.response?.status === 403 
            ? "Akses Ditolak: Izin melihat user tidak ada." 
            : "Gagal memuat data petugas.";
          setErrorInfo(msg);
          toast.error(msg);
        } finally {
          setFetching(false);
        }
      };
      fetchOperators();
    }
    
    if (machineData?.operatorId) {
      setSelectedOperatorId(machineData.operatorId.toString());
    } else {
      setSelectedOperatorId("");
    }
  }, [open, machineData, userData?.areaId]);

  // 2. Fungsi Assign
  const handleAssign = async () => {
    if (!selectedOperatorId || !machineData?.id) {
      toast.error("Pilih operator terlebih dahulu!");
      return;
    };

    setLoading(true);
    // 2. Loading Toast
    const toastId = toast.loading("Memperbarui operator mesin...");

    try {
      const token = localStorage.getItem("token");
      
      await axios.patch(
        `http://localhost:3000/api/machines/${machineData.id}/assign-operator`,
        { operatorId: parseInt(selectedOperatorId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 3. Success Toast
      toast.success("Operator berhasil ditugaskan!", { id: toastId });
      
      handleOpen(); 
      if (refreshData) refreshData();
    } catch (error) {
      console.error("Patch Error:", error.response?.data);
      const errorMsg = error.response?.data?.message || "Gagal memperbarui operator.";
      // 4. Error Toast
      toast.error(errorMsg, { id: toastId });
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
        <div className="space-y-6">
          {/* Info Mesin */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-1 font-bold">Mesin Terpilih</Typography>
            <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Typography className="text-sm font-bold text-blue-900">{machineData?.machineCode || "Tanpa Kode"}</Typography>
              <Typography className="text-xs text-gray-600">{machineData?.name || "Unit Mesin"}</Typography>
            </div>
          </div>

          {/* Dropdown Operator */}
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
      </DialogBody>

      <DialogFooter className="border-t border-gray-100 p-4 gap-2">
        <Button variant="text" color="red" onClick={handleOpen} disabled={loading} className="normal-case">Batal</Button>
        <Button 
          variant="gradient" 
          color="blue" 
          onClick={handleAssign} 
          disabled={loading || !selectedOperatorId || operators.length === 0}
          className="flex items-center gap-2 normal-case"
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Simpan Perubahan"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AssignOperatorModal;