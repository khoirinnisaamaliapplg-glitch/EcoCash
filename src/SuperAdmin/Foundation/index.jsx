import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import MainLayout from "../MainLayout";

import {
  Card,
  Typography,
  Button,
  Input,
  Chip,
} from "@material-tailwind/react";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpDownIcon,
  BuildingLibraryIcon,
  UserCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";

import api from "../../utils/api";

import CreateFoundationModal from "./CreateFoundationModal";
import EditFoundationModal from "./EditFoundationModal";
import DeleteFoundationModal from "./DeleteFoundationModal";

// ============================================================
// TABLE
// ============================================================

const TABLE_HEAD = [
  {
    label: "Foundation",
    value: "name",
  },
  {
    label: "Description",
    value: "description",
  },
  {
    label: "Foundation Admin",
    value: null,
  },
  {
    label: "Status",
    value: "isActive",
  },
  {
    label: "Action",
    value: null,
  },
];

// ============================================================
// COMPONENT
// ============================================================

const FoundationIndex = () => {
  // ==========================================================
  // DATA
  // ==========================================================

  const [
    foundations,
    setFoundations,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    debouncedSearch,
  ] = useDebounce(
    search,
    500
  );

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [
    page,
    setPage,
  ] = useState(1);

  const [limit] =
    useState(10);

  // ==========================================================
  // SORT
  // ==========================================================

  const [
    sortBy,
    setSortBy,
  ] = useState("name");

  const [
    sortOrder,
    setSortOrder,
  ] = useState("asc");

  // ==========================================================
  // MODAL
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
    selectedFoundation,
    setSelectedFoundation,
  ] = useState(null);

  // ==========================================================
  // HEADERS
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
  // GET FOUNDATIONS
  // ==========================================================

  const fetchFoundations =
    useCallback(
      async () => {
        setLoading(true);

        try {
          const response =
            await api.get(
              "/foundations",
              {
                headers:
                  getHeaders(),
              }
            );

          console.log(
            "FOUNDATION RESPONSE:",
            response.data
          );

          const result =
            Array.isArray(
              response.data
            )
              ? response.data
              : response.data
                  ?.data || [];

          setFoundations(
            result
          );
        } catch (error) {
          console.error(
            "GET FOUNDATIONS ERROR:",
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
              ?.data?.message ||
              "Gagal memuat data Foundation."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  // ==========================================================
  // INIT
  // ==========================================================

  useEffect(() => {
    fetchFoundations();
  }, [fetchFoundations]);

  // ==========================================================
  // RESET PAGE ON SEARCH
  // ==========================================================

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // ==========================================================
  // FILTER + SORT
  // ==========================================================

  const filteredFoundations =
    useMemo(() => {
      const keyword =
        debouncedSearch
          .toLowerCase()
          .trim();

      const filtered =
        foundations.filter(
          (foundation) => {
            if (!keyword) {
              return true;
            }

            const searchableText =
              [
                foundation.name,
                foundation.description,
                foundation.admin
                  ?.name,
                foundation.admin
                  ?.email,
              ]
                .filter(
                  Boolean
                )
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
              keyword
            );
          }
        );

      return [
        ...filtered,
      ].sort(
        (
          first,
          second
        ) => {
          const firstValue =
            String(
              first?.[
                sortBy
              ] ?? ""
            ).toLowerCase();

          const secondValue =
            String(
              second?.[
                sortBy
              ] ?? ""
            ).toLowerCase();

          if (
            firstValue <
            secondValue
          ) {
            return sortOrder ===
              "asc"
              ? -1
              : 1;
          }

          if (
            firstValue >
            secondValue
          ) {
            return sortOrder ===
              "asc"
              ? 1
              : -1;
          }

          return 0;
        }
      );
    }, [
      foundations,
      debouncedSearch,
      sortBy,
      sortOrder,
    ]);

  // ==========================================================
  // PAGINATION CALC
  // ==========================================================

  const totalData =
    filteredFoundations.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalData /
          limit
      )
    );

  useEffect(() => {
    if (
      page >
      totalPages
    ) {
      setPage(
        totalPages
      );
    }
  }, [
    page,
    totalPages,
  ]);

  const paginatedFoundations =
    useMemo(() => {
      const startIndex =
        (page - 1) *
        limit;

      return filteredFoundations.slice(
        startIndex,
        startIndex +
          limit
      );
    }, [
      filteredFoundations,
      page,
      limit,
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

    if (
      sortBy === value
    ) {
      setSortOrder(
        (previous) =>
          previous ===
          "asc"
            ? "desc"
            : "asc"
      );

      return;
    }

    setSortBy(value);

    setSortOrder(
      "asc"
    );
  };

  // ==========================================================
  // EDIT
  // ==========================================================

  const handleEdit = (
    foundation
  ) => {
    setSelectedFoundation(
      foundation
    );

    setOpenEdit(
      true
    );
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = (
    foundation
  ) => {
    setSelectedFoundation(
      foundation
    );

    setOpenDelete(
      true
    );
  };

  // ==========================================================
  // CLOSE EDIT
  // ==========================================================

  const closeEditModal =
    () => {
      setOpenEdit(
        false
      );

      setSelectedFoundation(
        null
      );
    };

  // ==========================================================
  // CLOSE DELETE
  // ==========================================================

  const closeDeleteModal =
    () => {
      setOpenDelete(
        false
      );

      setSelectedFoundation(
        null
      );
    };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-0">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-1">

          <Typography
            variant="h4"
            className="font-bold text-[#2b6cb0]"
          >
            Data Foundation
          </Typography>

          <Typography className="text-sm text-gray-500">
            Kelola Foundation
            dan tentukan
            Foundation Admin
            yang bertanggung
            jawab
          </Typography>

        </div>

        {/* ==================================================
            ACTION
        ================================================== */}

        <div className="flex flex-col justify-between gap-4 lg:flex-row">

          <div className="flex w-full flex-col gap-3 md:flex-row">

            <Button
              onClick={() =>
                setOpenCreate(
                  true
                )
              }
              className="
                flex
                shrink-0
                items-center
                justify-center
                gap-2

                rounded-xl

                bg-[#66bb6a]

                px-6

                normal-case
                shadow-none
              "
            >
              <PlusIcon className="h-5 w-5 stroke-[3]" />

              Add Foundation
            </Button>

          </div>

          {/* SEARCH */}

          <div className="w-full lg:w-80">

            <Input
              label="Cari foundation..."
              icon={
                <MagnifyingGlassIcon className="h-5 w-5" />
              }
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
            />

          </div>

        </div>

        {/* ==================================================
            TABLE
        ================================================== */}

        <Card
          className="
            w-full
            overflow-hidden

            rounded-2xl

            border
            border-blue-50

            shadow-sm
          "
        >

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] table-auto text-left">

              {/* TABLE HEAD */}

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
                          border-b
                          border-blue-gray-50

                          p-5

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
                              text-[11px]
                              font-bold
                              uppercase
                              leading-none
                              tracking-wider
                              text-[#2b6cb0]
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

              {/* BODY */}

              <tbody>

                {!loading &&
                paginatedFoundations.length >
                  0 ? (

                  paginatedFoundations.map(
                    (
                      foundation
                    ) => (

                      <tr
                        key={
                          foundation.id
                        }
                        className="
                          border-b
                          border-blue-gray-50/50

                          transition-colors

                          hover:bg-blue-50/20
                        "
                      >

                        {/* FOUNDATION */}

                        <td className="p-5">

                          <div className="flex items-center gap-3">

                            <div
                              className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center

                                overflow-hidden

                                rounded-xl

                                border
                                border-blue-100

                                bg-blue-50
                              "
                            >

                              {foundation.logoUrl ? (

                                <img
                                  src={
                                    foundation.logoUrl
                                  }
                                  alt={
                                    foundation.name
                                  }
                                  className="h-full w-full object-cover"
                                />

                              ) : (

                                <BuildingLibraryIcon className="h-6 w-6 text-[#2b6cb0]" />

                              )}

                            </div>

                            <div>

                              <Typography
                                variant="small"
                                className="font-bold text-blue-900"
                              >
                                {foundation.name ||
                                  "-"}
                              </Typography>

                              <Typography className="text-[10px] text-gray-400">
                                ID Foundation:{" "}
                                {
                                  foundation.id
                                }
                              </Typography>

                            </div>

                          </div>

                        </td>

                        {/* DESCRIPTION */}

                        <td className="p-5">

                          <Typography
                            className="
                              max-w-[320px]

                              text-xs
                              font-medium
                              leading-relaxed
                              text-gray-700
                            "
                          >
                            {foundation.description ||
                              "-"}
                          </Typography>

                        </td>

                        {/* ADMIN */}

                        <td className="p-5">

                          {foundation.admin ? (

                            <div className="flex items-center gap-3">

                              <div
                                className="
                                  flex
                                  h-9
                                  w-9
                                  items-center
                                  justify-center

                                  rounded-lg

                                  bg-green-50
                                "
                              >
                                <UserCircleIcon className="h-5 w-5 text-green-600" />
                              </div>

                              <div>

                                <Typography className="text-xs font-bold text-gray-800">
                                  {foundation
                                    .admin
                                    .name ||
                                    "-"}
                                </Typography>

                                <Typography className="text-[10px] text-gray-400">
                                  {foundation
                                    .admin
                                    .email ||
                                    "-"}
                                </Typography>

                              </div>

                            </div>

                          ) : (

                            <div>

                              <Chip
                                variant="ghost"
                                size="sm"
                                color="gray"
                                value="Belum ada admin"
                                className="w-fit text-[10px]"
                              />

                              {foundation.adminId && (

                                <Typography className="mt-1 text-[9px] text-gray-400">
                                  Admin ID:{" "}
                                  {
                                    foundation.adminId
                                  }
                                </Typography>

                              )}

                            </div>

                          )}

                        </td>

                        {/* STATUS */}

                        <td className="p-5">

                          <Chip
                            variant="ghost"
                            size="sm"
                            value={
                              foundation.isActive !==
                              false
                                ? "ACTIVE"
                                : "INACTIVE"
                            }
                            color={
                              foundation.isActive !==
                              false
                                ? "green"
                                : "red"
                            }
                            className="w-fit text-[10px] font-bold"
                          />

                        </td>

                        {/* ACTION */}

                        <td className="p-5">

                          <div className="flex items-center gap-2">

                            <Button
                              size="sm"
                              onClick={() =>
                                handleEdit(
                                  foundation
                                )
                              }
                              className="
                                rounded-lg

                                bg-[#66bb6a]

                                px-4
                                py-2

                                normal-case
                                shadow-none
                              "
                            >
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              onClick={() =>
                                handleDelete(
                                  foundation
                                )
                              }
                              className="
                                rounded-lg

                                bg-[#ef5350]

                                px-4
                                py-2

                                normal-case
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

                  <tr>

                    <td
                      colSpan={5}
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

                        <div className="flex flex-col items-center gap-2">

                          <BuildingLibraryIcon className="h-10 w-10 text-gray-300" />

                          {search
                            ? "Foundation tidak ditemukan."
                            : "Belum ada data Foundation."}

                        </div>

                      )}

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* ==================================================
              PAGINATION
          ================================================== */}

          <div
            className="
              flex
              flex-col
              gap-4

              border-t
              border-blue-gray-50

              bg-white

              p-5

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <Typography
              variant="small"
              className="font-medium text-gray-600"
            >
              Menampilkan{" "}

              <span className="text-blue-700">
                {
                  paginatedFoundations.length
                }
              </span>

              {" "}dari{" "}

              <span className="text-blue-700">
                {totalData}
              </span>

              {" "}data
            </Typography>

            <div className="flex items-center gap-2">

              <Button
                variant="outlined"
                size="sm"
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
                disabled={
                  page === 1 ||
                  loading
                }
                className="flex items-center gap-1 border-blue-gray-100"
              >
                <ChevronLeftIcon className="h-3 w-3 stroke-[3]" />

                Prev
              </Button>

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
                  / {totalPages}
                </Typography>

              </div>

              <Button
                variant="outlined"
                size="sm"
                onClick={() =>
                  setPage(
                    (
                      previous
                    ) =>
                      Math.min(
                        previous +
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
                className="flex items-center gap-1 border-blue-gray-100"
              >
                Next

                <ChevronRightIcon className="h-3 w-3 stroke-[3]" />

              </Button>

            </div>

          </div>

        </Card>

      </div>

      {/* ======================================================
          CREATE
      ====================================================== */}

      <CreateFoundationModal
        open={
          openCreate
        }
        handleOpen={() =>
          setOpenCreate(
            false
          )
        }
        refreshData={
          fetchFoundations
        }
      />

      {/* ======================================================
          EDIT + DELETE
      ====================================================== */}

      {selectedFoundation && (
        <>
          <EditFoundationModal
            open={
              openEdit
            }
            handleOpen={
              closeEditModal
            }
            foundation={
              selectedFoundation
            }
            refreshData={
              fetchFoundations
            }
          />

          <DeleteFoundationModal
            open={
              openDelete
            }
            handleOpen={
              closeDeleteModal
            }
            foundation={
              selectedFoundation
            }
            refreshData={
              fetchFoundations
            }
          />
        </>
      )}

    </MainLayout>
  );
};

export default FoundationIndex;