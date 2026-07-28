import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import {
  ExclamationTriangleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

import api from "../../../utils/api";

const DeleteOrganizationModal = ({
  open,
  handleOpen,
  organization,
  refreshData,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!organization?.id) {
      toast.error("Data organization tidak ditemukan.");
      return;
    }

    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(
        `/organizations/${organization.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        response.data?.message ||
          "Organization berhasil dihapus."
      );

      handleOpen();

      if (refreshData) {
        await refreshData();
      }
    } catch (error) {
      console.error("DELETE ORGANIZATION ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Gagal menghapus organization."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;

    handleOpen();
  };

  return (
    <Dialog
      open={open}
      handler={handleClose}
      size="xs"
      className="rounded-[28px]"
    >
      <DialogHeader className="px-8 pt-8 font-bold text-red-700">
        Hapus Organization
      </DialogHeader>

      <DialogBody className="px-8 py-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-red-50 p-4">
            <ExclamationTriangleIcon className="h-9 w-9 text-red-600" />
          </div>

          <Typography className="text-blue-gray-700">
            Apakah Anda yakin ingin menghapus organization berikut?
          </Typography>

          <Typography className="mt-2 font-bold text-blue-gray-900">
            {organization?.name || "-"}
          </Typography>

          <Typography
            variant="small"
            className="mt-3 text-blue-gray-500"
          >
            Organization yang masih digunakan oleh user, area, atau data
            lainnya mungkin tidak dapat dihapus.
          </Typography>
        </div>
      </DialogBody>

      <DialogFooter className="gap-3 px-8 pb-8">
        <Button
          type="button"
          variant="text"
          onClick={handleClose}
          disabled={isDeleting}
        >
          Batal
        </Button>

        <Button
          color="red"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2"
        >
          <TrashIcon className="h-4 w-4" />

          {isDeleting ? "Menghapus..." : "Ya, Hapus"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteOrganizationModal;