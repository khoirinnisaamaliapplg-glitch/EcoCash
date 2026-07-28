import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
} from "@material-tailwind/react";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import { toast } from "react-toastify";

import api from "../../../utils/api";

const CreateOrganizationModal = ({
  open,
  handleOpen,
  refreshData,
}) => {
  const formik = useFormik({
    initialValues: {
      name: "",
    },

    onSubmit: async (values, { resetForm, setSubmitting }) => {
      const name = values.name.trim();

      if (!name) {
        toast.warning("Nama organization wajib diisi.");
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const response = await api.post(
          "/organizations",
          {
            name,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(
          response.data?.message ||
            "Organization berhasil ditambahkan."
        );

        resetForm();
        handleOpen();

        if (refreshData) {
          await refreshData();
        }
      } catch (error) {
        console.error("CREATE ORGANIZATION ERROR:", error);

        toast.error(
          error.response?.data?.message ||
            "Gagal menambahkan organization."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    if (formik.isSubmitting) return;

    formik.resetForm();
    handleOpen();
  };

  return (
    <Dialog
      open={open}
      handler={handleClose}
      size="sm"
      className="rounded-[28px]"
    >
      <DialogHeader className="px-8 pt-8 font-bold text-blue-900">
        Tambah Organization
      </DialogHeader>

      <form onSubmit={formik.handleSubmit}>
        <DialogBody className="px-8 py-5">
          <Input
            label="Nama Organization"
            icon={<BuildingOffice2Icon className="h-4 w-4" />}
            {...formik.getFieldProps("name")}
            required
          />
        </DialogBody>

        <DialogFooter className="gap-3 px-8 pb-8">
          <Button
            type="button"
            variant="text"
            color="red"
            onClick={handleClose}
            disabled={formik.isSubmitting}
          >
            Batal
          </Button>

          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="bg-[#2b6cb0]"
          >
            {formik.isSubmitting
              ? "Menyimpan..."
              : "Tambah Organization"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default CreateOrganizationModal;