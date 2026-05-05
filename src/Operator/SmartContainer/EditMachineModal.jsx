import React, { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Button, 
  Select, 
  Option,
  Typography
} from "@material-tailwind/react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import axios from "axios";
// 1. Import toast
import { toast } from "react-hot-toast";

const EditMachineModal = ({ open, handleOpen, data, refreshData }) => {
  const [status, setStatus] = useState("OPERATING");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setStatus(data.status || "OPERATING");
    }
  }, [data, open]);

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    // 2. Bungkus request dalam toast.promise
    const updatePromise = axios.patch(
      `http://localhost:3000/api/machines/${data.id}/status`, 
      { status: status },
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        } 
      }
    );

    toast.promise(updatePromise, {
      loading: 'Memperbarui status unit...',
      success: () => {
        refreshData();
        handleOpen();
        return <b>Status berhasil diperbarui!</b>;
      },
      error: (err) => {
        const msg = err.response?.data?.message || "Gagal memperbarui status";
        return <b>{msg}</b>;
      },
    }, {
      // Styling opsional
      style: {
        borderRadius: '12px',
        background: '#333',
        color: '#fff',
      },
    });

    try {
      await updatePromise;
    } catch (err) {
      console.error("Update error:", err);
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
        <Typography variant="h5" className="text-blue-900 font-black tracking-tight">
          Update Kondisi Unit
        </Typography>
      </DialogHeader>

      <DialogBody className="px-8 py-4 space-y-5">
        <div className="space-y-4">
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
             <Typography className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
               Detail Unit
             </Typography>
             <Typography className="text-blue-900 font-bold">
               {data?.machineCode} - {data?.name}
             </Typography>
          </div>

          <div className="space-y-1">
            <Typography variant="small" className="text-blue-900 font-black ml-1 text-[10px] uppercase tracking-widest">
              Pilih Status Baru
            </Typography>
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
          className="w-full bg-blue-900 rounded-xl normal-case font-black py-3.5 flex justify-center items-center gap-2 active:scale-95 transition-transform" 
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
          className="w-full normal-case font-bold py-3 rounded-xl"
        >
          Batal
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditMachineModal;