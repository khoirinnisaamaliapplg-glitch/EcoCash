import React, {
  useEffect,
  useState,
} from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Button,
  Typography,
  IconButton,
} from "@material-tailwind/react";

import {
  XMarkIcon,
  HeartIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  PhotoIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

import {
  toast,
} from "react-toastify";

import api from "../../utils/api";

// ============================================================
// INITIAL
// ============================================================

const INITIAL_FORM = {
  name: "",
  description: "",
  imageUrl: "",
  targetAmount: "",
  startAt: "",
  endAt: "",
};

// ============================================================
// HELPERS
// ============================================================

const extractFoundations = (
  responseData
) => {
  if (
    Array.isArray(
      responseData
    )
  ) {
    return responseData;
  }

  if (
    Array.isArray(
      responseData?.data
    )
  ) {
    return responseData.data;
  }

  if (
    Array.isArray(
      responseData?.data
        ?.foundations
    )
  ) {
    return responseData.data
      .foundations;
  }

  if (
    Array.isArray(
      responseData
        ?.foundations
    )
  ) {
    return responseData
      .foundations;
  }

  return [];
};

// ============================================================
// COMPONENT
// ============================================================

const CreateCharityModal = ({
  open,
  handleOpen,
  onConfirm,
}) => {
  const [
    formData,
    setFormData,
  ] = useState(
    INITIAL_FORM
  );

  const [
    foundation,
    setFoundation,
  ] = useState(null);

  const [
    loadingFoundation,
    setLoadingFoundation,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getHeaders = () => {
    const token =
      localStorage.getItem(
        "token"
      );

    return {
      Authorization:
        `Bearer ${token}`,
    };
  };

  // ==========================================================
  // GET CURRENT FOUNDATION
  // ==========================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchFoundation =
      async () => {
        try {
          setLoadingFoundation(
            true
          );

          const response =
            await api.get(
              "/foundations",
              {
                headers:
                  getHeaders(),
              }
            );

          console.log(
            "CURRENT FOUNDATION RESPONSE:",
            response.data
          );

          const foundations =
            extractFoundations(
              response.data
            );

          const current =
            foundations[0] ||
            null;

          setFoundation(
            current
          );

          if (!current) {
            toast.error(
              "Foundation untuk akun ini belum ditemukan."
            );
          }
        } catch (error) {
          console.error(
            "GET CURRENT FOUNDATION ERROR:",
            error
          );

          console.error(
            "DATA:",
            error.response
              ?.data
          );

          setFoundation(
            null
          );

          toast.error(
            error.response
              ?.data?.message ||
              "Gagal mengambil Foundation."
          );
        } finally {
          setLoadingFoundation(
            false
          );
        }
      };

    fetchFoundation();
  }, [open]);

  // ==========================================================
  // CHANGE
  // ==========================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // ==========================================================
  // CLOSE
  // ==========================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    setFormData({
      ...INITIAL_FORM,
    });

    setFoundation(
      null
    );

    handleOpen();
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit =
    async () => {
      if (
        !formData.name.trim()
      ) {
        toast.warning(
          "Nama Charity wajib diisi."
        );

        return;
      }

      if (
        !foundation?.id
      ) {
        toast.warning(
          "Foundation tidak ditemukan."
        );

        return;
      }

      const targetAmount =
        Number(
          formData.targetAmount
        );

      if (
        !Number.isFinite(
          targetAmount
        ) ||
        targetAmount <= 0
      ) {
        toast.warning(
          "Target donasi harus lebih besar dari 0."
        );

        return;
      }

      if (
        formData.startAt &&
        formData.endAt
      ) {
        if (
          new Date(
            formData.endAt
          ) <=
          new Date(
            formData.startAt
          )
        ) {
          toast.warning(
            "Tanggal selesai harus setelah tanggal mulai."
          );

          return;
        }
      }

      // ======================================================
      // PAYLOAD SESUAI BACKEND
      // ======================================================

      const payload = {
        name:
          formData.name.trim(),

        foundationId:
          Number(
            foundation.id
          ),

        targetAmount,

        ...(formData.description.trim() && {
          description:
            formData.description.trim(),
        }),

        ...(formData.imageUrl.trim() && {
          imageUrl:
            formData.imageUrl.trim(),
        }),

        ...(formData.startAt && {
          startAt:
            new Date(
              formData.startAt
            ).toISOString(),
        }),

        ...(formData.endAt && {
          endAt:
            new Date(
              formData.endAt
            ).toISOString(),
        }),
      };

      console.log(
        "FINAL CREATE CHARITY PAYLOAD:",
        payload
      );

      try {
        setLoading(true);

        const success =
          await onConfirm(
            payload
          );

        if (success) {
          setFormData({
            ...INITIAL_FORM,
          });

          handleOpen();
        }
      } finally {
        setLoading(false);
      }
    };

  const formattedTarget =
    Number(
      formData.targetAmount ||
        0
    ).toLocaleString(
      "id-ID"
    );

  return (
    <Dialog
      open={open}
      handler={
        handleClose
      }
      size="lg"
      className="rounded-[28px]"
    >
      {/* HEADER */}

      <DialogHeader className="flex items-center justify-between px-8 pt-8">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

            <HeartIcon className="h-6 w-6 text-blue-600" />

          </div>

          <div>

            <Typography
              variant="h5"
              className="font-black text-blue-900"
            >
              Tambah Charity
            </Typography>

            <Typography className="text-[10px] font-bold uppercase text-gray-400">
              Foundation Program
            </Typography>

          </div>

        </div>

        <IconButton
          variant="text"
          onClick={
            handleClose
          }
        >
          <XMarkIcon className="h-5 w-5" />
        </IconButton>

      </DialogHeader>

      {/* BODY */}

      <DialogBody className="max-h-[70vh] space-y-5 overflow-y-auto px-8 py-5">

        {/* FOUNDATION */}

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">

          <div className="flex items-center gap-3">

            <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />

            <div>

              <Typography className="text-[10px] font-black uppercase text-blue-500">
                Foundation
              </Typography>

              {loadingFoundation ? (

                <Typography className="text-sm text-gray-500">
                  Memuat Foundation...
                </Typography>

              ) : foundation ? (

                <>
                  <Typography className="font-black text-blue-900">
                    {foundation.name}
                  </Typography>

                  <Typography className="text-[10px] text-gray-500">
                    Foundation ID:{" "}
                    {foundation.id}
                  </Typography>
                </>

              ) : (

                <Typography className="font-bold text-red-500">
                  Foundation tidak ditemukan
                </Typography>

              )}

            </div>

          </div>

        </div>

        {/* NAME */}

        <Input
          label="Nama Charity"
          name="name"
          value={
            formData.name
          }
          onChange={
            handleChange
          }
          icon={
            <HeartIcon className="h-4 w-4" />
          }
        />

        {/* DESCRIPTION */}

        <Textarea
          label="Deskripsi Charity"
          name="description"
          value={
            formData.description
          }
          onChange={
            handleChange
          }
          rows={5}
        />

        {/* TARGET */}

        <div>

          <Input
            label="Target Donasi"
            name="targetAmount"
            type="number"
            min="1"
            value={
              formData.targetAmount
            }
            onChange={
              handleChange
            }
            icon={
              <BanknotesIcon className="h-4 w-4" />
            }
          />

          <Typography className="mt-2 text-[10px] font-bold text-green-600">
            Rp {formattedTarget}
          </Typography>

        </div>

        {/* IMAGE */}

        <Input
          label="Image URL (Opsional)"
          name="imageUrl"
          type="url"
          value={
            formData.imageUrl
          }
          onChange={
            handleChange
          }
          icon={
            <PhotoIcon className="h-4 w-4" />
          }
        />

        {/* DATE */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <Input
            label="Tanggal Mulai"
            name="startAt"
            type="datetime-local"
            value={
              formData.startAt
            }
            onChange={
              handleChange
            }
            icon={
              <CalendarDaysIcon className="h-4 w-4" />
            }
          />

          <Input
            label="Tanggal Selesai"
            name="endAt"
            type="datetime-local"
            value={
              formData.endAt
            }
            onChange={
              handleChange
            }
            icon={
              <CalendarDaysIcon className="h-4 w-4" />
            }
          />

        </div>

      </DialogBody>

      {/* FOOTER */}

      <DialogFooter className="gap-3 px-8 pb-8">

        <Button
          variant="text"
          color="red"
          onClick={
            handleClose
          }
          disabled={
            loading
          }
        >
          Batal
        </Button>

        <Button
          onClick={
            handleSubmit
          }
          disabled={
            loading ||
            loadingFoundation ||
            !foundation
          }
          className="rounded-xl bg-[#66bb6a] normal-case shadow-none"
        >
          {loading
            ? "Menyimpan..."
            : "Simpan Charity"}
        </Button>

      </DialogFooter>

    </Dialog>
  );
};

export default CreateCharityModal;