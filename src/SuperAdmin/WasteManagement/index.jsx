import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../MainLayout";
import { Card, Typography, Button } from "@material-tailwind/react";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify"; // Import Toast

// Import Modal
import AddWasteTypeModal from "./AddWasteTypeModal";
import EditWasteTypeModal from "./EditWasteTypeModal";
import DeleteWasteTypeModal from "./DeleteWasteTypeModal";

const API_URL = "http://localhost:3000/api/waste-types"; 

const WasteManagementIndex = () => {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchWasteTypes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && Array.isArray(response.data.data)) {
        setWasteTypes(response.data.data);
      } else {
        setWasteTypes([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      
      if (error.response?.status === 401) {
        toast.error("Sesi login berakhir. Silakan login kembali.");
      } else {
        toast.error("Gagal mengambil data jenis sampah.");
      }
      
      setWasteTypes([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWasteTypes();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">
        <div className="flex justify-between items-center px-4">
          <div>
            <Typography variant="h4" color="blue-gray" className="font-bold">
              Waste Types
            </Typography>
            <Typography variant="small" className="text-gray-500 italic">
              Master data management for EcoCash
            </Typography>
          </div>
          <Button 
            onClick={() => setOpenAdd(true)} 
            className="bg-[#2b6cb0] flex items-center gap-2 normal-case rounded-lg"
          >
            <PlusIcon className="h-5 w-5 stroke-2" /> Add New Type
          </Button>
        </div>

        <Card className="p-4 overflow-hidden border border-blue-50 shadow-sm mx-4 rounded-xl">
          {loading ? (
            <div className="text-center py-20">
              <Typography className="font-medium text-gray-500 animate-pulse">
                Fetching secure data...
              </Typography>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] table-auto text-left">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b border-blue-gray-100 p-4 font-bold text-blue-900">Name</th>
                    <th className="border-b border-blue-gray-100 p-4 text-center font-bold text-blue-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(wasteTypes) && wasteTypes.length > 0 ? (
                    wasteTypes.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-4 border-b border-blue-gray-50 capitalize font-medium text-gray-700">
                          {item.name}
                        </td>
                        <td className="p-4 border-b border-blue-gray-50">
                          <div className="flex justify-center gap-3">
                            <Button 
                              size="sm" variant="text" color="blue" 
                              onClick={() => {
                                setSelectedItem(item);
                                setOpenEdit(true);
                              }}
                              className="rounded-full"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </Button>
                            <Button 
                              size="sm" variant="text" color="red" 
                              onClick={() => {
                                setSelectedItem(item);
                                setOpenDelete(true);
                              }}
                              className="rounded-full"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center py-20 text-gray-400 italic">
                        No data available. Add a new waste type to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal Components */}
        <AddWasteTypeModal 
          open={openAdd} 
          handleOpen={() => setOpenAdd(false)} 
          refreshData={fetchWasteTypes} 
          apiUrl={API_URL} 
        />

        <EditWasteTypeModal 
          open={openEdit} 
          handleOpen={() => setOpenEdit(false)} 
          data={selectedItem} 
          refreshData={fetchWasteTypes} 
          apiUrl={API_URL} 
        />

        <DeleteWasteTypeModal 
          open={openDelete} 
          handleOpen={() => setOpenDelete(false)} 
          data={selectedItem} 
          refreshData={fetchWasteTypes} 
          apiUrl={API_URL} 
        />
      </div>
    </MainLayout>
  );
};

export default WasteManagementIndex;