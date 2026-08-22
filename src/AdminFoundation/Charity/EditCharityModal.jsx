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
  Select,
  Option,
  IconButton,
} from "@material-tailwind/react";

import {
  XMarkIcon,
  PencilSquareIcon,
  BanknotesIcon,
  PhotoIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

import {
  toast,
} from "react-toastify";

// ============================================================
// DATE FORMAT FOR DATETIME LOCAL
// ============================================================

const toDateTimeLocal = (
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

  const offset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
        offset *
          60 *
          1000
    );

  return localDate
    .toISOString()
    .slice(0, 16);
};

// ============================================================
// COMPONENT
// ============================================================

const EditCharityModal = ({
  open,
  handleOpen,
  charity,
  onConfirm,
}) => {
  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    description: "",
    imageUrl: "",
    targetAmount: "",
    status: "ACTIVE",
    startAt: "",
    endAt: "",
    isActive: true,
  });

  const [
    loading,
    setLoading,
  ] = useState(false);

  // ==========================================================
  // LOAD CHARITY
  // ==========================================================

  useEffect(() => {
    if (
      !open ||
      !charity
    ) {
      return;
    }

    setFormData({
      name:
        charity.name ||
        "",

      description:
        charity.description ||
        "",

      imageUrl:
        charity.imageUrl ||
        "",

      targetAmount:
        charity.targetAmount !=
        null
          ? String(
              charity.targetAmount
            )
          : "",

      status:
        charity.status ||
        "ACTIVE",

      startAt:
        toDateTimeLocal(
          charity.startAt
        ),

      endAt:
        toDateTimeLocal(
          charity.endAt
        ),

      isActive:
        charity.isActive !==
        false,
    });
  }, [
    open,
    charity,
  ]);

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

    handleOpen();
  };

  // ==========================================================
  // UPDATE
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
        formData.endAt &&
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

      // ======================================================
      // UPDATE PAYLOAD
      //
      // JANGAN KIRIM foundationId
      // ======================================================

      const payload = {
        name:
          formData.name.trim(),

        description:
          formData.description.trim(),

        imageUrl:
          formData.imageUrl.trim(),

        targetAmount,

        status:
          formData.status,

        isActive:
          Boolean(
            formData.isActive
          ),

        startAt:
          formData.startAt
            ? new Date(
                formData.startAt
              ).toISOString()
            : null,

        endAt:
          formData.endAt
            ? new Date(
                formData.endAt
              ).toISOString()
            : null,
      };

      console.log(
        "EDIT CHARITY PAYLOAD:",
        payload
      );

      try {
        setLoading(true);

        const success =
          await onConfirm(
            charity.id,
            payload
          );

        if (success) {
          handleOpen();
        }
      } finally {
        setLoading(false);
      }
    };

  return (
    <Dialog
      open={open}
      handler={
        handleClose
      }
      size="lg"
      className="rounded-[28px]"
    >

      <DialogHeader className="flex items-center justify-between px-8 pt-8">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">

            <PencilSquareIcon className="h-6 w-6 text-green-600" />

          </div>

          <div>

            <Typography
              variant="h5"
              className="font-black text-blue-900"
            >
              Edit Charity
            </Typography>

            <Typography className="text-[10px] font-bold uppercase text-gray-400">
              Charity ID:{" "}
              {charity?.id}
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

      <DialogBody className="max-h-[70vh] space-y-5 overflow-y-auto px-8 py-5">

        <Input
          label="Nama Charity"
          name="name"
          value={
            formData.name
          }
          onChange={
            handleChange
          }
        />

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

        <Input
          label="Image URL"
          name="imageUrl"
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

        {/* STATUS */}

        <Select
          label="Status Charity"
          value={
            formData.status
          }
          onChange={(
            value
          ) =>
            setFormData(
              (
                previous
              ) => ({
                ...previous,

                status:
                  value ||
                  "ACTIVE",
              })
            )
          }
        >
          <Option value="ACTIVE">
            ACTIVE
          </Option>

          <Option value="COMPLETED">
            COMPLETED
          </Option>

          <Option value="CLOSED">
            CLOSED
          </Option>
        </Select>

        {/* DATES */}

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

        {/* ACTIVE */}

        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">

          <div>

            <Typography className="text-sm font-bold text-gray-800">
              Charity Aktif
            </Typography>

            <Typography className="text-[10px] text-gray-400">
              Mengatur isActive Charity
            </Typography>

          </div>

          <input
            type="checkbox"
            checked={
              formData.isActive
            }
            onChange={(
              event
            ) =>
              setFormData(
                (
                  previous
                ) => ({
                  ...previous,

                  isActive:
                    event.target
                      .checked,
                })
              )
            }
            className="h-5 w-5 cursor-pointer accent-green-500"
          />

        </div>

      </DialogBody>

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
            loading
          }
          className="rounded-xl bg-[#66bb6a] normal-case shadow-none"
        >
          {loading
            ? "Menyimpan..."
            : "Simpan Perubahan"}
        </Button>

      </DialogFooter>

    </Dialog>
  );
};

export default EditCharityModal;