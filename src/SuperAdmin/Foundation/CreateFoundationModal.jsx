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
// INITIAL FORM
// ============================================================

const INITIAL_FORM = {
  name: "",
  description: "",
  logoUrl: "",
  adminId: "",
};

// ============================================================
// COMPONENT
// ============================================================

const CreateFoundationModal = ({
  open,
  handleOpen,
  refreshData,
}) => {
  const [
    formData,
    setFormData,
  ] = useState(
    INITIAL_FORM
  );

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
  // GET FOUNDATION ADMIN USERS
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

          console.log(
            "FOUNDATION ADMIN USERS:",
            response.data
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
              "Gagal memuat user Foundation Admin."
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
  // CHANGE INPUT
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
  // RESET
  // ==========================================================

  const resetForm = () => {
    setFormData({
      ...INITIAL_FORM,
    });
  };

  // ==========================================================
  // CLOSE
  // ==========================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    resetForm();
    handleOpen();
  };

  // ==========================================================
  // CREATE FOUNDATION
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

        ...(formData.description.trim() && {
          description:
            formData.description.trim(),
        }),

        ...(formData.logoUrl.trim() && {
          logoUrl:
            formData.logoUrl.trim(),
        }),

        adminId:
          Number(
            formData.adminId
          ),
      };

      console.log(
        "CREATE FOUNDATION PAYLOAD:",
        payload
      );

      try {
        setLoading(true);

        const response =
          await api.post(
            "/foundations",
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
          "CREATE FOUNDATION RESPONSE:",
          response.data
        );

        toast.success(
          response.data
            ?.message ||
            "Foundation berhasil dibuat."
        );

        resetForm();

        handleOpen();

        if (
          refreshData
        ) {
          await refreshData();
        }
      } catch (error) {
        console.error(
          "CREATE FOUNDATION ERROR:",
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
            "Gagal membuat Foundation."
        );
      } finally {
        setLoading(false);
      }
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
              bg-blue-50
            "
          >
            <BuildingLibraryIcon
              className="
                h-6
                w-6
                text-blue-600
              "
            />
          </div>

          <div>

            <Typography
              variant="h5"
              className="font-black text-blue-900"
            >
              Add Foundation
            </Typography>

            <Typography
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-gray-400
              "
            >
              Foundation Management
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
          label="Logo URL (Opsional)"
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
              : "Pilih Foundation Admin"
          }
          value={
            formData.adminId
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
          disabled={
            loadingAdmins
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

        {/* NO ADMIN */}

        {!loadingAdmins &&
          admins.length ===
            0 && (

          <div
            className="
              rounded-xl
              border
              border-amber-100
              bg-amber-50
              p-4
            "
          >
            <Typography
              className="
                text-[11px]
                leading-relaxed
                text-amber-800
              "
            >
              Belum ada user
              FOUNDATION_ADMIN.
              Buat user dengan role
              FOUNDATION_ADMIN
              terlebih dahulu dari
              menu Users.
            </Typography>
          </div>

        )}

        {/* INFO */}

        <div
          className="
            rounded-xl
            border
            border-green-100
            bg-green-50
            p-4
          "
        >
          <div className="flex items-start gap-3">

            <UserCircleIcon
              className="
                mt-0.5
                h-5
                w-5
                shrink-0
                text-green-600
              "
            />

            <Typography
              className="
                text-[11px]
                leading-relaxed
                text-green-800
              "
            >
              Foundation Admin yang
              dipilih akan menjadi
              administrator Foundation
              ini. Contohnya Vina
              memiliki User ID 6,
              maka Foundation akan
              dibuat dengan
              adminId = 6.
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
            loadingAdmins ||
            admins.length ===
              0
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
            : "Add Foundation"}
        </Button>

      </DialogFooter>
    </Dialog>
  );
};

export default CreateFoundationModal;