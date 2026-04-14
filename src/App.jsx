import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Halaman Super Admin
import Login from './Login/login'; 
import Dashboard from './SuperAdmin/dashboard';
import SmartContainerIndex from './SuperAdmin/SmartContainer/index';
import SmartTruckIndex from './SuperAdmin/SmartTruck/index';
import UserIndex from './SuperAdmin/Users/index';
import WastePricesIndex from './SuperAdmin/WastePrices/index';
import MarketPlaceIndex from './SuperAdmin/MarketPlace/index';
import FinansialReportsIndex from './SuperAdmin/FinansialReports/index';
import SystemSettingIndex from './SuperAdmin/SystemSettingIndex';
import ProfileIndex from './SuperAdmin/Profile/index';

// Import Halaman Admin Area
import DashboardArea from './AdminArea/dashboard';
import MachineManagement from './AdminArea/Machine/index'; 
import OperatorManagement from './AdminArea/Operator/index'; 
import LocalWastePrice from './AdminArea/LocalWastePrice/index'; 
import AreaSettingIndex from './AdminArea/SystemSettingIndex';
import AreaProfileIndex from './AdminArea/Profile/index';

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman utama */}
        <Route path="/" element={<Login />} />
        
        {/* GROUP 1: SUPER ADMIN */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/smart-container" element={<SmartContainerIndex />} />
        <Route path="/smart-truck" element={<SmartTruckIndex />} />
        <Route path="/users" element={<UserIndex />} />
        <Route path="/waste-prices" element={<WastePricesIndex />} />
        <Route path="/marketplace" element={<MarketPlaceIndex />} />
        <Route path="/finansial-reports" element={<FinansialReportsIndex />} />
        <Route path="/settings" element={<SystemSettingIndex />} />
        <Route path="/profile" element={<ProfileIndex />} />

        {/* GROUP 2: ADMIN AREA */}
        <Route path="/area/dashboard" element={<DashboardArea />} />
        <Route path="/area/machine" element={<MachineManagement />} />
        <Route path="/area/operator" element={<OperatorManagement />} />
        <Route path="/area/local-waste" element={<LocalWastePrice />} />
        <Route path="/area/settings" element={<AreaSettingIndex />} />
        <Route path="/area/profile" element={<AreaProfileIndex />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;