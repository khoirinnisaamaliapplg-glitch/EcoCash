import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Button,
  Card,
  Chip,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Spinner,
  Typography,
} from "@material-tailwind/react";

import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import {
  toast,
} from "react-toastify";

import api from "../../utils/api";
import MainLayout from "../MainLayout";

const initialCreateForm = {
  name: "",
  username: "",
  email: "",
  phoneNumber: "",
  password: "",
  passwordConfirmation: "",
};

const initialEditForm = {
  name: "",
  phoneNumber: "",
};

const getLoggedInUser = () => {
  try {
    const rawUser =
      localStorage.getItem("userData") ||
      localStorage.getItem("user");

    return rawUser
      ? JSON.parse(rawUser)
      : null;
  } catch (error) {
    console.error(
      "Gagal membaca data login:",
      error
    );

    return null;
  }
};


const getAccessToken = () => {
  const rawToken =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token");

  if (!rawToken) {
    return null;
  }

  return rawToken
    .replace(/^Bearer\s+/i, "")
    .replace(/^"|"$/g, "")
    .trim();
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    const normalized = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      "="
    );

    const decoded = decodeURIComponent(
      window
        .atob(padded)
        .split("")
        .map(
          (character) =>
            `%${("00" +
              character.charCodeAt(0).toString(16)).slice(-2)}`
        )
        .join("")
    );

    const parsed = JSON.parse(decoded);

    return parsed?.user || parsed;
  } catch (error) {
    console.warn("Token JWT tidak dapat dibaca:", error);
    return null;
  }
};

const buildAuthConfig = (token, params) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
  ...(params ? { params } : {}),
});

const extractUsers = (response) => {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.data?.data
    )
  ) {
    return response.data.data;
  }

  return [];
};

const getErrorMessage = (
  error,
  fallbackMessage
) => {
  const status = error?.response?.status;
  const serverMessage =
    error?.response?.data?.message;

  if (status === 401) {
    return "Sesi login tidak valid. Silakan login kembali.";
  }

  if (status === 403) {
    return (
      serverMessage ||
      "Akses ditolak. Pastikan akun login memiliki role ORGANIZATION_ADMIN dan token masih aktif."
    );
  }

  return serverMessage || fallbackMessage;
};

