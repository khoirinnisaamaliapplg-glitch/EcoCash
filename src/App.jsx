import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

// ============================================================
// LOGIN
// ============================================================

import Login from "./Login/login";

// ============================================================
// SUPER ADMIN
// ============================================================

import Dashboard from "./SuperAdmin/dashboard";
import SmartContainerIndex from "./SuperAdmin/SmartContainer/index";
import SuperAdminTruckIndex from "./SuperAdmin/SmartTruck/index";
import UserIndex from "./SuperAdmin/Users/index";
import WastePricesIndex from "./SuperAdmin/WastePrices/index";
import MarketPlaceIndex from "./SuperAdmin/Store/index";
import FinansialReportsIndex from "./SuperAdmin/FinansialReports/index";
import SystemSettingIndex from "./SuperAdmin/SystemSettingIndex";
import ProfileIndex from "./SuperAdmin/Profile/index";
import AreaIndex from "./SuperAdmin/Area/index";
import WasteManagementIndex from "./SuperAdmin/WasteManagement/index";
import OrganizationIndex from "./SuperAdmin/organization/index";
import VoucherManagement from "./SuperAdmin/VoucherManagement";
import FoundationIndex from "./SuperAdmin/Foundation/index";

// ============================================================
// ADMIN AREA
// ============================================================

import DashboardArea from "./AdminArea/dashboard";
import MachineManagement from "./AdminArea/Machine/index";
import OperatorManagement from "./AdminArea/Operator/index";
import LocalWastePrice from "./AdminArea/LocalWastePrice/index";
import AreaSettingIndex from "./AdminArea/SystemSettingIndex";
import AreaProfileIndex from "./AdminArea/Profile/index";
import AdminAreaIndex from "./AdminArea/Area/index";
import StoreIndex from "./AdminArea/Store";
import AdminAreaTruckIndex from "./AdminArea/SmartTruck/index";

// ============================================================
// ORGANIZATION ADMIN
// ============================================================

import DashboardOrganization from "./OrganizationAdmin/dashboard";
import OrganizationUsers from "./OrganizationAdmin/Users";

// ============================================================
// FOUNDATION ADMIN
// ============================================================

import FoundationDashboard from "./AdminFoundation/dashboard";
import FoundationDonations from "./AdminFoundation/Donations/index";
import FoundationCharity from "./AdminFoundation/Charity/index";
import FoundationProfile from "./AdminFoundation/profile/index";

// ============================================================
// OPERATOR
// ============================================================

import OperatorDashboard from "./Operator/dashboard";
import OperatorSmartContainer from "./Operator/SmartContainer/index";
import OperatorSystemSetting from "./Operator/SystemSettingIndex";
import OperatorProfile from "./Operator/Profile/index";

// ============================================================
// STORE ADMIN
// ============================================================

