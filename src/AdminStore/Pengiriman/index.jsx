import React from "react";
import MainLayout from "../MainLayout";
import { 
  Card, 
  Typography, 
  Button, 
  Input,
  Tooltip,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { 
  MagnifyingGlassIcon, 
  TruckIcon,
  MapPinIcon,
  TagIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

const PengirimanIndex = () => {
  const dataPengiriman = [
    { 
      idPengiriman: "Odr-001", 
      namaPenerima: "Mina", 
      produk: "Pot Tanaman Kaleng", 
      kurir: "Ambil di Lokasi", 
      alamat: "Ambil di Lokasi (Smart Bin A)", 
      idPesanan: "PS-001", 
      status: "Selesai" 
    },
    { 
      idPengiriman: "Odr-002", 
      namaPenerima: "Cinta", 
      produk: "Lampu dari sendok", 
      kurir: "Kurir Lokal", 
      alamat: "Jl. Mawar No. 12", 
      idPesanan: "PS-002", 
      status: "Lacak" 
    },
    { 
      idPengiriman: "Odr-003", 
      namaPenerima: "Yusuf", 
      produk: "Lampu dari sendok", 
      kurir: "Kurir Lokal", 
      alamat: "Ambil di Lokasi (Smart Bin B)", 
      idPesanan: "PS-003", 
      status: "Dikemas" 
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Selesai": return "bg-green-600 shadow-green-100";
      case "Lacak": return "bg-blue-500 shadow-blue-100";
      case "Dikemas": return "bg-orange-600 shadow-orange-100";
      case "Dibatalkan": return "bg-red-600 shadow-red-100";
      default: return "bg-gray-500 shadow-gray-100";
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                  <TruckIcon className="h-6 w-6 text-white" />
               </div>
               <Typography variant="h3" className="text-blue-900 font-black tracking-tight">
                Pengiriman
              </Typography>
            </div>
            <Typography className="text-gray-500 font-medium ml-12">
              Update status logistik dan pengiriman pelanggan.
            </Typography>
          </div>
          
          <div className="w-full md:w-80">
            <Input
              label="Cari pengiriman..."
              icon={<MagnifyingGlassIcon className="h-5 w-5 text-blue-500" />}
              className="bg-white rounded-2xl shadow-sm !border-blue-100 focus:!border-blue-500"
            />
          </div>
        </div>

        {/* Main Table Container */}
        <Card className="rounded-[2rem] overflow-hidden border border-white shadow-2xl shadow-blue-100/50 bg-white/80 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50/80 to-transparent border-b border-blue-100/50">
                  {["ID Pengiriman", "Nama Penerima", "Produk", "Kurir", "Alamat", "ID Pesanan", "Aksi"].map((head) => (
                    <th key={head} className="p-5 py-7">
                      <Typography className="text-[12px] font-black text-blue-400 uppercase tracking-widest leading-none">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50/50">
                {dataPengiriman.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-all duration-300">
                    <td className="p-5">
                      <Typography className="text-xs font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full inline-block">
                        {item.idPengiriman}
                      </Typography>
                    </td>
                    <td className="p-5 text-sm font-bold text-gray-800">{item.namaPenerima}</td>
                    <td className="p-5 text-sm font-bold text-gray-700">{item.produk}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <TruckIcon className="h-4 w-4 text-gray-400" />
                        <Typography className="text-sm font-medium text-gray-500">{item.kurir}</Typography>
                      </div>
                    </td>
                    <td className="p-5 max-w-[200px]">
                       <Tooltip content={item.alamat}>
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <Typography className="text-sm font-medium text-gray-600 truncate">{item.alamat}</Typography>
                          </div>
                       </Tooltip>
                    </td>
                    <td className="p-5">
                       <div className="flex items-center gap-2 font-bold text-gray-700">
                        <TagIcon className="h-4 w-4 text-gray-400" />
                        {item.idPesanan}
                       </div>
                    </td>
                    
                    {/* AKSI DENGAN DROPDOWN */}
                    <td className="p-5">
                      <Menu placement="bottom-end">
                        <MenuHandler>
                          <Button 
                            size="sm" 
                            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-black lowercase tracking-wider shadow-lg transition-all active:scale-95 ${getStatusColor(item.status)}`}
                          >
                            {item.status}
                            <ChevronDownIcon className="h-3 w-3 stroke-[4]" />
                          </Button>
                        </MenuHandler>
                        <MenuList className="rounded-2xl border-none shadow-xl p-2 min-w-[140px]">
                          <MenuItem className="rounded-xl font-bold text-orange-600 hover:bg-orange-50 focus:bg-orange-50 flex items-center gap-2 py-3">
                            Dikemas
                          </MenuItem>
                          <MenuItem className="rounded-xl font-bold text-blue-600 hover:bg-blue-50 focus:bg-blue-50 flex items-center gap-2 py-3">
                            Lacak
                          </MenuItem>
                          <MenuItem className="rounded-xl font-bold text-green-600 hover:bg-green-50 focus:bg-green-50 flex items-center gap-2 py-3">
                            Selesai
                          </MenuItem>
                          <hr className="my-2 border-blue-gray-50" />
                          <MenuItem className="rounded-xl font-bold text-red-600 hover:bg-red-50 focus:bg-red-50 flex items-center gap-2 py-3">
                            Dibatalkan
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

export default PengirimanIndex;