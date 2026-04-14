import React from "react";
import MainLayout from "../MainLayout";
import { Card, Typography, Chip, Input } from "@material-tailwind/react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const FinansialReportsIndex = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header & Date Filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold">Finansial Reports</Typography>
          <div className="w-full md:w-72">
            <Input 
              label="Filter Tanggal" 
              icon={<CalendarDaysIcon className="h-5 w-5 text-blue-500" />} 
              className="rounded-xl border-blue-100 bg-white" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* KOLOM KIRI: Public Transaction Reports */}
          <Card className="p-6 rounded-[32px] border border-blue-50 shadow-sm bg-blue-50/20">
            <Typography variant="h6" className="text-[#2b6cb0] font-bold mb-4">Public Transaction Reports</Typography>
            
            {/* Stats Group */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <StatCard label="Total Deposit" value="Rp.200.000" />
              <StatCard label="Total Withdraw" value="Rp.100.000" />
              <StatCard label="Total Perdagangan" value="Rp.50.000" />
            </div>

            {/* Table Public */}
            <div className="overflow-x-auto rounded-xl border border-white bg-white/60">
              <table className="w-full text-left table-auto">
                <thead className="bg-[#e3f2fd]">
                  <tr className="text-[10px] text-blue-800 uppercase font-black tracking-tighter">
                    <th className="p-3">ID Transaksi</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Nama Pengguna</th>
                    <th className="p-3 text-center">Tipe</th>
                    <th className="p-3">Nominal</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] font-bold text-blue-900">
                  <tr className="border-b border-blue-50">
                    <td className="p-3">TR 001</td>
                    <td className="p-3">27-03-26</td>
                    <td className="p-3">Amel</td>
                    <td className="p-3 text-center">Deposit</td>
                    <td className="p-3">Rp.50.000</td>
                    <td className="p-3"><Chip size="sm" variant="ghost" color="green" value="Selesai" className="rounded-lg text-[9px]" /></td>
                  </tr>
                  <tr className="border-b border-blue-50">
                    <td className="p-3">TR 002</td>
                    <td className="p-3">27-03-26</td>
                    <td className="p-3">Mei</td>
                    <td className="p-3 text-center">Withdraw</td>
                    <td className="p-3">Rp.30.000</td>
                    <td className="p-3"><Chip size="sm" variant="ghost" color="orange" value="Proses" className="rounded-lg text-[9px]" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* KOLOM KANAN: Container System Reports */}
          <Card className="p-6 rounded-[32px] border border-blue-50 shadow-sm bg-blue-50/20">
            <Typography variant="h6" className="text-[#2b6cb0] font-bold mb-4">Container System Reports</Typography>
            
            {/* Stats Group */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <StatCard label="Total Pendapatan" value="Rp.7.000.000" />
              <StatCard label="Total Biaya" value="Rp.300.000" />
              <StatCard label="Volume Sampah" value="20 kg" />
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-xl border border-white bg-white/60">
              <table className="w-full text-left table-auto">
                <thead className="bg-[#e3f2fd]">
                  <tr className="text-[10px] text-blue-800 uppercase font-black tracking-tighter">
                    <th className="p-3">ID Container</th>
                    <th className="p-3">Lokasi</th>
                    <th className="p-3 text-center">Total Volume</th>
                    <th className="p-3">Biaya Operasional</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] font-bold text-blue-900">
                  <tr className="border-b border-blue-50">
                    <td className="p-3">CN 001</td>
                    <td className="p-3">Cikini 1</td>
                    <td className="p-3 text-center">10kg</td>
                    <td className="p-3">Rp.200.000</td>
                    <td className="p-3"><Chip size="sm" variant="ghost" color="green" value="Selesai" className="rounded-lg text-[9px]" /></td>
                  </tr>
                  <tr className="border-b border-blue-50">
                    <td className="p-3">CN 002</td>
                    <td className="p-3">Cikini 2</td>
                    <td className="p-3 text-center">10kg</td>
                    <td className="p-3">Rp.100.000</td>
                    <td className="p-3"><Chip size="sm" variant="ghost" color="red" value="Perawatan" className="rounded-lg text-[9px]" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      </div>
    </MainLayout>
  );
};

// Komponen Kecil untuk Kotak Statistik
const StatCard = ({ label, value }) => (
  <div className="bg-white p-3 rounded-xl border border-blue-50 shadow-sm text-center">
    <Typography className="text-[9px] font-bold text-blue-400 uppercase leading-tight">{label}</Typography>
    <Typography className="text-[11px] font-black text-blue-800">{value}</Typography>
  </div>
);

export default FinansialReportsIndex;