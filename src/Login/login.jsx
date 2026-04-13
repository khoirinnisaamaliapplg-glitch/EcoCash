import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import ForgotPasswordModal from './ForgotPasswordModal';

const Login = () => { // Ganti nama ke Login supaya tidak tabrakan dengan App.jsx
  const [isModalOpen, setIsModalOpen] = useState(false);
  
 const data = [
    { main: "Smart Waste Management", sub: "Digital Recycling Platform" },
    { main: "AIoT Integration", sub: "Real-time Monitoring System" },
    { main: "Circular Economy", sub: "Sustainable Waste Ecosystem" }
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % data.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formik = useFormik({
    initialValues: { username: '', password: '' },
    validationSchema: Yup.object({
      username: Yup.string().required('Username wajib diisi'),
      password: Yup.string().required('Password wajib diisi'),
    }),
    onSubmit: (values) => {
      console.log('Login attempt:', values);
      alert('Login Berhasil (Cek Console)');
    },
  });

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* SISI KIRI: HERO */}
      <div className="w-full md:w-1/2 bg-blue-50/50 p-10 flex flex-col items-center justify-center text-center">
        <div>
          <img 
            src="/login.png" 
            alt="Hero" 
            className="w-[300px] md:w-[366px] object-contain mb-10 transform hover:scale-105 transition-transform duration-500"
          />
          
          <div className="h-[120px] md:h-[140px] z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={index} // Supaya animasi jalan setiap index berubah
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Teks Utama */}
            <Typography 
              variant="h2" 
              color="blue" 
              className="font-black leading-tight drop-shadow-md"
            >
              {data[index].main}
            </Typography>

            {/* Teks Bawah (Sekarang Ikut Jalan) */}
            <Typography 
              variant="h4" 
              color="blue" 
              className="font-extrabold opacity-80 mt-2 tracking-wide"
            >
              & {data[index].sub}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </div>

          <Typography className="text-gray-600 text-sm mt-6 max-w-md px-4 font-normal">
             EcoCash menghubungkan masyarakat Indonesia dengan teknologi AIoT dan sistem insentif digital Terpusat untuk mengubah sampah menjadi nilai ekonomi, menciptakan ekosistem ekonomi sirkular yang cerdas, berkelanjutan, dan berdampak bagi masa depan lingkungan.
          </Typography>
        </div>
      </div>

      {/* SISI KANAN: FORM LOGIN */}
      <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center bg-white">
        <Card color="transparent" shadow={false} className="w-full max-w-sm">
          
          <div className="flex flex-col items-center mb-6">
            <img src="/logo1.png" alt="Logo" className="w-32 h-32 object-contain mb-2" />
            <Typography variant="h4" color="blue-gray">Sign In</Typography>
          </div>

          <Button
            size="lg"
            variant="outlined"
            color="blue-gray"
            className="flex items-center justify-center gap-3 normal-case mb-6"
            fullWidth
          >
            <img src="/google.png" alt="google" className="h-5 w-5" />
            Login with Google
          </Button>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <Typography variant="small" color="blue-gray" className="font-black opacity-50">OR</Typography>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

         <form onSubmit={formik.handleSubmit} className="w-full space-y-5">
            {/* FIELD USERNAME */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2b6cb0] mb-1.5 ml-0.5 drop-shadow-[0_1px_1px_rgba(43,108,176,0.2)]">
                Username
              </label>
              <Input
                size="lg"
                placeholder="Masukkan username Anda"
                {...formik.getFieldProps('username')}
                className="!border !border-gray-300 bg-white text-gray-900 shadow-sm shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-400 focus:!border-[#2b6cb0] focus:!border-t-[#2b6cb0] focus:ring-[#2b6cb0]/10 h-12 transition-all"
                labelProps={{
                  className: "hidden",
                }}
                containerProps={{ className: "min-w-[100px]" }}
                error={formik.touched.username && Boolean(formik.errors.username)}
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">
                  * {formik.errors.username}
                </p>
              )}
            </div>

            {/* FIELD PASSWORD */}
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#2b6cb0] ml-0.5 drop-shadow-[0_1px_1px_rgba(43,108,176,0.2)]">
                  Password
                </label>
                <Typography
                  as="a"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsModalOpen(true);
                  }}
                  className="text-[10px] font-bold text-[#2b6cb0] hover:text-blue-800 transition-colors uppercase tracking-tight"
                >
                  Forgot Password?
                </Typography>
              </div>
              <Input
                type="password"
                size="lg"
                placeholder="********"
                {...formik.getFieldProps('password')}
                className="!border !border-gray-300 bg-white text-gray-900 shadow-sm shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-400 focus:!border-[#2b6cb0] focus:!border-t-[#2b6cb0] focus:ring-[#2b6cb0]/10 h-12 transition-all"
                labelProps={{
                  className: "hidden",
                }}
                containerProps={{ className: "min-w-[100px]" }}
                error={formik.touched.password && Boolean(formik.errors.password)}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">
                  * {formik.errors.password}
                </p>
              )}
            </div>

            {/* BUTTON CONTINUE */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              className="bg-[#2b6cb0] hover:bg-[#23568c] shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] h-12 normal-case text-sm mt-4 font-bold tracking-wide"
            >
              Continue
            </Button>
          </form>
          
          
          <div className="mt-12 text-center">
            <Typography className="text-[10px] font-black uppercase tracking-widest text-blue-800 opacity-40">
              PT. Ideas Edvolution Technology
            </Typography>
          </div>
        </Card>
      </div>

      {/* Modal - Pastikan file ForgotPasswordModal.jsx ada di folder yang sama */}
      {isModalOpen && (
        <ForgotPasswordModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default Login;