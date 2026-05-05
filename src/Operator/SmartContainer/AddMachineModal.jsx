import React, { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button, Select, Option, Spinner } from "@material-tailwind/react";
import axios from "axios";
// 1. Import toast
import { toast } from "react-hot-toast";

const AddMachineModal = ({ open, handleOpen, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    machineCode: "",
    name: "",
    capacity: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (val) => {
    setFormData(prev => ({ ...prev, name: val }));
  };

  const handleClose = () => {
    setFormData({ machineCode: "", name: "", capacity: "" });
    handleOpen();
  };

  const handleSubmit = async () => {
    // 2. Validasi Sederhana
    if (!formData.machineCode || !formData.name || !formData.capacity) {
      return toast.error("Semua field wajib diisi!");
    }

    const token = localStorage.getItem("token");
    setLoading(true);

    // 3. Gunakan toast.promise untuk UX yang superior
    const postAction = axios.post("http://localhost:3000/api/machines", formData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.promise(postAction, {
      loading: 'Mendaftarkan unit baru...',
      success: () => {
        handleClose();
        if (refreshData) refreshData();
        return <b>Unit berhasil diregistrasi!</b>;
      },
      error: (err) => {
        const msg = err.response?.data?.message || "Gagal mendaftarkan unit";
        return <b>{msg}</b>;
      },
    }, {
      style: { borderRadius: '12px' }
    });

    try {
      await postAction;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={loading ? () => {} : handleClose} size="xs" className="rounded-[2rem]">
      <DialogHeader className="px-8 pt-8 text-blue-900 font-black uppercase tracking-tight text-xl">
        Registrasi Unit Baru
      </DialogHeader>
      
      <DialogBody className="px-8 space-y-5">
        <Input 
          label="ID Unit (Contoh: MS 004)" 
          name="machineCode"
          value={formData.machineCode}
          onChange={handleChange}
          color="blue" 
          className="rounded-xl" 
        />
        
        <Select 
          label="Jenis Mesin" 
          color="blue" 
          value={formData.name}
          onChange={handleSelectChange}
          className="rounded-xl"
        >
          <Option value="Pencacah Plastik">Pencacah Plastik</Option>
          <Option value="Mesin Press Hidrolik">Mesin Press Hidrolik</Option>
          <Option value="Pemilah Magnetik">Pemilah Magnetik</Option>
        </Select>
        
        <Input 
          label="Kapasitas Maksimal (Kg)" 
          name="capacity"
          type="number" 
          value={formData.capacity}
          onChange={handleChange}
          color="blue" 
          className="rounded-xl" 
        />
      </DialogBody>

      <DialogFooter className="px-8 pb-8 flex flex-col-reverse md:flex-row gap-3 pt-4">
        <Button 
          variant="text" 
          color="red" 
          onClick={handleClose} 
          disabled={loading}
          className="w-full md:w-auto normal-case font-bold"
        >
          Batal
        </Button>
        <Button 
          className="bg-blue-900 w-full md:flex-1 rounded-xl normal-case font-black shadow-none flex justify-center items-center gap-2 active:scale-95 transition-transform" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Spinner className="h-4 w-4" /> : "Simpan Unit"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddMachineModal;