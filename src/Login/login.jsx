import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ForgotPasswordModal from './ForgotPasswordModal';

const Login = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dataHero = [
    { main: "Smart Waste Management", sub: "Digital Recycling Platform" },
    { main: "AI-IoT Integration", sub: "Real-time Monitoring System" },
    { main: "Circular Economy", sub: "Sustainable Waste Ecosystem" }
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % dataHero.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [dataHero.length]);

  // --- LOGIKA API SESUAI POSTMAN ---
  const formik = useFormik({
    initialValues: { username: '', password: '' },
    validationSchema: Yup.object({
      username: Yup.string().required('Username wajib diisi'),
      password: Yup.string().required('Password wajib diisi'),
    }),
 // Taruh di paling atas file

// ... di dalam onSubmit:
onSubmit: async (values) => {
  setIsLoading(true);
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      identifier: values.username, 
      password: values.password
    });

    const loginData = response.data.data;
    const token = loginData.token;

    if (token) {
      // 1. Dekode token untuk mendapatkan role dan data user lainnya
      const decoded = jwtDecode(token);
      const role = decoded.role; // Pastikan di isi token ada field 'role'

      // 2. Simpan ke LocalStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userData", JSON.stringify(decoded));

      // 3. Navigasi berdasarkan Role dari hasil decode
      const userRole = role ? role.toUpperCase().trim() : "";

      switch (userRole) {
        case "SUPER_ADMIN": 
          navigate("/dashboard"); 
          break;
        case "AREA_ADMIN": 
          navigate("/AdminArea/dashboard"); 
          break;
        case "MACHINE_OPERATOR": 
          navigate("/operator/dashboard"); 
          break;
        case "STORE_ADMIN": 
          navigate("/store/dashboard"); 
          break;
        default: 
          alert(`Role "${userRole}" tidak dikenali atau tidak memiliki akses.`);
          navigate("/");
      }
    }
  } catch (error) {
    console.error("Login Error:", error.response?.data);
    alert("Gagal Login: " + (error.response?.data?.message || "Terjadi kesalahan"));
  } finally {
    setIsLoading(false);
  }},
  });

  return (
    <div className="h-screen w-full bg-white flex flex-col md:flex-row overflow-y-auto md:overflow-hidden font-sans">
      
      {/* SISI KIRI: HERO (Layout dari Kode Kedua) */}
      <div className="w-full md:w-1/2 h-full bg-blue-50/50 p-10 flex flex-col items-center justify-center text-center">
        <div className="w-full flex flex-col items-center justify-center">
          
          <img 
            src="/login.png" 
            alt="Hero" 
            className="w-[280px] md:w-[380px] object-contain mb-8 mx-auto transform hover:scale-105 transition-transform duration-500 drop-shadow-xl"
          />
          
          <div className="h-[120px] md:h-[140px] w-full flex flex-col items-center justify-center z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center" 
              >
                <Typography 
                  variant="h2" 
                  className="font-black text-3xl md:text-4xl leading-tight drop-shadow-md text-[#2b6cb0]"
                >
                  {dataHero[index].main}
                </Typography>

                <Typography 
                  variant="h4" 
                  className="font-extrabold text-xl md:text-2xl opacity-80 mt-2 tracking-wide text-[#2b6cb0]"
                >
                  & {dataHero[index].sub}
                </Typography>
              </motion.div>
            </AnimatePresence>
          </div>

          <Typography className="text-gray-600 text-sm mt-6 max-w-md px-4 font-normal leading-relaxed hidden md:block text-center">
            EcoCash menghubungkan masyarakat Indonesia dengan teknologi AI-IoT dan sistem insentif digital Terpusat untuk mengubah sampah menjadi nilai ekonomi.
          </Typography>
          
        </div>
      </div>

      {/* SISI KANAN: FORM LOGIN (Layout dari Kode Kedua) */}
      <div className="w-full md:w-1/2 h-full p-8 md:p-10 flex flex-col justify-center items-center bg-white border-l border-gray-50">
        <Card color="transparent" shadow={false} className="w-full max-w-sm">
          
          <div className="flex flex-col items-center mb-6">
            <img src="/logo1.png" alt="Logo" className="w-24 h-24 md:w-28 md:h-28 object-contain mb-2" />
            <Typography variant="h4" className="text-blue-gray-800 font-bold">Sign In</Typography>
          </div>

          {/* Tombol Google Login */}
          <Button
            size="lg"
            variant="outlined"
            color="blue-gray"
            className="flex items-center justify-center gap-3 normal-case mb-6 border-gray-200 hover:bg-gray-50 h-11"
            fullWidth
            onClick={() => alert('Fitur Google Login sedang dikembangkan!')}
          >
            <img src="/google.png" alt="google" className="h-5 w-5" />
            Login with Google
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-100"></div>
            <Typography variant="small" color="blue-gray" className="font-black opacity-30">OR</Typography>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          <form onSubmit={formik.handleSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2b6cb0] mb-1.5 ml-0.5">
                Username
              </label>
              <Input
                size="lg"
                placeholder="Masukkan username"
                {...formik.getFieldProps('username')}
                className="!border !border-gray-300 bg-white focus:!border-[#2b6cb0] focus:ring-[#2b6cb0]/10 h-11 transition-all"
                labelProps={{ className: "hidden" }}
                error={formik.touched.username && Boolean(formik.errors.username)}
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">* {formik.errors.username}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-end mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#2b6cb0] ml-0.5">
                  Password
                </label>
                <Typography
                  as="a"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsModalOpen(true);
                  }}
                  className="text-[10px] font-bold text-[#2b6cb0] hover:text-blue-800 uppercase"
                >
                  Forgot Password?
                </Typography>
              </div>
              <Input
                type="password"
                size="lg"
                placeholder="********"
                {...formik.getFieldProps('password')}
                className="!border !border-gray-300 bg-white focus:!border-[#2b6cb0] focus:ring-[#2b6cb0]/10 h-11 transition-all"
                labelProps={{ className: "hidden" }}
                error={formik.touched.password && Boolean(formik.errors.password)}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">* {formik.errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isLoading}
              className="bg-[#2b6cb0] hover:bg-[#23568c] shadow-md h-11 normal-case text-sm mt-4 font-bold tracking-wide flex justify-center items-center"
            >
              {isLoading ? "Authenticating..." : "Continue"}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <Typography className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              System by PT. Ideas Edvolution Technology
            </Typography>
          </div>
        </Card>
      </div>

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