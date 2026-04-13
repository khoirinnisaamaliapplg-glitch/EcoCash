import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import halaman yang sudah ada
import Login from './Login/login'; 
import Dashboard from './SuperAdmin/dashboard';
import SmartContainerIndex from './SuperAdmin/SmartContainer/index';

// 1. Import SmartTruckIndex dari folder yang baru dibuat
import SmartTruckIndex from './SuperAdmin/SmartTruck/index';

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman utama adalah Login */}
        <Route path="/" element={<Login />} />
        
        {/* Halaman setelah login sukses */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/smart-container" element={<SmartContainerIndex />} />

        {/* 2. Tambahkan Route baru untuk Smart Truck */}
        <Route path="/smart-truck" element={<SmartTruckIndex />} />
      </Routes>
    </Router>
  );
}

export default App;