import DashboardStore from "./AdminStore/dashboard";
import ProdukIndex from "./AdminStore/Produk/index";
import PesananIndex from "./AdminStore/Pesanan/index";
import PengirimanIndex from "./AdminStore/Pengiriman/index";
import StoreSystemSetting from "./AdminStore/SystemSettingIndex";
import StoreProfileIndex from "./AdminStore/Profile/index";
import StoreVoucherManagement from "./AdminStore/vocher/index";
import StoreWalletManagement from "./AdminStore/Wallet/index";

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <Router>
      <Routes>

        {/* ====================================================
            PUBLIC
        ==================================================== */}

        <Route
          path="/"
          element={<Login />}
        />

        {/* ====================================================
            SUPER ADMIN
        ==================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_ADMIN"]}
            />
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/smart-container"
            element={<SmartContainerIndex />}
          />

          <Route
            path="/smart-truck"
            element={<SuperAdminTruckIndex />}
          />

          <Route
            path="/areas"
            element={<AreaIndex />}
          />

          <Route
            path="/users"
            element={<UserIndex />}
          />

          <Route
            path="/waste-prices"
            element={<WastePricesIndex />}
          />

          <Route
            path="/marketplace"
            element={<MarketPlaceIndex />}
          />

          <Route
            path="/waste-management"
            element={<WasteManagementIndex />}
          />

          <Route
            path="/finansial-reports"
            element={<FinansialReportsIndex />}
          />

          <Route
            path="/settings"
            element={<SystemSettingIndex />}
          />

          <Route
            path="/profile"
            element={<ProfileIndex />}
          />

          <Route
            path="/organizations"
            element={<OrganizationIndex />}
          />

          <Route
            path="/vouchers"
            element={<VoucherManagement />}
          />
          <Route
            path="/foundations"
            element={<FoundationIndex />}
          />
        </Route>

        {/* ====================================================
            AREA ADMIN
        ==================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["AREA_ADMIN"]}
            />
          }
        >
          <Route
            path="/AdminArea/dashboard"
            element={<DashboardArea />}
          />

          <Route
            path="/AdminArea/machine"
            element={<MachineManagement />}
          />

          <Route
            path="/AdminArea/operator"
            element={<OperatorManagement />}
          />

          <Route
            path="/AdminArea/local-waste"
            element={<LocalWastePrice />}
          />

          <Route
            path="/AdminArea/locations"
            element={<AdminAreaIndex />}
          />

          <Route
            path="/AdminArea/settings"
            element={<AreaSettingIndex />}
          />

          <Route
            path="/AdminArea/profile"
            element={<AreaProfileIndex />}
          />

          <Route
            path="/AdminArea/store"
            element={<StoreIndex />}
          />

          <Route
            path="/AdminArea/smart-truck"
            element={<AdminAreaTruckIndex />}
          />
        </Route>

        {/* ====================================================
            ORGANIZATION ADMIN
        ==================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "ORGANIZATION_ADMIN",
              ]}
            />
          }
        >
          <Route
            path="/OrganizationAdmin/dashboard"
            element={<DashboardOrganization />}
          />

          <Route
            path="/OrganizationAdmin/users"
            element={<OrganizationUsers />}
          />
        </Route>

        {/* ====================================================
            FOUNDATION ADMIN
        ==================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "FOUNDATION_ADMIN",
              ]}
            />
          }
        >
          <Route
            path="/FoundationAdmin/dashboard"
            element={<FoundationDashboard />}
          />

          <Route
            path="/FoundationAdmin/donations"
            element={<FoundationDonations />}
          />

            <Route
              path="/FoundationAdmin/charities"
              element={
                <FoundationCharity />
              }
            />
            <Route
            path="/FoundationAdmin/profile"
            element={<FoundationProfile />}
          />
          </Route>
        


        {/* ====================================================
            MACHINE OPERATOR
        ==================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "MACHINE_OPERATOR",
              ]}
            />
          }
        >
          <Route
            path="/operator/dashboard"
            element={<OperatorDashboard />}
          />

          <Route
            path="/operator/smart-container"
            element={<OperatorSmartContainer />}
          />

          <Route
            path="/operator/settings"
            element={<OperatorSystemSetting />}
          />

          <Route
            path="/operator/profile"
            element={<OperatorProfile />}
          />
        </Route>

        {/* ====================================================
            STORE ADMIN
        ==================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "STORE_ADMIN",
              ]}
            />
          }
        >
          <Route
            path="/store/dashboard"
            element={<DashboardStore />}
          />

          <Route
            path="/store/produk"
            element={<ProdukIndex />}
          />

          <Route
            path="/store/pesanan"
            element={<PesananIndex />}
          />

          <Route
            path="/store/shipping"
            element={<PengirimanIndex />}
          />

          <Route
            path="/store/settings"
            element={<StoreSystemSetting />}
          />

          <Route
            path="/store/profile"
            element={<StoreProfileIndex />}
          />

          <Route
            path="/store/voucher"
            element={<StoreVoucherManagement />}
          />
          <Route
            path="/store/wallet"
            element={<StoreWalletManagement />}
          />
        </Route>

        {/* ====================================================
            CATCH ALL
        ==================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </Router>
  );
}

export default App;