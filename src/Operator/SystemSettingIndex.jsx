import React from "react";
import MainLayout from "./MainLayout"; // Pastikan path ini benar (MainLayout ada di folder Operator)
import { 
  Card, 
  Typography, 
  Button, 
  Input, 
  Switch 
} from "@material-tailwind/react";
import { 
  MapPinIcon, 
  CpuChipIcon, 
  BellAlertIcon, 
  ClockIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/outline";

const SystemSettingIndex = () => { // Sesuaikan nama dengan file agar tidak bingung
  return (
    <MainLayout>
      <div className="space-y-6 mt-4 pb-10 px-2 md:px-0">
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#1e5ea8] font-black uppercase tracking-tighter">
            System Configuration
          </Typography>
          <Typography className="text-gray-500 text-sm font-medium italic">
            Atur parameter teknis unit AIoT dan preferensi pemantauan lapangan Anda
          </Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 rounded-[2rem] border-none shadow-xl shadow-blue-900/5 text-center bg-white">
              <div className="flex justify-center mb-4">
                <div className="bg-[#1e5ea8] p-4 rounded-3xl shadow-lg shadow-blue-200">
                  <MapPinIcon className="h-10 w-10 text-white" />
                </div>
              </div>
              <Typography variant="h5" className="text-blue-900 font-black">Area Tasikmalaya</Typography>
              <Typography className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Operator Field Unit</Typography>
              <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-left space-y-3">
                <div className="flex justify-between items-center">
                  <Typography className="text-[10px] font-black text-blue-800 uppercase">My Machines</Typography>
                  <Typography className="text-xs font-black text-[#1e5ea8]">03 Unit Aktif</Typography>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-[2rem] border-none shadow-xl shadow-blue-900/5 space-y-5 bg-white">
              <Typography className="text-[#1e5ea8] font-black flex items-center gap-2 uppercase text-[10px] tracking-widest">
                <BellAlertIcon className="h-4 w-4 text-orange-500" /> Pengingat Otomatis
              </Typography>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Typography className="text-xs font-bold text-gray-600">Notif Mesin Error</Typography>
                  <Switch color="blue" defaultChecked ripple={false} />
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 rounded-[2rem] border-none shadow-xl shadow-blue-900/5 space-y-8 bg-white">
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                  <ClockIcon className="h-5 w-5 text-blue-500" />
                  <Typography className="text-sm font-black text-blue-900 uppercase tracking-tight">Waktu Operasional Shift</Typography>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Mulai Tugas" type="time" defaultValue="08:00" color="blue" />
                  <Input label="Selesai Tugas" type="time" defaultValue="17:00" color="blue" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <Button variant="text" color="blue-gray" className="rounded-xl normal-case font-black text-xs">Reset</Button>
                <Button className="bg-[#1e5ea8] rounded-xl normal-case px-10 font-black text-xs shadow-lg shadow-blue-100">Simpan</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SystemSettingIndex; 