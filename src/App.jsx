import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT HALAMAN LOGIN ---
import Login from './Login/login'; 

// --- IMPORT HALAMAN SUPER ADMIN ---
import Dashboard from './SuperAdmin/dashboard';
import SmartContainerIndex from './SuperAdmin/SmartContainer/index';
import SmartTruckIndex from './SuperAdmin/SmartTruck/index';
import UserIndex from './SuperAdmin/Users/index';
import WastePricesIndex from './SuperAdmin/WastePrices/index';
import MarketPlaceIndex from './SuperAdmin/MarketPlace/index';
import FinansialReportsIndex from './SuperAdmin/FinansialReports/index';
import SystemSettingIndex from './SuperAdmin/SystemSettingIndex';
import ProfileIndex from './SuperAdmin/Profile/index';
import AreaIndex from './SuperAdmin/Area/index'; 
import WasteManagementIndex from './SuperAdmin/WasteManagement/index'; // <-- BARU: Import halaman waste management

// --- IMPORT HALAMAN ADMIN AREA ---
import DashboardArea from './AdminArea/dashboard';
import MachineManagement from './AdminArea/Machine/index'; 
import OperatorManagement from './AdminArea/Operator/index'; 
import LocalWastePrice from './AdminArea/LocalWastePrice/index'; 
import AreaSettingIndex from './AdminArea/SystemSettingIndex';
import AreaProfileIndex from './AdminArea/Profile/index';
import AdminAreaIndex from './AdminArea/Area/index'; // <-- BARU: Import halaman data lokasi

// --- IMPORT HALAMAN OPERATOR ---
import OperatorDashboard from './Operator/dashboard'; 
import OperatorSmartContainer from './Operator/SmartContainer/index'; 
import OperatorSystemSetting from './Operator/SystemSettingIndex'; 
import OperatorProfile from './Operator/Profile/index'; 

// --- IMPORT HALAMAN ADMIN STORE ---
import DashboardStore from './AdminStore/dashboard';
import ProdukIndex from './AdminStore/Produk/index'; 
import PesananIndex from './AdminStore/Pesanan/index';
import PengirimanIndex from './AdminStore/Pengiriman/index'; 
import StoreSystemSetting from './AdminStore/SystemSettingIndex'; 
import StoreProfileIndex from './AdminStore/Profile/index'; // <-- BARU: Import profil admin store

function App() {
  return (
    <Router>
      <Routes>
        {/* HALAMAN UTAMA */}
        <Route path="/" element={<Login />} />
        
        {/* GROUP 1: SUPER ADMIN */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/smart-container" element={<SmartContainerIndex />} />
        <Route path="/smart-truck" element={<SmartTruckIndex />} />
        <Route path="/areas" element={<AreaIndex />} />
        <Route path="/users" element={<UserIndex />} />
        <Route path="/waste-prices" element={<WastePricesIndex />} />
        <Route path="/marketplace" element={<MarketPlaceIndex />} />
        <Route path="/waste-management" element={<WasteManagementIndex />} />
        <Route path="/finansial-reports" element={<FinansialReportsIndex />} />
        <Route path="/settings" element={<SystemSettingIndex />} />
        <Route path="/profile" element={<ProfileIndex />} />

        {/* GROUP 2: ADMIN AREA */}
        <Route path="/AdminArea/dashboard" element={<DashboardArea />} />
        <Route path="/AdminArea/machine" element={<MachineManagement />} />
        <Route path="/AdminArea/operator" element={<OperatorManagement />} />
        <Route path="/AdminArea/local-waste" element={<LocalWastePrice />} />
        <Route path="/AdminArea/locations" element={<AdminAreaIndex />} />
        <Route path="/AdminArea/settings" element={<AreaSettingIndex />} />
        <Route path="/AdminArea/profile" element={<AreaProfileIndex />} />
        
        {/* GROUP 3: OPERATOR */}
        <Route path="/operator/dashboard" element={<OperatorDashboard />} />
        <Route path="/operator/smart-container" element={<OperatorSmartContainer />} />
        <Route path="/operator/settings" element={<OperatorSystemSetting />} />
        <Route path="/operator/profile" element={<OperatorProfile />} />

        {/* GROUP 4: ADMIN STORE */}
        <Route path="/store/dashboard" element={<DashboardStore />} />
        <Route path="/store/produk" element={<ProdukIndex />} /> 
        <Route path="/store/pesanan" element={<PesananIndex />} />
        <Route path="/store/shipping" element={<PengirimanIndex />} />
        <Route path="/store/settings" element={<StoreSystemSetting />} /> 
        <Route path="/store/profile" element={<StoreProfileIndex />} /> {/* <-- BARU: Route ke profil store */}

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;