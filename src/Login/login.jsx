import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const App = () => {
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Username wajib diisi'),
      password: Yup.string().required('Password wajib diisi'),
    }),
    onSubmit: (values) => {
      console.log('Login attempt with:', values);
    },
  });

  return (
    // Background utama sekarang langsung putih
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      
      {/* Sisi Kiri */}
      <div className="w-full md:w-1/2 bg-[#e8f5ff] p-10 flex flex-col items-center justify-center text-center">
        <img 
          src="/login.png" 
          alt="EcoCash Illustration" 
          className="w-[366px] h-[366px] object-contain mb-10"
        />
        <h2 className="text-[#2b6cb0] text-xl font-extrabold mb-4 leading-tight">
          Smart Waste Management <br /> & <br /> Digital Recycling Platform
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed max-w-md px-4">
          EcoCash menghubungkan masyarakat Indonesia dengan teknologi AIoT dan sistem insentif digital Terpusat untuk mengubah sampah menjadi nilai ekonomi, menciptakan ekosistem ekonomi sirkular yang cerdas, berkelanjutan, dan berdampak bagi masa depan lingkungan.
        </p>
      </div>

      {/* Sisi Kanan */}
      <div className="w-full md:w-1/2 p-10 flex flex-col justify-between items-center bg-white">
        
        
        <div className="w-full max-w-sm flex flex-col items-center mt-10">
          
          
          <div className="flex flex-col items-center mb-8">
            <img 
              src="/logo1.png" 
              alt="EcoCash Logo" 
              className="w-[182px] h-[182px] object-contain mb-4" 
            />
            <h3 className="font-bold text-[#2b6cb0] text-xl tracking-wide">Sign In</h3>
          </div>

          {/* Google Login */}
          <button className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-md shadow-sm hover:bg-gray-50 transition-all mb-6 text-gray-700 font-semibold text-sm">
            <img 
              src="/google.png" 
              className="w-5" 
              alt="Google" 
            />
            Login with Google
          </button>

          
          <div className="w-full flex items-center mb-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-4 text-xs text-blue-800 font-bold tracking-widest">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Formik Form */}
          <form onSubmit={formik.handleSubmit} className="w-full space-y-6">
            <div>
              <label className="block text-[#2b6cb0] text-sm font-bold mb-2">Username</label>
              <input
                type="text"
                {...formik.getFieldProps('username')}
                className="w-full border border-gray-300 rounded-md p-3 outline-none focus:ring-1 focus:ring-blue-400 text-sm shadow-sm"
                placeholder="Username"
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-[#2b6cb0] text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                {...formik.getFieldProps('password')}
                className="w-full border border-gray-300 rounded-md p-3 outline-none focus:ring-1 focus:ring-blue-400 text-sm shadow-sm"
                placeholder="Password"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
              )}
              <div className="text-right mt-2">
                <a href="#" className="text-blue-200 text-xs font-bold hover:text-blue-400 transition-colors">Forgot Password?</a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#3182ce] hover:bg-[#2b6cb0] text-white font-bold py-3.5 rounded-md shadow-md transition-all active:scale-95 mt-4"
            >
              Continue
            </button>
          </form>
        </div>

        {/* Footer Branding */}
        <div className="mt-12 mb-4">
          <p className="text-[#2b6cb0] text-[11px] font-extrabold tracking-tighter uppercase opacity-80">
            PT. Ideas Edvolution Technology
          </p>
        </div>
      </div>

    </div>
  );
};

export default App;