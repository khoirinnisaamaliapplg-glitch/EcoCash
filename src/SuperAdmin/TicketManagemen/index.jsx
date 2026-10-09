
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import MainLayout from "../MainLayout";
import api from "../../utils/api";
import { toast } from "react-toastify";
import {
  Card,
  Typography,
  Button,
  Input,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";

const API = {
  all: "/tickets/admin/all",
  detail: (id) => `/tickets/${id}`,
  update: (id) => `/tickets/admin/${id}/status`,
};

const STATUSES = [
  { value: "OPEN", label: "Menunggu" },
  { value: "IN_PROGRESS", label: "Diproses" },
  { value: "RESOLVED", label: "Selesai" },
  { value: "CLOSED", label: "Ditutup" },
];

const PRIORITIES = [
  { value: "LOW", label: "Rendah" },
  { value: "MEDIUM", label: "Sedang" },
  { value: "HIGH", label: "Tinggi" },
  { value: "URGENT", label: "Darurat" },
];

const CATEGORIES = [
  { value: "MACHINE_BROKEN", label: "Kerusakan Mesin" },
  {
    value: "WEIGHING_DISCREPANCY",
    label: "Selisih Penimbangan",
  },
  {
    value: "WITHDRAWAL_ISSUE",
    label: "Masalah Penarikan",
  },
  { value: "OTHER", label: "Lainnya" },
];

const labelOf = (items, value) =>
  items.find((x) => x.value === value)?.label ||
  value ||
  "-";

const dateOf = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const errorOf = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Terjadi kesalahan.";

const statusColor = (value) =>
  ({
    OPEN: "amber",
    IN_PROGRESS: "blue",
    RESOLVED: "green",
    CLOSED: "blue-gray",
  })[value] || "gray";

const priorityColor = (value) =>
  ({
    LOW: "green",
    MEDIUM: "amber",
    HIGH: "orange",
    URGENT: "red",
  })[value] || "gray";

const StatusChip = ({ status }) => (
  <Chip
    size="sm"
    variant="ghost"
    color={statusColor(status)}
    value={labelOf(STATUSES, status)}
    className="w-fit text-xs"
  />
);

const PriorityChip = ({ priority }) => (
  <Chip
    size="sm"
    variant="ghost"
    color={priorityColor(priority)}
    value={labelOf(PRIORITIES, priority)}
    className="w-fit text-xs"
  />
);

const StatCard = ({ label, value, Icon, color }) => (
  <Card className="rounded-2xl border border-green-50 p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <Typography variant="h3" className="text-gray-800">
        {value}
      </Typography>
    </div>
    <Typography className="mt-3 text-sm text-gray-500">
      {label}
    </Typography>
  </Card>
);

export default function TicketManagement() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    status: "OPEN",
    priority: "MEDIUM",
    adminNotes: "",
  });

  const fetchTickets = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const response = await api.get(API.all);
      const data = response.data?.data;

      if (!Array.isArray(data)) {
        throw new Error("Format daftar tiket tidak sesuai.");
      }

      setTickets(data);
    } catch (error) {
      console.error("GET ALL TICKETS:", error);
      toast.error(errorOf(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      progress: tickets.filter(
        (t) => t.status === "IN_PROGRESS"
      ).length,
      completed: tickets.filter((t) =>
        ["RESOLVED", "CLOSED"].includes(t.status)
      ).length,
    }),
    [tickets]
  );

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const searchable = [
        ticket.id,
        ticket.subject,
        ticket.description,
        ticket.user?.name,
        ticket.user?.email,
        ticket.user?.role,
      ]
        .filter((v) => v != null)
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(keyword) &&
        (statusFilter === "ALL" ||
          ticket.status === statusFilter) &&
        (categoryFilter === "ALL" ||
          ticket.category === categoryFilter)
      );
    });
  }, [tickets, search, statusFilter, categoryFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const getDetail = async (id) => {
    const response = await api.get(API.detail(id));
    if (!response.data?.data) {
      throw new Error("Detail tiket tidak ditemukan.");
    }
    return response.data.data;
  };

  const openDetail = async (ticket) => {
    setSelected(ticket);
    setViewOpen(true);
    setDetailLoading(true);

    try {
      const data = await getDetail(ticket.id);
      setSelected(data);
    } catch (error) {
      toast.error(errorOf(error));
    } finally {
      setDetailLoading(false);
    }
  };

  const openEdit = async (ticket) => {
    setDetailLoading(true);
    try {
      const data = await getDetail(ticket.id);
      setSelected(data);
      setForm({
        status: data.status || "OPEN",
        priority: data.priority || "MEDIUM",
        adminNotes: data.adminNotes || "",
      });
      setViewOpen(false);
      setEditOpen(true);
    } catch (error) {
      toast.error(errorOf(error));
    } finally {
      setDetailLoading(false);
    }
  };

  const saveTicket = async (event) => {
    event.preventDefault();
    if (!selected || saving) return;

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append("status", form.status);
      payload.append("priority", form.priority);

      if (form.adminNotes.trim()) {
        payload.append("adminNotes", form.adminNotes.trim());
      }

      await api.patch(API.update(selected.id), payload);

      toast.success("Tiket berhasil diperbarui.");
      setEditOpen(false);
      await fetchTickets(true);
    } catch (error) {
      console.error("UPDATE TICKET:", error);
      toast.error(errorOf(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-0">
        {/* HEADER */}
        <div>
          <Typography
            variant="h4"
            className="font-bold text-[#2b6cb0]"
          >
            Ticket Management
          </Typography>
          <Typography className="text-sm text-gray-500">
            Kelola pengaduan EcoCash Partner dan pengguna
          </Typography>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Tiket"
            value={stats.total}
            Icon={TicketIcon}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Menunggu Penanganan"
            value={stats.open}
            Icon={ExclamationCircleIcon}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Sedang Diproses"
            value={stats.progress}
            Icon={ClockIcon}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Selesai / Ditutup"
            value={stats.completed}
            Icon={CheckCircleIcon}
            color="bg-green-50 text-green-600"
          />
        </div>

        {/* FILTER */}
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => fetchTickets(true)}
              disabled={loading || refreshing}
              className="flex items-center gap-2 rounded-xl bg-[#66bb6a] normal-case shadow-none"
            >
              <ArrowPathIcon
                className={`h-5 w-5 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh Data
            </Button>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="ALL">Semua Status</option>
              {STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="ALL">Semua Kategori</option>
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full xl:w-80">
            <Input
              label="Cari tiket atau pelapor..."
              icon={
                <MagnifyingGlassIcon className="h-5 w-5" />
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* TABEL */}
        <Card className="overflow-hidden rounded-2xl border border-green-50 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead>
                <tr className="bg-green-50">
                  {[
                    "Tiket",
                    "Pelapor",
                    "Kategori",
                    "Prioritas",
                    "Status",
                    "Tanggal",
                    "Aksi",
                  ].map((heading) => (
                    <th key={heading} className="border-b p-5">
                      <Typography className="text-xs font-bold uppercase text-[#2b6cb0]">
                        {heading}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-10 text-center text-gray-500"
                    >
                      Memuat tiket...
                    </td>
                  </tr>
                ) : visible.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-10 text-center text-gray-400"
                    >
                      Tidak ada tiket ditemukan.
                    </td>
                  </tr>
                ) : (
                  visible.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b hover:bg-green-50/30"
                    >
                      <td className="p-5">
                        <Typography className="max-w-[220px] font-bold text-gray-800">
                          {ticket.subject}
                        </Typography>
                        <p className="mt-1 text-xs text-gray-400">
                          Tiket #{ticket.id}
                        </p>
                      </td>

                      <td className="p-5">
                        <p className="font-semibold text-gray-800">
                          {ticket.user?.name || "-"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ticket.user?.email || "-"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {ticket.user?.role || "-"}
                        </p>
                      </td>

                      <td className="p-5 text-sm text-gray-700">
                        {labelOf(CATEGORIES, ticket.category)}
                      </td>

                      <td className="p-5">
                        <PriorityChip priority={ticket.priority} />
                      </td>

                      <td className="p-5">
                        <StatusChip status={ticket.status} />
                      </td>

                      <td className="p-5 text-sm text-gray-700">
                        {dateOf(ticket.createdAt)}
                      </td>

                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            title="Lihat detail"
                            onClick={() => openDetail(ticket)}
                            className="rounded-lg bg-blue-500 p-2.5 shadow-none"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            title="Tindak lanjut"
                            onClick={() => openEdit(ticket)}
                            className="rounded-lg bg-[#66bb6a] p-2.5 shadow-none"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t p-5">
            <Typography className="text-sm text-gray-600">
              Page {currentPage} / {pages}
              <span className="ml-2 text-gray-400">
                ({filtered.length} tiket)
              </span>
            </Typography>

            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                className="rounded-lg bg-[#2b6cb0] p-2.5"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                disabled={currentPage >= pages}
                onClick={() => setPage(currentPage + 1)}
                className="rounded-lg bg-[#2b6cb0] p-2.5"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* DETAIL TIKET */}
        <Dialog
          open={viewOpen}
          handler={() => setViewOpen(false)}
          size="lg"
          className="rounded-2xl"
        >
          <DialogHeader className="flex items-center justify-between border-b">
            <Typography
              variant="h5"
              className="font-bold text-[#2b6cb0]"
            >
              Detail Tiket #{selected?.id}
            </Typography>
            <button
              type="button"
              onClick={() => setViewOpen(false)}
              aria-label="Tutup"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </DialogHeader>

          <DialogBody className="max-h-[65vh] space-y-5 overflow-y-auto p-6">
            {detailLoading || !selected ? (
              <p className="text-center">Memuat detail...</p>
            ) : (
              <>
                <div>
                  <p className="mb-1 text-xs text-gray-500">
                    Subjek
                  </p>
                  <Typography
                    variant="h5"
                    className="text-gray-800"
                  >
                    {selected.subject}
                  </Typography>
                </div>

                <div className="flex flex-wrap gap-3">
                  <StatusChip status={selected.status} />
                  <PriorityChip priority={selected.priority} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      Kategori
                    </p>
                    <p className="text-sm text-gray-800">
                      {labelOf(CATEGORIES, selected.category)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Dibuat
                    </p>
                    <p className="text-sm text-gray-800">
                      {dateOf(selected.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="mb-1 text-xs font-semibold text-blue-700">
                    Informasi Pelapor
                  </p>
                  <p className="text-sm text-gray-800">
                    {selected.user?.name || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selected.user?.email || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selected.user?.phoneNumber || "-"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selected.user?.role || "-"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500">
                    Deskripsi Masalah
                  </p>
                  <div className="whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                    {selected.description || "-"}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500">
                    Lampiran Bukti
                  </p>
                  {selected.attachmentUrl ? (
                    <a
                      href={selected.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 underline"
                    >
                      <PaperClipIcon className="h-5 w-5" />
                      Lihat Lampiran
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Tidak ada lampiran.
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500">
                    Catatan Tindak Lanjut
                  </p>
                  <div className="whitespace-pre-wrap rounded-xl bg-green-50 p-4 text-sm text-gray-700">
                    {selected.adminNotes ||
                      "Belum ada catatan Admin."}
                  </div>
                </div>
              </>
            )}
          </DialogBody>

          <DialogFooter className="border-t">
            <Button
              variant="text"
              color="blue-gray"
              onClick={() => setViewOpen(false)}
            >
              Tutup
            </Button>
            <Button
              disabled={!selected || detailLoading}
              onClick={() => openEdit(selected)}
              className="bg-[#66bb6a] normal-case"
            >
              Tindak Lanjuti
            </Button>
          </DialogFooter>
        </Dialog>

        {/* EDIT STATUS */}
        <Dialog
          open={editOpen}
          handler={() => {
            if (!saving) setEditOpen(false);
          }}
          size="md"
          className="rounded-2xl"
        >
          <DialogHeader className="flex items-center justify-between border-b">
            <Typography
              variant="h5"
              className="font-bold text-[#2b6cb0]"
            >
              Tindak Lanjut Tiket
            </Typography>
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              disabled={saving}
              aria-label="Tutup"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </DialogHeader>

          <form onSubmit={saveTicket}>
            <DialogBody className="space-y-5 p-6">
              <div className="rounded-xl bg-blue-50 p-3">
                <p className="text-xs text-blue-600">
                  Tiket #{selected?.id}
                </p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selected?.subject}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((old) => ({
                      ...old,
                      status: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none focus:border-blue-500"
                >
                  {STATUSES.map((x) => (
                    <option key={x.value} value={x.value}>
                      {x.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Prioritas
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((old) => ({
                      ...old,
                      priority: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none focus:border-blue-500"
                >
                  {PRIORITIES.map((x) => (
                    <option key={x.value} value={x.value}>
                      {x.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Catatan Admin
                </label>
                <textarea
                  rows={5}
                  value={form.adminNotes}
                  onChange={(e) =>
                    setForm((old) => ({
                      ...old,
                      adminNotes: e.target.value,
                    }))
                  }
                  placeholder="Tuliskan tindakan penanganan masalah..."
                  className="w-full resize-none rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Catatan tindak lanjut akan digunakan
                  dalam notifikasi pembaruan kepada pelapor.
                </p>
              </div>
            </DialogBody>

            <DialogFooter className="gap-2 border-t">
              <Button
                type="button"
                variant="outlined"
                color="blue-gray"
                disabled={saving}
                onClick={() => setEditOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#66bb6a] normal-case"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      </div>
    </MainLayout>
  );
}
