import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Select,
  Option,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import {
  BuildingOffice2Icon,
  IdentificationIcon,
  MapPinIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import { toast } from "react-toastify";

import api from "../../utils/api";

const ORGANIZATION_TYPES = [
  {
    value: "SCHOOL",
    label: "Sekolah",
  },
  {
    value: "UNIVERSITY",
    label: "Perguruan Tinggi",
  },
  {
    value: "COMPANY",
    label: "Perusahaan",
  },
  {
    value: "GOVERNMENT",
    label: "Instansi Pemerintah",
  },
  {
    value: "OTHER",
    label: "Lainnya",
  },
];

const CreateOrganizationModal = ({
  open,
  handleOpen,
  refreshData,
}) => {
  const [organizationAdmins, setOrganizationAdmins] =
    useState([]);

  const [loadingAdmins, setLoadingAdmins] =
    useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchOrganizationAdmins = async () => {
    setLoadingAdmins(true);

    try {
      const response = await api.get("/admin/users", {
        headers: getHeaders(),
        params: {
          role: "ORGANIZATION_ADMIN",
          page: 1,
          limit: 100,
        },
      });

      const users = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      const availableAdmins = users.filter((user) => {
        if (user.role !== "ORGANIZATION_ADMIN") {
          return false;
        }

        /*
         * Jika backend mengirim managedOrganization,
         * hanya admin yang belum mempunyai organisasi
         * yang akan ditampilkan.
         */
        if (user.managedOrganization !== undefined) {
          return !user.managedOrganization;
        }

        return true;
      });

      setOrganizationAdmins(availableAdmins);
    } catch (error) {
      console.error(
        "GET ORGANIZATION ADMINS ERROR:",
        error
      );

      setOrganizationAdmins([]);

      toast.warning(
        error.response?.data?.message ||
          "Daftar Organization Admin tidak dapat dimuat. Organization tetap dapat dibuat tanpa admin."
      );
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchOrganizationAdmins();
    }
  }, [open]);

  const formik = useFormik({
    initialValues: {
      code: "",
      name: "",
      type: "",
      address: "",
      adminId: "",
    },

    onSubmit: async (
      values,
      { resetForm, setSubmitting }
    ) => {
      const code = values.code
        .trim()
        .toUpperCase();

      const name = values.name.trim();
      const type = values.type;
      const address = values.address.trim();

      if (!code) {
        toast.warning(
          "Kode organization wajib diisi."
        );

        setSubmitting(false);
        return;
      }

      if (!name) {
        toast.warning(
          "Nama organization wajib diisi."
        );

        setSubmitting(false);
        return;
      }

      if (!type) {
        toast.warning(
          "Tipe organization wajib dipilih."
        );

        setSubmitting(false);
        return;
      }

      if (
        !ORGANIZATION_TYPES.some(
          (item) => item.value === type
        )
      ) {
        toast.error(
          "Tipe organization tidak valid."
        );

        setSubmitting(false);
        return;
      }

      if (!address) {
        toast.warning(
          "Alamat organization wajib diisi."
        );

        setSubmitting(false);
        return;
      }

      /*
       * adminId hanya dikirim apabila admin dipilih.
       * Jangan kirim adminId: null karena validator
       * backend dapat menolaknya.
       */
      const payload = {
        code,
        name,
        type,
        address,

        ...(values.adminId && {
          adminId: Number(values.adminId),
        }),
      };

      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          toast.error(
            "Token login tidak ditemukan. Silakan login kembali."
          );

          setSubmitting(false);
          return;
        }

        console.log(
          "CREATE ORGANIZATION PAYLOAD:",
          payload
        );

        const response = await api.post(
          "/organizations",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        toast.success(
          response.data?.message ||
            "Organization berhasil ditambahkan."
        );

        resetForm();
        setOrganizationAdmins([]);
        handleOpen();

        if (refreshData) {
          await refreshData();
        }
      } catch (error) {
        const responseData =
          error.response?.data;

        console.error(
          "CREATE ORGANIZATION ERROR:",
          error
        );

        console.error(
          "STATUS:",
          error.response?.status
        );

        console.error(
          "RESPONSE DATA:",
          responseData
        );

        console.error(
          "VALIDATION ERROR DETAIL:",
          JSON.stringify(
            responseData?.error,
            null,
            2
          )
        );

        const validationErrors =
          Array.isArray(responseData?.error)
            ? responseData.error
            : [];

        const validationMessages =
          validationErrors
            .map((item) => {
              if (typeof item === "string") {
                return item;
              }

              if (item?.msg) {
                if (
                  item.path === "type" &&
                  item.msg ===
                    "Invalid organization type"
                ) {
                  return "Tipe organization tidak valid.";
                }

                return item.msg;
              }

              if (item?.message) {
                return item.message;
              }

              if (Array.isArray(item?.path)) {
                return `${item.path.join(
                  "."
                )} tidak valid`;
              }

              if (
                typeof item?.path === "string"
              ) {
                return `${item.path} tidak valid`;
              }

              return null;
            })
            .filter(Boolean);

        let errorMessage =
          validationMessages.length > 0
            ? validationMessages.join(", ")
            : responseData?.message ||
              "Gagal menambahkan organization.";

        if (
          error.response?.status === 409 ||
          errorMessage
            .toLowerCase()
            .includes("code already exists")
        ) {
          errorMessage =
            "Kode organization sudah digunakan.";
        }

        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    if (formik.isSubmitting) {
      return;
    }

    formik.resetForm();
    setOrganizationAdmins([]);
    handleOpen();
  };

  return (
    <Dialog
      open={open}
      handler={handleClose}
      size="md"
      className="rounded-[28px]"
    >
      <DialogHeader className="px-8 pt-8 font-bold text-blue-900">
        Tambah Organization
      </DialogHeader>

      <form onSubmit={formik.handleSubmit}>
        <DialogBody className="max-h-[70vh] space-y-4 overflow-y-auto px-8 py-5">
          {/* Kode dan Tipe */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Kode Organization"
              name="code"
              icon={
                <IdentificationIcon className="h-4 w-4" />
              }
              value={formik.values.code}
              onChange={(event) => {
                const value =
                  event.target.value
                    .toUpperCase()
                    .replace(/\s+/g, "-")
                    .replace(
                      /[^A-Z0-9-_]/g,
                      ""
                    );

                formik.setFieldValue(
                  "code",
                  value
                );
              }}
              onBlur={formik.handleBlur}
              placeholder="Contoh: ORG-001"
              required
            />

            <Select
              label="Tipe Organization"
              value={formik.values.type}
              onChange={(value) =>
                formik.setFieldValue(
                  "type",
                  value || ""
                )
              }
            >
              {ORGANIZATION_TYPES.map(
                (item) => (
                  <Option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </Option>
                )
              )}
            </Select>
          </div>

          {/* Nama */}
          <Input
            label="Nama Organization"
            name="name"
            icon={
              <BuildingOffice2Icon className="h-4 w-4" />
            }
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Masukkan nama organization"
            required
          />

          {/* Alamat */}
          <Textarea
            label="Alamat Organization"
            name="address"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Masukkan alamat lengkap organization"
            icon={
              <MapPinIcon className="h-4 w-4" />
            }
            required
          />

          {/* Organization Admin */}
          <Select
            label={
              loadingAdmins
                ? "Memuat Organization Admin..."
                : "Pilih Organization Admin (Opsional)"
            }
            value={
              formik.values.adminId
                ? formik.values.adminId.toString()
                : "NO_ADMIN"
            }
            onChange={(value) => {
              formik.setFieldValue(
                "adminId",
                value === "NO_ADMIN" ||
                  !value
                  ? ""
                  : value
              );
            }}
            disabled={loadingAdmins}
          >
            <Option value="NO_ADMIN">
              Tanpa Organization Admin
            </Option>

            {organizationAdmins.map(
              (admin) => (
                <Option
                  key={admin.id}
                  value={admin.id.toString()}
                >
                  {admin.name} — {admin.email}
                </Option>
              )
            )}
          </Select>

          {!loadingAdmins &&
            organizationAdmins.length ===
              0 && (
              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <UserCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                <Typography
                  variant="small"
                  className="text-blue-800"
                >
                  Belum ada Organization Admin
                  yang tersedia. Organization
                  tetap dapat dibuat tanpa admin
                  dan admin dapat ditentukan
                  kemudian melalui menu edit.
                </Typography>
              </div>
            )}
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