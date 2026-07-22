import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  Input, 
  Button, 
  Typography,
  Spinner 
} from "@material-tailwind/react";
import { PencilSquareIcon, IdentificationIcon, UserIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import api from "../../utils/api"; 

const EditModal = ({ open, setOpen, data, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    phoneNumber: "", 
    ktpNumber: "" 
  });

  useEffect(() => { 
    if (data) {
      setForm({
        name: data.name || "",
        phoneNumber: data.phoneNumber || "",
        ktpNumber: data.staffProfile?.ktpNumber || "", 
      });
    }
  }, [data]);

  const handleUpdate = async () => {
    // Validasi dasar
    if (!form.name) {
      toast.error("Nama wajib diisi!");
      return;
    }

    setLoading(true);
    const loadToast = toast.loading("Memperbarui data...");

    try {
      const token = localStorage.getItem("token");
      
      // Payload PATCH: Hanya kirim data yang ingin diubah
      const payload = {
        name: form.name.trim(),
        phoneNumber: form.phoneNumber ? form.phoneNumber.trim() : null,
        ktpNumber: form.ktpNumber ? form.ktpNumber.trim() : null,
      };

      // MENGGUNAKAN PATCH
      await api.patch(`/admin/users/${data.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profil berhasil diperbarui!", { id: loadToast });
      setOpen(false);
      if (refreshData) refreshData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Gagal memperbarui data.";
      toast.error(errorMsg, { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={() => !loading && setOpen(false)} 
      className="rounded-[35px] shadow-2xl overflow-hidden" 
      size="sm"
    >
      <DialogHeader className="flex flex-col items-start gap-1 pt-8 px-10">
        <div className="bg-amber-50 p-3 rounded-2xl mb-2">
          <PencilSquareIcon className="h-8 w-8 text-amber-600" />
        </div>
        <Typography variant="h4" className="text-blue-900 font-black">
          Edit Profil Operator
        </Typography>
        <Typography className="text-gray-500 font-medium text-sm">
          Perbarui informasi operator <span className="text-blue-600 font-bold">@{data?.username}</span>
        </Typography>
      </DialogHeader>

      <DialogBody className="px-10 py-4 space-y-5">
        <Input 
          size="lg"
          label="Nama Lengkap" 
          className="rounded-xl"
          value={form.name} 
          onChange={(e) => setForm({...form, name: e.target.value})} 
          icon={<UserIcon className="h-5 w-5 text-gray-400" />}
          disabled={loading}
        />
        <Input 
          size="lg"
          label="Nomor WhatsApp" 
          className="rounded-xl"
          value={form.phoneNumber} 
          onChange={(e) => setForm({...form, phoneNumber: e.target.value})} 
          icon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
          disabled={loading}
        />
        <Input 
          size="lg"
          label="Nomor KTP" 
          className="rounded-xl"
          value={form.ktpNumber} 
          onChange={(e) => setForm({...form, ktpNumber: e.target.value})} 
          icon={<IdentificationIcon className="h-5 w-5 text-gray-400" />}
          disabled={loading}
        />
      </DialogBody>

      <DialogFooter className="px-10 pb-10 pt-6 gap-3">
        <Button 
          variant="text" 
          color="red" 
          onClick={() => setOpen(false)}
          className="rounded-xl normal-case font-bold flex-1 py-3"
          disabled={loading}
        >
          Batal
        </Button>
        <Button 
          className="bg-blue-600 rounded-xl normal-case font-black flex-[2] py-3.5 shadow-lg flex justify-center items-center gap-2"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Simpan Perubahan"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditModal;