import React from "react";
import MainLayout from "./MainLayout";
import { 
  Card, 
  Typography, 
  Button, 
  Input, 
  Switch 
} from "@material-tailwind/react";
import { 
  BuildingStorefrontIcon, 
  BellAlertIcon, 
  ClockIcon,
  TruckIcon,
  CreditCardIcon
} from "@heroicons/react/24/outline";

const SystemSettingIndex = () => {
  return (
    <MainLayout>
      <div className="space-y-6 mt-4 pb-10 px-2 md:px-0">
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-blue-900 font-black uppercase tracking-tighter">
            Store Configuration
          </Typography>
          <Typography className="text-gray-500 text-sm font-medium italic">
            Kelola operasional marketplace dan preferensi toko digital EcoCash Anda
          </Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Store Status & Alerts */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 rounded-[2rem] border-none shadow-xl shadow-blue-900/5 text-center bg-white">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-600 p-4 rounded-3xl shadow-lg shadow-blue-200">
                  <BuildingStorefrontIcon className="h-10 w-10 text-white" />
                </div>
              </div>
              <Typography variant="h5" className="text-blue-900 font-black">EcoStore Tasikmalaya</Typography>
              <Typography className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Official Merchant Partner</Typography>
              
              <div className="mt-6 p-4 bg-green-50/50 rounded-2xl border border-green-100 text-left">
                <div className="flex justify-between items-center">
                  <Typography className="text-[10px] font-black text-green-800 uppercase tracking-tighter">Status Toko</Typography>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Typography className="text-xs font-black text-green-700">Online / Buka</Typography>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-[2rem] border-none shadow-xl shadow-blue-900/5 space-y-5 bg-white">
              <Typography className="text-blue-900 font-black flex items-center gap-2 uppercase text-[10px] tracking-widest">
                <BellAlertIcon className="h-4 w-4 text-orange-500" /> Notifikasi Penjualan
              </Typography>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Typography className="text-xs font-bold text-gray-600">Pesanan Masuk Baru</Typography>
                  <Switch color="blue" defaultChecked ripple={false} />
                </div>
                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <Typography className="text-xs font-bold text-gray-600">Review Pelanggan</Typography>
                  <Switch color="blue" ripple={false} />
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Detailed Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 rounded-[2rem] border-none shadow-xl shadow-blue-900/5 space-y-8 bg-white">
              
              {/* Jam Operasional */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                  <ClockIcon className="h-5 w-5 text-blue-500" />
                  <Typography className="text-sm font-black text-blue-900 uppercase tracking-tight">Jam Operasional Toko</Typography>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Buka Toko" type="time" defaultValue="08:00" color="blue" />
                  <Input label="Tutup Toko" type="time" defaultValue="20:00" color="blue" />
                </div>
              </div>

              {/* Ekspedisi & Pembayaran */}
              <div className="space-y-5 pt-4">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                  <TruckIcon className="h-5 w-5 text-blue-500" />
                  <Typography className="text-sm font-black text-blue-900 uppercase tracking-tight">Metode Pengiriman Aktif</Typography>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                      <Switch size="sm" color="blue" defaultChecked />
                      <Typography className="text-[11px] font-bold text-gray-700">Self Pickup</Typography>
                   </div>
                   <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                      <Switch size="sm" color="blue" defaultChecked />
                      <Typography className="text-[11px] font-bold text-gray-700">Kurir Lokal</Typography>
                   </div>
                   <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                      <Switch size="sm" color="blue" />
                      <Typography className="text-[11px] font-bold text-gray-700">JNE/J&T</Typography>
                   </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <Button variant="text" color="blue-gray" className="rounded-xl normal-case font-black text-xs">Reset Default</Button>
                <Button className="bg-blue-900 rounded-xl normal-case px-10 font-black text-xs shadow-lg shadow-blue-100">Update Konfigurasi</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SystemSettingIndex;