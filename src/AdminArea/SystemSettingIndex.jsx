import React from "react";
import MainLayout from "./MainLayout";
import { Card, Typography, Button, Input, Switch, Avatar } from "@material-tailwind/react";
import { 
  AdjustmentsHorizontalIcon, 
  MapPinIcon, 
  CpuChipIcon, 
  BellAlertIcon, 
  ClockIcon 
} from "@heroicons/react/24/outline";

const AreaSettingIndex = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">Area Configuration</Typography>
          <Typography className="text-gray-500 text-sm italic">Atur operasional unit AIoT dan preferensi wilayah EcoCash Anda</Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SISI KIRI: Status Wilayah */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 rounded-[32px] border border-blue-50 shadow-sm text-center bg-gradient-to-b from-white to-blue-50/30">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-600 p-4 rounded-3xl shadow-lg shadow-blue-200">
                  <MapPinIcon className="h-10 w-10 text-white" />
                </div>
              </div>
              <Typography variant="h6" className="text-blue-900 font-bold">Cikini Area - DKI 01</Typography>
              <Typography className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Region Managed by You</Typography>
              
              <div className="mt-6 p-4 bg-white rounded-2xl border border-blue-50 text-left space-y-2">
                <div className="flex justify-between">
                  <Typography className="text-[10px] font-bold text-gray-400 uppercase">Active Machines</Typography>
                  <Typography className="text-[10px] font-black text-blue-600">12 Unit</Typography>
                </div>
                <div className="flex justify-between">
                  <Typography className="text-[10px] font-bold text-gray-400 uppercase">System Status</Typography>
                  <Typography className="text-[10px] font-black text-green-500">OPTIMAL</Typography>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-[32px] border border-blue-50 shadow-sm space-y-4">
              <Typography variant="small" className="text-blue-900 font-bold flex items-center gap-2 uppercase text-[10px] tracking-widest">
                <BellAlertIcon className="h-4 w-4 text-orange-500" /> Operational Alert
              </Typography>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Typography className="text-xs font-bold text-gray-600">Full Container Notify</Typography>
                  <Switch color="blue" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Typography className="text-xs font-bold text-gray-600">Machine Offline Alert</Typography>
                  <Switch color="blue" defaultChecked />
                </div>
              </div>
            </Card>
          </div>

          {/* SISI KANAN: Operational Detail */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 rounded-[32px] border border-blue-50 shadow-sm space-y-8">
              
              {/* Area & Operational Time */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-2">
                  <ClockIcon className="h-5 w-5 text-blue-500" />
                  <Typography className="text-sm font-bold text-blue-900 uppercase tracking-wider">Jam Operasional Wilayah</Typography>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Buka Pukul" type="time" defaultValue="08:00" className="rounded-xl" />
                  <Input label="Tutup Pukul" type="time" defaultValue="17:00" className="rounded-xl" />
                  <Input label="Penanggung Jawab Area" defaultValue="Amel - Supervisor" className="rounded-xl" />
                  <Input label="Kontak Darurat Area" defaultValue="+62 812-3456-789" className="rounded-xl" />
                </div>
              </div>

              {/* AIoT Unit Sync */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-2">
                  <CpuChipIcon className="h-5 w-5 text-green-500" />
                  <Typography className="text-sm font-bold text-blue-900 uppercase tracking-wider">AIoT Unit Synchronization</Typography>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <Typography className="text-[11px] text-gray-500 mb-2">Sinkronisasi manual jika data mesin wilayah tertunda</Typography>
                    <Button variant="outlined" size="sm" color="green" className="rounded-lg normal-case font-bold">Sync All Machine in Cikini</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Default Waste Weight Limit (Kg)" defaultValue="50" type="number" className="rounded-xl" />
                    <Input label="Data Log Retention (Days)" defaultValue="30" type="number" className="rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <Button variant="text" color="blue-gray" className="rounded-xl normal-case font-bold">Discard</Button>
                <Button className="bg-[#2b6cb0] rounded-xl normal-case px-10 font-bold shadow-none">Update Area Settings</Button>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default AreaSettingIndex;