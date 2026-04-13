import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Sesuaikan import dengan struktur folder di gambar
import Login from './Login/login'; 
import Dashboard from './SuperAdmin/dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman utama adalah Login */}
        <Route path="/" element={<Login />} />
        
        {/* Halaman setelah login sukses */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;