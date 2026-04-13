import React from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Typography,
} from "@material-tailwind/react";
import { useFormik } from "formik";
import * as Yup from "yup";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Format email salah")
        .required("Email wajib diisi"),
    }),
    onSubmit: (values) => {
      console.log("Reset link sent to:", values.email);
      alert("Link reset password telah dikirim ke email Anda!");
      onClose();
      formik.resetForm();
    },
  });

  return (
    <Dialog 
      open={isOpen} 
      handler={onClose} 
      size="xs" 
      className="p-2 rounded-2xl shadow-2xl border border-gray-100"
    >
      <DialogHeader className="flex flex-col items-center text-center gap-2 pt-8">
        {/* Icon Kunci (Opsional, nambah estetika) */}
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#2b6cb0" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
          </svg>
        </div>
        <Typography variant="h4" className="text-[#2b6cb0] font-bold">
          Reset Password
        </Typography>
        <Typography className="text-gray-500 font-normal text-xs max-w-[240px]">
          Masukkan email Anda untuk menerima instruksi pemulihan akun EcoCash.
        </Typography>
      </DialogHeader>

      <DialogBody className="px-8 pb-4">
        <form id="reset-form" onSubmit={formik.handleSubmit} className="space-y-1">
          {/* Label dengan bayangan (Sama seperti Login) */}
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2b6cb0] mb-1.5 ml-0.5 drop-shadow-[0_1px_1px_rgba(43,108,176,0.2)]">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="nama@email.com"
            size="lg"
            {...formik.getFieldProps("email")}
            className="!border !border-gray-300 bg-white text-gray-900 shadow-sm shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-400 focus:!border-[#2b6cb0] focus:!border-t-[#2b6cb0] focus:ring-[#2b6cb0]/10 h-12 transition-all"
            labelProps={{
              className: "hidden",
            }}
            error={formik.touched.email && Boolean(formik.errors.email)}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">
              * {formik.errors.email}
            </p>
          )}
        </form>
      </DialogBody>

      <DialogFooter className="flex flex-col gap-3 px-8 pb-8">
        <Button 
          type="submit" 
          form="reset-form" 
          fullWidth 
          style={{ backgroundColor: '#2b6cb0' }}
          className="h-12 shadow-lg shadow-blue-900/20 normal-case text-sm font-bold"
        >
          Send Reset Link
        </Button>
        <Button 
          variant="text" 
          onClick={onClose} 
          fullWidth
          className="h-12 text-gray-500 font-bold text-sm hover:bg-gray-50 normal-case"
        >
          Back to Login
        </Button>
        <Typography className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 text-center mt-4">
          EcoCash Security System
        </Typography>
      </DialogFooter>
    </Dialog>
  );
};

export default ForgotPasswordModal;