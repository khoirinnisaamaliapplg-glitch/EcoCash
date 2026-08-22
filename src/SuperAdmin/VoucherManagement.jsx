import React, { useEffect, useState } from "react";
import api from "../utils/api";
import MainLayout from "./MainLayout";

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
} from "@heroicons/react/24/outline";

const VoucherManagement = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [vouchers, setVouchers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const [editingVoucher, setEditingVoucher] = useState(null);

  const [search, setSearch] = useState("");

  // Pagination dari response.meta
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [page, setPage] = useState(1);

  // ============================================================
  // FORM
  // ============================================================

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

  // ============================================================
  // FETCH VOUCHERS
  // GET /vouchers
  // ============================================================

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

      console.log("GET /vouchers RESPONSE:", response.data);

      /*
        Controller:

        return success(res, {
          message: "Vouchers fetched successfully",
          data: vouchers,
          meta,
        });
      */

      const voucherData = response?.data?.data;

      const metaData = response?.data?.meta;

      setVouchers(
        Array.isArray(voucherData)
          ? voucherData
          : []
      );

      if (metaData) {
        setMeta((prev) => ({
          ...prev,
          ...metaData,
        }));
      }
    } catch (error) {
      console.error(
        "Fetch vouchers error:",
        error?.response?.data || error
      );

      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD
  // ============================================================

  useEffect(() => {
    fetchVouchers();
  }, [page]);

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = () => {
    setPage(1);
    fetchVouchers();
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setFormData(initialForm);

    setEditingVoucher(null);
  };

  // ============================================================
  // CREATE MODAL
  // ============================================================

  const handleOpenCreate = () => {
    resetForm();

    setOpenModal(true);
  };

  // ============================================================
  // GET VOUCHER BY ID
  //
  // GET /vouchers/:id
  // ============================================================

  const handleOpenEdit = async (voucher) => {
    try {
      const response = await api.get(
        `/vouchers/${voucher.id}`
      );

      console.log(
        "GET VOUCHER DETAIL:",
        response.data
      );

      /*
        Controller:

        data: voucher
      */

      const data =
        response?.data?.data;

      if (!data) {
        alert(
          "Data voucher tidak ditemukan."
        );

        return;
      }

      setEditingVoucher(data);

      setFormData({
        code: data.code || "",

        name: data.name || "",

        description:
          data.description || "",

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
            ? formatDateInput(
                data.validFrom
              )
            : "",

        validUntil:
          data.validUntil
            ? formatDateInput(
                data.validUntil
              )
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
          "Gagal mengambil detail voucher."
      );
    }
  };

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        name === "code"
          ? value.toUpperCase()
          : value,
    }));
  };

  // ============================================================
  // VALIDATION FRONTEND
  // ============================================================

  const validateForm = () => {
    if (!formData.code.trim()) {
      alert(
        "Kode voucher wajib diisi."
      );

      return false;
    }

    if (!formData.name.trim()) {
      alert(
        "Nama voucher wajib diisi."
      );

      return false;
    }

    if (!formData.type) {
      alert(
        "Tipe voucher wajib dipilih."
      );

      return false;
    }

    if (
      formData.value === "" ||
      Number(formData.value) <= 0
    ) {
      alert(
        "Nilai voucher harus lebih dari 0."
      );

      return false;
    }

    if (!formData.validFrom) {
      alert(
        "Tanggal mulai voucher wajib diisi."
      );

      return false;
    }

    if (!formData.validUntil) {
      alert(
        "Tanggal berakhir voucher wajib diisi."
      );

      return false;
    }

    if (
      new Date(
        formData.validUntil
      ) <=
      new Date(
        formData.validFrom
      )
    ) {
      alert(
        "Tanggal berakhir harus setelah tanggal mulai."
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // PAYLOAD
  // ============================================================

  const buildPayload = () => {
    return {
      code:
        formData.code
          .trim()
          .toUpperCase(),

      name:
        formData.name.trim(),

      description:
        formData.description?.trim() ||
        null,

      type:
        formData.type,

      value:
        Number(
          formData.value
        ),

      minSpend:
        formData.minSpend !== ""
          ? Number(
              formData.minSpend
            )
          : 0,

      maxDiscount:
        formData.maxDiscount !== ""
          ? Number(
              formData.maxDiscount
            )
          : null,

      // ========================================================
      // SUPER ADMIN
      //
      // NULL = GLOBAL VOUCHER
      // ========================================================

      storeId: null,

      validFrom:
        new Date(
          formData.validFrom
        ).toISOString(),

      validUntil:
        new Date(
          formData.validUntil
        ).toISOString(),

      usageLimit:
        formData.usageLimit !== ""
          ? Number(
              formData.usageLimit
            )
          : null,

      perUserLimit:
        formData.perUserLimit !== ""
          ? Number(
              formData.perUserLimit
            )
          : null,
    };
  };

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const payload =
        buildPayload();

      console.log(
        "VOUCHER PAYLOAD:",
        payload
      );

      // ========================================================
      // UPDATE
      // PATCH /vouchers/:id
      // ========================================================

      if (editingVoucher) {
        const response =
          await api.patch(
            `/vouchers/${editingVoucher.id}`,
            payload
          );

        console.log(
          "UPDATE RESPONSE:",
          response.data
        );
      }

      // ========================================================
      // CREATE
      // POST /vouchers
      // ========================================================

      else {
        const response =
          await api.post(
            "/vouchers",
            payload
          );

        console.log(
          "CREATE RESPONSE:",
          response.data
        );
      }

      setOpenModal(false);

      resetForm();

      await fetchVouchers();
    } catch (error) {
      console.error(
        "Voucher save error:",
        error?.response?.data ||
          error
      );

      alert(
        error?.response?.data?.message ||
          "Gagal menyimpan voucher."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // SOFT DELETE
  //
  // DELETE /vouchers/:id
  // ============================================================

  const handleDelete = async (
    voucher
  ) => {
    const confirmation =
      window.confirm(
        `Apakah Anda yakin ingin menghapus voucher "${voucher.code}"?`
      );

    if (!confirmation) {
      return;
    }

    try {
      const response =
        await api.delete(
          `/vouchers/${voucher.id}`
        );

      console.log(
        "DELETE RESPONSE:",
        response.data
      );

      /*
        Backend menggunakan softDeleteVoucher.

        Jadi record tidak benar-benar hilang
        secara fisik dari database.
      */

      await fetchVouchers();
    } catch (error) {
      console.error(
        "Delete voucher error:",
        error?.response?.data ||
          error
      );

      alert(
        error?.response?.data?.message ||
          "Gagal menghapus voucher."
      );
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <MainLayout>

      <div className="space-y-6 pb-10">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>

            <Typography
              variant="h4"
              className="font-black text-blue-gray-900"
            >
              Voucher Management
            </Typography>

            <Typography className="text-xs text-gray-500 mt-1">
              Kelola voucher global EcoCash
            </Typography>

          </div>

          <Button
            onClick={
              handleOpenCreate
            }
            className="
              flex
              items-center
              gap-2
              bg-blue-600
              rounded-xl
            "
          >

            <PlusIcon className="h-4 w-4" />

            Buat Voucher

          </Button>

        </div>

        {/* ====================================================
            GLOBAL INFO
        ==================================================== */}

        <Card className="p-5 rounded-2xl border border-blue-100 bg-blue-50 shadow-none">

          <div className="flex items-center gap-4">

            <div className="p-3 bg-blue-600 rounded-xl">

              <TicketIcon className="h-6 w-6 text-white" />

            </div>

            <div>

              <Typography className="font-black text-blue-900 text-sm">
                Global Voucher
              </Typography>

              <Typography className="text-xs text-blue-gray-600 mt-1">
                Voucher yang dibuat oleh Super Admin tidak
                terikat pada store tertentu.
              </Typography>

            </div>

            <div className="ml-auto">

              <Chip
                value="SUPER ADMIN"
                color="blue"
                size="sm"
              />

            </div>

          </div>

        </Card>

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <Card className="p-4 rounded-2xl border border-gray-100 shadow-sm">

          <div className="flex flex-col md:flex-row gap-3">

            <div className="w-full md:w-96">

              <Input
                label="Cari Voucher"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
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
              onClick={
                handleSearch
              }
              className="rounded-xl"
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

        {/* ====================================================
            TABLE
        ==================================================== */}

        <Card className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1150px] table-auto">

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
                    Scope
                  </TableHead>

                  <TableHead>
                    Masa Berlaku
                  </TableHead>

                  <TableHead>
                    Limit
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

                {/* =============================================
                    LOADING
                ============================================= */}

                {loading ? (

                  <tr>

                    <td
                      colSpan={11}
                      className="py-16 text-center"
                    >

                      <Typography className="animate-pulse text-sm font-bold text-blue-500">
                        Loading vouchers...
                      </Typography>

                    </td>

                  </tr>

                ) : vouchers.length ===
                  0 ? (

                  /* ===========================================
                      EMPTY
                  =========================================== */

                  <tr>

                    <td
                      colSpan={11}
                      className="py-16 text-center"
                    >

                      <TicketIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />

                      <Typography className="font-bold text-gray-400 text-sm">
                        Belum ada voucher
                      </Typography>

                    </td>

                  </tr>

                ) : (

                  vouchers.map(
                    (voucher) => (

                      <tr
                        key={
                          voucher.id
                        }
                        className="
                          border-b
                          border-gray-50
                          hover:bg-gray-50
                          transition-colors
                        "
                      >

                        {/* CODE */}

                        <TableCell>

                          <Chip
                            value={
                              voucher.code ||
                              "-"
                            }
                            color="blue"
                            variant="ghost"
                            size="sm"
                            className="w-fit"
                          />

                        </TableCell>

                        {/* NAME */}

                        <TableCell>

                          <Typography className="font-bold text-blue-gray-900 text-xs">
                            {voucher.name ||
                              "-"}
                          </Typography>

                          <Typography className="text-[10px] text-gray-500 max-w-[180px] truncate mt-1">
                            {voucher.description ||
                              "-"}
                          </Typography>

                        </TableCell>

                        {/* TYPE */}

                        <TableCell>

                          <Chip
                            value={
                              voucher.type ||
                              "-"
                            }
                            variant="ghost"
                            color="green"
                            size="sm"
                            className="w-fit text-[9px]"
                          />

                        </TableCell>

                        {/* VALUE */}

                        <TableCell>

                          <Typography className="font-black text-blue-700 text-xs">
                            {formatVoucherValue(
                              voucher
                            )}
                          </Typography>

                        </TableCell>

                        {/* MIN SPEND */}

                        <TableCell>

                          <Typography className="text-xs font-bold">
                            {formatRupiah(
                              voucher.minSpend
                            )}
                          </Typography>

                        </TableCell>

                        {/* MAX DISCOUNT */}

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

                        {/* SCOPE */}

                        <TableCell>

                          {!voucher.storeId ? (

                            <Chip
                              value="GLOBAL"
                              color="blue"
                              size="sm"
                              className="w-fit text-[9px]"
                            />

                          ) : (

                            <div>

                              <Chip
                                value="STORE"
                                color="amber"
                                size="sm"
                                className="w-fit text-[9px]"
                              />

                              <Typography className="text-[9px] text-gray-500 mt-1">
                                {voucher.store?.name ||
                                  voucher.storeId}
                              </Typography>

                            </div>

                          )}

                        </TableCell>

                        {/* PERIOD */}

                        <TableCell>

                          <Typography className="text-[10px] font-bold text-blue-gray-800">
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

                        {/* LIMIT */}

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
                            voucher={
                              voucher
                            }
                          />

                        </TableCell>

                        {/* ACTION */}

                        <TableCell>

                          <div className="flex items-center gap-1">

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

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

          {/* ==================================================
              PAGINATION
          ================================================== */}

          <div className="flex items-center justify-between p-4 border-t border-gray-100">

            <Typography className="text-[10px] text-gray-500 font-bold">
              Total Voucher:{" "}
              {meta.total ??
                vouchers.length}
            </Typography>

            <div className="flex items-center gap-2">

              <Button
                size="sm"
                variant="outlined"
                disabled={
                  page <= 1
                }
                onClick={() =>
                  setPage(
                    (prev) =>
                      Math.max(
                        prev - 1,
                        1
                      )
                  )
                }
              >
                Previous
              </Button>

              <Typography className="text-xs font-black text-blue-gray-800 px-2">
                {page}
              </Typography>

              <Button
                size="sm"
                variant="outlined"
                disabled={
                  meta.totalPages
                    ? page >=
                      meta.totalPages
                    : vouchers.length <
                      10
                }
                onClick={() =>
                  setPage(
                    (prev) =>
                      prev + 1
                  )
                }
              >
                Next
              </Button>

            </div>

          </div>

        </Card>

      </div>

      {/* ======================================================
          MODAL CREATE / UPDATE
      ====================================================== */}

      <Dialog
        open={openModal}
        handler={() => {
          setOpenModal(
            !openModal
          );
        }}
        size="lg"
        className="max-h-[90vh] overflow-y-auto"
      >

        <DialogHeader>

          <div>

            <Typography
              variant="h5"
              className="font-black text-blue-gray-900"
            >
              {editingVoucher
                ? "Edit Voucher"
                : "Buat Voucher Global"}
            </Typography>

            <Typography className="text-xs font-normal text-gray-500 mt-1">
              Voucher yang dibuat Super Admin berlaku secara
              global.
            </Typography>

          </div>

        </DialogHeader>

        <DialogBody className="space-y-5">

          {/* CODE + NAME */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              label="Voucher Code"
              name="code"
              value={
                formData.code
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="Voucher Name"
              name="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
            />

          </div>

          {/* DESCRIPTION */}

          <Textarea
            label="Description"
            name="description"
            value={
              formData.description
            }
            onChange={
              handleChange
            }
          />

          {/* TYPE + VALUE */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Select
              label="Voucher Type"
              value={
                formData.type
              }
              onChange={(
                value
              ) =>
                setFormData(
                  (prev) => ({
                    ...prev,
                    type: value,
                  })
                )
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
              value={
                formData.value
              }
              onChange={
                handleChange
              }
            />

          </div>

          {/* MIN + MAX */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              type="number"
              label="Minimum Spend"
              name="minSpend"
              value={
                formData.minSpend
              }
              onChange={
                handleChange
              }
            />

            <Input
              type="number"
              label="Maximum Discount"
              name="maxDiscount"
              value={
                formData.maxDiscount
              }
              onChange={
                handleChange
              }
            />

          </div>

          {/* GLOBAL SCOPE */}

          <div>

            <Typography className="text-[10px] uppercase font-black text-gray-500 mb-2">
              Voucher Scope
            </Typography>

            <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 p-4">

              <div>

                <Typography className="text-xs font-black text-blue-900">
                  Global Voucher
                </Typography>

                <Typography className="text-[10px] text-gray-500 mt-1">
                  Store ID tidak digunakan untuk voucher global.
                </Typography>

              </div>

              <Chip
                value="GLOBAL"
                color="blue"
              />

            </div>

          </div>

          {/* DATE */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              type="datetime-local"
              label="Valid From"
              name="validFrom"
              value={
                formData.validFrom
              }
              onChange={
                handleChange
              }
            />

            <Input
              type="datetime-local"
              label="Valid Until"
              name="validUntil"
              value={
                formData.validUntil
              }
              onChange={
                handleChange
              }
            />

          </div>

          {/* LIMIT */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              type="number"
              label="Usage Limit"
              name="usageLimit"
              value={
                formData.usageLimit
              }
              onChange={
                handleChange
              }
            />

            <Input
              type="number"
              label="Per User Limit"
              name="perUserLimit"
              value={
                formData.perUserLimit
              }
              onChange={
                handleChange
              }
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
            onClick={
              handleSubmit
            }
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
// TABLE COMPONENTS
// ============================================================

const TableHead = ({
  children,
}) => (
  <th className="p-4 text-left">

    <Typography className="text-[10px] font-black uppercase text-blue-gray-500">
      {children}
    </Typography>

  </th>
);

const TableCell = ({
  children,
}) => (
  <td className="p-4 align-middle">
    {children}
  </td>
);

// ============================================================
// FORMAT RUPIAH
// ============================================================

const formatRupiah = (
  value
) => {
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
  ).format(
    Number(value) || 0
  );
};

// ============================================================
// VOUCHER VALUE
// ============================================================

const formatVoucherValue = (
  voucher
) => {
  if (!voucher) {
    return "-";
  }

  if (
    voucher.type ===
      "PERCENTAGE" ||
    voucher.type ===
      "PERCENT"
  ) {
    return `${voucher.value}%`;
  }

  return formatRupiah(
    voucher.value
  );
};

// ============================================================
// DATE
// ============================================================

const formatDate = (
  value
) => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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

// ============================================================
// DATE INPUT
// ============================================================

const formatDateInput = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const localDate =
    new Date(
      date.getTime() -
        date.getTimezoneOffset() *
          60000
    );

  return localDate
    .toISOString()
    .slice(0, 16);
};

// ============================================================
// VOUCHER STATUS
// ============================================================

const VoucherStatus = ({
  voucher,
}) => {
  const now =
    new Date();

  const validFrom =
    voucher.validFrom
      ? new Date(
          voucher.validFrom
        )
      : null;

  const validUntil =
    voucher.validUntil
      ? new Date(
          voucher.validUntil
        )
      : null;

  // Belum mulai
  if (
    validFrom &&
    now < validFrom
  ) {
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

  // Expired
  if (
    validUntil &&
    now > validUntil
  ) {
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

  // Limit habis
  if (
    voucher.usageLimit !==
      null &&
    voucher.usageLimit !==
      undefined
  ) {
    const used =
      Number(
        voucher.usageCount ??
          voucher.usedCount ??
          0
      );

    const limit =
      Number(
        voucher.usageLimit
      );

    if (
      used >= limit
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

export default VoucherManagement;