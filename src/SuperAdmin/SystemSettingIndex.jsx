import React from "react";
import MainLayout from "./MainLayout";
import { Card, Typography, Button, Input, Switch, Avatar } from "@material-tailwind/react";
import { Cog6ToothIcon, GlobeAltIcon, CpuChipIcon, ShieldCheckIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";

const SystemSettingIndex = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">System Setting</Typography>
          <Typography className="text-gray-500 text-sm italic">Konfigurasi AIoT, Keamanan, dan Identitas EcoCash</Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SISI KIRI: Identitas Sistem */}
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
                <Button fullWidth className="bg-[#ef5350] rounded-xl normal-case py-2 text-[11px] shadow-none">Reset System</Button>
              </div>
            </Card>

            <Card className="p-6 rounded-[32px] border border-blue-50 shadow-sm space-y-4">
              <Typography variant="small" className="text-blue-900 font-bold flex items-center gap-2 uppercase text-[10px] tracking-widest">
                <ShieldCheckIcon className="h-4 w-4 text-green-500" /> Security Status
              </Typography>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Typography className="text-xs font-bold text-gray-600">Two-Factor Auth</Typography>
                  <Switch color="blue" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Typography className="text-xs font-bold text-gray-600">Maintenance Mode</Typography>
                  <Switch color="red" />
                </div>
              </div>
            </Card>
          </div>

          {/* SISI KANAN: Detail Konfigurasi */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 rounded-[32px] border border-blue-50 shadow-sm space-y-8">
              
              {/* General Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-2">
                  <GlobeAltIcon className="h-5 w-5 text-blue-500" />
                  <Typography className="text-sm font-bold text-blue-900 uppercase tracking-wider">General Configuration</Typography>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="System Name" defaultValue="EcoCash Indonesia" className="rounded-xl" />
                  <Input label="Admin Email" defaultValue="admin@ecocash.id" className="rounded-xl" />
                  <Input label="Time Zone" defaultValue="(GMT+07:00) Jakarta" className="rounded-xl" />
                  <Input label="Currency Symbol" defaultValue="IDR (Rp)" className="rounded-xl" />
                </div>
              </div>

              {/* AIoT & Server Link */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-2">
                  <CpuChipIcon className="h-5 w-5 text-green-500" />
                  <Typography className="text-sm font-bold text-blue-900 uppercase tracking-wider">AIoT & Server Link</Typography>
                </div>
                <div className="space-y-4">
                  <Input label="MQTT Broker URL" defaultValue="mqtt://broker.ecocash-aiot.com:1883" className="rounded-xl" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="API Key Sync" type="password" value="**************" className="rounded-xl" />
                    <Input label="Refresh Interval (Seconds)" defaultValue="30" type="number" className="rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <Button variant="text" color="blue-gray" className="rounded-xl normal-case font-bold">Discard</Button>
                <Button className="bg-[#2b6cb0] rounded-xl normal-case px-10 font-bold shadow-none">Save Changes</Button>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default SystemSettingIndex;