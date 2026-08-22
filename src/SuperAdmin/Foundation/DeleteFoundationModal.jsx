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

import {
  toast,
} from "react-toastify";

import api from "../../utils/api";

// ============================================================
// COMPONENT
// ============================================================

const DeleteFoundationModal = ({
  open,
  handleOpen,
  foundation,
  refreshData,
}) => {
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
  // DELETE
  // ==========================================================

  const handleDelete =
    async () => {
      if (
        !foundation?.id
      ) {
        toast.error(
          "ID Foundation tidak ditemukan."
        );

        return;
      }

      try {
        setLoading(true);

        console.log(
          "DELETE FOUNDATION ID:",
          foundation.id
        );

        const response =
          await api.delete(
            `/foundations/${foundation.id}`,
            {
              headers:
                getHeaders(),
            }
          );

        console.log(
          "DELETE FOUNDATION RESPONSE:",
          response.data
        );

        toast.success(
          response.data
            ?.message ||
            "Foundation berhasil dihapus."
        );

        handleOpen();

        if (
          refreshData
        ) {
          await refreshData();
        }
      } catch (error) {
        console.error(
          "DELETE FOUNDATION ERROR:",
          error
        );

        console.error(
          "STATUS:",
          error.response
            ?.status
        );

        console.error(
          "DATA:",
          error.response
            ?.data
        );

        toast.error(
          error.response
            ?.data
            ?.message ||
            "Gagal menghapus Foundation."
        );
      } finally {
        setLoading(false);
      }
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
  // UI
  // ==========================================================

  return (
    <Dialog
      open={open}
      handler={
        handleClose
      }
      size="xs"
      className="rounded-[28px]"
    >
      <DialogHeader
        className="
          flex
          flex-col
          items-center
          pt-8
          text-center
        "
      >
        <div
          className="
            mb-4
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-red-50
          "
        >
          <ExclamationTriangleIcon
            className="
              h-8
              w-8
              text-red-500
            "
          />
        </div>

        <Typography
          variant="h5"
          className="font-black text-blue-900"
        >
          Hapus Foundation?
        </Typography>

      </DialogHeader>

      <DialogBody className="px-8 text-center">

        <Typography
          className="
            text-sm
            leading-relaxed
            text-gray-500
          "
        >
          Foundation{" "}

          <strong className="text-blue-900">
            {foundation?.name ||
              "ini"}
          </strong>

          {" "}akan dinonaktifkan
          dari sistem.
        </Typography>

        <div
          className="
            mt-5
            rounded-xl
            border
            border-red-100
            bg-red-50
            p-4
          "
        >
          <Typography
            className="
              text-[10px]
              leading-relaxed
              text-red-700
            "
          >
            Proses ini menggunakan
            soft delete sesuai
            backend Foundation.
          </Typography>
        </div>

      </DialogBody>

      <DialogFooter
        className="
          justify-center
          gap-3
          px-8
          pb-8
        "
      >
        <Button
          variant="outlined"
          onClick={
            handleClose
          }
          disabled={
            loading
          }
          className="
            rounded-xl
            normal-case
          "
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
          className="
            flex
            items-center
            gap-2
            rounded-xl
            normal-case
          "
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

export default DeleteFoundationModal;