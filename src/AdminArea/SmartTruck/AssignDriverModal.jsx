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
import { XMarkIcon, UserPlusIcon, MapPinIcon, TrashIcon } from "@heroicons/react/24/outline";
import api from "../../utils/api"; 
import { toast } from "react-hot-toast";

const AssignDriverModal = ({ open, handleOpen, data, onRefresh }) => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");

  // Ambil data session user dari localStorage untuk sinkronisasi Area ID
  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;
  
  // Ambil ID area dari data truk yang dipilih, atau fallback ke area admin yang login
  const currentAreaId = data?.areaId || data?.area_id || data?.area?.id || userData?.areaId;

  // Cek apakah truk ini dari awal sudah memiliki driver terpasang
  const hasExistingDriver = !!(data?.driverId || data?.driver?.id);

  // 1. Ambil daftar driver aktif sewilayah tugas saat modal dibuka
  useEffect(() => {
    if (open) {
      if (!currentAreaId) {
        setErrorInfo("Gagal memuat: Wilayah area tidak diketahui.");
        return;
      }

      const fetchAvailableDrivers = async () => {
        setFetching(true);
        setErrorInfo("");
        try {
          const token = localStorage.getItem("token");
          
          // Memanggil API users lewat /admin/users
          const response = await api.get("/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const allUsers = response?.data?.data || response?.data || [];
          
          if (Array.isArray(allUsers)) {
            // Filter ketat di frontend untuk memastikan role & kesamaan wilayah tugas
            const filtered = allUsers.filter(user => {
              const userRole = user.role?.toUpperCase();
              const userAreaId = user.areaId || user.area_id || user.area?.id;

              return (
                userRole === "TRUCK_DRIVER" &&
                Number(userAreaId) === Number(currentAreaId)
              );
            });
            setDrivers(filtered);
          } else {
            setDrivers([]);
          }
        } catch (err) {
          console.error("Gagal mengambil data TRUCK_DRIVER:", err);
          const msg = err.response?.status === 403 
            ? "Akses Ditolak: Anda tidak memiliki akses data user." 
            : "Gagal memuat data pengemudi armada.";
          setErrorInfo(msg);
          toast.error(msg);
        } finally {
          setFetching(false);
        }
      };

      fetchAvailableDrivers();
    }
    
    // Sinkronisasi data driver bawaan truk saat modal dibuka
    if (data?.driverId) {
      setSelectedDriverId(data.driverId.toString());
    } else if (data?.driver?.id) {
      setSelectedDriverId(data.driver.id.toString());
    } else {
      setSelectedDriverId("");
    }
  }, [open, data, currentAreaId]);

  // 2. Fungsi Utama untuk Assign Driver (Tombol Biru)
  const handleAssign = async () => {
    if (!data?.id) return;
    if (!selectedDriverId) {
      toast.error("Silakan pilih pengemudi terlebih dahulu.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Menugaskan pengemudi armada...");

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payloadId = Number(selectedDriverId);
        
      // Sesuai dokumentasi PATCH /trucks/{id}/assign-driver
      await api.patch(`/trucks/${data.id}/assign-driver`, { driverId: payloadId }, { headers });
      toast.success("Driver berhasil ditugaskan!", { id: toastId });
      
      handleOpen(); 
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Assign Driver Error:", error.response?.data);
      const errorMsg = error.response?.data?.message || "Gagal memperbarui driver armada.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // 3. Fungsi Khusus untuk Unassign/Lepas Driver (Tombol Merah Trash)
  const handleUnassign = async () => {
    if (!data?.id) return;

    setLoading(true);
    const toastId = toast.loading("Melepas pengemudi dari armada...");

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Sesuai dokumentasi PATCH /trucks/{id}/unassign-driver
      await api.patch(`/trucks/${data.id}/unassign-driver`, {}, { headers });
      toast.success("Driver berhasil dilepas dari armada!", { id: toastId });
      
      handleOpen(); 
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Unassign Driver Error:", error.response?.data);
      const errorMsg = error.response?.data?.message || "Gagal melepas driver dari armada.";
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
            <UserPlusIcon className="h-6 w-6 text-blue-600" />
          </div>
          <Typography variant="h5" color="blue-gray">Assign Driver</Typography>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen}>
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="px-6 py-8">
        <div className="space-y-6">
          {/* Info Metadata Ringkasan Armada */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-1 font-bold">Target Truk</Typography>
              <div className="p-2.5 bg-gray-50 rounded-xl border border-dashed border-gray-300 truncate text-xs font-bold text-gray-800">
                {data?.truckCode || "N/A"} ({data?.plateNumber || "N/A"})
              </div>
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-1 font-bold">Wilayah Truk</Typography>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 flex items-center gap-1 text-xs font-bold truncate">
                <MapPinIcon className="h-3 w-3 flex-shrink-0" />
                {data?.area?.name || "No Area"}
              </div>
            </div>
          </div>

          {/* Info Driver Saat Ini (Jika Ada) */}
          {hasExistingDriver && data?.driver?.name && (
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/70">
              <Typography variant="small" color="blue-gray" className="font-semibold text-[11px] uppercase tracking-wider text-blue-500 mb-0.5">
                Pengemudi Saat Ini
              </Typography>
              <Typography variant="small" color="blue-gray" className="font-bold text-gray-800">
                {data.driver.name}
              </Typography>
            </div>
          )}

          {/* Bagian Pilihan Dropdown Driver */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-bold">Pilih Pengemudi Lapangan Baru</Typography>
            
            {fetching ? (
              <div className="flex justify-center p-4"><Spinner color="blue" /></div>
            ) : errorInfo ? (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-center">
                 <Typography className="text-[11px] text-red-700 font-medium">{errorInfo}</Typography>
              </div>
            ) : drivers.length > 0 ? (
              /* KEY FIX: Menggunakan key dinamis berbasis string id agar dropdown ter-render ulang secara presisi */
              <Select 
                key={selectedDriverId}
                label="Daftar Driver" 
                value={selectedDriverId} 
                onChange={(v) => setSelectedDriverId(v || "")}
                color="blue"
              >
                {drivers.map((driver) => (
                  <Option key={driver.id.toString()} value={driver.id.toString()}>
                    {driver.name}
                  </Option>
                ))}
              </Select>
            ) : (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-center">
                 <Typography className="text-[11px] text-orange-700 italic">
                    Tidak ditemukan akun TRUCK_DRIVER di Area ID: {currentAreaId || "Kosong"}
                 </Typography>
              </div>
            )}
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="border-t border-gray-100 p-4 flex justify-between items-center gap-2">
        {/* Tombol Unassign Kiri */}
        <div>
          {hasExistingDriver ? (
            <Button 
              variant="text" 
              color="red" 
              onClick={handleUnassign} 
              disabled={loading}
              className="flex items-center gap-1.5 normal-case px-3 text-red-600 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
              Lepas Driver
            </Button>
          ) : (
            <Button variant="text" color="blue-gray" onClick={handleOpen} disabled={loading} className="normal-case">
              Batal
            </Button>
          )}
        </div>

        {/* Tombol Aksi Kanan */}
        <div className="flex gap-2">
          {hasExistingDriver && (
            <Button variant="text" color="blue-gray" onClick={handleOpen} disabled={loading} className="normal-case">
              Batal
            </Button>
          )}
          <Button 
            variant="gradient" 
            color="blue" 
            onClick={handleAssign} 
            disabled={loading || fetching || !selectedDriverId}
            className="flex items-center gap-2 normal-case"
          >
            {loading ? <Spinner className="h-4 w-4" /> : "Tugaskan Driver"}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};

export default AssignDriverModal;