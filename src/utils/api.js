import axios from "axios";

// 1. Buat "robot" pengirim pesan
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL // Dia otomatis ambil alamat dari .env tadi
});

// 2. Pasang "asisten" (Interceptor) yang otomatis kasih Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // KTP kamu otomatis ditempel di sini
  }
  return config;
});

export default api;