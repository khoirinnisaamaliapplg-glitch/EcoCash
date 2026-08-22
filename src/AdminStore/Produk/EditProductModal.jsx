import React, {
  useEffect,
} from "react";

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
} from "@material-tailwind/react";

import {
  PencilSquareIcon,
  CubeIcon,
  BanknotesIcon,
  TagIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";

const EditProductModal = ({
  open,
  setOpen,
  formData,
  setFormData,
  handleUpdate,
}) => {

  // ============================================================
  // SAAT MODAL DIBUKA
  // ============================================================

  useEffect(() => {
    if (!open) return;

    const hasDiscount =
      formData?.discountPrice !==
        null &&
      formData?.discountPrice !==
        undefined &&
      formData?.discountPrice !== "";

    setFormData((prev) => ({
      ...prev,

      // Existing backend product hanya menyimpan discountPrice
      discountMode:
        hasDiscount
          ? "PRICE"
          : "NONE",
    }));
  }, [open]);

  // ============================================================
  // INPUT
  // ============================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // DISCOUNT MODE
  // ============================================================

  const handleDiscountMode = (
    mode
  ) => {
    const regularPrice =
      Number(
        formData.price || 0
      );

    const oldSalePrice =
      Number(
        formData.discountPrice ||
          0
      );

    const oldPercent =
      Number(
        formData.discountPercent ||
          0
      );

    // ========================================================
    // NONE
    // ========================================================

    if (mode === "NONE") {
      setFormData((prev) => ({
        ...prev,

        discountMode: "NONE",
        discountPercent: "",
        discountPrice: "",
      }));

      return;
    }

    // ========================================================
    // PERCENT
    //
    // Jika sebelumnya memiliki discountPrice,
    // hitung perkiraan persennya
    // ========================================================

    if (mode === "PERCENT") {
      let percent =
        oldPercent > 0
          ? oldPercent
          : "";

      if (
        !percent &&
        regularPrice > 0 &&
        oldSalePrice >= 0 &&
        oldSalePrice <
          regularPrice
      ) {
        percent =
          Math.round(
            ((regularPrice -
              oldSalePrice) /
              regularPrice) *
              100
          );
      }

      setFormData((prev) => ({
        ...prev,

        discountMode:
          "PERCENT",

        discountPercent:
          percent,

        // PENTING
        discountPrice: "",
      }));

      return;
    }

    // ========================================================
    // PRICE
    //
    // Jika sebelumnya percent,
    // hitung harga jual
    // ========================================================

    if (mode === "PRICE") {
      let salePrice =
        formData.discountPrice;

      if (
        (salePrice === "" ||
          salePrice === null ||
          salePrice ===
            undefined) &&
        regularPrice > 0 &&
        oldPercent > 0
      ) {
        salePrice =
          Math.round(
            (regularPrice *
              (100 -
                oldPercent)) /
              100
          );
      }

      setFormData((prev) => ({
        ...prev,

        discountMode:
          "PRICE",

        discountPrice:
          salePrice,

        // PENTING
        discountPercent: "",
      }));
    }
  };

  // ============================================================
  // PREVIEW
  // ============================================================

  const regularPrice =
    Number(
      formData?.price || 0
    );

  let previewPrice =
    regularPrice;

  let previewPercent = 0;

  if (
    formData?.discountMode ===
      "PERCENT" &&
    Number(
      formData.discountPercent
    ) > 0
  ) {
    previewPercent =
      Number(
        formData.discountPercent
      );

    previewPrice =
      Math.round(
        (regularPrice *
          (100 -
            previewPercent)) /
          100
      );
  }

  if (
    formData?.discountMode ===
      "PRICE" &&
    formData.discountPrice !==
      ""
  ) {
    previewPrice =
      Number(
        formData.discountPrice
      );

    if (
      regularPrice > 0 &&
      previewPrice >= 0 &&
      previewPrice <
        regularPrice
    ) {
      previewPercent =
        Math.round(
          ((regularPrice -
            previewPrice) /
            regularPrice) *
            100
        );
    }
  }

  // ============================================================
  // VALIDATION
  // ============================================================

  const onSave = () => {
    if (
      !formData.name?.trim()
    ) {
      toast.error(
        "Nama produk tidak boleh kosong!"
      );

      return;
    }

    if (
      Number(
        formData.price
      ) <= 0
    ) {
      toast.error(
        "Harga harus lebih dari 0!"
      );

      return;
    }

    if (
      Number(
        formData.stock
      ) < 0
    ) {
      toast.error(
        "Stok tidak boleh negatif!"
      );

      return;
    }

    if (
      Number(
        formData.weight || 0
      ) < 0
    ) {
      toast.error(
        "Berat tidak boleh negatif!"
      );

      return;
    }

    // ========================================================
    // PERCENT
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
          "Diskon persen harus berupa angka bulat antara 1 sampai 99%."
        );

        return;
      }
    }

    // ========================================================
    // DISCOUNT PRICE
    // ========================================================

    if (
      formData.discountMode ===
      "PRICE"
    ) {
      const salePrice =
        Number(
          formData.discountPrice
        );

      if (
        formData.discountPrice ===
          "" ||
        !Number.isInteger(
          salePrice
        ) ||
        salePrice < 0
      ) {
        toast.error(
          "Harga diskon tidak valid."
        );

        return;
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

        return;
      }
    }

    handleUpdate();
  };

  return (
    <Dialog
      open={open}
      handler={() =>
        setOpen(false)
      }
      size="md"
      className="
        rounded-[2rem]
        p-4
        shadow-2xl
        border
        border-blue-100
        bg-white
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <DialogHeader className="flex items-center gap-4 border-b border-blue-50 pb-4">

        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">

          <PencilSquareIcon className="h-6 w-6 text-white stroke-[2.5]" />

        </div>

        <div>

          <Typography
            variant="h5"
            className="text-blue-900 font-black uppercase tracking-tight leading-none"
          >
            Update Produk
          </Typography>

          <Typography className="text-[10px] text-blue-400 font-bold tracking-widest uppercase mt-1">
            ID Produk:{" "}
            {formData?.id || "-"}
          </Typography>

        </div>

      </DialogHeader>

      {/* ======================================================
          BODY
      ====================================================== */}

      <DialogBody className="py-6 px-2 overflow-y-auto max-h-[70vh]">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="space-y-4">

            {/* NAME */}

            <div className="space-y-1.5">

              <Typography className="text-[11px] font-black text-blue-800 ml-1 uppercase flex items-center gap-2">
                <TagIcon className="h-3.5 w-3.5" />
                Nama Produk
              </Typography>

              <Input
                name="name"
                size="md"
                placeholder="Contoh: Pot Hias"
                className="
                  !border
                  !border-blue-100
                  bg-blue-50/20
                  focus:!border-blue-600
                  rounded-xl
                "
                labelProps={{
                  className:
                    "hidden",
                }}
                value={
                  formData?.name ||
                  ""
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* DESCRIPTION */}

            <div className="space-y-1.5">

              <Typography className="text-[11px] font-black text-blue-800 ml-1 uppercase flex items-center gap-2">
                <InformationCircleIcon className="h-3.5 w-3.5" />
                Deskripsi
              </Typography>

              <Input
                name="description"
                placeholder="Detail produk..."
                className="
                  !border
                  !border-blue-100
                  bg-blue-50/20
                  focus:!border-blue-600
                  rounded-xl
                "
                labelProps={{
                  className:
                    "hidden",
                }}
                value={
                  formData
                    ?.description ||
                  ""
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* WEIGHT */}

            <div className="space-y-1.5">

              <Typography className="text-[11px] font-black text-blue-800 ml-1 uppercase">
                Berat
              </Typography>

              <Input
                name="weight"
                type="number"
                min="0"
                className="
                  !border
                  !border-blue-100
                  bg-blue-50/20
                  focus:!border-blue-600
                  rounded-xl
                "
                labelProps={{
                  className:
                    "hidden",
                }}
                value={
                  formData?.weight ??
                  ""
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>

          {/* ==================================================
              RIGHT
          ================================================== */}

          <div className="space-y-4">

            {/* STOCK */}

            <div className="space-y-1.5">

              <Typography className="text-[11px] font-black text-blue-800 ml-1 uppercase flex items-center gap-2">
                <CubeIcon className="h-3.5 w-3.5" />
                Update Stok
              </Typography>

              <Input
                name="stock"
                type="number"
                min="0"
                className="
                  !border
                  !border-blue-100
                  bg-blue-50/20
                  focus:!border-blue-600
                  rounded-xl
                "
                labelProps={{
                  className:
                    "hidden",
                }}
                value={
                  formData?.stock ??
                  ""
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* PRICE */}

            <div className="space-y-1.5">

              <Typography className="text-[11px] font-black text-blue-800 ml-1 uppercase flex items-center gap-2">
                <BanknotesIcon className="h-3.5 w-3.5" />
                Harga Normal (Rp)
              </Typography>

              <Input
                name="price"
                type="number"
                min="0"
                className="
                  !border
                  !border-blue-100
                  bg-blue-50/20
                  focus:!border-blue-600
                  rounded-xl
                "
                labelProps={{
                  className:
                    "hidden",
                }}
                value={
                  formData?.price ??
                  ""
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>

        </div>

        {/* ====================================================
            DISCOUNT
        ==================================================== */}

        <div className="mt-6 border-t border-blue-50 pt-5">

          <div className="flex items-center gap-2 mb-4">

            <TagIcon className="h-4 w-4 text-red-500" />

            <Typography className="text-[11px] font-black uppercase text-blue-900">
              Diskon Produk
            </Typography>

          </div>

          <Select
            label="Jenis Diskon"
            value={
              formData?.discountMode ||
              "NONE"
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

          {/* PERCENT */}

          {formData
            ?.discountMode ===
            "PERCENT" && (

            <div className="mt-4">

              <Input
                name="discountPercent"
                type="number"
                min="1"
                max="99"
                label="Diskon (%)"
                value={
                  formData
                    ?.discountPercent ??
                  ""
                }
                onChange={
                  handleChange
                }
              />

            </div>

          )}

          {/* PRICE */}

          {formData
            ?.discountMode ===
            "PRICE" && (

            <div className="mt-4">

              <Input
                name="discountPrice"
                type="number"
                min="0"
                label="Harga Setelah Diskon"
                value={
                  formData
                    ?.discountPrice ??
                  ""
                }
                onChange={
                  handleChange
                }
              />

            </div>

          )}

          {/* PREVIEW */}

          {formData
            ?.discountMode !==
            "NONE" &&
            regularPrice > 0 && (

            <div className="mt-4 bg-green-50 border border-green-100 rounded-2xl p-4">

              <Typography className="text-[9px] font-black text-gray-500 uppercase">
                Preview Harga Jual
              </Typography>

              <div className="flex items-end gap-3 mt-1">

                <Typography className="text-xs font-bold text-gray-400 line-through">
                  Rp{" "}
                  {regularPrice.toLocaleString(
                    "id-ID"
                  )}
                </Typography>

                <Typography
                  variant="h5"
                  className="font-black text-green-600"
                >
                  Rp{" "}
                  {Number(
                    previewPrice ||
                      0
                  ).toLocaleString(
                    "id-ID"
                  )}
                </Typography>

              </div>

              {previewPercent >
                0 && (

                <Typography className="text-[10px] text-red-500 font-black mt-2">
                  DISKON{" "}
                  {previewPercent}%
                </Typography>

              )}

            </div>

          )}

        </div>

      </DialogBody>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <DialogFooter className="flex justify-end gap-3 border-t border-blue-50 pt-5">

        <Button
          variant="text"
          color="red"
          onClick={() =>
            setOpen(false)
          }
          className="rounded-xl font-black italic py-2.5 px-6"
        >
          Batal
        </Button>

        <Button
          onClick={onSave}
          className="
            bg-blue-600
            hover:bg-blue-700
            rounded-xl
            font-black
            shadow-lg
            shadow-blue-100
            px-8
            py-2.5
            text-xs
            uppercase
            transition-all
            active:scale-95
          "
        >
          Simpan Perubahan
        </Button>

      </DialogFooter>

    </Dialog>
  );
};

export default EditProductModal;