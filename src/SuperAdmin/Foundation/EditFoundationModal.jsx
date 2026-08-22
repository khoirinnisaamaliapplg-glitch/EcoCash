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
  Select,
  Option,
  Typography,
} from "@material-tailwind/react";

import {
  BuildingLibraryIcon,
  UserCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

import {
  toast,
} from "react-toastify";

import api from "../../utils/api";

// ============================================================
// COMPONENT
// ============================================================

const EditFoundationModal = ({
  open,
  handleOpen,
  foundation,
  refreshData,
}) => {
  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    description: "",
    logoUrl: "",
    adminId: "",
    isActive: true,
  });

  const [
    admins,
    setAdmins,
  ] = useState([]);

  const [
    loadingAdmins,
    setLoadingAdmins,
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
  // EXTRACT USERS
  // ==========================================================

  const extractUsers = (
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
          ?.users
      )
    ) {
      return responseData
        .data.users;
    }

    if (
      Array.isArray(
        responseData?.users
      )
    ) {
      return responseData.users;
    }

    return [];
  };

  // ==========================================================
  // SET CURRENT FOUNDATION
  // ==========================================================

  useEffect(() => {
    if (
      !open ||
      !foundation
    ) {
      return;
    }

    setFormData({
      name:
        foundation.name ||
        "",

      description:
        foundation.description ||
        "",

      logoUrl:
        foundation.logoUrl ||
        "",

      adminId:
        foundation.adminId
          ? String(
              foundation.adminId
            )
          : foundation.admin
              ?.id
            ? String(
                foundation.admin
                  .id
              )
            : "",

      isActive:
        foundation.isActive !==
        false,
    });
  }, [
    open,
    foundation,
  ]);

  // ==========================================================
  // GET FOUNDATION ADMINS
  // ==========================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchAdmins =
      async () => {
        try {
          setLoadingAdmins(
            true
          );

          const response =
            await api.get(
              "/admin/users",
              {
                headers:
                  getHeaders(),
              }
            );

          const users =
            extractUsers(
              response.data
            );

          const foundationAdmins =
            users.filter(
              (user) =>
                String(
                  user.role ||
                    ""
                )
                  .toUpperCase()
                  .trim() ===
                "FOUNDATION_ADMIN"
            );

          setAdmins(
            foundationAdmins
          );
        } catch (error) {
          console.error(
            "GET FOUNDATION ADMINS ERROR:",
            error
          );

          toast.error(
            error.response
              ?.data
              ?.message ||
              "Gagal memuat Foundation Admin."
          );
        } finally {
          setLoadingAdmins(
            false
          );
        }
      };

    fetchAdmins();
  }, [open]);

  // ==========================================================
  // INPUT
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
          "Nama Foundation wajib diisi."
        );

        return;
      }

      if (
        !formData.adminId
      ) {
        toast.warning(
          "Foundation Admin wajib dipilih."
        );

        return;
      }

      const payload = {
        name:
          formData.name.trim(),

        description:
          formData.description.trim(),

        logoUrl:
          formData.logoUrl.trim(),

        adminId:
          Number(
            formData.adminId
          ),

        isActive:
          Boolean(
            formData.isActive
          ),
      };

      console.log(
        "UPDATE FOUNDATION PAYLOAD:",
        payload
      );

      try {
        setLoading(true);

        const response =
          await api.patch(
            `/foundations/${foundation.id}`,
            payload,
            {
              headers: {
                ...getHeaders(),
                "Content-Type":
                  "application/json",
              },
            }
          );

        console.log(
          "UPDATE FOUNDATION RESPONSE:",
          response.data
        );

        toast.success(
          response.data
            ?.message ||
            "Foundation berhasil diperbarui."
        );

        handleOpen();

        if (
          refreshData
        ) {
          await refreshData();
        }
      } catch (error) {
        console.error(
          "UPDATE FOUNDATION ERROR:",
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
            "Gagal memperbarui Foundation."
        );
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
      size="md"
      className="rounded-[28px]"
    >
      <DialogHeader className="px-8 pt-8">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-green-50
            "
          >
            <BuildingLibraryIcon
              className="
                h-6
                w-6
                text-green-600
              "
            />
          </div>

          <div>

            <Typography
              variant="h5"
              className="font-black text-blue-900"
            >
              Edit Foundation
            </Typography>

            <Typography
              className="
                text-[10px]
                font-bold
                uppercase
                text-gray-400
              "
            >
              Foundation ID:{" "}
              {foundation?.id}
            </Typography>

          </div>

        </div>

      </DialogHeader>

      <DialogBody className="space-y-5 px-8 py-5">

        {/* NAME */}

        <Input
          label="Nama Foundation"
          name="name"
          value={
            formData.name
          }
          onChange={
            handleChange
          }
          icon={
            <BuildingLibraryIcon className="h-4 w-4" />
          }
        />

        {/* DESCRIPTION */}

        <Textarea
          label="Description"
          name="description"
          value={
            formData.description
          }
          onChange={
            handleChange
          }
          rows={5}
        />

        {/* LOGO */}

        <Input
          label="Logo URL"
          name="logoUrl"
          type="url"
          value={
            formData.logoUrl
          }
          onChange={
            handleChange
          }
          icon={
            <PhotoIcon className="h-4 w-4" />
          }
        />

        {/* ADMIN */}

        <Select
          label={
            loadingAdmins
              ? "Memuat Foundation Admin..."
              : "Foundation Admin"
          }
          value={
            formData.adminId
          }
          disabled={
            loadingAdmins
          }
          onChange={(
            value
          ) =>
            setFormData(
              (
                previous
              ) => ({
                ...previous,
                adminId:
                  value ||
                  "",
              })
            )
          }
        >
          {admins.map(
            (admin) => (
              <Option
                key={
                  admin.id
                }
                value={
                  String(
                    admin.id
                  )
                }
              >
                {admin.name ||
                  admin.username ||
                  "Foundation Admin"}
                {" - "}
                {admin.email}
                {" (ID: "}
                {admin.id}
                {")"}
              </Option>
            )
          )}
        </Select>

        {/* ACTIVE */}

        <div
          className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-gray-100
            bg-gray-50
            p-4
          "
        >
          <div>

            <Typography
              className="
                text-sm
                font-bold
                text-gray-800
              "
            >
              Foundation Aktif
            </Typography>

            <Typography
              className="
                text-[10px]
                text-gray-400
              "
            >
              Aktifkan atau
              nonaktifkan Foundation
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
            className="
              h-5
              w-5
              cursor-pointer
              accent-green-500
            "
          />

        </div>

        {/* ADMIN INFO */}

        <div
          className="
            rounded-xl
            border
            border-blue-100
            bg-blue-50
            p-4
          "
        >
          <div className="flex items-start gap-3">

            <UserCircleIcon
              className="
                mt-0.5
                h-5
                w-5
                text-blue-600
              "
            />

            <Typography
              className="
                text-[11px]
                leading-relaxed
                text-blue-800
              "
            >
              Mengubah Foundation
              Admin akan mengubah
              user yang bertanggung
              jawab atas Foundation
              ini.
            </Typography>

          </div>
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
            loading ||
            loadingAdmins
          }
          className="
            rounded-xl
            bg-[#66bb6a]
            normal-case
            shadow-none
          "
        >
          {loading
            ? "Menyimpan..."
            : "Simpan Perubahan"}
        </Button>

      </DialogFooter>
    </Dialog>
  );
};

export default EditFoundationModal;