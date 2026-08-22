import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import MainLayout from "../MainLayout";

import {
  Card,
  Typography,
  Button,
  Input,
  Chip,
  Avatar,
  Select,
  Option,
} from "@material-tailwind/react";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  QrCodeIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpDownIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

import api from "../../utils/api";

import {
  toast,
} from "react-toastify";

import {
  useDebounce,
} from "use-debounce";

// ============================================================
// MODALS
// ============================================================

import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";

// ============================================================
// TABLE HEADER
// ============================================================

const TABLE_HEAD = [
  {
    label: "User",
    value: "name",
  },

  {
    label: "Email",
    value: "email",
  },

  {
    label: "QR-Code",
    value: null,
  },

  {
    label: "RFID",
    value: "rfid",
  },

  {
    label: "Role",
    value: "role",
  },

  {
    label: "Location",
    value: "areaId",
  },

  {
    label: "Action",
    value: null,
  },
];

// ============================================================
// COMPONENT
// ============================================================

const UserIndex = () => {
  // ==========================================================
  // USERS
  // ==========================================================

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [search, setSearch] =
    useState("");

  const [
    debouncedSearch,
  ] = useDebounce(
    search,
    500
  );

  // ==========================================================
  // FILTER
  // ==========================================================

  const [
    filterRole,
    setFilterRole,
  ] = useState("");

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [page, setPage] =
    useState(1);

  const [limit] =
    useState(10);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    totalData,
    setTotalData,
  ] = useState(0);

  // ==========================================================
  // SORT
  // ==========================================================

  const [
    sortBy,
    setSortBy,
  ] = useState(
    "createdAt"
  );

  const [
    sortOrder,
    setSortOrder,
  ] = useState(
    "desc"
  );

  // ==========================================================
  // MODALS
  // ==========================================================

  const [
    openCreate,
    setOpenCreate,
  ] = useState(false);

  const [
    openEdit,
    setOpenEdit,
  ] = useState(false);

  const [
    openDelete,
    setOpenDelete,
  ] = useState(false);

  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);

  // ==========================================================
  // FIRST RENDER
  // ==========================================================

  const isFirstRender =
    useRef(true);

  // ==========================================================
  // FETCH USERS
  // ==========================================================

  const fetchUsers =
    useCallback(async () => {
      setLoading(true);

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await api.get(
            "/admin/users",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              params: {
                page,
                limit,

                search:
                  debouncedSearch,

                sortBy,

                sortOrder,

                role:
                  filterRole,
              },
            }
          );

        const result =
          response.data;

        setUsers(
          result.data || []
        );

        setTotalPages(
          result.pagination
            ?.totalPages || 1
        );

        setTotalData(
          result.pagination
            ?.totalItems || 0
        );
      } catch (error) {
        console.error(
          "Gagal mengambil data user:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Gagal memuat data pengguna."
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      limit,
      debouncedSearch,
      sortBy,
      sortOrder,
      filterRole,
    ]);

  // ==========================================================
  // FETCH
  // ==========================================================

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ==========================================================
  // RESET PAGE WHEN FILTER CHANGES
  // ==========================================================

  useEffect(() => {
    if (
      isFirstRender.current
    ) {
      isFirstRender.current =
        false;

      return;
    }

    setPage(1);
  }, [
    debouncedSearch,
    filterRole,
  ]);

  // ==========================================================
  // SORT
  // ==========================================================

  const handleSort = (
    value
  ) => {
    if (!value) {
      return;
    }

    const isAsc =
      sortBy === value &&
      sortOrder === "asc";

    setSortOrder(
      isAsc
        ? "desc"
        : "asc"
    );

    setSortBy(
      value
    );
  };

  // ==========================================================
  // ROLE COLOR
  // ==========================================================

  const getRoleColor = (
    role
  ) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "blue";

      case "AREA_ADMIN":
        return "green";

      case "ORGANIZATION_ADMIN":
        return "cyan";

      case "STORE_ADMIN":
        return "purple";

      case "FOUNDATION_ADMIN":
        return "amber";

      case "MACHINE_OPERATOR":
        return "orange";

      case "TRUCK_DRIVER":
        return "brown";

      case "REGULAR_USER":
        return "teal";

      default:
        return "gray";
    }
  };

  // ==========================================================
  // ROLE LABEL
  // ==========================================================

  const getRoleLabel = (
    role
  ) => {
    if (!role) {
      return "USER";
    }

    return role.replace(
      /_/g,
      " "
    );
  };

  // ==========================================================
  // LOCATION
  // ==========================================================

  const getUserLocation = (
    row
  ) => {
    // AREA
    if (
      row.area?.name
    ) {
      return row.area.name;
    }

    if (row.areaId) {
      return `Area ID: ${row.areaId}`;
    }

    // ORGANIZATION
    if (
      row.organization
        ?.name
    ) {
      return row.organization
        .name;
    }

    if (
      row.organizationId
    ) {
      return `Organization ID: ${row.organizationId}`;
    }

    // FOUNDATION
    if (
      row.role ===
      "FOUNDATION_ADMIN"
    ) {
      return "Foundation";
    }

    // STORE ADMIN
    if (
      row.role ===
      "STORE_ADMIN"
    ) {
      return (
        row.store?.name ||
        "Store"
      );
    }

    // SUPER ADMIN
    if (
      row.role ===
      "SUPER_ADMIN"
    ) {
      return "Pusat";
    }

    return "Pusat";
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <MainLayout>
      <div className="p-4 md:p-0 space-y-6">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col gap-1">

          <Typography
            variant="h4"
            className="text-[#2b6cb0] font-bold"
          >
            Data Users
          </Typography>

          <Typography className="text-gray-500 text-sm">
            Kelola hak akses dan profil pengguna sistem
          </Typography>

        </div>

        {/* ====================================================
            ACTION
        ==================================================== */}

        <div className="flex flex-col lg:flex-row justify-between gap-4">

          <div className="flex flex-col md:flex-row gap-3 w-full">

            {/* =================================================
                ADD USER
            ================================================= */}

            <Button
              onClick={() =>
                setOpenCreate(
                  true
                )
              }
              className="
                flex
                items-center
                justify-center
                gap-2
                bg-[#66bb6a]
                normal-case
                rounded-xl
                shadow-none
                px-6
                shrink-0
              "
            >
              <PlusIcon className="h-5 w-5 stroke-[3]" />

              Add User
            </Button>

            {/* =================================================
                FILTER ROLE
            ================================================= */}

            <div className="w-full md:w-64">

              <Select
                label="Filter berdasarkan Role"
                value={
                  filterRole
                }
                onChange={(
                  val
                ) =>
                  setFilterRole(
                    val || ""
                  )
                }
                className="bg-white"
              >
                <Option value="">
                  Semua Role
                </Option>

                <Option value="SUPER_ADMIN">
                  Super Admin
                </Option>

                <Option value="AREA_ADMIN">
                  Area Admin
                </Option>

                <Option value="ORGANIZATION_ADMIN">
                  Organization Admin
                </Option>

                <Option value="STORE_ADMIN">
                  Store Admin
                </Option>

                {/* ============================================
                    FOUNDATION ADMIN
                ============================================ */}

                <Option value="FOUNDATION_ADMIN">
                  Foundation Admin
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

            </div>

          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="w-full lg:w-80">

            <Input
              label="Cari user atau email..."
              icon={
                <MagnifyingGlassIcon className="h-5 w-5" />
              }
              value={
                search
              }
              onChange={(
                e
              ) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <Card
          className="
            w-full
            overflow-hidden
            border
            border-blue-50
            shadow-sm
            rounded-2xl
          "
        >

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] table-auto text-left">

              {/* ===============================================
                  TABLE HEADER
              =============================================== */}

              <thead>

                <tr className="bg-[#e3f2fd]/50">

                  {TABLE_HEAD.map(
                    (head) => (

                      <th
                        key={
                          head.label
                        }
                        onClick={() =>
                          handleSort(
                            head.value
                          )
                        }
                        className={`
                          p-5
                          border-b
                          border-blue-gray-50
                          transition-colors

                          ${
                            head.value
                              ? "cursor-pointer hover:bg-blue-100/50"
                              : ""
                          }
                        `}
                      >

                        <div className="flex items-center justify-between gap-2">

                          <Typography
                            className="
                              font-bold
                              text-[#2b6cb0]
                              uppercase
                              text-[11px]
                              tracking-wider
                              leading-none
                            "
                          >
                            {head.label}
                          </Typography>

                          {head.value && (

                            <ChevronUpDownIcon
                              className={`
                                h-4
                                w-4

                                ${
                                  sortBy ===
                                  head.value
                                    ? "text-blue-700"
                                    : "text-gray-400"
                                }
                              `}
                            />

                          )}

                        </div>

                      </th>

                    )
                  )}

                </tr>

              </thead>

              {/* ===============================================
                  BODY
              =============================================== */}

              <tbody>

                {!loading &&
                users.length >
                  0 ? (

                  users.map(
                    (row) => (

                      <tr
                        key={
                          row.id
                        }
                        className="
                          hover:bg-blue-50/20
                          transition-colors
                          border-b
                          border-blue-gray-50/50
                        "
                      >

                        {/* =====================================
                            USER
                        ===================================== */}

                        <td className="p-5">

                          <div className="flex items-center gap-3">

                            <Avatar
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                row.name ||
                                  "User"
                              )}&background=random&color=fff`}
                              size="sm"
                              variant="rounded"
                            />

                            <div>

                              <Typography
                                variant="small"
                                className="font-bold text-blue-900"
                              >
                                {
                                  row.name
                                }
                              </Typography>

                              <Typography className="text-[10px] text-gray-400">
                                @
                                {
                                  row.username
                                }
                              </Typography>

                            </div>

                          </div>

                        </td>

                        {/* =====================================
                            EMAIL
                        ===================================== */}

                        <td className="p-5">

                          <Typography className="text-xs font-medium text-blue-600 underline decoration-blue-200">
                            {
                              row.email
                            }
                          </Typography>

                        </td>

                        {/* =====================================
                            QR CODE
                        ===================================== */}

                        <td className="p-5">

                          <div
                            className="
                              p-2
                              bg-gray-50
                              w-fit
                              rounded-lg
                              border
                              border-gray-100
                              cursor-pointer
                              hover:bg-white
                              transition-all
                            "
                          >

                            <QrCodeIcon className="h-6 w-6 text-gray-800" />

                          </div>

                        </td>

                        {/* =====================================
                            RFID
                        ===================================== */}

                        <td className="p-5">

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                              p-2
                              bg-gray-50
                              w-fit
                              rounded-lg
                              border
                              border-gray-100
                            "
                          >

                            <CreditCardIcon className="h-4 w-4 text-gray-500" />

                            <Typography className="text-xs font-mono font-bold text-gray-700">
                              {row.rfid ||
                                "-"}
                            </Typography>

                          </div>

                        </td>

                        {/* =====================================
                            ROLE
                        ===================================== */}

                        <td className="p-5">

                          <Chip
                            variant="ghost"
                            size="sm"
                            value={
                              getRoleLabel(
                                row.role
                              )
                            }
                            color={
                              getRoleColor(
                                row.role
                              )
                            }
                            className="text-[10px] font-bold"
                          />

                        </td>

                        {/* =====================================
                            LOCATION
                        ===================================== */}

                        <td className="p-5">

                          <Typography className="text-xs font-semibold text-gray-700">

                            {getUserLocation(
                              row
                            )}

                          </Typography>

                        </td>

                        {/* =====================================
                            ACTION
                        ===================================== */}

                        <td className="p-5">

                          <div className="flex items-center gap-2">

                            {/* EDIT */}

                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedUser(
                                  row
                                );

                                setOpenEdit(
                                  true
                                );
                              }}
                              className="
                                bg-[#66bb6a]
                                px-4
                                py-2
                                normal-case
                                rounded-lg
                                shadow-none
                              "
                            >
                              Edit
                            </Button>

                            {/* DELETE */}

                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedUser(
                                  row
                                );

                                setOpenDelete(
                                  true
                                );
                              }}
                              className="
                                bg-[#ef5350]
                                px-4
                                py-2
                                normal-case
                                rounded-lg
                                shadow-none
                              "
                            >
                              Hapus
                            </Button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  /* ===========================================
                      EMPTY / LOADING
                  =========================================== */

                  <tr>

                    <td
                      colSpan={
                        7
                      }
                      className="p-10 text-center text-gray-400"
                    >

                      {loading ? (

                        <div className="flex flex-col items-center gap-2">

                          <div
                            className="
                              h-8
                              w-8
                              animate-spin
                              rounded-full
                              border-4
                              border-blue-200
                              border-t-blue-600
                            "
                          />

                          Memuat data...

                        </div>

                      ) : (

                        "Tidak ada data user ditemukan."

                      )}

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* ==================================================
              PAGINATION FOOTER
          ================================================== */}

          <div
            className="
              flex
              items-center
              justify-between
              p-5
              border-t
              border-blue-gray-50
              bg-white
            "
          >

            {/* TOTAL */}

            <Typography
              variant="small"
              className="font-medium text-gray-600"
            >
              Menampilkan{" "}

              <span className="text-blue-700">
                {
                  users.length
                }
              </span>

              {" "}dari{" "}

              <span className="text-blue-700">
                {
                  totalData
                }
              </span>

              {" "}data
            </Typography>

            {/* PAGE */}

            <div className="flex items-center gap-2">

              {/* PREVIOUS */}

              <Button
                variant="outlined"
                size="sm"
                onClick={() =>
                  setPage(
                    (
                      currentPage
                    ) =>
                      Math.max(
                        currentPage -
                          1,
                        1
                      )
                  )
                }
                disabled={
                  page === 1 ||
                  loading
                }
                className="
                  flex
                  items-center
                  gap-1
                  border-blue-gray-100
                "
              >

                <ChevronLeftIcon className="h-3 w-3 stroke-[3]" />

                Prev

              </Button>

              {/* CURRENT PAGE */}

              <div className="flex items-center gap-1 px-2">

                <Typography
                  variant="small"
                  className="font-bold text-blue-700"
                >
                  {page}
                </Typography>

                <Typography
                  variant="small"
                  className="font-normal text-gray-500"
                >
                  /{" "}
                  {
                    totalPages
                  }
                </Typography>

              </div>

              {/* NEXT */}

              <Button
                variant="outlined"
                size="sm"
                onClick={() =>
                  setPage(
                    (
                      currentPage
                    ) =>
                      Math.min(
                        currentPage +
                          1,
                        totalPages
                      )
                  )
                }
                disabled={
                  page ===
                    totalPages ||
                  loading
                }
                className="
                  flex
                  items-center
                  gap-1
                  border-blue-gray-100
                "
              >
                Next

                <ChevronRightIcon className="h-3 w-3 stroke-[3]" />

              </Button>

            </div>

          </div>

        </Card>

      </div>

      {/* ======================================================
          CREATE MODAL
      ====================================================== */}

      <CreateUserModal
        open={
          openCreate
        }
        handleOpen={() =>
          setOpenCreate(
            false
          )
        }
        refreshData={
          fetchUsers
        }
      />

      {/* ======================================================
          EDIT + DELETE
      ====================================================== */}

      {selectedUser && (
        <>
          <EditUserModal
            open={
              openEdit
            }
            handleOpen={() =>
              setOpenEdit(
                false
              )
            }
            data={
              selectedUser
            }
            refreshData={
              fetchUsers
            }
          />

          <DeleteUserModal
            open={
              openDelete
            }
            handleOpen={() =>
              setOpenDelete(
                false
              )
            }
            data={
              selectedUser
            }
            refreshData={
              fetchUsers
            }
          />
        </>
      )}

    </MainLayout>
  );
};

export default UserIndex;