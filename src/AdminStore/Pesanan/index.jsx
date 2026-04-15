import React, { useState } from "react";
import MainLayout from "../MainLayout";
import { 
  Card, 
  Typography, 
  Button, 
  Input, 
  Avatar, 
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { 
  MagnifyingGlassIcon, 
  ArchiveBoxIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const PesananMasuk = () => {
  const [dataPesanan] = useState([
    { id: "PS-001", pembeli: "Mina", produk: "Pot Tanaman Kaleng", metode: "Ambil di Lokasi", status: "Baru", img: "https://images.unsplash.com/photo-1599591037488-348f3f885f81?w=100", keterangan: "Proses" },
    { id: "PS-002", pembeli: "Cinta", produk: "Lampu dari sendok", metode: "Kurir Lokal", status: "Baru", img: "https://images.unsplash.com/photo-1513506496266-3d241991aa05?w=100", keterangan: "Sisipkan" },
    { id: "PS-003", pembeli: "Yusuf", produk: "Lampu dari sendok", metode: "Kurir Lokal", status: "Baru", img: "https://images.unsplash.com/photo-1513506496266-3d241991aa05?w=100", keterangan: "Proses" },
  ]);

  const getKetColor = (ket) => {
    switch (ket) {
      case "Sisipkan": return "bg-emerald-400 text-emerald-900 shadow-emerald-100";
      case "Selesai": return "bg-gray-500 text-white shadow-gray-100";
      default: return "bg-blue-600 text-white shadow-blue-100";
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <Typography variant="h3" className="text-blue-900 font-black tracking-tight flex items-center gap-3">
             <ArchiveBoxIcon className="h-8 w-8 text-blue-600" /> Pesanan
          </Typography>
          <div className="w-full md:w-80">
            <Input 
              label="Cari..." 
              icon={<MagnifyingGlassIcon className="h-5 w-5 text-blue-500" />} 
              className="bg-white rounded-2xl shadow-sm !border-blue-100 focus:!border-blue-500" 
            />
          </div>
        </div>

        <Card className="rounded-[2rem] overflow-hidden border border-white shadow-2xl bg-white/80 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr className="bg-blue-50/50 border-b border-blue-100/50">
                  {["ID Pesanan", "Pelanggan", "Produk", "Metode", "Status", "Preview", "Aksi Keterangan"].map((head) => (
                    <th key={head} className="p-5 py-7 text-[12px] font-black text-blue-400 uppercase tracking-widest">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50/50">
                {dataPesanan.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-all duration-300">
                    <td className="p-5 text-xs font-black text-blue-500">{item.id}</td>
                    <td className="p-5 text-sm font-bold text-gray-800">{item.pembeli}</td>
                    <td className="p-5 text-sm font-bold text-gray-700">{item.produk}</td>
                    <td className="p-5 text-sm font-medium text-gray-500">{item.metode}</td>
                    <td className="p-5 text-sm font-bold text-blue-700">{item.status}</td>
                    <td className="p-5">
                      <Avatar src={item.img} variant="rounded" size="md" className="shadow-sm border border-white" />
                    </td>
                    
                    {/* AKSI KETERANGAN (Satu-satunya kolom aksi) */}
                    <td className="p-5">
                      <Menu placement="bottom-start">
                        <MenuHandler>
                          <Button 
                            size="sm" 
                            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 font-black lowercase tracking-wider shadow-lg transition-all active:scale-95 ${getKetColor(item.keterangan)}`}
                          >
                            {item.keterangan}
                            <ChevronDownIcon className="h-3 w-3 stroke-[4]" />
                          </Button>
                        </MenuHandler>
                        <MenuList className="rounded-2xl border-none shadow-xl p-2 min-w-[150px]">
                          <MenuItem className="rounded-xl font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-3 py-3">
                            <ArrowPathIcon className="h-4 w-4" /> Proses
                          </MenuItem>
                          <MenuItem className="rounded-xl font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-3 py-3">
                            <PlusCircleIcon className="h-4 w-4" /> Sisipkan
                          </MenuItem>
                          <MenuItem className="rounded-xl font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3 py-3">
                            <CheckCircleIcon className="h-4 w-4" /> Selesai
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </td>
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

export default PesananMasuk;