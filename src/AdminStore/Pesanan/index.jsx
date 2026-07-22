import React, { useState, useCallback, useEffect } from "react";
import MainLayout from "../MainLayout";
import { 
  Card, Typography, Button, Input, Avatar, Menu,
  MenuHandler, MenuList, MenuItem 
} from "@material-tailwind/react";
import { 
  MagnifyingGlassIcon, ArchiveBoxIcon, ChevronDownIcon,
  ArrowPathIcon, PlusCircleIcon, CheckCircleIcon 
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import api from "../../utils/api";

const PesananMasuk = () => {
  const [dataPesanan, setDataPesanan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/orders", {
        params: { search }
      });
      // Pastikan struktur response.data.data sesuai
      setDataPesanan(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data pesanan:", error);
      toast.error("Gagal memuat data pesanan.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (id, newStatus) => {
  // Ubah status ke format yang diinginkan backend (biasanya UPPERCASE)
  const statusFormatted = newStatus.toUpperCase(); 

  try {
    await api.patch(`/orders/${id}/status`, {
      status: statusFormatted 
    });
    
    toast.success("Status berhasil diperbarui!");
    fetchOrders(); 
  } catch (error) {
    // Pesan error dari server akan muncul di sini
    const msg = error.response?.data?.message || "Gagal memperbarui status.";
    toast.error(msg);
  }
  };

  // Sesuaikan logika warna berdasarkan status yang ada di JSON (PAID, dll)
  const getKetColor = (status) => {
    switch (status) {
      case "PAID": return "bg-emerald-400 text-emerald-900 shadow-emerald-100";
      case "PENDING": return "bg-amber-400 text-amber-900 shadow-amber-100";
      case "CANCELLED": return "bg-red-400 text-white shadow-red-100";
      default: return "bg-blue-600 text-white shadow-blue-100";
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <Typography variant="h3" className="text-blue-900 font-black tracking-tight flex items-center gap-3">
             <ArchiveBoxIcon className="h-8 w-8 text-blue-600" /> Pesanan
          </Typography>
          <div className="w-full md:w-80">
            <Input 
              label="Cari..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<MagnifyingGlassIcon className="h-5 w-5 text-blue-500" />} 
              className="bg-white rounded-2xl shadow-sm" 
            />
          </div>
        </div>

        <Card className="rounded-[2rem] overflow-hidden border border-white shadow-2xl bg-white/80">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr className="bg-blue-50/50 border-b border-blue-100">
                {["ID Pesanan", "Pelanggan", "Produk", "Catatan/Metode", "Status", "Preview", "Aksi"].map((head) => (
                  <th key={head} className="p-5 text-[12px] font-black text-blue-400 uppercase tracking-widest">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataPesanan.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30">
                  <td className="p-5 text-xs font-black text-blue-500">{item.id}</td>
                  <td className="p-5 text-sm font-bold text-gray-800">{item.user?.name || "N/A"}</td>
                  <td className="p-5 text-sm font-bold text-gray-700">
                    {item.orderItems?.map((oi) => oi.product?.name).join(", ") || "-"}
                  </td>
                  <td className="p-5 text-sm font-medium text-gray-500">{item.notes || "-"}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getKetColor(item.status)}`}>
                        {item.status}
                    </span>
                  </td>
                  <td className="p-5">
                    <Avatar src={item.img || "https://via.placeholder.com/150"} variant="rounded" size="md" />
                  </td>
                  <td className="p-5">
                    <Menu placement="bottom-start">
                      <MenuHandler>
                        <Button size="sm" className={`flex items-center gap-2 rounded-xl px-6 py-2.5 font-black lowercase ${getKetColor(item.status)}`}>
                          {item.status} <ChevronDownIcon className="h-3 w-3" />
                        </Button>
                      </MenuHandler>
                      <MenuList className="rounded-2xl shadow-xl p-2">
  {/* Sesuaikan dengan status yang valid di backend Anda */}
  <MenuItem onClick={() => handleUpdateStatus(item.id, "COMPLETED")} className="flex items-center gap-3 py-3">
    <CheckCircleIcon className="h-4 w-4" /> Selesai
  </MenuItem>
  <MenuItem onClick={() => handleUpdateStatus(item.id, "CANCELLED")} className="flex items-center gap-3 py-3">
    <ArchiveBoxIcon className="h-4 w-4" /> Batalkan
  </MenuItem>
</MenuList>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PesananMasuk;