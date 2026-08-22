import React, { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../../utils/api";
import MainLayout from "../MainLayout";

import {
  Card,
  Typography,
  Button,
  Input,
  Textarea,
  Select,
  Option,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Chip,
  IconButton,
} from "@material-tailwind/react";

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  TicketIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

// ============================================================
// HELPER TOKEN
// ============================================================

const getCurrentStoreAdmin = () => {
  try {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (!token) return null;

    const decoded = jwtDecode(token);

    return decoded;
  } catch (error) {
    console.error("Decode token error:", error);
    return null;
  }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const StoreVoucherManagement = () => {
  const currentUser = useMemo(() => getCurrentStoreAdmin(), []);

  // ==========================================================
  // COBA AMBIL STORE ID DARI TOKEN
  // ==========================================================

  const storeId =
    currentUser?.storeId ??
    currentUser?.store?.id ??
    currentUser?.store_id ??
    null;

  const storeName =
    currentUser?.storeName ??
    currentUser?.store?.name ??
    "Store Anda";

  // ==========================================================
  // STATE
  // ==========================================================

  const [vouchers, setVouchers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);

  const [editingVoucher, setEditingVoucher] = useState(null);

  const [page, setPage] = useState(1);

  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // ==========================================================
  // FORM
  // ==========================================================

  const initialForm = {
    code: "",
    name: "",
    description: "",
    type: "PERCENTAGE",
    value: "",
    minSpend: "",
    maxDiscount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
    perUserLimit: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // ==========================================================
  // GET VOUCHERS
  // ==========================================================

  const fetchVouchers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/vouchers", {
        params: {
          page,
          limit: 10,

          ...(search.trim()
            ? {
                search: search.trim(),
              }
            : {}),
        },
      });

      console.log("STORE VOUCHERS:", response.data);

      const data = response?.data?.data;
      const responseMeta = response?.data?.meta;

      setVouchers(
        Array.isArray(data)
          ? data
          : []
      );

      if (responseMeta) {
        setMeta((prev) => ({
          ...prev,
          ...responseMeta,
        }));
      }
    } catch (error) {
      console.error(
        "Fetch store vouchers error:",
        error?.response?.data || error
      );

      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [page]);

  // ==========================================================
  // RESET
  // ==========================================================

  const resetForm = () => {
    setFormData(initialForm);
    setEditingVoucher(null);
  };

  // ==========================================================
  // CREATE
  // ==========================================================

  const handleOpenCreate = () => {
    resetForm();
    setOpenModal(true);
  };

  // ==========================================================
  // DETAIL / EDIT
  // ==========================================================

  const handleOpenEdit = async (voucher) => {
    try {
      const response = await api.get(
        `/vouchers/${voucher.id}`
      );

      const data = response?.data?.data;

      if (!data) {
        alert("Voucher tidak ditemukan.");
        return;
      }

      setEditingVoucher(data);

      setFormData({
        code: data.code || "",
        name: data.name || "",
        description: data.description || "",

        type:
          data.type ||
          "PERCENTAGE",

        value:
          data.value ?? "",

        minSpend:
          data.minSpend ?? "",

        maxDiscount:
          data.maxDiscount ?? "",

        validFrom:
          data.validFrom
            ? formatDateInput(data.validFrom)
            : "",

        validUntil:
          data.validUntil
            ? formatDateInput(data.validUntil)
            : "",

        usageLimit:
          data.usageLimit ?? "",

        perUserLimit:
          data.perUserLimit ?? "",
      });

      setOpenModal(true);
    } catch (error) {
      console.error(
        "Get voucher error:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.message ||
          "Gagal mengambil voucher."
      );
    }
  };

  // ==========================================================
  // INPUT
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        name === "code"
          ? value.toUpperCase()
          : value,
    }));
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    if (!formData.code.trim()) {
      alert("Kode voucher wajib diisi.");
      return false;
    }

    if (!formData.name.trim()) {
      alert("Nama voucher wajib diisi.");
      return false;
    }

    if (
      formData.value === "" ||
      Number(formData.value) <= 0
    ) {
      alert("Nilai voucher harus lebih dari 0.");
      return false;
    }

    if (!formData.validFrom) {
      alert("Tanggal mulai wajib diisi.");
      return false;
    }

    if (!formData.validUntil) {
      alert("Tanggal berakhir wajib diisi.");
      return false;
    }

    if (
      new Date(formData.validUntil) <=
      new Date(formData.validFrom)
    ) {
      alert(
        "Tanggal berakhir harus setelah tanggal mulai."
      );

      return false;
    }

    return true;
  };

  // ==========================================================
  // BUILD PAYLOAD
  // ==========================================================

  const buildPayload = () => {
    const payload = {
      code: formData.code
        .trim()
        .toUpperCase(),

      name: formData.name.trim(),

      description:
        formData.description?.trim() ||
        null,

      type: formData.type,

      value: Number(formData.value),

      minSpend:
        formData.minSpend !== ""
          ? Number(formData.minSpend)
          : 0,

      maxDiscount:
        formData.maxDiscount !== ""
          ? Number(formData.maxDiscount)
          : null,

      validFrom: new Date(
        formData.validFrom
      ).toISOString(),

      validUntil: new Date(
        formData.validUntil
      ).toISOString(),

      usageLimit:
        formData.usageLimit !== ""
          ? Number(formData.usageLimit)
          : null,

      perUserLimit:
        formData.perUserLimit !== ""
          ? Number(formData.perUserLimit)
          : null,
    };

    // ========================================================
    // STORE ADMIN
    // ========================================================

    if (storeId) {
      payload.storeId = storeId;
    }

    return payload;
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const payload =
        buildPayload();

      console.log(
        "STORE VOUCHER PAYLOAD:",
        payload
      );

      if (editingVoucher) {
        await api.patch(
          `/vouchers/${editingVoucher.id}`,
          payload
        );
      } else {
        await api.post(
          "/vouchers",
          payload
        );
      }

      setOpenModal(false);

      resetForm();

      await fetchVouchers();
    } catch (error) {
      console.error(
        "Save voucher error:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.message ||
          "Gagal menyimpan voucher."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (voucher) => {
    const confirmed =
      window.confirm(
        `Hapus voucher "${voucher.code}"?`
      );

    if (!confirmed) return;

    try {
      await api.delete(
        `/vouchers/${voucher.id}`
      );

      await fetchVouchers();
    } catch (error) {
      console.error(
        "Delete voucher error:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.message ||
          "Gagal menghapus voucher."
      );
    }
  };

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = () => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchVouchers();
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>
            <Typography
              variant="h4"
              className="font-black text-blue-gray-900"
            >
              Voucher Store
            </Typography>

            <Typography className="text-xs text-gray-500 mt-1">
              Kelola voucher diskon untuk store Anda
            </Typography>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 rounded-xl"
          >
            <PlusIcon className="h-4 w-4" />

            Buat Voucher
          </Button>

        </div>

        {/* STORE INFO */}

        <Card className="p-5 rounded-2xl border border-green-100 bg-green-50 shadow-none">

          <div className="flex items-center gap-4">

            <div className="p-3 bg-green-500 rounded-xl">
              <BuildingStorefrontIcon className="h-6 w-6 text-white" />
            </div>

            <div>
              <Typography className="font-black text-green-900 text-sm">
                Store Voucher
              </Typography>

              <Typography className="text-xs text-gray-600 mt-1">
                Voucher hanya berlaku untuk transaksi di{" "}
                <strong>{storeName}</strong>.
              </Typography>
            </div>

            <div className="ml-auto">
              <Chip
                value="STORE ADMIN"
                color="green"
                size="sm"
              />
            </div>

          </div>

        </Card>

        {/* SEARCH */}

        <Card className="p-4 rounded-2xl border border-gray-100 shadow-sm">

          <div className="flex flex-col md:flex-row gap-3">

            <div className="w-full md:w-96">

              <Input
                label="Cari Voucher"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                icon={
                  <MagnifyingGlassIcon className="h-4 w-4" />
                }
              />

            </div>

            <Button
              color="blue"
              className="rounded-xl"
              onClick={handleSearch}
            >
              Cari
            </Button>

            <IconButton
              variant="outlined"
              onClick={() => {
                setSearch("");
                setPage(1);

                setTimeout(() => {
                  fetchVouchers();
                }, 0);
              }}
            >
              <ArrowPathIcon className="h-4 w-4" />
            </IconButton>

          </div>

        </Card>

        {/* TABLE */}

        <Card className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead>

                <tr className="bg-blue-gray-50">

                  <TableHead>
                    Code
                  </TableHead>

                  <TableHead>
                    Voucher
                  </TableHead>

                  <TableHead>
                    Type
                  </TableHead>

                  <TableHead>
                    Discount
                  </TableHead>

                  <TableHead>
                    Min Spend
                  </TableHead>

                  <TableHead>
                    Max Discount
                  </TableHead>

                  <TableHead>
                    Validity
                  </TableHead>

                  <TableHead>
                    Usage
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead>
                    Action
                  </TableHead>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={10}
                      className="py-16 text-center"
                    >
                      <Typography className="animate-pulse text-sm font-bold text-blue-500">
                        Loading vouchers...
                      </Typography>
                    </td>

                  </tr>

                ) : vouchers.length === 0 ? (

                  <tr>

                    <td
                      colSpan={10}
                      className="py-16 text-center"
                    >

                      <TicketIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />

                      <Typography className="text-sm font-bold text-gray-400">
                        Belum ada voucher store
                      </Typography>

                    </td>

                  </tr>

                ) : (

                  vouchers.map((voucher) => (

                    <tr
                      key={voucher.id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >

                      {/* CODE */}

                      <TableCell>

                        <Chip
                          value={voucher.code || "-"}
                          color="blue"
                          variant="ghost"
                          size="sm"
                          className="w-fit"
                        />

                      </TableCell>

                      {/* NAME */}

                      <TableCell>

                        <Typography className="font-bold text-blue-gray-900 text-xs">
                          {voucher.name || "-"}
                        </Typography>

                        <Typography className="text-[10px] text-gray-500 max-w-[180px] truncate">
                          {voucher.description || "-"}
                        </Typography>

                      </TableCell>

                      {/* TYPE */}

                      <TableCell>

                        <Chip
                          value={voucher.type || "-"}
                          color="green"
                          variant="ghost"
                          size="sm"
                          className="w-fit text-[9px]"
                        />

                      </TableCell>

                      {/* DISCOUNT */}

                      <TableCell>

                        <Typography className="text-xs font-black text-blue-700">
                          {formatVoucherValue(voucher)}
                        </Typography>

                      </TableCell>

                      {/* MINIMUM */}

                      <TableCell>

                        <Typography className="text-xs font-bold">
                          {formatRupiah(
                            voucher.minSpend
                          )}
                        </Typography>

                      </TableCell>

                      {/* MAX */}

                      <TableCell>

                        <Typography className="text-xs">
                          {voucher.maxDiscount !==
                            null &&
                          voucher.maxDiscount !==
                            undefined
                            ? formatRupiah(
                                voucher.maxDiscount
                              )
                            : "-"}
                        </Typography>

                      </TableCell>

                      {/* VALIDITY */}

                      <TableCell>

                        <Typography className="text-[10px] font-bold">
                          {formatDate(
                            voucher.validFrom
                          )}
                        </Typography>

                        <Typography className="text-[9px] text-gray-400">
                          s/d{" "}
                          {formatDate(
                            voucher.validUntil
                          )}
                        </Typography>

                      </TableCell>

                      {/* USAGE */}

                      <TableCell>

                        <Typography className="text-xs font-bold">
                          {voucher.usageCount ??
                            voucher.usedCount ??
                            0}
                          {" / "}
                          {voucher.usageLimit ??
                            "∞"}
                        </Typography>

                        <Typography className="text-[9px] text-gray-400">
                          Per user:{" "}
                          {voucher.perUserLimit ??
                            "∞"}
                        </Typography>

                      </TableCell>

                      {/* STATUS */}

                      <TableCell>

                        <VoucherStatus
                          voucher={voucher}
                        />

                      </TableCell>

                      {/* ACTION */}

                      <TableCell>

                        <div className="flex gap-1">

                          <IconButton
                            variant="text"
                            color="blue"
                            onClick={() =>
                              handleOpenEdit(
                                voucher
                              )
                            }
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </IconButton>

                          <IconButton
                            variant="text"
                            color="red"
                            onClick={() =>
                              handleDelete(
                                voucher
                              )
                            }
                          >
                            <TrashIcon className="h-5 w-5" />
                          </IconButton>

                        </div>

                      </TableCell>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          <div className="flex items-center justify-between p-4 border-t border-gray-100">

            <Typography className="text-[10px] text-gray-500 font-bold">
              Total Voucher:{" "}
              {meta.total ?? vouchers.length}
            </Typography>

            <div className="flex items-center gap-2">

              <Button
                size="sm"
                variant="outlined"
                disabled={page <= 1}
                onClick={() =>
                  setPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
              >
                Previous
              </Button>

              <Typography className="text-xs font-black">
                {page}
              </Typography>

              <Button
                size="sm"
                variant="outlined"
                disabled={
                  meta.totalPages
                    ? page >= meta.totalPages
                    : vouchers.length < 10
                }
                onClick={() =>
                  setPage((prev) => prev + 1)
                }
              >
                Next
              </Button>

            </div>

          </div>

        </Card>

      </div>

      {/* ======================================================
          MODAL
      ====================================================== */}

      <Dialog
        open={openModal}
        handler={() =>
          setOpenModal(!openModal)
        }
        size="lg"
        className="max-h-[90vh] overflow-y-auto"
      >

        <DialogHeader>

          <div>

            <Typography
              variant="h5"
              className="font-black"
            >
              {editingVoucher
                ? "Edit Voucher Store"
                : "Buat Voucher Store"}
            </Typography>

            <Typography className="text-xs font-normal text-gray-500 mt-1">
              Voucher hanya berlaku pada store Anda.
            </Typography>

          </div>

        </DialogHeader>

        <DialogBody className="space-y-5">

          {/* CODE + NAME */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              label="Voucher Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
            />

            <Input
              label="Voucher Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

          </div>

          {/* DESCRIPTION */}

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          {/* TYPE */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Select
              label="Voucher Type"
              value={formData.type}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  type: value,
                }))
              }
            >
              <Option value="PERCENTAGE">
                Percentage
              </Option>

              <Option value="FIXED">
                Fixed Amount
              </Option>
            </Select>

            <Input
              type="number"
              label={
                formData.type ===
                "PERCENTAGE"
                  ? "Discount (%)"
                  : "Discount Amount"
              }
              name="value"
              value={formData.value}
              onChange={handleChange}
            />

          </div>

          {/* MIN MAX */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              type="number"
              label="Minimum Spend"
              name="minSpend"
              value={formData.minSpend}
              onChange={handleChange}
            />

            <Input
              type="number"
              label="Maximum Discount"
              name="maxDiscount"
              value={formData.maxDiscount}
              onChange={handleChange}
            />

          </div>

          {/* STORE SCOPE */}

          <div>

            <Typography className="text-[10px] font-black uppercase text-gray-500 mb-2">
              Voucher Scope
            </Typography>

            <div className="flex items-center justify-between border border-green-100 bg-green-50 rounded-xl p-4">

              <div>

                <Typography className="text-xs font-black text-green-900">
                  {storeName}
                </Typography>

                <Typography className="text-[10px] text-gray-500 mt-1">
                  Voucher hanya berlaku pada store ini.
                </Typography>

              </div>

              <Chip
                value="STORE"
                color="green"
              />

            </div>

          </div>

          {/* DATE */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              type="datetime-local"
              label="Valid From"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleChange}
            />

            <Input
              type="datetime-local"
              label="Valid Until"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleChange}
            />

          </div>

          {/* LIMIT */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              type="number"
              label="Usage Limit"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleChange}
            />

            <Input
              type="number"
              label="Per User Limit"
              name="perUserLimit"
              value={formData.perUserLimit}
              onChange={handleChange}
            />

          </div>

        </DialogBody>

        <DialogFooter className="gap-2">

          <Button
            variant="text"
            color="gray"
            disabled={saving}
            onClick={() => {
              setOpenModal(false);
              resetForm();
            }}
          >
            Batal
          </Button>

          <Button
            color="blue"
            disabled={saving}
            onClick={handleSubmit}
          >
            {saving
              ? "Menyimpan..."
              : editingVoucher
              ? "Update Voucher"
              : "Create Voucher"}
          </Button>

        </DialogFooter>

      </Dialog>

    </MainLayout>
  );
};

// ============================================================
// TABLE
// ============================================================

const TableHead = ({ children }) => (
  <th className="p-4 text-left">
    <Typography className="text-[10px] font-black uppercase text-blue-gray-500">
      {children}
    </Typography>
  </th>
);

const TableCell = ({ children }) => (
  <td className="p-4 align-middle">
    {children}
  </td>
);

// ============================================================
// FORMAT
// ============================================================

const formatRupiah = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "-";
  }

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(Number(value) || 0);
};

