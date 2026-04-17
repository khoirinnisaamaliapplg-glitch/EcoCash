import React, { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button, Typography, Select, Option } from "@material-tailwind/react";
import { UserIcon, EnvelopeIcon, KeyIcon, PhoneIcon, UserCircleIcon } from "@heroicons/react/24/outline"; // Pastikan semua di-import!
import { useFormik } from "formik";
import axios from "axios";

const CreateUserModal = ({ open, handleOpen, refreshData }) => {
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      role: "",
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        await axios.post("http://localhost:3000/api/auth/register", values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        alert("Berhasil mendaftarkan user baru!");
        formik.resetForm();
        handleOpen();
        if (refreshData) refreshData();
      } catch (error) {
        alert(error.response?.data?.message || "Gagal mendaftarkan user");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Dialog open={open} handler={handleOpen} size="sm" className="rounded-[28px]">
      <DialogHeader className="px-8 pt-8 text-blue-900">Registrasi User Baru</DialogHeader>
      <form onSubmit={formik.handleSubmit}>
        <DialogBody className="px-8 py-4 space-y-4">
          <Input label="Nama Lengkap" icon={<UserIcon className="h-4 w-4" />} {...formik.getFieldProps("name")} />
          <Input label="Username" icon={<UserCircleIcon className="h-4 w-4" />} {...formik.getFieldProps("username")} />
          <Input label="Email" icon={<EnvelopeIcon className="h-4 w-4" />} {...formik.getFieldProps("email")} />
          <Input label="Phone" icon={<PhoneIcon className="h-4 w-4" />} {...formik.getFieldProps("phoneNumber")} />
          <Input type="password" label="Password" icon={<KeyIcon className="h-4 w-4" />} {...formik.getFieldProps("password")} />
          
          <Select 
            label="Pilih Role" 
            value={formik.values.role}
            onChange={(val) => formik.setFieldValue("role", val)}
          >
            <Option value="SUPER_ADMIN">Super Admin</Option>
            <Option value="AREA_ADMIN">Area Admin</Option>
            <Option value="STORE_ADMIN">Store Admin</Option>
            <Option value="OPERATOR">Operator</Option>
          </Select>
        </DialogBody>
        <DialogFooter className="px-8 pb-8 gap-3">
          <Button variant="text" color="red" onClick={handleOpen}>Batal</Button>
          <Button type="submit" disabled={isLoading} className="bg-[#2b6cb0]">
            {isLoading ? "Memproses..." : "Daftarkan User"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default CreateUserModal;