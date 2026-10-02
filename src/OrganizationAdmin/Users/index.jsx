import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  PrinterIcon,
  QrCodeIcon,
  TrashIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";

import api from "../../utils/api";
import MainLayout from "../MainLayout";

// ============================================================
// CONFIG
// ============================================================

const PAGE_LIMIT = 10;

// ============================================================
// DEFAULT FORM
// ============================================================

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

// ============================================================
// LOCAL STORAGE
// ============================================================

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

// ============================================================
// JWT
// ============================================================

const decodeJwtPayload = (token) => {
  if (
    !token ||
    typeof token !== "string"
  ) {
    return null;
  }

  try {
    const payloadPart =
      token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    const normalized =
      payloadPart
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const padded =
      normalized.padEnd(
        Math.ceil(
          normalized.length / 4
        ) * 4,
        "="
      );

    const decoded =
      decodeURIComponent(
        window
          .atob(padded)
          .split("")
          .map(
            (character) =>
              `%${(
                "00" +
                character
                  .charCodeAt(0)
                  .toString(16)
              ).slice(-2)}`
          )
          .join("")
      );

    const parsed =
      JSON.parse(decoded);

    return parsed?.user || parsed;
  } catch (error) {
    console.warn(
      "Token JWT tidak dapat dibaca:",
      error
    );

    return null;
  }
};

// ============================================================
// API HELPERS
// ============================================================

const buildAuthConfig = (
  token,
  params
) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },

  ...(params
    ? {
        params,
      }
    : {}),
});

// ============================================================
// EXTRACT USERS
// ============================================================

const extractUsers = (
  response
) => {
  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.data?.data
    )
  ) {
    return response.data.data;
  }

  if (
    Array.isArray(
      response?.data?.data?.items
    )
  ) {
    return response.data.data.items;
  }

  if (
    Array.isArray(
      response?.data?.users
    )
  ) {
    return response.data.users;
  }

  return [];
};

// ============================================================
// EXTRACT PAGINATION
// ============================================================

const extractPagination = (
  response,
  currentPage
) => {
  const body =
    response?.data || {};

  const pagination =
    body.pagination ||
    body.meta ||
    body?.data?.pagination ||
    body?.data?.meta ||
    {};

  const total =
    Number(
      pagination.totalItems ??
        pagination.total ??
        pagination.count ??
        body.totalItems ??
        body.total ??
        0
    ) || 0;

  const limit =
    Number(
      pagination.limit ??
        pagination.pageSize ??
        PAGE_LIMIT
    ) || PAGE_LIMIT;

  const page =
    Number(
      pagination.page ??
        pagination.currentPage ??
        currentPage
    ) || currentPage;

  let totalPages =
    Number(
      pagination.totalPages ??
        pagination.pages ??
        0
    ) || 0;

  if (
    totalPages <= 0 &&
    total > 0
  ) {
    totalPages =
      Math.ceil(
        total / limit
      );
  }

  return {
    total,
    limit,
    page,
    totalPages:
      Math.max(
        totalPages,
        1
      ),
  };
};

// ============================================================
// EXTRACT CREDENTIAL
// ============================================================

const extractCredentials = (
  response
) => {
  if (
    Array.isArray(
      response?.data
    )
  ) {
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

const extractSingleData = (
  response
) => {
  return (
    response?.data?.data ||
    response?.data ||
    null
  );
};

// ============================================================
// CREDENTIAL HELPERS
// ============================================================

const getUserCredentials = (
  user
) => {
  if (!user) {
    return [];
  }

  if (
    Array.isArray(
      user.credentials
    )
  ) {
    return user.credentials;
  }

  if (
    Array.isArray(
      user.userCredentials
    )
  ) {
    return user.userCredentials;
  }

  return [];
};

const findActiveQrCredential = (
  credentials = []
) => {
  return (
    credentials
      .filter(
        (credential) =>
          String(
            credential?.type ||
              ""
          ).toUpperCase() ===
            "QR" &&
          credential?.isActive !==
            false &&
          Boolean(
            credential?.identifier
          )
      )
      .sort(
        (a, b) => {
          const dateA =
            new Date(
              a?.createdAt ||
                0
            ).getTime();

          const dateB =
            new Date(
              b?.createdAt ||
                0
            ).getTime();

          return (
            dateB - dateA
          );
        }
      )[0] || null
  );
};

const getActiveQrCredential = (
  user
) => {
  return findActiveQrCredential(
    getUserCredentials(user)
  );
};

// ============================================================
// HTML ESCAPE
// ============================================================

const escapeHtml = (
  value
) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character]
  );

