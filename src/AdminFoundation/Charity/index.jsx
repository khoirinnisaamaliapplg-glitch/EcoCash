import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  HeartIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";

import MainLayout from "../MainLayout";
import api from "../../utils/api";

import CreateCharityModal from "./CreateCharityModal";
import EditCharityModal from "./EditCharityModal";
import DeleteCharityModal from "./DeleteCharityModal";

// ============================================================
// TABLE HEADER
// ============================================================

const TABLE_HEAD = [
  {
    label: "Charity",
    value: "name",
  },
  {
    label: "Foundation",
    value: null,
  },
  {
    label: "Target",
    value: "targetAmount",
  },
  {
    label: "Terkumpul",
    value: "collectedAmount",
  },
  {
    label: "Status",
    value: "status",
  },
  {
    label: "Aktif",
    value: "isActive",
  },
  {
    label: "Action",
    value: null,
  },
];

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("id-ID");
};

const extractCharities = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  if (Array.isArray(responseData?.data?.charities)) {
    return responseData.data.charities;
  }

  if (Array.isArray(responseData?.charities)) {
    return responseData.charities;
  }

  return [];
};

// ============================================================
// COMPONENT
// ============================================================

const CharityIndex = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // ==========================================================
  // SORT
  // ==========================================================

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // ==========================================================
  // MODAL
  // ==========================================================

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedCharity, setSelectedCharity] =
    useState(null);

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // ==========================================================
  // GET CHARITIES
  // ==========================================================

  const fetchCharities = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/charities",
        {
          headers: getHeaders(),

          params: {
            page: 1,
            limit: 100,
            sortBy: "createdAt",
            order: "desc",
          },
        }
      );

      console.log(
        "GET CHARITIES RESPONSE:",
        response.data
      );

      const data = extractCharities(
        response.data
      );

      setCharities(data);
    } catch (error) {
      console.error(
        "GET CHARITIES ERROR:",
        error
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "DATA:",
        error.response?.data
      );

      toast.error(
        error.response?.data?.message ||
          "Gagal memuat data Charity."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharities();
  }, [fetchCharities]);

  // ==========================================================
  // SEARCH RESET PAGE
  // ==========================================================

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // ==========================================================
  // FILTER + SORT
  // ==========================================================

  const filteredCharities =
    useMemo(() => {
      const keyword =
        debouncedSearch
          .toLowerCase()
          .trim();

      const filtered =
        charities.filter(
          (charity) => {
            if (!keyword) {
              return true;
            }

            const searchable =
              [
                charity.name,
                charity.description,
                charity.status,
                charity.foundation
                  ?.name,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchable.includes(
              keyword
            );
          }
        );

      return [...filtered].sort(
        (first, second) => {
          let firstValue =
            first?.[sortBy];

          let secondValue =
            second?.[sortBy];

          if (
            sortBy ===
              "targetAmount" ||
            sortBy ===
              "collectedAmount"
          ) {
            firstValue =
              Number(
                firstValue ||
                  0
              );

            secondValue =
              Number(
                secondValue ||
                  0
              );
          } else {
            firstValue =
              String(
                firstValue ??
                  ""
              ).toLowerCase();

            secondValue =
              String(
                secondValue ??
                  ""
              ).toLowerCase();
          }

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
      charities,
      debouncedSearch,
      sortBy,
      sortOrder,
    ]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalData =
    filteredCharities.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalData / limit
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

  const paginatedCharities =
    useMemo(() => {
      const start =
        (page - 1) *
        limit;

      return filteredCharities.slice(
        start,
        start + limit
      );
    }, [
      filteredCharities,
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
    setSortOrder("asc");
  };

  // ==========================================================
  // CREATE CHARITY
  // ==========================================================

  const handleCreate =
    async (payload) => {
      try {
        console.log(
          "CREATE CHARITY PAYLOAD:",
          payload
        );

        const response =
          await api.post(
            "/charities",
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
          "CREATE CHARITY RESPONSE:",
          response.data
        );

        toast.success(
          response.data?.message ||
            "Charity berhasil dibuat."
        );

        await fetchCharities();

        return true;
      } catch (error) {
        console.error(
          "CREATE CHARITY ERROR:",
          error
        );

        console.error(
          "STATUS:",
          error.response?.status
        );

        console.error(
          "MESSAGE:",
          error.response?.data
            ?.message
        );

        console.error(
          "CODE:",
          error.response?.data
            ?.code
        );

        console.error(
          "DETAIL:",
          error.response?.data
            ?.error
        );

        console.error(
          "FULL DATA:",
          error.response?.data
        );

        const validationErrors =
          Array.isArray(
            error.response?.data
              ?.error
          )
            ? error.response.data
                .error
            : [];

        const validationMessage =
          validationErrors
            .map(
              (item) =>
                item?.msg ||
                item?.message ||
                item
            )
            .filter(Boolean)
            .join(", ");

        toast.error(
          validationMessage ||
            error.response?.data
              ?.message ||
            "Gagal membuat Charity."
        );

        return false;
      }
    };

  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const handleEdit =
    async (charity) => {
      try {
        const response =
          await api.get(
            `/charities/${charity.id}`,
            {
              headers:
                getHeaders(),
            }
          );

        const detail =
          response.data?.data ||
          charity;

        setSelectedCharity(
          detail
        );

        setOpenEdit(true);
      } catch (error) {
        console.error(
          "GET CHARITY DETAIL ERROR:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Gagal mengambil detail Charity."
        );
      }
    };

  // ==========================================================
  // UPDATE CHARITY
  // ==========================================================

  const handleUpdate =
    async (
      id,
      payload
    ) => {
      try {
        console.log(
          "UPDATE CHARITY:",
          id,
          payload
        );

        const response =
          await api.patch(
            `/charities/${id}`,
            payload,
            {
              headers: {
                ...getHeaders(),

                "Content-Type":
                  "application/json",
              },
            }
          );

        toast.success(
          response.data?.message ||
            "Charity berhasil diperbarui."
        );

        await fetchCharities();

        return true;
      } catch (error) {
        console.error(
          "UPDATE CHARITY ERROR:",
          error
        );

        console.error(
          "STATUS:",
          error.response?.status
        );

        console.error(
          "DATA:",
          error.response?.data
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Gagal memperbarui Charity."
        );

        return false;
      }
    };

  // ==========================================================
  // OPEN DELETE
  // ==========================================================

  const handleDelete = (
    charity
  ) => {
    setSelectedCharity(
      charity
    );

    setOpenDelete(true);
  };

  // ==========================================================
  // DELETE CHARITY
  // ==========================================================

  const confirmDelete =
    async (id) => {
      try {
        const response =
          await api.delete(
            `/charities/${id}`,
            {
              headers:
                getHeaders(),
            }
          );

        toast.success(
          response.data?.message ||
            "Charity berhasil dihapus."
        );

        await fetchCharities();

        return true;
      } catch (error) {
        console.error(
          "DELETE CHARITY ERROR:",
          error
        );

        console.error(
          "STATUS:",
          error.response?.status
        );

        console.error(
          "DATA:",
          error.response?.data
        );

        if (
          error.response?.data
            ?.code ===
          "CHARITY_HAS_DONATIONS"
        ) {
          toast.error(
            "Charity sudah memiliki Donation. Ubah status menjadi COMPLETED atau CLOSED, bukan menghapusnya."
          );

          return false;
        }

        toast.error(
          error.response?.data
            ?.message ||
            "Gagal menghapus Charity."
        );

        return false;
      }
    };

  // ==========================================================
  // CLOSE MODALS
  // ==========================================================

  const closeEditModal =
    () => {
      setOpenEdit(false);

      setSelectedCharity(
        null
      );
    };

  const closeDeleteModal =
    () => {
      setOpenDelete(
        false
      );

      setSelectedCharity(
        null
      );
    };

  // ==========================================================
  // STATUS COLOR
  // ==========================================================

  const getStatusColor = (
    status
  ) => {
    switch (
      String(
        status ||
          ""
      ).toUpperCase()
    ) {
      case "ACTIVE":
        return "green";

      case "COMPLETED":
        return "blue";

      case "CLOSED":
        return "red";

      default:
        return "gray";
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-0">

        {/* HEADER */}

        <div className="flex flex-col gap-1">

          <Typography
            variant="h4"
            className="font-bold text-[#2b6cb0]"
          >
            Data Charity
          </Typography>

          <Typography className="text-sm text-gray-500">
            Kelola program Charity
            milik Foundation
          </Typography>

        </div>

        {/* ACTION */}

        <div className="flex flex-col justify-between gap-4 lg:flex-row">

          <Button
            onClick={() =>
              setOpenCreate(true)
            }
            className="
              flex
              w-fit
              items-center
              gap-2
              rounded-xl
              bg-[#66bb6a]
              px-6
              normal-case
              shadow-none
            "
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" />

            Add Charity
          </Button>

          <div className="w-full lg:w-80">

            <Input
              label="Cari Charity..."
              icon={
                <MagnifyingGlassIcon className="h-5 w-5" />
              }
              value={search}
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

        {/* TABLE */}

        <Card className="w-full overflow-hidden rounded-2xl border border-blue-50 shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1350px] table-auto text-left">

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

                          ${
                            head.value
                              ? "cursor-pointer hover:bg-blue-100/50"
                              : ""
                          }
                        `}
                      >

                        <div className="flex items-center justify-between gap-2">

                          <Typography className="text-[11px] font-bold uppercase tracking-wider text-[#2b6cb0]">
                            {head.label}
                          </Typography>

                          {head.value && (
                            <ChevronUpDownIcon
                              className={`
                                h-4 w-4

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

              <tbody>

                {!loading &&
                paginatedCharities.length >
                  0 ? (

                  paginatedCharities.map(
                    (charity) => (

                      <tr
                        key={
                          charity.id
                        }
                        className="border-b border-blue-gray-50/50 hover:bg-blue-50/20"
                      >

                        {/* CHARITY */}

                        <td className="p-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-blue-100 bg-blue-50">

                              {charity.imageUrl ? (
                                <img
                                  src={
                                    charity.imageUrl
                                  }
                                  alt={
                                    charity.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <HeartIcon className="h-6 w-6 text-blue-600" />
                              )}

                            </div>

                            <div>

                              <Typography className="text-sm font-bold text-blue-900">
                                {charity.name ||
                                  "-"}
                              </Typography>

                              <Typography className="text-[10px] text-gray-400">
                                ID:{" "}
                                {charity.id}
                              </Typography>

                            </div>

                          </div>

                        </td>

                        {/* FOUNDATION */}

                        <td className="p-5">

                          <div className="flex items-center gap-2">

                            <BuildingLibraryIcon className="h-4 w-4 text-gray-400" />

                            <Typography className="text-xs font-semibold text-gray-700">
                              {charity.foundation
                                ?.name ||
                                "-"}
                            </Typography>

                          </div>

                        </td>

                        {/* TARGET */}

                        <td className="p-5">

                          <Typography className="text-xs font-bold text-gray-800">
                            Rp{" "}
                            {formatCurrency(
                              charity.targetAmount
                            )}
                          </Typography>

                        </td>

                        {/* COLLECTED */}

                        <td className="p-5">

                          <div className="flex items-center gap-2">

                            <BanknotesIcon className="h-4 w-4 text-green-500" />

                            <Typography className="text-xs font-bold text-green-600">
                              Rp{" "}
                              {formatCurrency(
                                charity.collectedAmount
                              )}
                            </Typography>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="p-5">

                          <Chip
                            variant="ghost"
                            size="sm"
                            value={
                              charity.status ||
                              "ACTIVE"
                            }
                            color={getStatusColor(
                              charity.status ||
                                "ACTIVE"
                            )}
                            className="w-fit text-[10px]"
                          />

                        </td>

                        {/* ACTIVE */}

                        <td className="p-5">

                          <Chip
                            variant="ghost"
                            size="sm"
                            value={
                              charity.isActive !==
                              false
                                ? "ACTIVE"
                                : "INACTIVE"
                            }
                            color={
                              charity.isActive !==
                              false
                                ? "green"
                                : "red"
                            }
                            className="w-fit text-[10px]"
                          />

                        </td>

                        {/* ACTION */}

                        <td className="p-5">

                          <div className="flex items-center gap-2">

                            <Button
                              size="sm"
                              onClick={() =>
                                handleEdit(
                                  charity
                                )
                              }
                              className="flex items-center gap-1 rounded-lg bg-[#66bb6a] px-4 py-2 normal-case shadow-none"
                            >
                              <PencilSquareIcon className="h-4 w-4" />

                              Edit
                            </Button>

                            <Button
                              size="sm"
                              onClick={() =>
                                handleDelete(
                                  charity
                                )
                              }
                              className="flex items-center gap-1 rounded-lg bg-[#ef5350] px-4 py-2 normal-case shadow-none"
                            >
                              <TrashIcon className="h-4 w-4" />

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
                      colSpan={7}
                      className="p-12 text-center text-gray-400"
                    >

                      {loading ? (

                        <div className="flex flex-col items-center gap-2">

                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

                          Memuat Charity...

                        </div>

                      ) : (

                        <div className="flex flex-col items-center gap-2">

                          <HeartIcon className="h-10 w-10 text-gray-300" />

                          {search
                            ? "Charity tidak ditemukan."
                            : "Belum ada data Charity."}

                        </div>

                      )}

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          <div className="flex flex-col gap-4 border-t border-blue-gray-50 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">

            <Typography
              variant="small"
              className="font-medium text-gray-600"
            >
              Menampilkan{" "}

              <span className="text-blue-700">
                {
                  paginatedCharities.length
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
                    (previous) =>
                      Math.max(
                        previous - 1,
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
                <ChevronLeftIcon className="h-3 w-3" />

                Prev
              </Button>

              <Typography className="text-sm font-bold text-blue-700">
                {page} /{" "}
                {totalPages}
              </Typography>

              <Button
                variant="outlined"
                size="sm"
                onClick={() =>
                  setPage(
                    (previous) =>
                      Math.min(
                        previous + 1,
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

                <ChevronRightIcon className="h-3 w-3" />

              </Button>

            </div>

          </div>

        </Card>

      </div>

      {/* CREATE */}

      <CreateCharityModal
        open={openCreate}
        handleOpen={() =>
          setOpenCreate(false)
        }
        onConfirm={
          handleCreate
        }
      />

      {/* EDIT */}

      {selectedCharity && (
        <EditCharityModal
          open={openEdit}
          handleOpen={
            closeEditModal
          }
          charity={
            selectedCharity
          }
          onConfirm={
            handleUpdate
          }
        />
      )}

      {/* DELETE */}

      {selectedCharity && (
        <DeleteCharityModal
          open={openDelete}
          handleOpen={
            closeDeleteModal
          }
          charity={
            selectedCharity
          }
          onConfirm={
            confirmDelete
          }
        />
      )}

    </MainLayout>
  );
};

export default CharityIndex;