const OrganizationUsers = () => {
  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [meta, setMeta] =
    useState({
      total: 0,
      totalPages: 1,
      limit: 10,
    });

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [createForm, setCreateForm] =
    useState(initialCreateForm);

  const [editForm, setEditForm] =
    useState(initialEditForm);

  const loggedInUser = useMemo(
    () => getLoggedInUser(),
    []
  );

  const token = useMemo(
    () => getAccessToken(),
    []
  );

  const tokenUser = useMemo(
    () => decodeJwtPayload(token),
    [token]
  );

  /*
   * Data otorisasi diprioritaskan dari token karena backend
   * membandingkan organizationId payload dengan req.user.organizationId.
   */
  const currentUserId =
    tokenUser?.id ??
    tokenUser?.userId ??
    loggedInUser?.id ??
    loggedInUser?.userId ??
    null;

  const currentUserRole =
    tokenUser?.role ??
    loggedInUser?.role ??
    null;

  const organizationId =
    tokenUser?.organizationId ??
    tokenUser?.organization?.id ??
    loggedInUser?.organizationId ??
    loggedInUser?.organization?.id ??
    null;

  const organizationName =
    loggedInUser?.organization?.name ||
    loggedInUser?.organizationName ||
    tokenUser?.organization?.name ||
    `Organization ${organizationId || ""}`;

  const isOrganizationAdmin =
    currentUserRole === "ORGANIZATION_ADMIN";

  const isSuperAdmin =
    currentUserRole === "SUPER_ADMIN";

  const canEditUser = useCallback(
    (user) =>
      Boolean(
        user &&
          (isSuperAdmin ||
            Number(currentUserId) ===
              Number(user.id))
      ),
    [currentUserId, isSuperAdmin]
  );

  const fetchUsers = useCallback(
    async () => {
      if (!token) {
        setUsers([]);
        setMeta({
          total: 0,
          totalPages: 1,
          limit: 10,
        });
        setLoading(false);

        toast.error(
          "Token login tidak ditemukan. Silakan login kembali."
        );

        return;
      }

      if (!organizationId) {
        setUsers([]);
        setMeta({
          total: 0,
          totalPages: 1,
          limit: 10,
        });
        setLoading(false);

        toast.error(
          "Organization ID tidak ditemukan pada token atau data login."
        );

        return;
      }

      if (!isOrganizationAdmin && !isSuperAdmin) {
        setUsers([]);
        setMeta({
          total: 0,
          totalPages: 1,
          limit: 10,
        });
        setLoading(false);

        toast.error(
          "Halaman ini hanya dapat diakses Organization Admin."
        );

        return;
      }

      try {
        setLoading(true);

        const response = await api.get(
          "/admin/users",
          buildAuthConfig(token, {
            search:
              search.trim() ||
              undefined,
            role: "REGULAR_USER",
            isActive: true,
            page: 1,
            limit: 1000,
          })
        );

        const result =
          extractUsers(response);

        const filteredUsers =
          result.filter((user) => {
            const sameOrganization =
              Number(user.organizationId) ===
              Number(organizationId);

            const isRegularUser =
              user.role ===
              "REGULAR_USER";

            return (
              sameOrganization &&
              isRegularUser
            );
          });

        setUsers(filteredUsers);

        setMeta({
          total: filteredUsers.length,
          totalPages: Math.max(
            Math.ceil(
              filteredUsers.length / 10
            ),
            1
          ),
          limit: 10,
        });
      } catch (error) {
        console.error(
          "GET ORGANIZATION USERS ERROR:",
          error
        );

        setUsers([]);
        setMeta({
          total: 0,
          totalPages: 1,
          limit: 10,
        });

        toast.error(
          getErrorMessage(
            error,
            "Gagal mengambil data user."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [
      organizationId,
      isOrganizationAdmin,
      isSuperAdmin,
      search,
      token,
    ]
  );

  const visibleUsers = useMemo(() => {
    const startIndex =
      (page - 1) * meta.limit;

    return users.slice(
      startIndex,
      startIndex + meta.limit
    );
  }, [meta.limit, page, users]);

  useEffect(() => {
    if (page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta.totalPages, page]);

  useEffect(() => {
    const delay =
      setTimeout(() => {
        fetchUsers();
      }, 350);

    return () =>
      clearTimeout(delay);
  }, [fetchUsers]);

  const handleSearchChange = (
    event
  ) => {
    setSearch(
      event.target.value
    );

    setPage(1);
  };

  const handleCreateChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setCreateForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const handleEditChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setEditForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const openCreateModal = () => {
    setCreateForm(
      initialCreateForm
    );

    setCreateOpen(true);
  };

  const closeCreateModal = () => {
    if (submitting) {
      return;
    }

    setCreateOpen(false);
    setCreateForm(
      initialCreateForm
    );
  };

  const openEditModal = (
    user
  ) => {
    if (!canEditUser(user)) {
      toast.warning(
        "Organization Admin tidak diizinkan mengubah user lain oleh endpoint backend saat ini."
      );
      return;
    }

    setSelectedUser(user);

    setEditForm({
      name:
        user.name || "",

      phoneNumber:
        user.phoneNumber || "",
    });

    setEditOpen(true);
  };

  const closeEditModal = () => {
    if (submitting) {
      return;
    }

    setEditOpen(false);
    setSelectedUser(null);
    setEditForm(
      initialEditForm
    );
  };

  const openDeleteModal = (
    user
  ) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    if (submitting) {
      return;
    }

    setDeleteOpen(false);
    setSelectedUser(null);
  };

  const validateCreateForm =
    () => {
      if (
        !createForm.name.trim()
      ) {
        toast.error(
          "Nama wajib diisi."
        );

        return false;
      }

      if (
        !createForm.username.trim()
      ) {
        toast.error(
          "Username wajib diisi."
        );

        return false;
      }

      if (
        !createForm.email.trim()
      ) {
        toast.error(
          "Email wajib diisi."
        );

        return false;
      }

      if (
        !createForm.password
      ) {
        toast.error(
          "Password wajib diisi."
        );

        return false;
      }

      if (
        createForm.password.length <
        6
      ) {
        toast.error(
          "Password minimal 6 karakter."
        );

        return false;
      }

      if (
        createForm.password !==
        createForm.passwordConfirmation
      ) {
        toast.error(
          "Konfirmasi password tidak sama."
        );

        return false;
      }

      return true;
    };

  const handleCreateUser =
    async () => {
      if (
        !validateCreateForm()
      ) {
        return;
      }

      if (!organizationId) {
        toast.error(
          "Organization ID tidak ditemukan."
        );

        return;
      }

      try {
        setSubmitting(true);

        const payload = {
          name:
            createForm.name.trim(),

          username:
            createForm.username
              .trim()
              .toLowerCase(),

          email:
            createForm.email
              .trim()
              .toLowerCase(),

          phoneNumber:
            createForm.phoneNumber
              .trim() || null,

          password:
            createForm.password,

          /*
           * Role dikunci menjadi
           * REGULAR_USER.
           */
          role:
            "REGULAR_USER",

          /*
           * Organization ID berasal
           * dari Organization Admin
           * yang sedang login.
           */
          organizationId:
            Number(
              organizationId
            ),
        };

        await api.post(
          "/admin/users",
          payload,
          buildAuthConfig(token)
        );

        toast.success(
          "User berhasil dibuat."
        );

        setCreateOpen(false);
        setCreateForm(
          initialCreateForm
        );
        setPage(1);

        await fetchUsers();
      } catch (error) {
        console.error(
          "CREATE USER ERROR:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Gagal membuat user."
          )
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handleUpdateUser =
    async () => {
      if (!selectedUser) {
        return;
      }

      if (!canEditUser(selectedUser)) {
        toast.warning(
          "Endpoint backend hanya mengizinkan user mengubah akun sendiri atau SUPER_ADMIN."
        );
        return;
      }

      if (
        !editForm.name.trim()
      ) {
        toast.error(
          "Nama wajib diisi."
        );

        return;
      }

      try {
        setSubmitting(true);

        /*
         * Backend updateUser saat ini
         * hanya menerima name dan
         * phoneNumber.
         */
        const payload = {
          name:
            editForm.name.trim(),

          phoneNumber:
            editForm.phoneNumber
              .trim() || null,
        };

        await api.put(
          `/admin/users/${selectedUser.id}`,
          payload,
          buildAuthConfig(token)
        );

        toast.success(
          "User berhasil diperbarui."
        );

        setEditOpen(false);
        setSelectedUser(null);
        setEditForm(initialEditForm);

        await fetchUsers();
      } catch (error) {
        console.error(
          "UPDATE USER ERROR:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Gagal memperbarui user."
          )
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handleDeleteUser =
    async () => {
      if (!selectedUser) {
        return;
      }

      try {
        setSubmitting(true);

        await api.delete(
          `/admin/users/${selectedUser.id}`,
          buildAuthConfig(token)
        );

        toast.success(
          "User berhasil dihapus."
        );

        setDeleteOpen(false);
        setSelectedUser(null);

        if (
          visibleUsers.length === 1 &&
          page > 1
        ) {
          setPage(
            (previous) =>
              previous - 1
          );
        }

        await fetchUsers();
      } catch (error) {
        console.error(
          "DELETE USER ERROR:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Gagal menghapus user."
          )
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">
        {/* HEADER */}
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Typography
              variant="h4"
              className="font-black uppercase italic tracking-tight text-blue-900"
            >
              User Management
            </Typography>

            <Typography className="mt-1 text-sm font-medium text-gray-500">
              Kelola Regular User pada{" "}
              <span className="font-bold text-blue-700">
                {organizationName}
              </span>
            </Typography>
          </div>

          <Button
            onClick={
              openCreateModal
            }
            disabled={
              !token ||
              !organizationId ||
              (!isOrganizationAdmin &&
                !isSuperAdmin)
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 normal-case shadow-md"
          >
            <PlusIcon className="h-5 w-5" />

            Tambah User
          </Button>
        </section>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="flex flex-row items-center justify-between rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div>
              <Typography className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Total Regular User
              </Typography>

              <Typography
                variant="h3"
                className="mt-1 font-black text-blue-900"
              >
                {meta.total}
              </Typography>
            </div>

            <div className="rounded-2xl bg-blue-600 p-4">
              <UserGroupIcon className="h-7 w-7 text-white" />
            </div>
          </Card>

          <Card className="flex items-center justify-between rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div>
              <Typography className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Organization ID
              </Typography>

              <Typography
                variant="h4"
                className="mt-1 font-black text-blue-900"
              >
                {organizationId ||
                  "-"}
              </Typography>
            </div>

            <Chip
              value="REGULAR USER"
              className="rounded-full bg-green-50 text-[9px] font-black text-green-700"
            />
          </Card>
        </div>

        {/* TABLE CARD */}
        <Card className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center">
            <div>
              <Typography className="font-black text-blue-gray-900">
                Daftar User Organisasi
              </Typography>

              <Typography className="mt-1 text-xs text-gray-500">
                Hanya user dengan role
                Regular User yang
                ditampilkan.
              </Typography>
            </div>

            <div className="relative w-full md:w-80">
              <Input
                label="Cari user"
                value={search}
                onChange={
                  handleSearchChange
                }
                icon={
                  <MagnifyingGlassIcon className="h-5 w-5" />
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto text-left">
              <thead>
                <tr className="bg-blue-gray-50/50">
                  <TableHeader>
                    User
                  </TableHeader>

                  <TableHeader>
                    Username
                  </TableHeader>

                  <TableHeader>
                    Telepon
                  </TableHeader>

                  <TableHeader>
                    Role
                  </TableHeader>

                  <TableHeader>
                    Organization ID
                  </TableHeader>

                  <TableHeader>
                    Tanggal Dibuat
                  </TableHeader>

                  <TableHeader>
                    Aksi
                  </TableHeader>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-16"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Spinner className="h-9 w-9 text-blue-600" />

                        <Typography className="text-xs font-semibold text-gray-500">
                          Memuat data user...
                        </Typography>
                      </div>
                    </td>
                  </tr>
                ) : visibleUsers.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-16"
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <UserGroupIcon className="mb-3 h-10 w-10 text-gray-300" />

                        <Typography className="font-bold text-gray-600">
                          User belum tersedia
                        </Typography>

                        <Typography className="mt-1 text-xs text-gray-400">
                          Tambahkan Regular User
                          untuk organisasi ini.
                        </Typography>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map(
                    (user) => (
                      <UserTableRow
                        key={user.id}
                        user={user}
                        canEdit={
                          canEditUser(user)
                        }
                        onEdit={() =>
                          openEditModal(
                            user
                          )
                        }
                        onDelete={() =>
                          openDeleteModal(
                            user
                          )
                        }
                      />
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col justify-between gap-3 border-t border-gray-100 p-5 sm:flex-row sm:items-center">
            <Typography className="text-xs font-medium text-gray-500">
              Halaman {page} dari{" "}
              {Math.max(
                meta.totalPages,
                1
              )}
            </Typography>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outlined"
                disabled={
                  page <= 1 ||
                  loading
                }
                onClick={() =>
                  setPage(
                    (previous) =>
                      previous - 1
                  )
                }
                className="normal-case"
              >
                Sebelumnya
              </Button>

              <Button
                size="sm"
                variant="outlined"
                disabled={
                  page >=
                    meta.totalPages ||
                  loading
                }
                onClick={() =>
                  setPage(
                    (previous) =>
                      previous + 1
                  )
                }
                className="normal-case"
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* CREATE MODAL */}
      <Dialog
        open={createOpen}
        handler={
          closeCreateModal
        }
        size="md"
      >
        <DialogHeader className="flex items-center justify-between">
          <div>
            <Typography
              variant="h5"
              className="font-black text-blue-gray-900"
            >
              Tambah Regular User
            </Typography>

            <Typography className="mt-1 text-xs font-normal text-gray-500">
              User otomatis dimasukkan ke{" "}
              {organizationName}.
            </Typography>
          </div>

          <button
            type="button"
            onClick={
              closeCreateModal
            }
            disabled={submitting}
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </DialogHeader>

        <DialogBody
          divider
          className="max-h-[65vh] space-y-4 overflow-y-auto"
        >
          <Input
            label="Nama lengkap"
            name="name"
            value={
              createForm.name
            }
            onChange={
              handleCreateChange
            }
          />

          <Input
            label="Username"
            name="username"
            value={
              createForm.username
            }
            onChange={
              handleCreateChange
            }
          />

          <Input
            type="email"
            label="Email"
            name="email"
            value={
              createForm.email
            }
            onChange={
              handleCreateChange
            }
          />

          <Input
            label="Nomor telepon"
            name="phoneNumber"
            value={
              createForm.phoneNumber
            }
            onChange={
              handleCreateChange
            }
          />

          <Input
            type="password"
            label="Password"
            name="password"
            value={
              createForm.password
            }
            onChange={
              handleCreateChange
            }
          />

          <Input
            type="password"
            label="Konfirmasi password"
            name="passwordConfirmation"
            value={
              createForm.passwordConfirmation
            }
            onChange={
              handleCreateChange
            }
          />

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <Typography className="text-xs font-bold text-blue-800">
              Role: REGULAR_USER
            </Typography>

            <Typography className="mt-1 text-xs text-blue-700">
              Organization ID:{" "}
              {organizationId}
            </Typography>
          </div>
        </DialogBody>

        <DialogFooter className="gap-2">
          <Button
            variant="text"
            color="blue-gray"
            onClick={
              closeCreateModal
            }
            disabled={submitting}
            className="normal-case"
          >
            Batal
          </Button>

          <Button
            onClick={
              handleCreateUser
            }
            disabled={submitting}
            className="bg-blue-600 normal-case"
          >
            {submitting
              ? "Menyimpan..."
              : "Simpan User"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog
        open={editOpen}
        handler={closeEditModal}
        size="sm"
      >
        <DialogHeader>
          Edit User
        </DialogHeader>

        <DialogBody
          divider
          className="space-y-4"
        >
          <Input
            label="Nama lengkap"
            name="name"
            value={editForm.name}
            onChange={
              handleEditChange
            }
          />

          <Input
            label="Nomor telepon"
            name="phoneNumber"
            value={
              editForm.phoneNumber
            }
            onChange={
              handleEditChange
            }
          />

          <div className="rounded-xl bg-gray-50 p-4">
            <Typography className="text-xs font-semibold text-gray-500">
              Username dan email tidak
              dapat diubah melalui endpoint
              update saat ini.
            </Typography>
          </div>
        </DialogBody>

        <DialogFooter className="gap-2">
          <Button
            variant="text"
            color="blue-gray"
            onClick={
              closeEditModal
            }
            disabled={submitting}
            className="normal-case"
          >
            Batal
          </Button>

          <Button
            onClick={
              handleUpdateUser
            }
            disabled={submitting}
            className="bg-blue-600 normal-case"
          >
            {submitting
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* DELETE MODAL */}
      <Dialog
        open={deleteOpen}
        handler={
          closeDeleteModal
        }
        size="xs"
      >
        <DialogHeader>
          Hapus User
        </DialogHeader>

        <DialogBody divider>
          <Typography className="text-sm text-gray-700">
            Yakin ingin menghapus user{" "}
            <span className="font-bold">
              {selectedUser?.name}
            </span>
            ?
          </Typography>

          <Typography className="mt-2 text-xs text-gray-500">
            User akan dinonaktifkan dari
            sistem.
          </Typography>
        </DialogBody>

        <DialogFooter className="gap-2">
          <Button
            variant="text"
            color="blue-gray"
            onClick={
              closeDeleteModal
            }
            disabled={submitting}
            className="normal-case"
          >
            Batal
          </Button>

          <Button
            color="red"
            onClick={
              handleDeleteUser
            }
            disabled={submitting}
            className="normal-case"
          >
            {submitting
              ? "Menghapus..."
              : "Hapus User"}
          </Button>
        </DialogFooter>
      </Dialog>
    </MainLayout>
  );
};

const TableHeader = ({
  children,
}) => (
  <th className="border-b border-blue-gray-100 px-5 py-4">
    <Typography className="text-[10px] font-black uppercase tracking-widest text-blue-gray-500">
      {children}
    </Typography>
  </th>
);

const UserTableRow = ({
  user,
  canEdit,
  onEdit,
  onDelete,
}) => {
  const initial =
    user.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "U";

  const createdAt =
    user.createdAt
      ? new Date(
          user.createdAt
        ).toLocaleDateString(
          "id-ID",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )
      : "-";

  return (
    <tr className="border-b border-gray-50 transition hover:bg-blue-50/30">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-700">
            {initial}
          </div>

          <div>
            <Typography className="text-xs font-black text-blue-gray-900">
              {user.name || "-"}
            </Typography>

            <Typography className="mt-1 text-[10px] text-gray-500">
              {user.email || "-"}
            </Typography>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <Typography className="text-xs font-semibold text-gray-700">
          {user.username || "-"}
        </Typography>
      </td>

      <td className="px-5 py-4">
        <Typography className="text-xs text-gray-600">
          {user.phoneNumber || "-"}
        </Typography>
      </td>

      <td className="px-5 py-4">
        <Chip
          value="REGULAR USER"
          className="w-fit rounded-full bg-blue-50 text-[8px] font-black text-blue-700"
        />
      </td>

      <td className="px-5 py-4">
        <Typography className="text-xs font-bold text-gray-700">
          {user.organizationId ||
            "-"}
        </Typography>
      </td>

      <td className="px-5 py-4">
        <Typography className="text-xs text-gray-600">
          {createdAt}
        </Typography>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={!canEdit}
            className={
              canEdit
                ? "rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                : "cursor-not-allowed rounded-lg bg-gray-100 p-2 text-gray-300"
            }
            title={
              canEdit
                ? "Edit user"
                : "Backend hanya mengizinkan edit akun sendiri atau SUPER_ADMIN"
            }
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
            title="Hapus user"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default OrganizationUsers;