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
  BuildingOffice2Icon,
  MapPinIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";

import api from "../../utils/api";

import CreateOrganizationModal from "./CreateOrganizationModal";
import EditOrganizationModal from "./EditOrganizationModal";
import DeleteOrganizationModal from "./DeleteOrganizationModal";

const TABLE_HEAD = [
  {
    label: "Organization",
    value: "name",
  },
  {
    label: "Kode",
    value: "code",
  },
  {
    label: "Tipe",
    value: "type",
  },
  {
    label: "Alamat",
    value: "address",
  },
  {
    label: "Organization Admin",
    value: null,
  },
  {
    label: "Action",
    value: null,
  },
];

const OrganizationIndex = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [
    selectedOrganization,
    setSelectedOrganization,
  ] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get(
        "/organizations",
        {
          headers: getHeaders(),
        }
      );

      const result = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setOrganizations(result);
    } catch (error) {
      console.error(
        "GET ORGANIZATIONS ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Gagal memuat data organization."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const filteredOrganizations = useMemo(() => {
    const keyword = debouncedSearch
      .toLowerCase()
      .trim();

    const filtered = organizations.filter(
      (organization) => {
        if (!keyword) return true;

        const searchableText = [
          organization.name,
          organization.code,
          organization.type,
          organization.address,
          organization.admin?.name,
          organization.admin?.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(keyword);
      }
    );

    return [...filtered].sort((first, second) => {
      const firstValue = String(
        first?.[sortBy] || ""
      ).toLowerCase();

      const secondValue = String(
        second?.[sortBy] || ""
      ).toLowerCase();

      if (firstValue < secondValue) {
        return sortOrder === "asc" ? -1 : 1;
      }

      if (firstValue > secondValue) {
        return sortOrder === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [
    organizations,
    debouncedSearch,
    sortBy,
    sortOrder,
  ]);

  const totalData = filteredOrganizations.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalData / limit)
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedOrganizations = useMemo(() => {
    const startIndex = (page - 1) * limit;

    return filteredOrganizations.slice(
      startIndex,
      startIndex + limit
    );
  }, [
    filteredOrganizations,
    page,
    limit,
  ]);

  const handleSort = (value) => {
    if (!value) return;

    if (sortBy === value) {
      setSortOrder((previous) =>
        previous === "asc" ? "desc" : "asc"
      );
      return;
    }

    setSortBy(value);
    setSortOrder("asc");
  };

  const handleEdit = (organization) => {
    setSelectedOrganization(organization);
    setOpenEdit(true);
  };

  const handleDelete = (organization) => {
    setSelectedOrganization(organization);
    setOpenDelete(true);
  };

  const closeEditModal = () => {
    setOpenEdit(false);
    setSelectedOrganization(null);
  };

  const closeDeleteModal = () => {
    setOpenDelete(false);
    setSelectedOrganization(null);
  };

  const getTypeColor = (type) => {
    const normalizedType =
      type?.toUpperCase() || "";

    switch (normalizedType) {
      case "UNIVERSITY":
      case "CAMPUS":
        return "blue";

      case "COMPANY":
      case "CORPORATE":
        return "green";

      case "GOVERNMENT":
        return "orange";

      case "SCHOOL":
        return "purple";

      case "COMMUNITY":
        return "teal";

      default:
        return "gray";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-0">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <Typography
            variant="h4"
            className="font-bold text-[#2b6cb0]"
          >
            Data Organization
          </Typography>

          <Typography className="text-sm text-gray-500">
            Kelola organization yang terdaftar di
            dalam sistem EcoCash
          </Typography>
        </div>

        {/* Action dan Search */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row">
          <div className="flex w-full flex-col gap-3 md:flex-row">
            <Button
              onClick={() => setOpenCreate(true)}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#66bb6a] px-6 normal-case shadow-none"
            >
              <PlusIcon className="h-5 w-5 stroke-[3]" />

              Add Organization
            </Button>
          </div>

          <div className="w-full lg:w-80">
            <Input
              label="Cari organization..."
              icon={
                <MagnifyingGlassIcon className="h-5 w-5" />
              }
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>
        </div>

        {/* Table */}
        <Card className="w-full overflow-hidden rounded-2xl border border-blue-50 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] table-auto text-left">
              <thead>
                <tr className="bg-[#e3f2fd]/50">
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head.label}
                      onClick={() =>
                        handleSort(head.value)
                      }
                      className={`
                        border-b border-blue-gray-50 p-5
                        transition-colors
                        ${
                          head.value
                            ? "cursor-pointer hover:bg-blue-100/50"
                            : ""
                        }
                      `}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Typography className="text-[11px] font-bold uppercase leading-none tracking-wider text-[#2b6cb0]">
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
                  ))}
                </tr>
              </thead>

              <tbody>
                {!loading &&
                paginatedOrganizations.length >
                  0 ? (
                  paginatedOrganizations.map(
                    (organization) => (
                      <tr
                        key={organization.id}
                        className="border-b border-blue-gray-50/50 transition-colors hover:bg-blue-50/20"
                      >
                        {/* Organization */}
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
                              <BuildingOffice2Icon className="h-6 w-6 text-[#2b6cb0]" />
                            </div>

                            <div>
                              <Typography
                                variant="small"
                                className="font-bold text-blue-900"
                              >
                                {organization.name ||
                                  "-"}
                              </Typography>

                              <Typography className="text-[10px] text-gray-400">
                                ID Organization:{" "}
                                {organization.id}
                              </Typography>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="p-5">
                          <div className="w-fit rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                            <Typography className="font-mono text-xs font-bold text-gray-700">
                              {organization.code ||
                                "-"}
                            </Typography>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="p-5">
                          <Chip
                            variant="ghost"
                            size="sm"
                            value={
                              organization.type ||
                              "OTHER"
                            }
                            color={getTypeColor(
                              organization.type
                            )}
                            className="w-fit text-[10px] font-bold"
                          />
                        </td>

                        {/* Address */}
                        <td className="p-5">
                          <div className="flex max-w-[300px] items-start gap-2">
                            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                            <Typography className="text-xs font-medium leading-relaxed text-gray-700">
                              {organization.address ||
                                "-"}
                            </Typography>
                          </div>
                        </td>

                        {/* Organization Admin */}
                        <td className="p-5">
                          {organization.admin ? (
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                                <UserCircleIcon className="h-5 w-5 text-green-600" />
                              </div>

                              <div>
                                <Typography className="text-xs font-bold text-gray-800">
                                  {
                                    organization
                                      .admin.name
                                  }
                                </Typography>

                                <Typography className="text-[10px] text-gray-400">
                                  {
                                    organization
                                      .admin.email
                                  }
                                </Typography>
                              </div>
                            </div>
                          ) : (
                            <Chip
                              variant="ghost"
                              size="sm"
                              color="gray"
                              value="Belum ada admin"
                              className="w-fit text-[10px]"
                            />
                          )}
                        </td>

                        {/* Action */}
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleEdit(
                                  organization
                                )
                              }
                              className="rounded-lg bg-[#66bb6a] px-4 py-2 normal-case shadow-none"
                            >
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              onClick={() =>
                                handleDelete(
                                  organization
                                )
                              }
                              className="rounded-lg bg-[#ef5350] px-4 py-2 normal-case shadow-none"
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
                      colSpan={6}
                      className="p-10 text-center text-gray-400"
                    >
                      {loading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

                          Memuat data...
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <BuildingOffice2Icon className="h-10 w-10 text-gray-300" />

                          {search
                            ? "Organization tidak ditemukan."
                            : "Belum ada data organization."}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-4 border-t border-blue-gray-50 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <Typography
              variant="small"
              className="font-medium text-gray-600"
            >
              Menampilkan{" "}
              <span className="text-blue-700">
                {paginatedOrganizations.length}
              </span>{" "}
              dari{" "}
              <span className="text-blue-700">
                {totalData}
              </span>{" "}
              data
            </Typography>

            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={() =>
                  setPage((previous) =>
                    Math.max(previous - 1, 1)
                  )
                }
                disabled={
                  page === 1 || loading
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
                  setPage((previous) =>
                    Math.min(
                      previous + 1,
                      totalPages
                    )
                  )
                }
                disabled={
                  page === totalPages ||
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

      {/* Create Modal */}
      <CreateOrganizationModal
        open={openCreate}
        handleOpen={() =>
          setOpenCreate(false)
        }
        refreshData={fetchOrganizations}
      />

      {/* Edit dan Delete Modal */}
      {selectedOrganization && (
        <>
          <EditOrganizationModal
            open={openEdit}
            handleOpen={closeEditModal}
            organization={
              selectedOrganization
            }
            refreshData={fetchOrganizations}
          />

          <DeleteOrganizationModal
            open={openDelete}
            handleOpen={closeDeleteModal}
            organization={
              selectedOrganization
            }
            refreshData={fetchOrganizations}
          />
        </>
      )}
    </MainLayout>
  );
};

export default OrganizationIndex;