const formatVoucherValue = (voucher) => {
  if (
    voucher?.type === "PERCENTAGE" ||
    voucher?.type === "PERCENT"
  ) {
    return `${voucher.value}%`;
  }

  return formatRupiah(
    voucher?.value
  );
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(
    date.getTime() -
      date.getTimezoneOffset() *
        60000
  );

  return localDate
    .toISOString()
    .slice(0, 16);
};

// ============================================================
// STATUS
// ============================================================

const VoucherStatus = ({ voucher }) => {
  const now = new Date();

  const from = voucher.validFrom
    ? new Date(voucher.validFrom)
    : null;

  const until = voucher.validUntil
    ? new Date(voucher.validUntil)
    : null;

  if (from && now < from) {
    return (
      <Chip
        value="UPCOMING"
        color="amber"
        variant="ghost"
        size="sm"
        className="w-fit text-[9px]"
      />
    );
  }

  if (until && now > until) {
    return (
      <Chip
        value="EXPIRED"
        color="red"
        variant="ghost"
        size="sm"
        className="w-fit text-[9px]"
      />
    );
  }

  const used = Number(
    voucher.usageCount ??
      voucher.usedCount ??
      0
  );

  if (
    voucher.usageLimit !== null &&
    voucher.usageLimit !== undefined &&
    used >= Number(voucher.usageLimit)
  ) {
    return (
      <Chip
        value="LIMIT REACHED"
        color="red"
        variant="ghost"
        size="sm"
        className="w-fit text-[9px]"
      />
    );
  }

  return (
    <Chip
      value="ACTIVE"
      color="green"
      variant="ghost"
      size="sm"
      className="w-fit text-[9px]"
    />
  );
};

export default StoreVoucherManagement;