// ============================================================
// ERROR
// ============================================================

const getErrorMessage = (
  error,
  fallbackMessage
) => {
  const status =
    error?.response?.status;

  const serverMessage =
    error?.response?.data
      ?.message ||
    error?.response?.data
      ?.error;

  if (status === 401) {
    return "Sesi login tidak valid. Silakan login kembali.";
  }

  if (status === 403) {
    return (
      serverMessage ||
      "Akses ditolak. Pastikan akun Organization Admin memiliki permission yang sesuai."
    );
  }

  if (status === 404) {
    return (
      serverMessage ||
      "Endpoint atau data tidak ditemukan."
    );
  }

  return (
    serverMessage ||
    error?.message ||
    fallbackMessage
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const OrganizationUsers = () => {
  // ==========================================================
  // USER
  // ==========================================================

  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState("");

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    meta,
    setMeta,
  ] = useState({
    total: 0,
    totalPages: 1,
    limit: PAGE_LIMIT,
  });

  // ==========================================================
  // MODAL
  // ==========================================================

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    qrOpen,
    setQrOpen,
  ] = useState(false);

  // ==========================================================
  // SELECTED USER
  // ==========================================================

  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);

  // ==========================================================
  // QR
  // ==========================================================

  const [
    qrLoading,
    setQrLoading,
  ] = useState(false);

  const [
    qrUser,
    setQrUser,
  ] = useState(null);

  const [
    qrCredential,
    setQrCredential,
  ] = useState(null);

  const qrPrintRef =
    useRef(null);

  // ==========================================================
  // FORM
  // ==========================================================

  const [
    createForm,
    setCreateForm,
  ] = useState(
    initialCreateForm
  );

  const [
    editForm,
    setEditForm,
  ] = useState(
    initialEditForm
  );

  // ==========================================================
  // LOGIN
  // ==========================================================

  const loggedInUser =
    useMemo(
      () =>
        getLoggedInUser(),
      []
    );

  const token =
    useMemo(
      () =>
        getAccessToken(),
      []
    );

  const tokenUser =
    useMemo(
      () =>
        decodeJwtPayload(
          token
        ),
      [token]
    );

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
    loggedInUser
      ?.organization
      ?.name ||
    loggedInUser
      ?.organizationName ||
    tokenUser
      ?.organization
      ?.name ||
    (
      organizationId
        ? `Organization ${organizationId}`
        : "Organization"
    );

  const isOrganizationAdmin =
    currentUserRole ===
    "ORGANIZATION_ADMIN";

  const isSuperAdmin =
    currentUserRole ===
    "SUPER_ADMIN";

  // ==========================================================
  // EDIT PERMISSION
  // ==========================================================

  const canEditUser =
    useCallback(
      (user) =>
        Boolean(
          user &&
            (
              isSuperAdmin ||
              Number(
                currentUserId
              ) ===
                Number(
                  user.id
                )
            )
        ),
      [
        currentUserId,
        isSuperAdmin,
      ]
    );

  // ==========================================================
  // UPDATE USER CREDENTIAL STATE
  // ==========================================================

  const updateUserCredentials =
    useCallback(
      (
        userId,
        credentials
      ) => {
        setUsers(
          (previous) =>
            previous.map(
              (item) =>
                Number(
                  item.id
                ) ===
                Number(
                  userId
                )
                  ? {
                      ...item,
                      credentials,
                    }
                  : item
            )
        );
      },
      []
    );

  // ==========================================================
  // GET USER CREDENTIAL
  // ==========================================================

  const fetchUserCredentials =
    useCallback(
      async (
        userId
      ) => {
        const response =
          await api.get(
            `/admin/credentials/users/${userId}/credentials`,
            buildAuthConfig(
              token
            )
          );

        return extractCredentials(
          response
        );
      },
      [token]
    );

  // ==========================================================
  // REFRESH QR
  // ==========================================================

  const refreshQrCredential =
    useCallback(
      async (
        userId
      ) => {
        const response =
          await api.post(
            `/admin/credentials/users/${userId}/credentials/qr/refresh`,
            {},
            buildAuthConfig(
              token
            )
          );

        return extractSingleData(
          response
        );
      },
      [token]
    );

  // ==========================================================
  // FETCH USERS
  // ==========================================================

  const fetchUsers =
    useCallback(
      async () => {
        if (!token) {
          setUsers([]);

          setMeta({
            total: 0,
            totalPages: 1,
            limit:
              PAGE_LIMIT,
          });

          setLoading(false);

          toast.error(
            "Token login tidak ditemukan. Silakan login kembali."
          );

          return;
        }

        if (
          !isOrganizationAdmin &&
          !isSuperAdmin
        ) {
          setUsers([]);

          setLoading(false);

          toast.error(
            "Halaman ini hanya dapat diakses Organization Admin."
          );

          return;
        }

        try {
          setLoading(true);

          const response =
            await api.get(
              "/admin/users",
              buildAuthConfig(
                token,
                {
                  search:
                    search.trim() ||
                    undefined,

                  role:
                    "REGULAR_USER",

                  isActive:
                    true,

                  includeCredentials:
                    true,

                  // ==========================================
                  // PAGINATION BACKEND
                  // ==========================================

                  page,

                  limit:
                    PAGE_LIMIT,
                }
              )
            );

          console.log(
            "GET USERS RESPONSE:",
            response?.data
          );

          // ==================================================
          // USER HASIL BACKEND
          // ==================================================

          const result =
            extractUsers(
              response
            );

          // ==================================================
          // FILTER ROLE
          // ==================================================

          const regularUsers =
            result.filter(
              (user) =>
                !user.role ||
                user.role ===
                  "REGULAR_USER"
            );

          // ==================================================
          // FILTER ORGANIZATION
          // ==================================================

          const organizationUsers =
            organizationId
              ? regularUsers.filter(
                  (
                    user
                  ) => {
                    /*
                     * Jika backend tidak mengembalikan
                     * organizationId, jangan hilangkan user.
                     */
                    if (
                      user.organizationId ===
                        undefined ||
                      user.organizationId ===
                        null
                    ) {
                      return true;
                    }

                    return (
                      Number(
                        user.organizationId
                      ) ===
                      Number(
                        organizationId
                      )
                    );
                  }
                )
              : regularUsers;

          setUsers(
            organizationUsers
          );

          // ==================================================
          // PAGINATION BACKEND
          // ==================================================

          const pagination =
            extractPagination(
              response,
              page
            );

          console.log(
            "PAGINATION:",
            pagination
          );

          setMeta({
            total:
              pagination.total,

            totalPages:
              pagination.totalPages,

            limit:
              pagination.limit,
          });
        } catch (
          error
        ) {
          console.error(
            "GET ORGANIZATION USERS ERROR:",
            error
          );

          console.error(
            "GET USERS RESPONSE:",
            error
              ?.response
              ?.data
          );

          setUsers([]);

          setMeta({
            total: 0,
            totalPages: 1,
            limit:
              PAGE_LIMIT,
          });

          toast.error(
            getErrorMessage(
              error,
              "Gagal mengambil data user."
            )
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        token,
        search,
        page,
        organizationId,
        isOrganizationAdmin,
        isSuperAdmin,
      ]
    );

  // ==========================================================
  // FETCH WITH DEBOUNCE
  // ==========================================================

  useEffect(() => {
    const delay =
      setTimeout(() => {
        fetchUsers();
      }, 350);

    return () =>
      clearTimeout(
        delay
      );
  }, [fetchUsers]);

  // ==========================================================
  // USER SUDAH DIPAGINATION BACKEND
  // ==========================================================

  const visibleUsers =
    users;

  // ==========================================================
  // PAGE VALIDATION
  // ==========================================================

  useEffect(() => {
    if (
      page >
      meta.totalPages
    ) {
      setPage(
        Math.max(
          meta.totalPages,
          1
        )
      );
    }
  }, [
    page,
    meta.totalPages,
  ]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearchChange = (
    event
  ) => {
    setSearch(
      event.target.value
    );

    setPage(1);
  };

  // ==========================================================
  // FORM
  // ==========================================================

  const handleCreateChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setCreateForm(
      (
        previous
      ) => ({
        ...previous,

        [name]:
          value,
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
      (
        previous
      ) => ({
        ...previous,

        [name]:
          value,
      })
    );
  };

  // ==========================================================
  // CREATE MODAL
  // ==========================================================

  const openCreateModal =
    () => {
      setCreateForm(
        initialCreateForm
      );

      setCreateOpen(
        true
      );
    };

  const closeCreateModal =
    () => {
      if (
        submitting
      ) {
        return;
      }

      setCreateOpen(
        false
      );

      setCreateForm(
        initialCreateForm
      );
    };

  // ==========================================================
  // EDIT MODAL
  // ==========================================================

  const openEditModal = (
    user
  ) => {
    if (
      !canEditUser(
        user
      )
    ) {
      toast.warning(
        "Backend saat ini hanya mengizinkan edit akun sendiri atau SUPER_ADMIN."
      );

      return;
    }

    setSelectedUser(
      user
    );

    setEditForm({
      name:
        user.name ||
        "",

      phoneNumber:
        user.phoneNumber ||
        "",
    });

    setEditOpen(
      true
    );
  };

  const closeEditModal =
    () => {
      if (
        submitting
      ) {
        return;
      }

      setEditOpen(
        false
      );

      setSelectedUser(
        null
      );

      setEditForm(
        initialEditForm
      );
    };

  // ==========================================================
  // DELETE MODAL
  // ==========================================================

  const openDeleteModal = (
    user
  ) => {
    setSelectedUser(
      user
    );

    setDeleteOpen(
      true
    );
  };

  const closeDeleteModal =
    () => {
      if (
        submitting
      ) {
        return;
      }

      setDeleteOpen(
        false
      );

      setSelectedUser(
        null
      );
    };

  // ==========================================================
  // QR MODAL
  // ==========================================================

  const closeQrModal =
    () => {
      setQrOpen(
        false
      );

      setQrUser(
        null
      );

      setQrCredential(
        null
      );

      setQrLoading(
        false
      );
    };

  // ==========================================================
  // OPEN QR
  // ==========================================================

  const openQrModal =
    async (
      user
    ) => {
      if (
        !user?.id
      ) {
        return;
      }

      setQrUser(
        user
      );

      setQrCredential(
        null
      );

      setQrOpen(
        true
      );

      setQrLoading(
        true
      );

      try {
        let credentials =
          await fetchUserCredentials(
            user.id
          );

        let activeQr =
          findActiveQrCredential(
            credentials
          );

        if (
          activeQr
        ) {
          setQrCredential(
            activeQr
          );

          updateUserCredentials(
            user.id,
            credentials
          );

          return;
        }

        const refreshed =
          await refreshQrCredential(
            user.id
          );

        if (
          refreshed
            ?.identifier
        ) {
          activeQr = {
            ...refreshed,

            type:
              refreshed
                ?.type ||
              "QR",

            isActive:
              refreshed
                ?.isActive !==
              false,
          };

          setQrCredential(
            activeQr
          );

          credentials = [
            activeQr,

            ...credentials.filter(
              (
                credential
              ) =>
                Number(
                  credential
                    ?.id
                ) !==
                Number(
                  activeQr
                    ?.id
                )
            ),
          ];

          updateUserCredentials(
            user.id,
            credentials
          );

          toast.success(
            "QR Credential berhasil diaktifkan."
          );

          return;
        }

        credentials =
          await fetchUserCredentials(
            user.id
          );

        activeQr =
          findActiveQrCredential(
            credentials
          );

        updateUserCredentials(
          user.id,
          credentials
        );

        setQrCredential(
          activeQr
        );

        if (
          activeQr
        ) {
          toast.success(
            "QR Credential berhasil diaktifkan."
          );
        } else {
          toast.warning(
            "QR refresh berhasil dipanggil, tetapi credential QR aktif belum ditemukan."
          );
        }
      } catch (
        error
      ) {
        console.error(
          "OPEN QR ERROR:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Gagal mengambil atau mengaktifkan QR Credential."
          )
        );
      } finally {
        setQrLoading(
          false
        );
      }
    };

  // ==========================================================
  // VALIDATE CREATE
  // ==========================================================

  const validateCreateForm =
    () => {
      if (
        !createForm
          .name
          .trim()
      ) {
        toast.error(
          "Nama wajib diisi."
        );

        return false;
      }

      if (
        !createForm
          .username
          .trim()
      ) {
        toast.error(
          "Username wajib diisi."
        );

        return false;
      }

      if (
        !createForm
          .email
          .trim()
      ) {
        toast.error(
          "Email wajib diisi."
        );

        return false;
      }

      if (
        !createForm
          .password
      ) {
        toast.error(
          "Password wajib diisi."
        );

        return false;
      }

      if (
        createForm
          .password
          .length <
        6
      ) {
        toast.error(
          "Password minimal 6 karakter."
        );

        return false;
      }

      if (
        createForm
          .password !==
        createForm
          .passwordConfirmation
      ) {
        toast.error(
          "Konfirmasi password tidak sama."
        );

        return false;
      }

      return true;
    };

  // ==========================================================
  // CREATE USER
  // ==========================================================

  const handleCreateUser =
    async () => {
      if (
        !validateCreateForm()
      ) {
        return;
      }

      if (
        !organizationId
      ) {
        toast.error(
          "Organization ID tidak ditemukan pada data login."
        );

        return;
      }

      try {
        setSubmitting(
          true
        );

        const payload = {
          name:
            createForm
              .name
              .trim(),

          username:
            createForm
              .username
              .trim()
              .toLowerCase(),

          email:
            createForm
              .email
              .trim()
              .toLowerCase(),

          phoneNumber:
            createForm
              .phoneNumber
              .trim() ||
            null,

          password:
            createForm
              .password,

          role:
            "REGULAR_USER",

          organizationId:
            Number(
              organizationId
            ),
        };

        const userResponse =
          await api.post(
            "/admin/users",
            payload,
            buildAuthConfig(
              token
            )
          );

        const newUser =
          extractSingleData(
            userResponse
          );

        if (
          !newUser?.id
        ) {
          throw new Error(
            "User berhasil dibuat tetapi ID user tidak ditemukan."
          );
        }

        try {
          await refreshQrCredential(
            newUser.id
          );

          toast.success(
            "User berhasil dibuat dan QR Credential sudah aktif."
          );
        } catch (
          qrError
        ) {
          console.error(
            "AUTO QR REFRESH ERROR:",
            qrError
          );

          toast.warning(
            getErrorMessage(
              qrError,
              "User berhasil dibuat, tetapi QR belum berhasil diaktifkan."
            )
          );
        }

        setCreateOpen(
          false
        );

        setCreateForm(
          initialCreateForm
        );

        if (
          page !== 1
        ) {
          setPage(1);
        } else {
          await fetchUsers();
        }
      } catch (
        error
      ) {
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
        setSubmitting(
          false
        );
      }
    };

  // ==========================================================
  // UPDATE USER
  // ==========================================================

  const handleUpdateUser =
    async () => {
      if (
        !selectedUser
      ) {
        return;
      }

      if (
        !canEditUser(
          selectedUser
        )
      ) {
        toast.warning(
          "Backend hanya mengizinkan user mengubah akun sendiri atau SUPER_ADMIN."
        );

        return;
      }

      if (
        !editForm
          .name
          .trim()
      ) {
        toast.error(
          "Nama wajib diisi."
        );

        return;
      }

      try {
        setSubmitting(
          true
        );

        const payload = {
          name:
            editForm
              .name
              .trim(),

          phoneNumber:
            editForm
              .phoneNumber
              .trim() ||
            null,
        };

        await api.put(
          `/admin/users/${selectedUser.id}`,
          payload,
          buildAuthConfig(
            token
          )
        );

        toast.success(
          "User berhasil diperbarui."
        );

        setEditOpen(
          false
        );

        setSelectedUser(
          null
        );

        setEditForm(
          initialEditForm
        );

        await fetchUsers();
      } catch (
        error
      ) {
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
        setSubmitting(
          false
        );
      }
    };

  // ==========================================================
  // DELETE USER
  // ==========================================================

  const handleDeleteUser =
    async () => {
      if (
        !selectedUser
      ) {
        return;
      }

      try {
        setSubmitting(
          true
        );

        await api.delete(
          `/admin/users/${selectedUser.id}`,
          buildAuthConfig(
            token
          )
        );

        toast.success(
          "User berhasil dihapus."
        );

        setDeleteOpen(
          false
        );

        setSelectedUser(
          null
        );

        if (
          users.length ===
            1 &&
          page > 1
        ) {
          setPage(
            (
              previous
            ) =>
              previous -
              1
          );
        } else {
          await fetchUsers();
        }
      } catch (
        error
      ) {
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
        setSubmitting(
          false
        );
      }
    };

  // ==========================================================
  // PRINT QR
  // ==========================================================

  const handlePrintQr =
    () => {
      if (
        !qrCredential
          ?.identifier ||
        !qrUser
      ) {
        toast.warning(
          "QR Credential belum tersedia."
        );

        return;
      }

      const qrSvg =
        qrPrintRef
          .current
          ?.querySelector(
            "svg"
          )
          ?.outerHTML;

      if (
        !qrSvg
      ) {
        toast.error(
          "QR belum siap untuk dicetak."
        );

        return;
      }

      const printWindow =
        window.open(
          "",
          "_blank",
          "width=650,height=820"
        );

      if (
        !printWindow
      ) {
        toast.error(
          "Popup diblokir browser."
        );

        return;
      }

      const safeName =
        escapeHtml(
          qrUser.name ||
            "-"
        );

      const safeUsername =
        escapeHtml(
          qrUser.username ||
            "-"
        );

      const safeEmail =
        escapeHtml(
          qrUser.email ||
            "-"
        );

      const safeOrganization =
        escapeHtml(
          organizationName ||
            "EcoCash"
        );

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />

            <title>
              QR Credential - ${safeName}
            </title>

            <style>
              * {
                box-sizing: border-box;
              }

              body {
                margin: 0;
                font-family: Arial, Helvetica, sans-serif;
                color: #0f172a;
                background: #ffffff;
              }

              .page {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 30px;
              }

              .card {
                width: 380px;
                border: 2px solid #dbeafe;
                border-radius: 26px;
                padding: 30px;
                text-align: center;
              }

              .brand {
                margin: 0;
                color: #1d4ed8;
                font-size: 28px;
                font-weight: 900;
              }

              .organization {
                margin-top: 6px;
                margin-bottom: 24px;
                color: #64748b;
                font-size: 12px;
              }

              .qr {
                display: flex;
                justify-content: center;
              }

              .qr svg {
                width: 240px;
                height: 240px;
              }

              .name {
                margin-top: 18px;
                margin-bottom: 0;
                font-size: 21px;
                font-weight: 900;
              }

              .username {
                margin-top: 7px;
                color: #2563eb;
                font-size: 13px;
                font-weight: 700;
              }

              .email {
                margin-top: 5px;
                color: #64748b;
                font-size: 11px;
                word-break: break-word;
              }

              .status {
                display: inline-block;
                margin-top: 15px;
                padding: 6px 12px;
                border-radius: 999px;
                background: #dcfce7;
                color: #15803d;
                font-size: 9px;
                font-weight: 700;
              }

              .description {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #e2e8f0;
                color: #64748b;
                font-size: 10px;
                line-height: 1.5;
              }

              @media print {
                @page {
                  margin: 10mm;
                }

                .page {
                  min-height: auto;
                  padding: 0;
                }
              }
            </style>
          </head>

          <body>

            <div class="page">

              <div class="card">

                <h1 class="brand">
                  EcoCash
                </h1>

                <div class="organization">
                  ${safeOrganization}
                </div>

                <div class="qr">
                  ${qrSvg}
                </div>

                <h2 class="name">
                  ${safeName}
                </h2>

                <div class="username">
                  @${safeUsername}
                </div>

                <div class="email">
                  ${safeEmail}
                </div>

                <div class="status">
                  ACTIVE QR CREDENTIAL
                </div>

                <div class="description">
                  QR ini merupakan credential identitas pengguna EcoCash.

                  <br />

                  Gunakan QR untuk identifikasi pada Smart Container dan sistem EcoCash.
                </div>

              </div>

            </div>

          </body>
        </html>
      `);

      printWindow.document.close();

      printWindow.focus();

      setTimeout(
        () => {
          printWindow.print();

          printWindow.close();
        },
        300
      );
    };

  // ==========================================================
  // UI
  // ==========================================================

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
              (
                !isOrganizationAdmin &&
                !isSuperAdmin
              )
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

        {/* TABLE */}

        <Card className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-sm">

          <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center">

            <div>

              <Typography className="font-black text-blue-gray-900">
                Daftar User Organisasi
              </Typography>

              <Typography className="mt-1 text-xs text-gray-500">
                Regular User dan QR Credential organisasi.
              </Typography>

            </div>

            {/* SEARCH */}

            <div className="relative w-full md:w-80">

              <Input
                label="Cari user"
                value={
                  search
                }
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

            <table className="w-full min-w-[1100px] table-auto text-left">

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
                    Organization
                  </TableHeader>

                  <TableHeader>
                    Dibuat
                  </TableHeader>

                  <TableHeader>
                    QR
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
                      colSpan={8}
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

                ) : users.length ===
                  0 ? (

                  <tr>

                    <td
                      colSpan={8}
                      className="py-16"
                    >

                      <div className="flex flex-col items-center justify-center text-center">

                        <UserGroupIcon className="mb-3 h-10 w-10 text-gray-300" />

                        <Typography className="font-bold text-gray-600">
                          User belum tersedia
                        </Typography>

                        <Typography className="mt-1 text-xs text-gray-400">
                          Tambahkan Regular User untuk organisasi ini.
                        </Typography>

                      </div>

                    </td>

                  </tr>

                ) : (

                  users.map(
                    (
                      user
                    ) => (

                      <UserTableRow
                        key={
                          user.id
                        }
                        user={
                          user
                        }
                        canEdit={
                          canEditUser(
                            user
                          )
                        }
                        onQr={() =>
                          openQrModal(
                            user
                          )
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

            <div>

              <Typography className="text-xs font-medium text-gray-500">

                Halaman{" "}

                <span className="font-bold text-blue-700">
                  {page}
                </span>

                {" "}dari{" "}

                <span className="font-bold text-blue-700">
                  {Math.max(
                    meta.totalPages,
                    1
                  )}
                </span>

              </Typography>

              <Typography className="mt-1 text-[10px] text-gray-400">

                Total{" "}

                <span className="font-black text-blue-700">
                  {meta.total}
                </span>

                {" "}Regular User

              </Typography>

            </div>

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
                    (
                      previous
                    ) =>
                      Math.max(
                        previous -
                          1,
                        1
                      )
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
                    (
                      previous
                    ) =>
                      Math.min(
                        previous +
                          1,
                        meta.totalPages
                      )
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

      {/* ======================================================
          CREATE USER
      ====================================================== */}

      <Dialog
        open={
          createOpen
        }
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
            disabled={
              submitting
            }
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
              createForm
                .passwordConfirmation
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

              {organizationId ||
                "-"}

            </Typography>

            <Typography className="mt-1 text-xs text-blue-700">
              QR Credential otomatis diaktifkan setelah user dibuat.
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
            disabled={
              submitting
            }
            className="normal-case"
          >
            Batal
          </Button>

          <Button
            onClick={
              handleCreateUser
            }
            disabled={
              submitting
            }
            className="bg-blue-600 normal-case"
          >

            {submitting
              ? "Membuat User..."
              : "Simpan User"}

          </Button>

        </DialogFooter>

      </Dialog>

      {/* ======================================================
          EDIT USER
      ====================================================== */}

      <Dialog
        open={
          editOpen
        }
        handler={
          closeEditModal
        }
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
            value={
              editForm.name
            }
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

        </DialogBody>

        <DialogFooter className="gap-2">

          <Button
            variant="text"
            onClick={
              closeEditModal
            }
            disabled={
              submitting
            }
          >
            Batal
          </Button>

          <Button
            onClick={
              handleUpdateUser
            }
            disabled={
              submitting
            }
            className="bg-blue-600"
          >
            Simpan
          </Button>

        </DialogFooter>

      </Dialog>

      {/* ======================================================
          DELETE USER
      ====================================================== */}

      <Dialog
        open={
          deleteOpen
        }
        handler={
          closeDeleteModal
        }
        size="xs"
      >

        <DialogHeader>
          Hapus User
        </DialogHeader>

        <DialogBody divider>

          Yakin ingin menghapus{" "}

          <strong>
            {selectedUser
              ?.name}
          </strong>

          ?

        </DialogBody>

        <DialogFooter className="gap-2">

          <Button
            variant="text"
            onClick={
              closeDeleteModal
            }
          >
            Batal
          </Button>

          <Button
            color="red"
            onClick={
              handleDeleteUser
            }
          >
            Hapus
          </Button>

        </DialogFooter>

      </Dialog>

      {/* ======================================================
          QR
      ====================================================== */}

      <Dialog
        open={
          qrOpen
        }
        handler={
          closeQrModal
        }
        size="sm"
      >

        <DialogHeader>
          QR Credential
        </DialogHeader>

        <DialogBody
          divider
          className="flex min-h-[400px] flex-col items-center justify-center"
        >

          {qrLoading ? (

            <Spinner className="h-10 w-10 text-blue-600" />

          ) : qrCredential
              ?.identifier ? (

            <div className="w-full text-center">

              <div
                ref={
                  qrPrintRef
                }
                className="mx-auto w-fit rounded-3xl bg-white p-5 shadow"
              >

                <QRCodeSVG
                  value={
                    qrCredential
                      .identifier
                  }
                  size={230}
                  level="H"
                  includeMargin
                />

              </div>

              <Typography className="mt-4 font-black">
                {qrUser?.name}
              </Typography>

              <Typography className="text-xs text-blue-600">
                @{qrUser
                  ?.username}
              </Typography>

            </div>

          ) : (

            <div className="text-center">

              <QrCodeIcon className="mx-auto h-16 w-16 text-gray-300" />

              <Typography className="mt-4 font-bold text-gray-500">
                QR belum tersedia
              </Typography>

            </div>

          )}

        </DialogBody>

        <DialogFooter className="gap-2">

          <Button
            variant="text"
            onClick={
              closeQrModal
            }
          >
            Tutup
          </Button>

          <Button
            onClick={
              handlePrintQr
            }
            disabled={
              !qrCredential
                ?.identifier
            }
            className="flex items-center gap-2 bg-blue-600"
          >

            <PrinterIcon className="h-4 w-4" />

            Print QR

          </Button>

        </DialogFooter>

      </Dialog>

    </MainLayout>
  );
};

// ============================================================
// TABLE HEADER
// ============================================================

const TableHeader = ({
  children,
}) => (
  <th className="border-b border-blue-gray-100 px-5 py-4">

    <Typography className="text-[10px] font-black uppercase tracking-widest text-blue-gray-500">
      {children}
    </Typography>

  </th>
);

// ============================================================
// USER ROW
// ============================================================

const UserTableRow = ({
  user,
  canEdit,
  onEdit,
  onQr,
  onDelete,
}) => {
  const initial =
    user.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() ||
    "U";

  const qrCredential =
    getActiveQrCredential(
      user
    );

  const createdAt =
    user.createdAt
      ? new Date(
          user.createdAt
        ).toLocaleDateString(
          "id-ID",
          {
            day:
              "2-digit",

            month:
              "short",

            year:
              "numeric",
          }
        )
      : "-";

  return (
    <tr className="border-b border-gray-50 transition hover:bg-blue-50/30">

      <td className="px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-700">
            {initial}
          </div>

          <div>

            <Typography className="text-xs font-black">
              {user.name ||
                "-"}
            </Typography>

            <Typography className="text-[10px] text-gray-500">
              {user.email ||
                "-"}
            </Typography>

          </div>

        </div>

      </td>

      <td className="px-5 py-4">
        {user.username ||
          "-"}
      </td>

      <td className="px-5 py-4">
        {user.phoneNumber ||
          "-"}
      </td>

      <td className="px-5 py-4">

        <Chip
          value="REGULAR USER"
          className="w-fit bg-blue-50 text-[8px] text-blue-700"
        />

      </td>

      <td className="px-5 py-4">
        {user.organizationId ||
          "-"}
      </td>

      <td className="px-5 py-4">
        {createdAt}
      </td>

      <td className="px-5 py-4">

        <button
          type="button"
          onClick={
            onQr
          }
          className="rounded-xl bg-blue-50 p-2"
        >

          {qrCredential
            ?.identifier ? (

            <QRCodeSVG
              value={
                qrCredential
                  .identifier
              }
              size={42}
            />

          ) : (

            <QrCodeIcon className="h-7 w-7 text-blue-500" />

          )}

        </button>

      </td>

      <td className="px-5 py-4">

        <div className="flex gap-2">

          <button
            type="button"
            onClick={
              onEdit
            }
            disabled={
              !canEdit
            }
            className={
              canEdit
                ? "rounded-lg bg-blue-50 p-2 text-blue-600"
                : "cursor-not-allowed rounded-lg bg-gray-100 p-2 text-gray-300"
            }
          >

            <PencilSquareIcon className="h-4 w-4" />

          </button>

          <button
            type="button"
            onClick={
              onDelete
            }
            className="rounded-lg bg-red-50 p-2 text-red-600"
          >

            <TrashIcon className="h-4 w-4" />

          </button>

        </div>

      </td>

    </tr>
  );
};

export default OrganizationUsers;