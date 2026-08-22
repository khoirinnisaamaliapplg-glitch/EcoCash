import React, {
  useState,
} from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
} from "@material-tailwind/react";

import {
  ExclamationTriangleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// ============================================================
// COMPONENT
// ============================================================

const DeleteCharityModal = ({
  open,
  handleOpen,
  charity,
  onConfirm,
}) => {
  const [
    loading,
    setLoading,
  ] = useState(false);

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
  // DELETE
  // ==========================================================

  const handleDelete =
    async () => {
      if (
        !charity?.id
      ) {
        return;
      }

      try {
        setLoading(true);

        const success =
          await onConfirm(
            charity.id
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
      size="xs"
      className="rounded-[28px]"
    >

      <DialogHeader className="flex flex-col items-center pt-8 text-center">

        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">

          <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />

        </div>

        <Typography
          variant="h5"
          className="font-black text-blue-900"
        >
          Hapus Charity?
        </Typography>

      </DialogHeader>

      <DialogBody className="px-8 text-center">

        <Typography className="text-sm leading-relaxed text-gray-500">

          Charity{" "}

          <strong className="text-blue-900">
            {charity?.name ||
              "ini"}
          </strong>

          {" "}akan dinonaktifkan
          dari sistem.

        </Typography>

        <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">

          <Typography className="text-[10px] leading-relaxed text-amber-800">

            Jika Charity sudah
            menerima Donation,
            Charity tidak dapat
            dihapus. Gunakan Edit
            kemudian ubah status
            menjadi COMPLETED atau
            CLOSED.

          </Typography>

        </div>

      </DialogBody>

      <DialogFooter className="justify-center gap-3 px-8 pb-8">

        <Button
          variant="outlined"
          onClick={
            handleClose
          }
          disabled={
            loading
          }
          className="rounded-xl normal-case"
        >
          Batal
        </Button>

        <Button
          color="red"
          onClick={
            handleDelete
          }
          disabled={
            loading
          }
          className="flex items-center gap-2 rounded-xl normal-case"
        >

          <TrashIcon className="h-4 w-4" />

          {loading
            ? "Menghapus..."
            : "Ya, Hapus"}

        </Button>

      </DialogFooter>

    </Dialog>
  );
};

export default DeleteCharityModal;