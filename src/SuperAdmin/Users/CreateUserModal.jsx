import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Select,
  Option,
  Textarea, // Ditambahkan untuk input notes yang lebih luas
} from "@material-tailwind/react";
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  PhoneIcon,
  UserCircleIcon,
  IdentificationIcon, // Icon untuk KTP
  DocumentTextIcon, // Icon untuk Notes
} from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import api from "../../utils/api";
import { toast } from "react-toastify"; // Import Toast

const CreateUserModal = ({ open, handleOpen, refreshData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [areas, setAreas] = useState([]);

  // Mengambil data area dari database
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/areas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAreas(response.data.data || []);
      } catch (err) {
        console.error("Gagal mengambil data area:", err);
        toast.error("Gagal memuat daftar area.");
      }
    };
    if (open) fetchAreas();
  }, [open]);

  const formik = useFormik({
    initialValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      role: "",
      areaId: "", 
      ktpNumber: "", // Inisialisasi properti ktpNumber
      notes: "",     // Inisialisasi properti notes
    },
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      // Validasi sederhana
      if (!values.areaId || !values.role) {
        toast.warning("Harap pilih Role dan Lokasi Area!");
        return;
      }

      // Validasi tambahan jika role adalah MACHINE_OPERATOR atau TRUCK_DRIVER
      const isDriverOrOperator = values.role === "MACHINE_OPERATOR" || values.role === "TRUCK_DRIVER";
      if (isDriverOrOperator && !values.ktpNumber) {
        toast.warning("No KTP wajib diisi untuk Operator / Driver!");
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        const payload = {
          name: values.name.trim(),
          username: values.username.toLowerCase().trim(),
          email: values.email.toLowerCase().trim(),
          password: values.password,
          role: values.role,
          phoneNumber: values.phoneNumber ? values.phoneNumber.trim() : null,
          areaId: Number(values.areaId),
          // Hanya kirim properti ktpNumber & notes jika role-nya sesuai
          ...(isDriverOrOperator && {
            ktpNumber: values.ktpNumber.trim(),
            notes: values.notes ? values.notes.trim() : null,
          }),
        };

        const response = await api.post("/admin/users", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success(response.data.message || "User Berhasil Didaftarkan!");
        resetForm();
        handleOpen();
        if (refreshData) refreshData();
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Terjadi kesalahan server";
        toast.error(`Gagal: ${errorMsg}`);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    handleOpen();
  };

  // Kondisi pengecekan role untuk memunculkan input KTP & Notes
  const showKtpInput = formik.values.role === "MACHINE_OPERATOR" || formik.values.role === "TRUCK_DRIVER";

  return (
    <Dialog open={open} handler={handleClose} size="md" className="rounded-[28px]">
      <DialogHeader className="px-8 pt-8 text-blue-900 font-bold">Registrasi User Baru</DialogHeader>
      <form onSubmit={formik.handleSubmit}>
        <DialogBody className="px-8 py-4 space-y-4 overflow-visible max-h-[70vh] overflow-y-auto">
          <Input 
            label="Nama Lengkap" 
            icon={<UserIcon className="h-4 w-4" />} 
            {...formik.getFieldProps("name")} 
            required 
          />
          <Input 
            label="Username" 
            icon={<UserCircleIcon className="h-4 w-4" />} 
            {...formik.getFieldProps("username")} 
            required 
          />
          <Input 
            label="Email" 
            type="email" 
            icon={<EnvelopeIcon className="h-4 w-4" />} 
            {...formik.getFieldProps("email")} 
            required 
          />
          <Input 
            label="Phone" 
            icon={<PhoneIcon className="h-4 w-4" />} 
            {...formik.getFieldProps("phoneNumber")} 
          />
          <Input 
            type="password" 
            label="Password" 
            icon={<KeyIcon className="h-4 w-4" />} 
            {...formik.getFieldProps("password")} 
            required 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Pilih Role" 
              value={formik.values.role}
              onChange={(val) => formik.setFieldValue("role", val)}
            >
              <Option value="SUPER_ADMIN">Super Admin</Option>
              <Option value="AREA_ADMIN">Area Admin</Option>
              <Option value="STORE_ADMIN">Store Admin</Option>
              <Option value="MACHINE_OPERATOR">Machine Operator</Option>
              <Option value="TRUCK_DRIVER">Truck Driver</Option> {/* Ditambahkan opsi Truck Driver */}
              <Option value="REGULAR_USER">Regular User</Option>
            </Select>

            <Select 
              label="Lokasi Penempatan Area" 
              key={formik.values.areaId ? "has-val" : "no-val"}
              value={formik.values.areaId ? formik.values.areaId.toString() : ""}
              onChange={(val) => formik.setFieldValue("areaId", val)}
            >
              {areas.map((area) => (
                <Option key={area.id} value={area.id.toString()}>
                  {area.name} (ID: {area.id})
                </Option>
              ))}
            </Select>
          </div>

          {/* Kondisi render field KTP dan Notes */}
          {showKtpInput && (
            <div className="space-y-4 pt-2 border-t border-gray-200 animate-fadeIn">
              <Input 
                label="No KTP" 
                icon={<IdentificationIcon className="h-4 w-4" />} 
                {...formik.getFieldProps("ktpNumber")} 
                required 
              />
              <Textarea 
                label="Notes (Catatan Tambahan)" 
                icon={<DocumentTextIcon className="h-4 w-4" />} 
                {...formik.getFieldProps("notes")} 
              />
            </div>
          )}
        </DialogBody>

        <DialogFooter className="px-8 pb-8 gap-3">
          <Button variant="text" color="red" onClick={handleClose}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-[#2b6cb0]">
            {isLoading ? "Memproses..." : "Daftarkan User"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default CreateUserModal;