import React, { useState } from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  IconButton,
  Textarea,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";

import {
  XMarkIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  TagIcon,
  CubeIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";

// ============================================================
// INITIAL FORM
// ============================================================

const initialForm = {
  name: "",
  price: "",
  stock: "",
  weight: "",
  description: "",

  // STORE
  storeId: "",

  // DISCOUNT
  discountMode: "NONE",
  discountPercent: "",
  discountPrice: "",
};

// ============================================================
// COMPONENT
// ============================================================

const AddProductModal = ({
  open,
  handleOpen,
  onConfirm,
}) => {
  const [formData, setFormData] =
    useState(initialForm);

  const [saving, setSaving] =
    useState(false);

  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================================
  // HANDLE DISCOUNT MODE
  // ==========================================================

  const handleDiscountMode = (
    value
  ) => {
    setFormData((prev) => ({
      ...prev,

      discountMode: value,

      // Jika pilih persen,
      // hapus discountPrice
      discountPrice:
        value === "PRICE"
          ? prev.discountPrice
          : "",

      // Jika pilih harga diskon,
      // hapus discountPercent
      discountPercent:
        value === "PERCENT"
          ? prev.discountPercent
          : "",
    }));
  };

  // ==========================================================
  // NORMAL PRICE
  // ==========================================================

  const normalPrice =
    Number(
      formData.price || 0
    );

  // ==========================================================
  // PREVIEW DISCOUNT
  // ==========================================================

  let finalPrice =
    normalPrice;

  let discountPreview =
    0;

  // ==========================================================
  // DISCOUNT PERCENT PREVIEW
  // ==========================================================

  if (
    formData.discountMode ===
      "PERCENT" &&
    Number(
      formData.discountPercent
    ) > 0
  ) {
    discountPreview =
      Number(
        formData.discountPercent
      );

    finalPrice =
      Math.round(
        (
          normalPrice *
          (100 -
            discountPreview)
        ) /
          100
      );
  }

  // ==========================================================
  // DISCOUNT PRICE PREVIEW
  // ==========================================================

  if (
    formData.discountMode ===
      "PRICE" &&
    formData.discountPrice !==
      ""
  ) {
    finalPrice =
      Number(
        formData.discountPrice
      );

    if (
      normalPrice > 0 &&
      finalPrice >= 0 &&
      finalPrice <
        normalPrice
    ) {
      discountPreview =
        Math.round(
          (
            (normalPrice -
              finalPrice) /
            normalPrice
          ) * 100
        );
    }
  }

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    setFormData({
      ...initialForm,
    });
  };

  // ==========================================================
  // CLOSE
  // ==========================================================

  const handleClose = () => {
    if (saving) {
      return;
    }

    resetForm();

    handleOpen();
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    // ========================================================
    // PRODUCT NAME
    // ========================================================

    if (
      !formData.name.trim()
    ) {
      toast.error(
        "Nama produk wajib diisi."
      );

      return false;
    }

    // ========================================================
    // STORE ID
    // ========================================================

    if (
      formData.storeId === "" ||
      Number(
        formData.storeId
      ) <= 0 ||
      Number.isNaN(
        Number(
          formData.storeId
        )
      )
    ) {
      toast.error(
        "Store ID wajib diisi."
      );

      return false;
    }

    // ========================================================
    // PRICE
    // ========================================================

    if (
      formData.price === "" ||
      Number(
        formData.price
      ) <= 0
    ) {
      toast.error(
        "Harga produk harus lebih dari 0."
      );

      return false;
    }

    // ========================================================
    // STOCK
    // ========================================================

    if (
      Number(
        formData.stock || 0
      ) < 0
    ) {
      toast.error(
        "Stok tidak boleh negatif."
      );

      return false;
    }

    // ========================================================
    // WEIGHT
    // ========================================================

    if (
      Number(
        formData.weight || 0
      ) < 0
    ) {
      toast.error(
        "Berat tidak boleh negatif."
      );

      return false;
    }

    // ========================================================
    // DISCOUNT PERCENT
    // ========================================================

    if (
      formData.discountMode ===
      "PERCENT"
    ) {
      const percent =
        Number(
          formData.discountPercent
        );

      if (
        !Number.isInteger(
          percent
        ) ||
        percent < 1 ||
        percent > 99
      ) {
        toast.error(
          "Diskon persen harus antara 1 sampai 99%."
        );

        return false;
      }
    }

    // ========================================================
    // DISCOUNT PRICE
    // ========================================================

    if (
      formData.discountMode ===
      "PRICE"
    ) {
      if (
        formData.discountPrice ===
        ""
      ) {
        toast.error(
          "Harga diskon wajib diisi."
        );

        return false;
      }

      const salePrice =
        Number(
          formData.discountPrice
        );

      if (
        !Number.isInteger(
          salePrice
        ) ||
        salePrice < 0
      ) {
        toast.error(
          "Harga diskon tidak valid."
        );

        return false;
      }

      if (
        salePrice >=
        Number(
          formData.price
        )
      ) {
        toast.error(
          "Harga diskon harus lebih rendah dari harga normal."
        );

        return false;
      }
    }

    return true;
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // ========================================================
    // BASIC PAYLOAD
    // ========================================================

    const payload = {
      name:
        formData.name.trim(),

      description:
        formData.description
          ?.trim() || "",

      price:
        Number(
          formData.price
        ),

      stock:
        Number(
          formData.stock || 0
        ),

      weight:
        Number(
          formData.weight || 0
        ),

      storeId:
        Number(
          formData.storeId
        ),
    };

    // ========================================================
    // DISCOUNT PERCENT
    //
    // Kirim hanya discountPercent
    // ========================================================

    if (
      formData.discountMode ===
      "PERCENT"
    ) {
      payload.discountPercent =
        Number(
          formData.discountPercent
        );
    }

    // ========================================================
    // DISCOUNT PRICE
    //
    // Kirim hanya discountPrice
    // ========================================================

    if (
      formData.discountMode ===
      "PRICE"
    ) {
      payload.discountPrice =
        Number(
          formData.discountPrice
        );
    }

    try {
      setSaving(true);

      console.log(
        "CREATE PRODUCT PAYLOAD:",
        payload
      );

      const success =
        await onConfirm(
          payload
        );

      // ======================================================
      // CREATE BERHASIL
      // ======================================================

      if (success) {
        resetForm();

        handleOpen();
      }
    } catch (error) {
      console.error(
        "ADD PRODUCT MODAL ERROR:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Dialog
      open={open}
      handler={handleClose}
      size="md"
      className="
        rounded-[2rem]
        border
        border-blue-100
        shadow-2xl
        bg-white
      "
    >
      {/* ====================================================
          HEADER
      ==================================================== */}

      <DialogHeader
        className="
          flex
          items-center
          justify-between
          border-b
          border-blue-50
          pb-4
        "
      >
        <div>
          <Typography
            variant="h5"
            className="
              font-black
              text-blue-900
              uppercase
              tracking-tight
            "
          >
            Tambah Produk
          </Typography>

          <Typography
            className="
              text-[10px]
              font-bold
              text-blue-400
              uppercase
              tracking-widest
              mt-1
            "
          >
            EcoCash Store
          </Typography>
        </div>

        <IconButton
          variant="text"
          onClick={
            handleClose
          }
          disabled={
            saving
          }
          className="rounded-xl"
        >
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      {/* ====================================================
          BODY
      ==================================================== */}

      <DialogBody
        className="
          space-y-5
          max-h-[70vh]
          overflow-y-auto
          py-6
        "
      >
        {/* ==================================================
            STORE ID
        ================================================== */}

        <div>
          <Typography
            className="
              text-[10px]
              font-black
              text-blue-800
              uppercase
              mb-2
              flex
              items-center
              gap-2
            "
          >
            <BuildingStorefrontIcon className="h-4 w-4" />

            Store ID
          </Typography>

          <Input
            label="Masukkan ID Toko"
            name="storeId"
            type="number"
            min="1"
            value={
              formData.storeId
            }
            onChange={
              handleChange
            }
            icon={
              <BuildingStorefrontIcon className="h-5 w-5 text-blue-500" />
            }
          />
        </div>

        {/* ==================================================
            PRODUCT NAME
        ================================================== */}

        <div>
          <Typography
            className="
              text-[10px]
              font-black
              text-blue-800
              uppercase
              mb-2
            "
          >
            Nama Produk
          </Typography>

          <Input
            label="Nama Produk"
            name="name"
            value={
              formData.name
            }
            onChange={
              handleChange
            }
          />
        </div>

        {/* ==================================================
            PRICE
        ================================================== */}

        <div>
          <Typography
            className="
              text-[10px]
              font-black
              text-blue-800
              uppercase
              mb-2
              flex
              items-center
              gap-2
            "
          >
            <CurrencyDollarIcon className="h-4 w-4" />

            Harga Normal
          </Typography>

          <Input
            label="Harga Produk"
            name="price"
            type="number"
            min="0"
            value={
              formData.price
            }
            onChange={
              handleChange
            }
            icon={
              <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
            }
          />
        </div>

        {/* ==================================================
            STOCK & WEIGHT
        ================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* STOCK */}

          <div>
            <Typography
              className="
                text-[10px]
                font-black
                text-blue-800
                uppercase
                mb-2
                flex
                items-center
                gap-2
              "
            >
              <CubeIcon className="h-4 w-4" />

              Stok
            </Typography>

            <Input
              label="Jumlah Stok"
              name="stock"
              type="number"
              min="0"
              value={
                formData.stock
              }
              onChange={
                handleChange
              }
            />
          </div>

          {/* WEIGHT */}

          <div>
            <Typography
              className="
                text-[10px]
                font-black
                text-blue-800
                uppercase
                mb-2
                flex
                items-center
                gap-2
              "
            >
              <ScaleIcon className="h-4 w-4" />

              Berat
            </Typography>

            <Input
              label="Berat Produk"
              name="weight"
              type="number"
              min="0"
              value={
                formData.weight
              }
              onChange={
                handleChange
              }
            />
          </div>
        </div>

        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        <div>
          <Typography
            className="
              text-[10px]
              font-black
              text-blue-800
              uppercase
              mb-2
            "
          >
            Deskripsi
          </Typography>

          <Textarea
            label="Deskripsi Produk"
            name="description"
            value={
              formData.description
            }
            onChange={
              handleChange
            }
          />
        </div>

        {/* ==================================================
            DISCOUNT SECTION
        ================================================== */}

        <div
          className="
            border-t
            border-blue-50
            pt-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              mb-4
            "
          >
            <div
              className="
                bg-red-50
                p-2
                rounded-xl
              "
            >
              <TagIcon className="h-5 w-5 text-red-500" />
            </div>

            <div>
              <Typography
                className="
                  text-xs
                  font-black
                  text-blue-900
                  uppercase
                "
              >
                Diskon Produk
              </Typography>

              <Typography
                className="
                  text-[9px]
                  text-gray-400
                  font-bold
                  uppercase
                "
              >
                Opsional
              </Typography>
            </div>
          </div>

          {/* =================================================
              DISCOUNT MODE
          ================================================= */}

          <Select
            label="Jenis Diskon"
            value={
              formData.discountMode
            }
            onChange={
              handleDiscountMode
            }
          >
            <Option value="NONE">
              Tanpa Diskon
            </Option>

            <Option value="PERCENT">
              Persentase (%)
            </Option>

            <Option value="PRICE">
              Harga Diskon
            </Option>
          </Select>

          {/* =================================================
              DISCOUNT PERCENT
          ================================================= */}

          {formData.discountMode ===
            "PERCENT" && (
            <div className="mt-4">
              <Input
                label="Diskon (%)"
                name="discountPercent"
                type="number"
                min="1"
                max="99"
                value={
                  formData.discountPercent
                }
                onChange={
                  handleChange
                }
                icon={
                  <TagIcon className="h-5 w-5 text-red-500" />
                }
              />
            </div>
          )}

          {/* =================================================
              DISCOUNT PRICE
          ================================================= */}

          {formData.discountMode ===
            "PRICE" && (
            <div className="mt-4">
              <Input
                label="Harga Setelah Diskon"
                name="discountPrice"
                type="number"
                min="0"
                value={
                  formData.discountPrice
                }
                onChange={
                  handleChange
                }
                icon={
                  <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                }
              />
            </div>
          )}

          {/* =================================================
              PRICE PREVIEW
          ================================================= */}

          {formData.discountMode !==
            "NONE" &&
            normalPrice > 0 && (
              <div
                className="
                  mt-4
                  p-4
                  rounded-2xl
                  bg-green-50
                  border
                  border-green-100
                "
              >
                <Typography
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    text-gray-500
                    tracking-wider
                  "
                >
                  Preview Harga Jual
                </Typography>

                <div
                  className="
                    flex
                    flex-wrap
                    items-end
                    gap-3
                    mt-2
                  "
                >
                  {/* NORMAL PRICE */}

                  <Typography
                    className="
                      text-sm
                      font-bold
                      text-gray-400
                      line-through
                    "
                  >
                    Rp{" "}
                    {normalPrice.toLocaleString(
                      "id-ID"
                    )}
                  </Typography>

                  {/* FINAL PRICE */}

                  <Typography
                    variant="h5"
                    className="
                      font-black
                      text-green-600
                    "
                  >
                    Rp{" "}
                    {Number(
                      finalPrice || 0
                    ).toLocaleString(
                      "id-ID"
                    )}
                  </Typography>
                </div>

                {/* DISCOUNT BADGE */}

                {discountPreview >
                  0 && (
                  <div className="mt-3">
                    <span
                      className="
                        inline-flex
                        px-3
                        py-1
                        rounded-xl
                        bg-red-50
                        text-red-600
                        border
                        border-red-100
                        text-[10px]
                        font-black
                        uppercase
                      "
                    >
                      Diskon{" "}
                      {
                        discountPreview
                      }
                      %
                    </span>
                  </div>
                )}
              </div>
            )}
        </div>
      </DialogBody>

      {/* ====================================================
          FOOTER
      ==================================================== */}

      <DialogFooter
        className="
          flex
          justify-end
          gap-3
          border-t
          border-blue-50
          pt-5
        "
      >
        <Button
          variant="text"
          color="red"
          onClick={
            handleClose
          }
          disabled={
            saving
          }
          className="
            rounded-xl
            font-black
            px-6
          "
        >
          Batal
        </Button>

        <Button
          onClick={
            handleSubmit
          }
          disabled={
            saving
          }
          className="
            bg-blue-600
            hover:bg-blue-700
            rounded-xl
            font-black
            px-8
            shadow-lg
            shadow-blue-100
          "
        >
          {saving
            ? "Menyimpan..."
            : "Simpan Produk"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddProductModal;