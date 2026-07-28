import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Typography,
  Select,
  Option,
  Spinner,
} from "@material-tailwind/react";
import {
  BanknotesIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const CreateWasteModal = ({
  open,
  handleOpen,
  refreshData,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    wasteTypeId: "",
    pricePerKg: "",
  });

  const getUserData = () => {
    try {
      const rawUser =
        localStorage.getItem("userData") ||
        localStorage.getItem("user");

      return rawUser ? JSON.parse(rawUser) : null;
    } catch (error) {
      console.error("Gagal membaca userData:", error);
      return null;
    }
  };

  const userData = getUserData();

  useEffect(() => {
    if (!open) return;

    const loadWasteTypes = async () => {
      setLoadingData(true);

      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/waste-types", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const wasteTypes = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        setCategories(
          wasteTypes.filter(
            (item) =>
              item.isActive === true ||
              item.isActive === undefined
          )
        );
      } catch (error) {
        console.error(
          "Fetch Waste Types Error:",
          error.response?.data || error.message
        );

        toast.error(
          error.response?.data?.message ||
            "Gagal memuat kategori sampah"
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadWasteTypes();
  }, [open]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const wasteTypeId = Number(formData.wasteTypeId);
    const pricePerKg = Number(formData.pricePerKg);
    const areaId = Number(
      userData?.areaId || userData?.area?.id
    );

    if (!wasteTypeId) {
      toast.error("Silakan pilih kategori sampah");
      return;
    }

    if (
      !Number.isFinite(pricePerKg) ||
      pricePerKg <= 0
    ) {
      toast.error("Harga per kilogram harus lebih dari 0");
      return;
    }

    if (!Number.isInteger(areaId) || areaId <= 0) {
      console.error("User data:", userData);

      toast.error(
        "ID wilayah tidak ditemukan pada akun Anda"
      );
      return;
    }

    setLoading(true);

    const toastId = toast.loading(
      "Sedang menyimpan harga sampah..."
    );

    try {
      const token = localStorage.getItem("token");

      const payload = {
        areaId,
        wasteTypeId,
        pricePerKg,
      };

      console.log("Payload waste price:", payload);

      /*
       * Gunakan api, bukan axios.
       *
       * Jika baseURL api sudah:
       * http://localhost:3000/api/v1
       *
       * maka endpoint cukup /waste-prices
       */
      const response = await api.post(
        "/waste-prices",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Create waste price response:",
        response.data
      );

      toast.success(
        response.data?.message ||
          "Harga sampah berhasil ditambahkan",
        {
          id: toastId,
        }
      );

      setFormData({
        wasteTypeId: "",
        pricePerKg: "",
      });

      if (typeof refreshData === "function") {
        await refreshData();
      }

      handleOpen();
    } catch (error) {
      console.error(
        "Create Waste Price Error:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Gagal menyimpan harga sampah";

      toast.error(message, {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;

    setFormData({
      wasteTypeId: "",
      pricePerKg: "",
    });

    handleOpen();
  };

  return (
    <Dialog
      open={open}
      handler={handleClose}
      size="sm"
      className="min-w-[90%] overflow-visible rounded-[24px] md:min-w-[450px]"
    >
      <DialogHeader className="flex flex-col items-start gap-1 px-6 pt-8 md:px-8">
        <div className="mb-2 rounded-lg bg-blue-50 p-2">
          <PlusCircleIcon className="h-6 w-6 text-blue-600" />
        </div>

        <Typography
          variant="h5"
          className="text-xl font-bold text-blue-900"
        >
          Tambah Harga Sampah
        </Typography>

        <Typography className="text-xs font-normal text-gray-500">
          Menambahkan standar harga untuk wilayah:{" "}
          <span className="font-bold text-blue-600">
            {userData?.areaName ||
              userData?.area?.name ||
              "Wilayah Anda"}
          </span>
        </Typography>
      </DialogHeader>

      <DialogBody className="overflow-visible px-6 py-4 md:px-8">
        {loadingData ? (
          <div className="flex justify-center py-10">
            <Spinner
              color="blue"
              className="h-10 w-10"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-full">
              <Typography
                variant="small"
                className="mb-2 font-bold text-blue-gray-700"
              >
                Kategori Sampah
              </Typography>

              <Select
                label="Pilih Jenis Sampah"
                value={formData.wasteTypeId}
                onChange={(value) =>
                  setFormData((previous) => ({
                    ...previous,
                    wasteTypeId: value || "",
                  }))
                }
                color="blue"
                disabled={
                  loading || categories.length === 0
                }
              >
                {categories.map((item) => (
                  <Option
                    key={item.id}
                    value={String(item.id)}
                  >
                    {item.name}
                  </Option>
                ))}
              </Select>

              {categories.length === 0 && (
                <Typography className="mt-2 text-xs text-red-500">
                  Belum ada kategori sampah yang aktif.
                </Typography>
              )}
            </div>

            <div className="w-full">
              <Typography
                variant="small"
                className="mb-2 font-bold text-blue-gray-700"
              >
                Harga Jual per Kilogram
              </Typography>

              <Input
                type="number"
                name="pricePerKg"
                min="1"
                step="1"
                placeholder="Contoh: 5000"
                value={formData.pricePerKg}
                onChange={handleInputChange}
                icon={
                  <BanknotesIcon className="h-5 w-5 text-blue-500" />
                }
                className="!border-t-blue-gray-200 font-bold focus:!border-blue-500"
                labelProps={{
                  className: "hidden",
                }}
                disabled={loading}
              />
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="flex flex-col-reverse gap-3 px-6 pb-8 pt-4 md:flex-row md:px-8">
        <Button
          variant="text"
          color="red"
          onClick={handleClose}
          disabled={loading}
          className="w-full font-bold normal-case md:w-auto"
        >
          Batal
        </Button>

        <Button
          className="flex w-full items-center justify-center bg-blue-600 py-3 font-black normal-case shadow-lg shadow-blue-100 md:flex-1"
          onClick={handleSubmit}
          disabled={
            loading ||
            loadingData ||
            categories.length === 0
          }
        >
          {loading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Menyimpan...
            </>
          ) : (
            "Simpan Harga"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateWasteModal;