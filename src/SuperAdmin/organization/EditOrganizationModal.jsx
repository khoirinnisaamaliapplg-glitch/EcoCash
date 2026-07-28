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

/**
 * Nilai type mengikuti validator backend:
 *
 * .isIn([
 *   "SCHOOL",
 *   "UNIVERSITY",
 *   "COMPANY",
 *   "GOVERNMENT",
 *   "OTHER",
 * ])
 */
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

const EditOrganizationModal = ({
  open,
  handleOpen,
  organization,
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

  /**
   * Mengambil Organization Admin yang:
   * 1. Role-nya ORGANIZATION_ADMIN.
   * 2. organizationId-nya sama dengan organization
   *    yang sedang diedit.
   * 3. Admin yang sedang terpasang tetap ditampilkan.
   */
  const fetchOrganizationAdmins = async () => {
    if (!organization?.id) {
      setOrganizationAdmins([]);
      return;
    }

    setLoadingAdmins(true);

    try {
      const response = await api.get("/admin/users", {
        headers: getHeaders(),
        params: {
          role: "ORGANIZATION_ADMIN",
          page: 1,
          limit: 100,
          isActive: true,
        },
      });

      const users = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      const currentOrganizationId = Number(
        organization.id
      );

      const currentAdminId =
        organization?.admin?.id ??
        organization?.adminId ??
        null;

      const availableAdmins = users.filter((user) => {
        if (user.role !== "ORGANIZATION_ADMIN") {
          return false;
        }

        const belongsToCurrentOrganization =
          Number(user.organizationId) ===
          currentOrganizationId;

        const isCurrentAdmin =
          currentAdminId &&
          Number(user.id) === Number(currentAdminId);

        return (
          belongsToCurrentOrganization ||
          isCurrentAdmin
        );
      });

      /**
       * Jika admin yang sedang digunakan tidak muncul
       * pada endpoint users, masukkan data admin dari
       * object organization agar tetap tampil.
       */
      if (
        organization?.admin?.id &&
        !availableAdmins.some(
          (admin) =>
            Number(admin.id) ===
            Number(organization.admin.id)
        )
      ) {
        availableAdmins.unshift({
          id: organization.admin.id,
          name:
            organization.admin.name ||
            "Organization Admin",
          email: organization.admin.email || "-",
          role: "ORGANIZATION_ADMIN",
          organizationId: organization.id,
        });
      }

      console.log(
        "CURRENT ORGANIZATION:",
        organization
      );

      console.log(
        "ALL ORGANIZATION ADMINS:",
        users
      );

      console.log(
        "AVAILABLE ORGANIZATION ADMINS:",
        availableAdmins
      );

      setOrganizationAdmins(availableAdmins);
    } catch (error) {
      console.error(
        "GET ORGANIZATION ADMINS ERROR:",
        error
      );

      setOrganizationAdmins([]);

      toast.error(
        error.response?.data?.message ||
          "Gagal mengambil daftar Organization Admin."
      );
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (open && organization?.id) {
      fetchOrganizationAdmins();
    } else {
      setOrganizationAdmins([]);
    }
  }, [
    open,
    organization?.id,
    organization?.admin?.id,
    organization?.adminId,
  ]);

  const formik = useFormik({
    initialValues: {
      code: organization?.code || "",
      name: organization?.name || "",
      type: organization?.type || "",
      address: organization?.address || "",

      adminId:
        organization?.admin?.id?.toString() ||
        organization?.adminId?.toString() ||
        "",
    },

    enableReinitialize: true,

    onSubmit: async (
      values,
      { resetForm, setSubmitting }
    ) => {
      if (!organization?.id) {
        toast.error(
          "Data organization tidak ditemukan."
        );

        setSubmitting(false);
        return;
      }

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

      const isValidType =
        ORGANIZATION_TYPES.some(
          (item) => item.value === type
        );

      if (!isValidType) {
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

      const previousAdminId =
        organization?.admin?.id?.toString() ||
        organization?.adminId?.toString() ||
        "";

      const payload = {
        code,
        name,
        type,
        address,
      };

      /**
       * Jika admin dipilih, kirim adminId sebagai number.
       */
      if (values.adminId) {
        payload.adminId = Number(values.adminId);
      }

      /**
       * Jika sebelumnya ada admin lalu pengguna memilih
       * "Tanpa Organization Admin", kirim null untuk
       * melepaskan admin dari organization.
       */
      if (!values.adminId && previousAdminId) {
        payload.adminId = null;
      }

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
          "UPDATE ORGANIZATION PAYLOAD:",
          payload
        );

        const response = await api.patch(
          `/organizations/${organization.id}`,
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
            "Organization berhasil diperbarui."
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
          "UPDATE ORGANIZATION ERROR:",
          error
        );

        console.error(
          "UPDATE ORGANIZATION STATUS:",
          error.response?.status
        );

        console.error(
          "UPDATE ORGANIZATION RESPONSE:",
          responseData
        );

        console.error(
          "UPDATE VALIDATION DETAIL:",
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

              if (
                item?.path === "type" &&
                item?.msg ===
                  "Invalid organization type"
              ) {
                return "Tipe organization tidak valid.";
              }

              if (item?.msg) {
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
              "Gagal memperbarui organization.";

        const normalizedError =
          errorMessage.toLowerCase();

        if (
          error.response?.status === 409 ||
          normalizedError.includes(
            "organization code already exists"
          )
        ) {
          errorMessage =
            "Kode organization sudah digunakan.";
        }

        if (
          normalizedError.includes(
            "organization admin is already assigned"
          )
        ) {
          errorMessage =
            "Organization Admin tersebut sudah menjadi admin utama organization lain.";
        }

        if (
          normalizedError.includes(
            "organization admin not found"
          )
        ) {
          errorMessage =
            "Organization Admin tidak ditemukan.";
        }

        if (
          normalizedError.includes(
            "user is not an organization admin"
          )
        ) {
          errorMessage =
            "User yang dipilih bukan Organization Admin.";
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
        Edit Organization
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

          {/* Nama Organization */}
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
            icon={
              <MapPinIcon className="h-4 w-4" />
            }
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Masukkan alamat organization"
            required
          />

          {/* Organization Admin */}
          <Select
            label={
              loadingAdmins
                ? "Memuat Organization Admin..."
                : "Pilih Organization Admin"
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

          {loadingAdmins && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <Typography
                variant="small"
                className="text-blue-800"
              >
                Sedang mengambil daftar
                Organization Admin...
              </Typography>
            </div>
          )}

          {!loadingAdmins &&
            organizationAdmins.length === 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <UserCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <Typography
                  variant="small"
                  className="text-amber-800"
                >
                  Belum ada Organization Admin
                  untuk organization ini. Buat
                  user dengan role Organization
                  Admin dan pilih organization ini
                  pada saat registrasi user.
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
            disabled={
              formik.isSubmitting ||
              loadingAdmins
            }
            className="bg-[#2b6cb0]"
          >
            {formik.isSubmitting
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default EditOrganizationModal;