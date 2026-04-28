import React, { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Button, 
  Select, 
  Option,
  Typography,
  Alert
} from "@material-tailwind/react";
import { PencilSquareIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";

const EditMachineModal = ({ open, handleOpen, data, refreshData }) => {
  const [status, setStatus] = useState("OPERATING");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (data) {
      setStatus(data.status || "OPERATING");
    }
    setError("");
  }, [data, open]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      // MENGGUNAKAN PATCH: Hanya mengirimkan field status
      await axios.patch(`http://localhost:3000/api/machines/${data.id}/status`, 
        { status: status },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );
      
      refreshData();
      handleOpen();
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Gagal memperbarui status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={handleOpen} 
      size="xs" 
      className="rounded-[28px] overflow-hidden"
    >
      <DialogHeader className="px-8 pt-8 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
          <PencilSquareIcon className="h-6 w-6 stroke-[2]" />
        </div>
        <Typography variant="h5" className="text-blue-900 font-black">Update Kondisi Unit</Typography>
      </DialogHeader>

      <DialogBody className="px-8 py-4 space-y-5">
        {error && (
          <Alert color="red" icon={<InformationCircleIcon className="h-5 w-5" />} className="rounded-xl font-medium">
            {error}
          </Alert>
        )}

        <div className="space-y-4">
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
             <Typography className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Detail Unit</Typography>
             <Typography className="text-blue-900 font-bold">{data?.machineCode} - {data?.name}</Typography>
          </div>

          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-black ml-1 text-[10px] uppercase tracking-widest">Pilih Status Baru</Typography>
            <Select 
              value={status} 
              onChange={(val) => setStatus(val)}
              label="Pilih Status"
              className="rounded-xl"
            >
              <Option value="OPERATING">OPERATING (Berjalan)</Option>
              <Option value="BROKEN">BROKEN (Rusak)</Option>
              <Option value="MAINTENANCE">MAINTENANCE (Perbaikan)</Option>
            </Select>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="px-8 pb-8 pt-2 flex flex-col gap-3">
        <Button 
          className="w-full bg-blue-900 rounded-xl normal-case font-black py-3.5 flex justify-center items-center gap-2" 
          onClick={handleSubmit}
          loading={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        <Button 
          variant="text" 
          color="blue-gray" 
          onClick={handleOpen} 
          disabled={loading}
          className="w-full normal-case font-bold py-3"
        >
          Batal
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditMachineModal;