import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// --- IMPORT SEMUA HALAMAN (Jangan sampai dihapus) ---
import Login from './Login/login'; 
import Dashboard from './SuperAdmin/dashboard';
import SmartContainerIndex from './SuperAdmin/SmartContainer/index';
import SuperAdminTruckIndex from './SuperAdmin/SmartTruck/index'; // Diubah namanya agar unik
import UserIndex from './SuperAdmin/Users/index';
import WastePricesIndex from './SuperAdmin/WastePrices/index';
import MarketPlaceIndex from './SuperAdmin/Store/index';
import FinansialReportsIndex from './SuperAdmin/FinansialReports/index';
import SystemSettingIndex from './SuperAdmin/SystemSettingIndex';
import ProfileIndex from './SuperAdmin/Profile/index';
import AreaIndex from './SuperAdmin/Area/index'; 
import WasteManagementIndex from './SuperAdmin/WasteManagement/index';
import OrganizationIndex from './SuperAdmin/organization/index'; // Tambahkan ini jika ada halaman organisasi

import DashboardArea from './AdminArea/dashboard';
import MachineManagement from './AdminArea/Machine/index'; 
import OperatorManagement from './AdminArea/Operator/index'; 
import LocalWastePrice from './AdminArea/LocalWastePrice/index'; 
import AreaSettingIndex from './AdminArea/SystemSettingIndex';
import AreaProfileIndex from './AdminArea/Profile/index';
import AdminAreaIndex from './AdminArea/Area/index';
import StoreIndex from './AdminArea/Store';
import AdminAreaTruckIndex from './AdminArea/SmartTruck/index'; // Diubah namanya agar unik

import DashboardOrganization from "./OrganizationAdmin/dashboard";
import OrganizationUsers from "./OrganizationAdmin/Users";


import OperatorDashboard from './Operator/dashboard'; 
import OperatorSmartContainer from './Operator/SmartContainer/index'; 
import OperatorSystemSetting from './Operator/SystemSettingIndex'; 
import OperatorProfile from './Operator/Profile/index'; 

import DashboardStore from './AdminStore/dashboard';
import ProdukIndex from './AdminStore/Produk/index'; 
import PesananIndex from './AdminStore/Pesanan/index';
import PengirimanIndex from './AdminStore/Pengiriman/index'; 
import StoreSystemSetting from './AdminStore/SystemSettingIndex'; 
import StoreProfileIndex from './AdminStore/Profile/index';

function App() {
  return (
    <Router>
      <Routes>
        {/* HALAMAN PUBLIK */}
        <Route path="/" element={<Login />} />
        
        {/* GROUP 1: KHUSUS SUPER ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/smart-container" element={<SmartContainerIndex />} />
          <Route path="/smart-truck" element={<SuperAdminTruckIndex />} /> {/* Menggunakan nama baru */}
          <Route path="/areas" element={<AreaIndex />} />
          <Route path="/users" element={<UserIndex />} />
          <Route path="/waste-prices" element={<WastePricesIndex />} />
          <Route path="/marketplace" element={<MarketPlaceIndex />} />
          <Route path="/waste-management" element={<WasteManagementIndex />} />
          <Route path="/finansial-reports" element={<FinansialReportsIndex />} />
          <Route path="/settings" element={<SystemSettingIndex />} />
          <Route path="/profile" element={<ProfileIndex />} />
          <Route path="/organizations" element={<OrganizationIndex />} /> {/* Tambahkan ini jika ada halaman organisasi */}
        </Route>

        {/* GROUP 2: KHUSUS ADMIN AREA */}
        <Route element={<ProtectedRoute allowedRoles={['AREA_ADMIN']} />}>
          <Route path="/AdminArea/dashboard" element={<DashboardArea />} />
          <Route path="/AdminArea/machine" element={<MachineManagement />} />
          <Route path="/AdminArea/operator" element={<OperatorManagement />} />
          <Route path="/AdminArea/local-waste" element={<LocalWastePrice />} />
          <Route path="/AdminArea/locations" element={<AdminAreaIndex />} />
          <Route path="/AdminArea/settings" element={<AreaSettingIndex />} />
          <Route path="/AdminArea/profile" element={<AreaProfileIndex />} />
          <Route path="/AdminArea/store" element={<StoreIndex />} />
          <Route path="/AdminArea/smart-truck" element={<AdminAreaTruckIndex />} /> {/* Menggunakan nama baru */}
        </Route>
        {/* GROUP 5: KHUSUS ORGANIZATION ADMIN */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["ORGANIZATION_ADMIN"]}
            />
          }
        >
          <Route
            path="/OrganizationAdmin/dashboard"
            element={<DashboardOrganization />}
          />
        </Route>
         <Route
            path="/OrganizationAdmin/users"
            element={
              <OrganizationUsers />
            }
          />

        {/* GROUP 3: KHUSUS OPERATOR */}
        <Route element={<ProtectedRoute allowedRoles={['MACHINE_OPERATOR']} />}>
          <Route path="/operator/dashboard" element={<OperatorDashboard />} />
          <Route path="/operator/smart-container" element={<OperatorSmartContainer />} />
          <Route path="/operator/settings" element={<OperatorSystemSetting />} />
          <Route path="/operator/profile" element={<OperatorProfile />} />
        </Route>

        {/* GROUP 4: KHUSUS ADMIN STORE */}
        <Route element={<ProtectedRoute allowedRoles={['STORE_ADMIN']} />}>
          <Route path="/store/dashboard" element={<DashboardStore />} />
          <Route path="/store/produk" element={<ProdukIndex />} /> 
          <Route path="/store/pesanan" element={<PesananIndex />} />
          <Route path="/store/shipping" element={<PengirimanIndex />} />
          <Route path="/store/settings" element={<StoreSystemSetting />} /> 
          <Route path="/store/profile" element={<StoreProfileIndex />} />
          <Route path="/store/pesanan" element={<PesananIndex />} />
        </Route>

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;