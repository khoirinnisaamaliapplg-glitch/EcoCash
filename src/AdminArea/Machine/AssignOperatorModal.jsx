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
import { XMarkIcon, UserGroupIcon, MapPinIcon, TrashIcon } from "@heroicons/react/24/outline";
import api from "../../utils/api"; 
import { toast } from "react-hot-toast";

const AssignOperatorModal = ({ open, handleOpen, machineData, refreshData }) => {
  const [operators, setOperators] = useState([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");

  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;

  // Mendapatkan area dari machineData atau fallback ke user yang login
  const currentAreaId = machineData?.areaId || machineData?.area_id || machineData?.area?.id || userData?.areaId;
  const hasExistingOperator = !!(machineData?.operatorId || machineData?.operator?.id);

  // 1. Fetch Operator yang tersedia
  useEffect(() => {
    if (open) {
      if (!currentAreaId) {
        setErrorInfo("Gagal memuat: Wilayah area tidak diketahui.");
        return;
      }

      const fetchOperators = async () => {
        setFetching(true);
        setErrorInfo("");
        try {
          const token = localStorage.getItem("token");
          const response = await api.get("/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const allUsers = response.data.data || response.data || [];
          
          if (Array.isArray(allUsers)) {
            const filtered = allUsers.filter(user => {
              const userRole = user.role?.toUpperCase();
              const userAreaId = user.areaId || user.area_id || user.area?.id;
              return userRole === "MACHINE_OPERATOR" && Number(userAreaId) === Number(currentAreaId);
            });
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
    
    // Sinkronisasi data operator bawaan mesin
    if (machineData?.operatorId) {
      setSelectedOperatorId(machineData.operatorId.toString());
    } else if (machineData?.operator?.id) {
      setSelectedOperatorId(machineData.operator.id.toString());
    } else {
      setSelectedOperatorId("");
    }
  }, [open, machineData, currentAreaId]);

  // 2. Fungsi Assign
  const handleAssign = async () => {
    if (!machineData?.id) return;
    if (!selectedOperatorId) {
      toast.error("Pilih operator terlebih dahulu!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Memperbarui operator mesin...");

    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/machines/${machineData.id}/assign-operator`,
        { operatorId: parseInt(selectedOperatorId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Operator berhasil ditugaskan!", { id: toastId });
      handleOpen(); 
      if (refreshData) refreshData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Gagal memperbarui operator.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // 3. Fungsi Unassign
  const handleUnassign = async () => {
    if (!machineData?.id) return;
    setLoading(true);
    const toastId = toast.loading("Melepas operator dari mesin...");

    try {
      const token = localStorage.getItem("token");
      await api.patch(`/machines/${machineData.id}/unassign-operator`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Operator berhasil dilepas dari mesin!", { id: toastId });
      handleOpen();
      if (refreshData) refreshData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Gagal melepas operator.";
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-1 font-bold">Target Mesin</Typography>
              <div className="p-2.5 bg-gray-50 rounded-xl border border-dashed border-gray-300 truncate text-xs font-bold text-gray-800">
                {machineData?.machineCode || "N/A"}
              </div>
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-1 font-bold">Wilayah</Typography>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 flex items-center gap-1 text-xs font-bold truncate">
                <MapPinIcon className="h-3 w-3 flex-shrink-0" />
                {machineData?.area?.name || "No Area"}
              </div>
            </div>
          </div>

          {hasExistingOperator && (machineData?.operator?.name || machineData?.operatorName) && (
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/70">
              <Typography variant="small" color="blue-gray" className="font-semibold text-[11px] uppercase tracking-wider text-blue-500 mb-0.5">
                Operator Saat Ini
              </Typography>
              <Typography variant="small" color="blue-gray" className="font-bold text-gray-800">
                {machineData.operator?.name || machineData.operatorName}
              </Typography>
            </div>
          )}

          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-bold">Pilih Operator Baru</Typography>
            {fetching ? (
              <div className="flex justify-center p-4"><Spinner color="blue" /></div>
            ) : errorInfo ? (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-center">
                 <Typography className="text-[11px] text-red-700 font-medium">{errorInfo}</Typography>
              </div>
            ) : operators.length > 0 ? (
              <Select 
                key={selectedOperatorId}
                label="Daftar Operator" 
                value={selectedOperatorId} 
                onChange={(v) => setSelectedOperatorId(v || "")}
                color="blue"
              >
                {operators.map((op) => (
                  <Option key={op.id.toString()} value={op.id.toString()}>
                    {op.name}
                  </Option>
                ))}
              </Select>
            ) : (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-center">
                 <Typography className="text-[11px] text-orange-700 italic">
                   Tidak ditemukan operator di Area ID: {currentAreaId || "Kosong"}
                 </Typography>
              </div>
            )}
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="border-t border-gray-100 p-4 flex justify-between items-center gap-2">
        <div>
          {hasExistingOperator ? (
            <Button variant="text" color="red" onClick={handleUnassign} disabled={loading} className="flex items-center gap-1.5 normal-case px-3">
              <TrashIcon className="h-4 w-4" /> Lepas Operator
            </Button>
          ) : (
            <Button variant="text" color="blue-gray" onClick={handleOpen} disabled={loading} className="normal-case">Batal</Button>
          )}
        </div>
        <div className="flex gap-2">
          {hasExistingOperator && (
            <Button variant="text" color="blue-gray" onClick={handleOpen} disabled={loading} className="normal-case">Batal</Button>
          )}
          <Button 
            variant="gradient" 
            color="blue" 
            onClick={handleAssign} 
            disabled={loading || fetching || !selectedOperatorId}
            className="flex items-center gap-2 normal-case"
          >
            {loading ? <Spinner className="h-4 w-4" /> : "Simpan Perubahan"}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};

export default AssignOperatorModal;