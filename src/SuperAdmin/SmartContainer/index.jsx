import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../MainLayout";
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import DetailModal from "./DetailModal";
import api from "../../utils/api";

import {
  Card,
  Typography,
  Button,
  Input,
  Chip,
  Spinner,
  Progress,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronUpDownIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDebounce } from "use-debounce";

const TABLE_HEAD = [
  { label: "Machine Code", value: "machineCode" },
  { label: "Name & Place", value: "name" },
  { label: "API Key", value: null },
  { label: "Capacity", value: "fillPercentage" },
  { label: "Area", value: "areaId" },
  { label: "Status", value: "isActive" },
  { label: "Action", value: null },
];

const SmartContainerIndex = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  // Menyimpan API Key hasil create selama halaman ini masih terbuka.
  // Tidak disimpan ke localStorage agar key tidak menetap di browser.
  const [createdApiKeys, setCreatedApiKeys] = useState({});
  const [visibleApiKeyId, setVisibleApiKeyId] = useState(null);

  const fetchMachines = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/machines", {
        params: {
          page: Number(page),
          limit: Number(limit),
          search: debouncedSearch || undefined,
          sortBy: [
            "createdAt",
            "name",
            "machineCode",
            "fillPercentage",
          ].includes(sortBy)
            ? sortBy
            : "createdAt",
          sortOrder,
        },
      });

      const result = response.data;

      setMachines(
        Array.isArray(result.data) ? result.data : []
      );
      setTotalPages(result.meta?.totalPages || 1);
      setTotalData(result.meta?.total || 0);
    } catch (error) {
      console.error(
        "Gagal mengambil data mesin:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message ||
        "Koneksi database terganggu.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleSort = (value) => {
    if (!value) return;

    const isAscending =
      sortBy === value && sortOrder === "asc";

    setSortOrder(isAscending ? "desc" : "asc");
    setSortBy(value);
  };

  const getProgressColor = (percent) => {
    const value = Number(percent) || 0;

    if (value >= 80) return "red";
    if (value >= 50) return "amber";
    return "green";
  };

  const handleMachineCreated = useCallback((machine) => {
    if (!machine?.id || !machine?.apiKey) return;

    setCreatedApiKeys((previous) => ({
      ...previous,
      [machine.id]: machine.apiKey,
    }));
  }, []);

  const getMachineApiKey = (machine) => {
    // Bila formatMachine pada backend ikut mengirim apiKey,
    // gunakan row.apiKey. Bila tidak, gunakan key hasil create.
    return machine?.apiKey || createdApiKeys[machine?.id] || "";
  };

  const handleCopyApiKey = async (apiKey) => {
    if (!apiKey) {
      toast.warning(
        "API Key tidak tersedia pada response daftar mesin."
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(apiKey);
      toast.success("API Key berhasil disalin!");
    } catch (error) {
      console.error("Gagal menyalin API Key:", error);

      const textarea = document.createElement("textarea");
      textarea.value = apiKey;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      toast.success("API Key berhasil disalin!");
    }
  };

  const maskApiKey = (apiKey) => {
    if (!apiKey) return "";
    if (apiKey.length <= 12) return "••••••••••••";

    return `${apiKey.slice(0, 8)}${"•".repeat(16)}${apiKey.slice(-6)}`;
  };

  return (
    <MainLayout>
      <style>
        {`.Toastify__toast-container { z-index: 99999 !important; }`}
      </style>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="space-y-6 p-4 md:p-0">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Typography
              variant="h4"
              className="text-2xl font-bold text-[#2b6cb0] md:text-3xl"
            >
              Smart Container
            </Typography>

            <Typography className="text-sm italic text-gray-500">
              Monitoring Database System (Limiter Off)
            </Typography>
          </div>

          <Button
            variant="text"
            size="sm"
            className="flex items-center gap-2 font-bold normal-case text-blue-600"
            onClick={fetchMachines}
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh Data
          </Button>
        </div>

        <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
          <Button
            onClick={() => setOpenCreate(true)}
            className="flex items-center justify-center gap-2 bg-[#4CAF50] normal-case"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" />
            Add Machine
          </Button>

          <div className="w-full md:w-80">
            <Input
              label="Cari Mesin..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
        </div>

        <Card className="w-full overflow-hidden rounded-2xl border border-blue-50 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] table-auto text-left">
              <thead>
                <tr className="bg-[#f8fbff]">
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head.label}
                      onClick={() => handleSort(head.value)}
                      className={`border-b border-blue-50 p-5 ${
                        head.value ? "cursor-pointer" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Typography className="text-[10px] font-bold uppercase text-[#2b6cb0]">
                          {head.label}
                        </Typography>

                        {head.value && (
                          <ChevronUpDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center">
                      <Spinner className="mx-auto" />
                    </td>
                  </tr>
                ) : machines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  machines.map((row, index) => {
                    const apiKey = getMachineApiKey(row);
                    const isVisible = visibleApiKeyId === row.id;
                    const fillPercentage =
                      Number(row.fillPercentage) || 0;

                    return (
                      <tr
                        key={row.id || index}
                        className="transition-colors hover:bg-blue-50/10"
                      >
                        <td className="border-b border-blue-50/50 p-5">
                          <Typography
                            variant="small"
                            className="font-bold text-blue-900"
                          >
                            {row.machineCode}
                          </Typography>
                        </td>

                        <td className="border-b border-blue-50/50 p-5">
                          <Typography
                            variant="small"
                            className="font-semibold"
                          >
                            {row.name}
                          </Typography>

                          <Typography className="text-[10px] text-gray-500">
                            {row.placeName ||
                              row.district ||
                              "-"}
                          </Typography>
                        </td>

                        <td className="w-[340px] border-b border-blue-50/50 p-5">
                          {apiKey ? (
                            <div className="flex items-center gap-2">
                              <div className="min-w-0 flex-1 rounded-lg border border-blue-gray-100 bg-blue-gray-50 px-3 py-2">
                                <Typography className="truncate font-mono text-[11px] text-blue-gray-800">
                                  {isVisible
                                    ? apiKey
                                    : maskApiKey(apiKey)}
                                </Typography>
                              </div>

                              <Tooltip
                                content={
                                  isVisible
                                    ? "Sembunyikan API Key"
                                    : "Tampilkan API Key"
                                }
                              >
                                <IconButton
                                  variant="text"
                                  color="blue-gray"
                                  size="sm"
                                  onClick={() =>
                                    setVisibleApiKeyId(
                                      isVisible ? null : row.id
                                    )
                                  }
                                >
                                  {isVisible ? (
                                    <EyeSlashIcon className="h-4 w-4" />
                                  ) : (
                                    <EyeIcon className="h-4 w-4" />
                                  )}
                                </IconButton>
                              </Tooltip>

                              <Tooltip content="Salin API Key">
                                <IconButton
                                  variant="text"
                                  color="blue"
                                  size="sm"
                                  onClick={() =>
                                    handleCopyApiKey(apiKey)
                                  }
                                >
                                  <ClipboardDocumentIcon className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>
                            </div>
                          ) : (
                            <div>
                              <Typography className="text-xs font-medium text-gray-500">
                                Tidak tersedia
                              </Typography>

                              <Typography className="mt-1 text-[10px] text-gray-400">
                                API Key tidak dikirim oleh endpoint GET.
                              </Typography>
                            </div>
                          )}
                        </td>

                        <td className="w-64 border-b border-blue-50/50 p-5">
                          <div className="flex flex-col gap-1">
                            <div className="mb-1 flex justify-between">
                              <Typography
                                variant="small"
                                className="text-[10px] font-bold"
                              >
                                Level: {row.fillLevel ?? 0} cm
                              </Typography>

                              <Typography
                                variant="small"
                                className="text-[10px] font-bold"
                              >
                                {fillPercentage}%
                              </Typography>
                            </div>

                            <Progress
                              value={fillPercentage}
                              size="sm"
                              color={getProgressColor(
                                fillPercentage
                              )}
                            />
                          </div>
                        </td>

                        <td className="border-b border-blue-50/50 p-5">
                          <Chip
                            value={row.area?.name || "No Area"}
                            size="sm"
                            variant="ghost"
                            className="capitalize"
                          />
                        </td>

                        <td className="border-b border-blue-50/50 p-5">
                          <Chip
                            value={
                              row.isActive ? "Active" : "Inactive"
                            }
                            color={row.isActive ? "green" : "red"}
                            size="sm"
                          />
                        </td>

                        <td className="border-b border-blue-50/50 p-5">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setSelectedData(row);
                                setOpenDetail(true);
                              }}
                              size="sm"
                              variant="text"
                              className="normal-case text-blue-600"
                            >
                              Detail
                            </Button>

                            <Button
                              onClick={() => {
                                setSelectedData(row);
                                setOpenEdit(true);
                              }}
                              size="sm"
                              color="green"
                              variant="gradient"
                              className="normal-case"
                            >
                              Edit
                            </Button>

                            <Button
                              onClick={() => {
                                setSelectedData(row);
                                setOpenDelete(true);
                              }}
                              size="sm"
                              color="red"
                              variant="gradient"
                              className="normal-case"
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-blue-50 p-5">
            <Typography variant="small" className="text-gray-600">
              Menampilkan <b>{machines.length}</b> dari{" "}
              <b>{totalData}</b> mesin
            </Typography>

            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={() =>
                  setPage((currentPage) =>
                    Math.max(currentPage - 1, 1)
                  )
                }
                disabled={page === 1}
                className="border-blue-100"
              >
                Prev
              </Button>

              <Typography
                variant="small"
                className="mx-2 font-bold text-blue-700"
              >
                {page} / {totalPages}
              </Typography>

              <Button
                variant="outlined"
                size="sm"
                onClick={() =>
                  setPage((currentPage) =>
                    Math.min(currentPage + 1, totalPages)
                  )
                }
                disabled={page === totalPages}
                className="border-blue-100"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        <CreateModal
          open={openCreate}
          handleOpen={() => setOpenCreate(false)}
          refreshData={fetchMachines}
          onMachineCreated={handleMachineCreated}
        />

        {selectedData && (
          <>
            <EditModal
              open={openEdit}
              handleOpen={() => {
                setOpenEdit(false);
                setSelectedData(null);
              }}
              data={selectedData}
              refreshData={fetchMachines}
            />

            <DetailModal
              open={openDetail}
              handleOpen={() => {
                setOpenDetail(false);
                setSelectedData(null);
              }}
              data={selectedData}
            />

            <DeleteModal
              open={openDelete}
              handleOpen={() => {
                setOpenDelete(false);
                setSelectedData(null);
              }}
              data={selectedData}
              refreshData={fetchMachines}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default SmartContainerIndex;