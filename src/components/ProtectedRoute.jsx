import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  // Ambil data dari localStorage sesuai key yang ada di Login.jsx
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole"); // Mengambil string role

  // 1. Cek jika tidak ada token (berarti belum login)
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. Cek apakah role user (dalam huruf kecil/snake_case) diizinkan
  // Kita konversi ke format yang konsisten (misal: super_admin)
  const formattedRole = role ? role.toUpperCase().trim() : "";

  if (!allowedRoles.includes(formattedRole)) {
    // Mapping fallback jika role tidak punya akses ke halaman tersebut
    const fallbackMap = {
      'SUPER_ADMIN': '/dashboard',
      'AREA_ADMIN': '/AdminArea/dashboard',
      'MACHINE_OPERATOR': '/operator/dashboard',
      'STORE_ADMIN': '/store/dashboard'
    };
    return <Navigate to={fallbackMap[formattedRole] || "/"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;