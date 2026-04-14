import React, { useState } from "react";
import MainLayout from "../MainLayout";
import { Card, Typography, Button, Input, Chip } from "@material-tailwind/react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Import Modal
import AddWastePriceModal from "./AddWastePriceModal";
import EditWastePriceModal from "./EditWastePriceModal";
import DeleteWastePriceModal from "./DeleteWastePriceModal";

const DATA_WASTE = [
  {
    location: "Jakarta, Cikini 1 Container 001",
    items: [
      { category: "Plastik", price: "2.500", update: "2026-03-27 10:30 WIB" },
      { category: "Organik", price: "2.000", update: "2026-03-27 10:30 WIB" },
      { category: "Kaca", price: "3.000", update: "2026-03-27 10:30 WIB" },
      { category: "Kaleng", price: "3.500", update: "2026-03-27 10:30 WIB" },
      { category: "Kertas", price: "2.500", update: "2026-03-27 10:30 WIB" },
      { category: "Wallet", price: "5.000", update: "2026-03-27 10:30 WIB" },
      { category: "Jelantah", price: "1.000", update: "2026-03-27 10:30 WIB" },
    ]
  },
  {
    location: "Jakarta, Cikini 2 Container 002",
    items: [
      { category: "Plastik", price: "2.500", update: "2026-03-27 10:30 WIB" },
      { category: "Organik", price: "2.000", update: "2026-03-27 10:30 WIB" },
    ]
  }
];

const WastePricesIndex = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setOpenEdit(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setOpenDelete(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6 px-2 md:px-0 pb-10">
        {/* Header Responsif */}
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-[#2b6cb0] font-bold text-2xl md:text-3xl">
            Waste Prices
          </Typography>
          <Typography className="text-gray-500 text-sm italic">
            Atur standar harga sampah tiap wilayah AIoT
          </Typography>
        </div>

        {/* Toolbar Responsif */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button 
            onClick={() => setOpenAdd(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#66bb6a] normal-case rounded-xl shadow-none py-3"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" /> Add Price
          </Button>
          <div className="w-full md:w-80">
            <Input 
              label="Search city or category..." 
              icon={<MagnifyingGlassIcon className="h-5 w-5" />} 
              color="blue"
            />
          </div>
        </div>

        {/* Container Tabel yang bisa di-scroll ke pinggir */}
        <Card className="rounded-[24px] md:rounded-[32px] overflow-hidden border border-blue-50 shadow-sm p-2 md:p-4 bg-white/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] table-auto border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[#2b6cb0] uppercase text-[10px] md:text-[11px] font-black tracking-widest text-center">
                  <th className="pb-2">City</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Last Update</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {DATA_WASTE.map((group, idx) => (
                  <tr key={idx} className="bg-[#e8f5e9]/40 rounded-[24px] overflow-hidden">
                    {/* Kolom Lokasi */}
                    <td className="p-4 md:p-6 w-[180px] md:w-[200px] border-r border-white/50 align-top">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-900 rounded-xl flex items-center justify-center overflow-hidden shadow-md shrink-0">
                          <img 
                            src="https://maps.gstatic.com/tactile/pane/default_geocode-2x.png" 
                            alt="map" 
                            className="opacity-50 grayscale invert" 
                          />
                        </div>
                        <Typography className="text-[11px] md:text-[12px] font-bold text-blue-800 leading-tight">
                          {group.location}
                        </Typography>
                      </div>
                    </td>

                    {/* Kolom Items (Nesting Grid) */}
                    <td colSpan={4} className="p-2 md:p-3">
                      <div className="space-y-2">
                        {group.items.map((item, i) => (
                          <div key={i} className="grid grid-cols-4 items-center bg-white/60 hover:bg-white transition-all rounded-xl p-3 shadow-sm border border-white">
                            <div className="flex justify-center px-1">
                              <Chip 
                                value={item.category} 
                                variant="ghost" 
                                color="blue" 
                                className="rounded-lg lowercase font-bold text-[10px] px-3 md:px-6" 
                              />
                            </div>
                            <Typography className="text-center font-black text-blue-700 text-xs md:text-sm">
                              Rp.{item.price}
                            </Typography>
                            <Typography className="text-center text-[9px] md:text-[10px] font-medium text-gray-500 leading-tight">
                              {item.update}
                            </Typography>
                            <div className="flex justify-center gap-1.5 md:gap-2 px-1">
                              <Button 
                                size="sm" 
                                onClick={() => handleEdit(item)}
                                className="bg-[#66bb6a] px-2.5 md:px-4 py-1.5 normal-case rounded-lg shadow-none text-[10px] md:text-xs"
                              >Edit</Button>
                              <Button 
                                size="sm" 
                                variant="text"
                                onClick={() => handleDelete(item)}
                                className="text-[#ef5350] hover:bg-red-50 px-2.5 md:px-3 py-1.5 normal-case rounded-lg shadow-none text-[10px] md:text-xs font-bold"
                              >Hapus</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <AddWastePriceModal open={openAdd} handleOpen={() => setOpenAdd(false)} />
      <EditWastePriceModal open={openEdit} handleOpen={() => setOpenEdit(false)} data={selectedItem} />
      <DeleteWastePriceModal open={openDelete} handleOpen={() => setOpenDelete(false)} data={selectedItem} />
    </MainLayout>
  );
};

export default WastePricesIndex;