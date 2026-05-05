import React, { useState } from "react"; // Tambahkan useState
import MainLayout from "./MainLayout";
import { Card, Typography, Button, Input, Switch, Avatar } from "@material-tailwind/react";
import { GlobeAltIcon, CpuChipIcon, ShieldCheckIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";

const SystemSettingIndex = () => {
  // 1. Inisialisasi State untuk formulir
  const [settings, setSettings] = useState({
    systemName: "EcoCash Indonesia",
    adminEmail: "admin@ecocash.id",
    timeZone: "(GMT+07:00) Jakarta",
    currency: "IDR (Rp)",
    mqttUrl: "mqtt://broker.ecocash-aiot.com:1883",
    refreshInterval: 30,
    twoFactor: true,
    maintenanceMode: false
  });

  // 2. Handler untuk perubahan input text/number
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Handler untuk perubahan Switch
  const handleSwitch = (name) => {
    setSettings((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // 4. Handler saat tombol Save diklik
  const handleSave = () => {
    console.log("Data yang disimpan:", settings);
    alert("Konfigurasi sistem berhasil diperbarui!");
    // Di sini kamu bisa panggil fungsi API seperti axios.post('/api/settings', settings)
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">System Setting</Typography>
          <Typography className="text-gray-500 text-sm italic">Konfigurasi AIoT, Keamanan, dan Identitas EcoCash</Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SISI KIRI */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 rounded-[32px] border border-blue-50 shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar
                    src="https://api.dicebear.com/7.x/shapes/svg?seed=EcoCash"
                    alt="Logo System"
                    size="xl"
                    variant="rounded"
                    className="rounded-2xl border-4 border-blue-50 shadow-md"
                  />
                  <div className="absolute -bottom-2 -right-2 p-1.5 bg-green-500 rounded-lg border-2 border-white cursor-pointer">
                    <CloudArrowUpIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <Typography variant="h6" className="text-blue-900 font-bold">EcoCash System</Typography>
              <Typography className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">v3.0 - AIoT Integrated</Typography>
              <div className="mt-6 space-y-3">
                <Button fullWidth variant="outlined" color="blue" className="rounded-xl normal-case py-2 text-[11px]">Download Backup Data</Button>
                <Button fullWidth className="bg-[#ef5350] rounded-xl normal-case py-2 text-[11px] shadow-none" onClick={() => alert("Sistem direset!")}>Reset System</Button>
              </div>
            </Card>

            <Card className="p-6 rounded-[32px] border border-blue-50 shadow-sm space-y-4">
              <Typography variant="small" className="text-blue-900 font-bold flex items-center gap-2 uppercase text-[10px] tracking-widest">
                <ShieldCheckIcon className="h-4 w-4 text-green-500" /> Security Status
              </Typography>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Typography className="text-xs font-bold text-gray-600">Two-Factor Auth</Typography>
                  <Switch 
                    color="blue" 
                    checked={settings.twoFactor} 
                    onChange={() => handleSwitch('twoFactor')} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography className="text-xs font-bold text-gray-600">Maintenance Mode</Typography>
                  <Switch 
                    color="red" 
                    checked={settings.maintenanceMode} 
                    onChange={() => handleSwitch('maintenanceMode')} 
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* SISI KANAN */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 rounded-[32px] border border-blue-50 shadow-sm space-y-8">
              
              {/* General Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-2">
                  <GlobeAltIcon className="h-5 w-5 text-blue-500" />
                  <Typography className="text-sm font-bold text-blue-900 uppercase tracking-wider">General Configuration</Typography>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="System Name" name="systemName" value={settings.systemName} onChange={handleChange} className="rounded-xl" />
                  <Input label="Admin Email" name="adminEmail" value={settings.adminEmail} onChange={handleChange} className="rounded-xl" />
                  <Input label="Time Zone" name="timeZone" value={settings.timeZone} onChange={handleChange} className="rounded-xl" />
                  <Input label="Currency Symbol" name="currency" value={settings.currency} onChange={handleChange} className="rounded-xl" />
                </div>
              </div>

              {/* AIoT & Server Link */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-2">
                  <CpuChipIcon className="h-5 w-5 text-green-500" />
                  <Typography className="text-sm font-bold text-blue-900 uppercase tracking-wider">AIoT & Server Link</Typography>
                </div>
                <div className="space-y-4">
                  <Input label="MQTT Broker URL" name="mqttUrl" value={settings.mqttUrl} onChange={handleChange} className="rounded-xl" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="API Key Sync" type="password" value="**************" disabled className="rounded-xl" />
                    <Input label="Refresh Interval (Sec)" name="refreshInterval" type="number" value={settings.refreshInterval} onChange={handleChange} className="rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <Button variant="text" color="blue-gray" className="rounded-xl normal-case font-bold" onClick={() => window.location.reload()}>Discard</Button>
                <Button className="bg-[#2b6cb0] rounded-xl normal-case px-10 font-bold shadow-none" onClick={handleSave}>Save Changes</Button>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default SystemSettingIndex;