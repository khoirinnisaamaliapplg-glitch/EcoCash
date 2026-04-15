import React from "react";
import MainLayout from "./MainLayout";
import { 
  Card, 
  Typography, 
  Button, 
  Chip, 
  Avatar 
} from "@material-tailwind/react";
import { 
  ShoppingBagIcon, 
  ClipboardDocumentListIcon, 
  TruckIcon, 
  ArrowTrendingUpIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

const DashboardStore = () => {
  const stats = [
    { 
      title: "Produk Saya", 
      value: "12", 
      unit: "Item Aktif", 
      icon: ShoppingBagIcon, 
      color: "blue", 
      growth: "+2 bulan ini",
      gradient: "from-blue-500 to-blue-700"
    },
    { 
      title: "Pesanan Masuk", 
      value: "25", 
      unit: "Perlu Diproses", 
      icon: ClipboardDocumentListIcon, 
      color: "indigo", 
      growth: "+5 hari ini",
      gradient: "from-indigo-500 to-indigo-700"
    },
    { 
      title: "Total Pengiriman", 
      value: "18", 
      unit: "Selesai Dikirim", 
      icon: TruckIcon, 
      color: "cyan", 
      growth: "Efisiensi 98%",
      gradient: "from-cyan-500 to-cyan-700"
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-10 animate-fade-in">
        
        {/* WELCOME BANNER DENGAN GLASSMORPHISM */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-blue-700 p-8 md:p-12 shadow-2xl shadow-blue-200">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <Typography variant="h2" className="text-white font-black tracking-tight mb-2">
                Selamat Datang, Admin Store! 👋
              </Typography>
              <Typography className="text-blue-100 font-medium max-w-md">
                Kelola inventaris marketplace EcoCash Anda dan pantau setiap pesanan masuk secara real-time.
              </Typography>
            </div>
            <Button size="lg" color="white" className="flex items-center gap-3 rounded-2xl text-blue-700 font-black shadow-xl hover:scale-105 transition-transform">
              <PlusIcon className="h-5 w-5 stroke-[3]" /> Tambah Produk
            </Button>
          </div>
        </div>

        {/* STATS SECTION DENGAN EFEK HOVER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <Card key={i} className="group overflow-hidden p-1 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 hover:-translate-y-2">
              <div className="p-7">
                <div className="flex items-start justify-between mb-8">
                  <div className={`p-4 rounded-[1.5rem] bg-gradient-to-br ${stat.gradient} text-white shadow-lg shadow-${stat.color}-200 transform group-hover:rotate-12 transition-transform duration-500`}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                  <Chip 
                    value={stat.growth} 
                    className="rounded-full bg-blue-50 text-blue-700 lowercase font-bold border-none" 
                  />
                </div>
                <Typography className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">{stat.title}</Typography>
                <div className="flex items-baseline gap-2">
                  <Typography variant="h1" className="text-blue-900 font-black text-5xl tracking-tighter">
                    {stat.value}
                  </Typography>
                  <Typography className="text-gray-400 font-bold text-sm italic">{stat.unit}</Typography>
                </div>
              </div>
              <div className={`h-1.5 w-full bg-gradient-to-r ${stat.gradient} opacity-20`}></div>
            </Card>
          ))}
        </div>

        {/* AKTIVITAS TERAKHIR (Tabel Sederhana) */}
        <Card className="rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-700" />
              </div>
              <Typography variant="h5" className="text-blue-900 font-black italic">Recent Orders</Typography>
            </div>
            <Button variant="text" size="sm" className="font-black text-blue-700 hover:bg-blue-50 rounded-xl">View All</Button>
          </div>
          <div className="p-0 overflow-x-auto bg-white">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 uppercase text-[10px] tracking-[0.2em] font-black">
                  <th className="p-6">Produk</th>
                  <th className="p-6">Pembeli</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { id: 1, item: "Paving Block Recycled", user: "Budi Santoso", status: "Proses", total: "Rp 250.000", img: "PB" },
                  { id: 2, item: "Eco-Brick Premium", user: "Siti Aminah", status: "Selesai", total: "Rp 120.000", img: "EB" }
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <Avatar variant="rounded" size="sm" src={`https://ui-avatars.com/api/?name=${row.img}&background=0D8ABC&color=fff`} className="shadow-sm" />
                        <Typography className="font-black text-gray-800 text-sm">{row.item}</Typography>
                      </div>
                    </td>
                    <td className="p-6 font-bold text-gray-600 text-sm">{row.user}</td>
                    <td className="p-6">
                      <Chip 
                        size="sm" 
                        value={row.status} 
                        className={`rounded-lg font-black ${row.status === 'Selesai' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`} 
                      />
                    </td>
                    <td className="p-6 font-black text-blue-900 text-sm">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </MainLayout>
  );
};

export default DashboardStore;