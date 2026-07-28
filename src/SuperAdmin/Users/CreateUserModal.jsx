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
} from "@material-tailwind/react";
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  PhoneIcon,
  UserCircleIcon,
  IdentificationIcon,
  DocumentTextIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import { toast } from "react-toastify";

import api from "../../utils/api";

const VALID_ROLES = [
  "REGULAR_USER",
  "SUPER_ADMIN",
  "AREA_ADMIN",
  "MACHINE_OPERATOR",
  "ORGANIZATION_ADMIN",
  "STORE_ADMIN",
  "TRUCK_DRIVER",
];

const STAFF_ROLES = [
  "AREA_ADMIN",
  "ORGANIZATION_ADMIN",
  "MACHINE_OPERATOR",
  "TRUCK_DRIVER",
];

const AREA_ROLES = [
  "AREA_ADMIN",
  "MACHINE_OPERATOR",
  "TRUCK_DRIVER",
];

const ORGANIZATION_ROLES = [
  "ORGANIZATION_ADMIN",
  "REGULAR_USER",
];

const CreateUserModal = ({
  open,
  handleOpen,
  refreshData,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReference, setIsLoadingReference] =
    useState(false);

  const [areas, setAreas] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  /**
   * Mengambil area dan organization.
   */
  useEffect(() => {
    if (!open) return;

    const fetchReferenceData = async () => {
      setIsLoadingReference(true);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error(
            "Token login tidak ditemukan. Silakan login kembali."
          );
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [areaResponse, organizationResponse] =
          await Promise.all([
            api.get("/areas", { headers }),
            api.get("/organizations", { headers }),
          ]);

        const areaData = Array.isArray(areaResponse.data)
          ? areaResponse.data
          : areaResponse.data?.data || [];

        const organizationData = Array.isArray(
          organizationResponse.data
        )
          ? organizationResponse.data
          : organizationResponse.data?.data || [];

        setAreas(areaData);
        setOrganizations(organizationData);
      } catch (error) {
        console.error(
          "GET REFERENCE DATA ERROR:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Gagal memuat daftar area dan organization."
        );
      } finally {
        setIsLoadingReference(false);
      }
    };

    fetchReferenceData();
  }, [open]);

  const formik = useFormik({
    initialValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      role: "",
      areaId: "",
      organizationId: "",
      ktpNumber: "",
      ktpImageUrl: "",
      notes: "",
    },

    enableReinitialize: true,

    onSubmit: async (values, { resetForm }) => {
      const name = values.name.trim();
      const username = values.username
        .trim()
        .toLowerCase();
      const email = values.email
        .trim()
        .toLowerCase();
      const password = values.password;
      const role = values.role;

      if (!name) {
        toast.warning("Nama lengkap wajib diisi.");
        return;
      }

      if (!username) {
        toast.warning("Username wajib diisi.");
        return;
      }

      if (!email) {
        toast.warning("Email wajib diisi.");
        return;
      }

      if (!password) {
        toast.warning("Password wajib diisi.");
        return;
      }

      if (!role || !VALID_ROLES.includes(role)) {
        toast.warning("Harap pilih role yang valid.");
        return;
      }

      const requiresArea = AREA_ROLES.includes(role);
      const requiresOrganization =
        ORGANIZATION_ROLES.includes(role);
      const requiresKtp = STAFF_ROLES.includes(role);

      /*
       * AREA_ADMIN, MACHINE_OPERATOR, dan TRUCK_DRIVER
       * wajib memiliki area.
       */
      if (requiresArea && !values.areaId) {
        toast.warning(
          "Lokasi area wajib dipilih untuk role tersebut."
        );
        return;
      }

      /*
       * ORGANIZATION_ADMIN dan REGULAR_USER
       * wajib memiliki organization.
       */
      if (
        requiresOrganization &&
        !values.organizationId
      ) {
        toast.warning(
          "Organization wajib dipilih untuk role tersebut."
        );
        return;
      }

      /*
       * Semua staff wajib memiliki KTP:
       * AREA_ADMIN, ORGANIZATION_ADMIN,
       * MACHINE_OPERATOR, dan TRUCK_DRIVER.
       */
      let normalizedKtp = "";

      if (requiresKtp) {
        normalizedKtp =
          values.ktpNumber.replace(/\D/g, "");

        if (!normalizedKtp) {
          toast.warning(
            "Nomor KTP wajib diisi untuk user staff."
          );
          return;
        }

        if (normalizedKtp.length !== 16) {
          toast.warning(
            "Nomor KTP harus terdiri dari 16 digit."
          );
          return;
        }
      }

      setIsLoading(true);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error(
            "Token login tidak ditemukan. Silakan login kembali."
          );
          return;
        }

        /*
         * Field opsional hanya dikirim jika memiliki nilai.
         * Hal ini menghindari validator menolak nilai null.
         */
        const payload = {
          name,
          username,
          email,
          password,
          role,

          ...(values.phoneNumber.trim() && {
            phoneNumber: values.phoneNumber.trim(),
          }),

          ...(requiresArea && {
            areaId: Number(values.areaId),
          }),

          ...(requiresOrganization && {
            organizationId: Number(
              values.organizationId
            ),
          }),

          ...(requiresKtp && {
            ktpNumber: normalizedKtp,

            ...(values.ktpImageUrl.trim() && {
              ktpImageUrl:
                values.ktpImageUrl.trim(),
            }),

            ...(values.notes.trim() && {
              notes: values.notes.trim(),
            }),
          }),
        };

        console.log(
          "CREATE USER PAYLOAD:",
          payload
        );

        const response = await api.post(
          "/admin/users",
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
            "User berhasil didaftarkan."
        );

        resetForm();
        handleOpen();

        if (refreshData) {
          await refreshData();
        }
      } catch (error) {
        const responseData =
          error.response?.data;

        console.error(
          "CREATE USER ERROR:",
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

              return (
                item?.msg ||
                item?.message ||
                (item?.path
                  ? `${item.path} tidak valid`
                  : null)
              );
            })
            .filter(Boolean);

        const errorMessage =
          validationMessages.length > 0
            ? validationMessages.join(", ")
            : responseData?.message ||
              "Terjadi kesalahan saat membuat user.";

        toast.error(`Gagal: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleRoleChange = (value) => {
    formik.setFieldValue("role", value || "");

    /*
     * Reset seluruh field relasi ketika role berubah.
     */
    formik.setFieldValue("areaId", "");
    formik.setFieldValue("organizationId", "");
    formik.setFieldValue("ktpNumber", "");
    formik.setFieldValue("ktpImageUrl", "");
    formik.setFieldValue("notes", "");
  };

  const handleClose = () => {
    if (isLoading) return;

    formik.resetForm();
    handleOpen();
  };

  const selectedRole = formik.values.role;

  const requiresArea =
    AREA_ROLES.includes(selectedRole);

  const requiresOrganization =
    ORGANIZATION_ROLES.includes(selectedRole);

  const requiresKtp =
    STAFF_ROLES.includes(selectedRole);

  return (
    <Dialog
      open={open}
      handler={handleClose}
      size="md"
      className="rounded-[28px]"
    >
      <DialogHeader className="px-8 pt-8 font-bold text-blue-900">
        Registrasi User Baru
      </DialogHeader>

      <form onSubmit={formik.handleSubmit}>
        <DialogBody className="max-h-[70vh] space-y-4 overflow-y-auto px-8 py-4">
          <Input
            label="Nama Lengkap"
            icon={<UserIcon className="h-4 w-4" />}
            {...formik.getFieldProps("name")}
            required
          />

          <Input
            label="Username"
            icon={
              <UserCircleIcon className="h-4 w-4" />
            }
            {...formik.getFieldProps("username")}
            required
          />

          <Input
            label="Email"
            type="email"
            icon={
              <EnvelopeIcon className="h-4 w-4" />
            }
            {...formik.getFieldProps("email")}
            required
          />

          <Input
            label="Phone"
            type="tel"
            icon={<PhoneIcon className="h-4 w-4" />}
            {...formik.getFieldProps("phoneNumber")}
          />

          <Input
            type="password"
            label="Password"
            icon={<KeyIcon className="h-4 w-4" />}
            {...formik.getFieldProps("password")}
            required
          />

          {/* Layout tetap dua kolom */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Pilih Role"
              value={formik.values.role}
              onChange={handleRoleChange}
            >
              <Option value="SUPER_ADMIN">
                Super Admin
              </Option>

              <Option value="ORGANIZATION_ADMIN">
                Organization Admin
              </Option>

              <Option value="AREA_ADMIN">
                Area Admin
              </Option>

              <Option value="STORE_ADMIN">
                Store Admin
              </Option>

              <Option value="MACHINE_OPERATOR">
                Machine Operator
              </Option>

              <Option value="TRUCK_DRIVER">
                Truck Driver
              </Option>

              <Option value="REGULAR_USER">
                Regular User
              </Option>
            </Select>

            {/* Area untuk AREA_ADMIN, OPERATOR, DRIVER */}
            {requiresArea ? (
              <Select
                label="Lokasi Penempatan Area"
                value={
                  formik.values.areaId
                    ? formik.values.areaId.toString()
                    : ""
                }
                onChange={(value) =>
                  formik.setFieldValue(
                    "areaId",
                    value || ""
                  )
                }
                disabled={isLoadingReference}
              >
                {areas.map((area) => (
                  <Option
                    key={area.id}
                    value={area.id.toString()}
                  >
                    {area.name} (ID: {area.id})
                  </Option>
                ))}
              </Select>
            ) : requiresOrganization ? (
              /*
               * Organization untuk ORGANIZATION_ADMIN
               * dan REGULAR_USER.
               */
              <Select
                label="Pilih Organization"
                value={
                  formik.values.organizationId
                    ? formik.values.organizationId.toString()
                    : ""
                }
                onChange={(value) =>
                  formik.setFieldValue(
                    "organizationId",
                    value || ""
                  )
                }
                disabled={isLoadingReference}
              >
                {organizations.map(
                  (organization) => (
                    <Option
                      key={organization.id}
                      value={organization.id.toString()}
                    >
                      {organization.name}
                      {organization.code
                        ? ` (${organization.code})`
                        : ""}
                    </Option>
                  )
                )}
              </Select>
            ) : (
              /*
               * SUPER_ADMIN dan STORE_ADMIN
               * tidak membutuhkan relasi area/organization
               * berdasarkan backend saat ini.
               */
              <div className="flex h-10 items-center rounded-md border border-blue-gray-200 px-3 text-sm text-blue-gray-500">
                Tidak memerlukan penempatan
              </div>
            )}
          </div>

          {/* KTP untuk seluruh staff role */}
          {requiresKtp && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Nomor KTP"
                  inputMode="numeric"
                  maxLength={16}
                  icon={
                    <IdentificationIcon className="h-4 w-4" />
                  }
                  value={formik.values.ktpNumber}
                  onChange={(event) => {
                    const numericValue =
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16);

                    formik.setFieldValue(
                      "ktpNumber",
                      numericValue
                    );
                  }}
                  required
                />

                <Input
                  label="URL Foto KTP (Opsional)"
                  type="url"
                  icon={
                    <PhotoIcon className="h-4 w-4" />
                  }
                  {...formik.getFieldProps(
                    "ktpImageUrl"
                  )}
                />
              </div>

              <Textarea
                label="Notes (Catatan Tambahan)"
                icon={
                  <DocumentTextIcon className="h-4 w-4" />
                }
                {...formik.getFieldProps("notes")}
              />
            </div>
          )}
        </DialogBody>

        <DialogFooter className="gap-3 px-8 pb-8">
          <Button
            type="button"
            variant="text"
            color="red"
            onClick={handleClose}
            disabled={isLoading}
          >
            Batal
          </Button>

          <Button
            type="submit"
            disabled={
              isLoading || isLoadingReference
            }
            className="bg-[#2b6cb0]"
          >
            {isLoading
              ? "Memproses..."
              : "Daftarkan User"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default CreateUserModal;