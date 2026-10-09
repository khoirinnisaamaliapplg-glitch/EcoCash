
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
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon,
  PhotoIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

// =====================================================
// API CONFIGURATION
// =====================================================

const API = {
  partners: "/partners/admin/all",

  // Isi lewat .env jika backend memiliki endpoint
  // daftar semua dokumen yang bisa diakses SUPER_ADMIN.
  // Contoh nilai harus mengikuti Swagger backend.
  documents:
    import.meta.env.VITE_KYC_DOCUMENTS_ENDPOINT || "",

  verify: (id) =>
    `/partners/admin/documents/${encodeURIComponent(id)}/verify`,
};

// Atur ke true setelah kontrak PATCH diverifikasi
// pada partner.controller.js.
const VERIFY_ENABLED =
  import.meta.env.VITE_KYC_VERIFY_ENABLED === "true";

// =====================================================
// HELPERS
// =====================================================

const getError = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Terjadi kesalahan pada sistem.";

const normalizeStatus = (status) =>
  String(status || "").toUpperCase();

const formatDate = (value) => {
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

const getPartnerName = (partner) =>
  partner?.user?.name ||
  partner?.name ||
  partner?.companyName ||
  "-";

const getPartnerEmail = (partner) =>
  partner?.user?.email ||
  partner?.email ||
  "-";

const getPartnerPhone = (partner) =>
  partner?.user?.phoneNumber ||
  partner?.phoneNumber ||
  "-";

const getDocumentName = (doc, index = 0) =>
  doc?.documentType ||
  doc?.type ||
  `Dokumen ${index + 1}`;

const statusLabel = (status) => {
  const labels = {
    PENDING: "Pending",
    APPROVED: "Approved",
    VERIFIED: "Verified",
    REJECTED: "Rejected",
    ACTIVE: "Active",
    SUSPENDED: "Suspended",
  };

  const value = normalizeStatus(status);

  return labels[value] || value || "Tidak diketahui";
};

const statusColor = (status) => {
  const value = normalizeStatus(status);

  if (["APPROVED", "VERIFIED", "ACTIVE"].includes(value)) {
    return "green";
  }

  if (["REJECTED", "SUSPENDED"].includes(value)) {
    return "red";
  }

  if (value === "PENDING") return "amber";

  return "blue-gray";
};

// =====================================================
// RESPONSE NORMALIZATION
// =====================================================

const extractArray = (response, keys = []) => {
  const body = response?.data ?? response;

  const candidates = [
    body?.data,
    body,
    body?.data?.data,
    ...keys.map((key) => body?.data?.[key]),
    ...keys.map((key) => body?.[key]),
  ];

  return candidates.find(Array.isArray) || null;
};

const getDocuments = (partner) => {
  if (!partner) return [];

  const candidates = [
    partner.documents,
    partner.partnerDocuments,
    partner.kycDocuments,
  ];

  return candidates.find(Array.isArray) || [];
};

const mergeDocuments = (partners, documents) => {
  const grouped = new Map();

  documents.forEach((doc) => {
    if (doc?.partnerId == null) return;

    const partnerId = String(doc.partnerId);

    if (!grouped.has(partnerId)) {
      grouped.set(partnerId, []);
    }

    grouped.get(partnerId).push(doc);
  });

  return partners.map((partner) => {
    const existingDocs = getDocuments(partner);
    const separateDocs =
      grouped.get(String(partner.id)) || [];

    // Gabungkan tanpa menduplikasi ID dokumen.
    const docMap = new Map();

    [...existingDocs, ...separateDocs].forEach((doc) => {
      if (!doc) return;

      const key =
        doc.id != null
          ? String(doc.id)
          : `${doc.documentType}-${doc.fileUrl}`;

      docMap.set(key, doc);
    });

    return {
      ...partner,
      documents: Array.from(docMap.values()),
    };
  });
};

const getOverallStatus = (documents) => {
  if (!documents.length) return null;

  const statuses = documents.map((doc) =>
    normalizeStatus(doc.status)
  );

  if (statuses.includes("REJECTED")) {
    return "REJECTED";
  }

  if (statuses.includes("PENDING")) {
    return "PENDING";
  }

  if (
    statuses.every((status) =>
      ["APPROVED", "VERIFIED"].includes(status)
    )
  ) {
    return "APPROVED";
  }

  return null;
};

// =====================================================
// DOCUMENT URL
// =====================================================

const getBackendOrigin = () => {
  const configured = import.meta.env.VITE_API_ORIGIN;

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const base = api.defaults?.baseURL;

  if (!base) return "";

  try {
    return new URL(base, window.location.origin).origin;
  } catch {
    return "";
  }
};

const getDocumentUrl = (document) => {
  const raw =
    document?.fileUrl ||
    document?.documentUrl ||
    document?.url ||
    document?.imageUrl;

  if (!raw || typeof raw !== "string") {
    return null;
  }

  const value = raw.trim().replace(/\\/g, "/");
  const backendOrigin = getBackendOrigin();

  try {
    const parsed = new URL(
      value,
      backendOrigin || window.location.origin
    );

    // File lama disimpan menggunakan localhost:3000.
    // Ganti host tersebut dengan domain API aktif.
    const isLocalhost = [
      "localhost",
      "127.0.0.1",
    ].includes(parsed.hostname);

    if (isLocalhost && backendOrigin) {
      return (
        backendOrigin +
        parsed.pathname +
        parsed.search
      );
    }

    if (!backendOrigin && !/^https?:\/\//i.test(value)) {
      return null;
    }

    return parsed.href;
  } catch {
    return null;
  }
};

// =====================================================
// UI COMPONENTS
// =====================================================

function StatusBadge({ status }) {
  return (
    <Chip
      size="sm"
      variant="ghost"
      value={statusLabel(status)}
      color={statusColor(status)}
      className="w-fit text-xs font-semibold"
    />
  );
}

function SummaryCard({ title, value, Icon, color }) {
  return (
    <Card className="rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>

        <Typography
          variant="h3"
          className="font-bold text-gray-800"
        >
          {value}
        </Typography>
      </div>

      <p className="mt-3 text-sm font-medium text-gray-500">
        {title}
      </p>
    </Card>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs text-gray-500">
        {label}
      </p>

      <p className="break-words text-sm font-semibold text-gray-800">
        {value ?? "-"}
      </p>
    </div>
  );
}

function DocumentPreview({ document, index }) {
  const url = getDocumentUrl(document);
  const name = getDocumentName(document, index);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  const isPdf =
    document?.mimeType === "application/pdf" ||
    document?.mimetype === "application/pdf" ||
    (typeof url === "string" &&
      /\.pdf(?:[?#]|$)/i.test(url));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b bg-gray-50 p-4">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5 text-blue-600" />

          <p className="text-sm font-bold text-gray-800">
            {name}
          </p>
        </div>

        <StatusBadge status={document.status} />
      </div>

      <div className="p-4">
        {!url ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl bg-gray-50">
            <PhotoIcon className="h-12 w-12 text-gray-300" />

            <p className="mt-3 text-sm text-gray-500">
              URL dokumen belum tersedia.
            </p>
          </div>
        ) : isPdf ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl bg-red-50">
            <DocumentTextIcon className="h-14 w-14 text-red-500" />

            <p className="mt-3 text-sm text-gray-700">
              Dokumen PDF
            </p>
          </div>
        ) : failed ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl bg-gray-50">
            <PhotoIcon className="h-12 w-12 text-gray-300" />

            <p className="mt-3 text-sm text-red-500">
              Gambar gagal dimuat.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Periksa akses file di server.
            </p>
          </div>
        ) : (
          <img
            src={url}
            alt={name}
            loading="lazy"
            onError={() => {
              console.error(
                "Gagal memuat dokumen KYC:",
                document.id
              );
              setFailed(true);
            }}
            className="mx-auto max-h-[360px] w-full rounded-xl bg-gray-50 object-contain"
          />
        )}

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            Buka Dokumen
          </a>
        )}
      </div>
    </div>
  );
}

// =====================================================
// MAIN PAGE
// =====================================================

export default function KycVerification() {
  const [partners, setPartners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedPartnerId, setSelectedPartnerId] =
    useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const [selectedDocument, setSelectedDocument] =
    useState(null);

  const [verifyAction, setVerifyAction] =
    useState("APPROVED");

  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const [documentWarning, setDocumentWarning] =
    useState("");

  // ===================================================
  // LOAD PARTNERS + DOCUMENTS
  // ===================================================

  const fetchPartners = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorText("");
      setDocumentWarning("");

      const partnerResponse = await api.get(API.partners);

      const partnerList = extractArray(
        partnerResponse,
        ["partners"]
      );

      if (!partnerList) {
        throw new Error(
          "Respons daftar Partner tidak sesuai."
        );
      }

      // Dokumen yang sudah disertakan API Partner.
      const embeddedCount = partnerList.reduce(
        (total, partner) =>
          total + getDocuments(partner).length,
        0
      );

      let separateDocuments = [];

      if (API.documents) {
        try {
          const documentResponse = await api.get(
            API.documents
          );

          const list = extractArray(
            documentResponse,
            ["documents"]
          );

          if (!list) {
            throw new Error(
              "Respons endpoint dokumen bukan array."
            );
          }

          separateDocuments = list;
        } catch (error) {
          console.error(
            "Gagal mengambil dokumen KYC:",
            error
          );

          setDocumentWarning(
            "Endpoint dokumen gagal diakses. " +
            getError(error)
          );
        }
      } else if (embeddedCount === 0) {
        setDocumentWarning(
          "API daftar Partner belum menyertakan dokumen. " +
          "Atur VITE_KYC_DOCUMENTS_ENDPOINT dengan endpoint " +
          "daftar dokumen untuk Super Admin."
        );
      }

      const merged = mergeDocuments(
        partnerList,
        separateDocuments
      );

      if (import.meta.env.DEV) {
        console.table(
          merged.map((partner) => ({
            partnerId: partner.id,
            jumlahDokumen: partner.documents.length,
          }))
        );
      }

      setPartners(merged);
    } catch (error) {
      console.error("FETCH KYC ERROR:", error);

      setErrorText(getError(error));
      toast.error(getError(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // ===================================================
  // SELECTED PARTNER
  // ===================================================

  const selectedPartner = useMemo(
    () =>
      partners.find(
        (partner) =>
          String(partner.id) ===
          String(selectedPartnerId)
      ) || null,
    [partners, selectedPartnerId]
  );

  // ===================================================
  // STATS
  // ===================================================

  const stats = useMemo(() => {
    const docs = partners.flatMap(getDocuments);

    return {
      partners: partners.length,
      documents: docs.length,
      pending: docs.filter(
        (doc) =>
          normalizeStatus(doc.status) === "PENDING"
      ).length,
      approved: docs.filter((doc) =>
        ["APPROVED", "VERIFIED"].includes(
          normalizeStatus(doc.status)
        )
      ).length,
      rejected: docs.filter(
        (doc) =>
          normalizeStatus(doc.status) === "REJECTED"
      ).length,
    };
  }, [partners]);

  // ===================================================
  // FILTER
  // ===================================================

  const filteredPartners = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return partners.filter((partner) => {
      const searchable = [
        partner.id,
        getPartnerName(partner),
        getPartnerEmail(partner),
        partner.companyName,
        partner.type,
      ]
        .filter((item) => item != null)
        .join(" ")
        .toLowerCase();

      const documents = getDocuments(partner);
      const overall = getOverallStatus(documents);

      const matchSearch = searchable.includes(keyword);

      const matchStatus =
        statusFilter === "ALL" ||
        overall === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [partners, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPartners.length / limit)
  );

  const currentPage = Math.min(page, totalPages);

  const visiblePartners = filteredPartners.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  // ===================================================
  // DETAIL MODAL
  // ===================================================

  const openDetail = (partner) => {
    setSelectedPartnerId(partner.id);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    if (saving || verifyOpen) return;

    setDetailOpen(false);
    setSelectedPartnerId(null);
  };

  // ===================================================
  // VERIFICATION
  // ===================================================

  const openVerify = (document, action) => {
    if (!VERIFY_ENABLED) {
      toast.warning(
        "Verifikasi belum diaktifkan. " +
        "Konfirmasi payload pada partner.controller.js."
      );
      return;
    }

    if (!document?.id) {
      toast.error("ID dokumen tidak ditemukan.");
      return;
    }

    setSelectedDocument(document);
    setVerifyAction(action);
    setReason("");
    setVerifyOpen(true);
  };

  const submitVerification = async (event) => {
    event.preventDefault();

    if (
      !VERIFY_ENABLED ||
      saving ||
      !selectedDocument?.id
    ) {
      return;
    }

    if (
      verifyAction === "REJECTED" &&
      !reason.trim()
    ) {
      toast.warning("Alasan penolakan wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.patch(
        API.verify(selectedDocument.id),
        {
          status: verifyAction,
          rejectionReason:
            verifyAction === "REJECTED"
              ? reason.trim()
              : null,
        }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message ||
          "Verifikasi gagal."
        );
      }

      toast.success(
        verifyAction === "APPROVED"
          ? "Dokumen berhasil disetujui."
          : "Dokumen berhasil ditolak."
      );

      setVerifyOpen(false);
      setSelectedDocument(null);
      setReason("");

      // Muat ulang hasil terbaru dari server.
      await fetchPartners(true);
    } catch (error) {
      console.error("VERIFY KYC ERROR:", error);
      toast.error(getError(error));
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-0">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-50 p-3">
            <ShieldCheckIcon className="h-7 w-7 text-green-500" />
          </div>

          <div>
            <Typography
              variant="h4"
              className="font-bold text-[#2b6cb0]"
            >
              Verifikasi KYC
            </Typography>

            <p className="text-sm text-gray-500">
              Pemeriksaan dokumen EcoCash Partner
            </p>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            title="Total Partner"
            value={stats.partners}
            Icon={UserGroupIcon}
            color="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="Total Dokumen"
            value={stats.documents}
            Icon={DocumentTextIcon}
            color="bg-purple-50 text-purple-600"
          />

          <SummaryCard
            title="Pending"
            value={stats.pending}
            Icon={ClockIcon}
            color="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="Approved"
            value={stats.approved}
            Icon={CheckCircleIcon}
            color="bg-green-50 text-green-600"
          />

          <SummaryCard
            title="Rejected"
            value={stats.rejected}
            Icon={XCircleIcon}
            color="bg-red-50 text-red-600"
          />
        </div>

        {/* WARNING */}
        {documentWarning && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {documentWarning}
          </div>
        )}

        {errorText && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorText}
          </div>
        )}

        {/* FILTER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={loading || refreshing}
              onClick={() => fetchPartners(true)}
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
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="w-full lg:w-80">
            <Input
              label="Cari Partner..."
              value={search}
              icon={
                <MagnifyingGlassIcon className="h-5 w-5" />
              }
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* PARTNER TABLE */}
        <Card className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead>
                <tr className="bg-green-50">
                  {[
                    "Partner",
                    "Tipe Partner",
                    "Dokumen",
                    "Status KYC",
                    "Tanggal",
                    "Aksi",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="border-b p-5"
                    >
                      <p className="text-xs font-bold uppercase text-[#2b6cb0]">
                        {heading}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-10 text-center text-gray-500"
                    >
                      Memuat data KYC...
                    </td>
                  </tr>
                ) : visiblePartners.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-10 text-center text-gray-400"
                    >
                      Tidak ada Partner ditemukan.
                    </td>
                  </tr>
                ) : (
                  visiblePartners.map((partner) => {
                    const docs = getDocuments(partner);
                    const overall = getOverallStatus(docs);

                    return (
                      <tr
                        key={partner.id}
                        className="border-b hover:bg-green-50/30"
                      >
                        <td className="p-5">
                          <p className="font-semibold text-gray-800">
                            {getPartnerName(partner)}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {getPartnerEmail(partner)}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Partner #{partner.id}
                          </p>
                        </td>

                        <td className="p-5 text-sm text-gray-700">
                          {partner.type || "-"}
                        </td>

                        <td className="p-5 text-sm text-gray-700">
                          <span className="font-semibold">
                            {docs.length}
                          </span>{" "}
                          dokumen
                        </td>

                        <td className="p-5">
                          {overall ? (
                            <StatusBadge status={overall} />
                          ) : (
                            <span className="text-xs text-gray-400">
                              Belum ada dokumen
                            </span>
                          )}
                        </td>

                        <td className="p-5 text-sm text-gray-700">
                          {formatDate(partner.createdAt)}
                        </td>

                        <td className="p-5">
                          <Button
                            size="sm"
                            onClick={() => openDetail(partner)}
                            className="flex items-center gap-2 rounded-lg bg-blue-500 normal-case shadow-none"
                          >
                            <EyeIcon className="h-4 w-4" />
                            Detail
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between border-t p-5">
            <p className="text-sm text-gray-600">
              Halaman {currentPage} / {totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={currentPage === 1}
                onClick={() =>
                  setPage((prev) =>
                    Math.max(1, prev - 1)
                  )
                }
                className="rounded-lg bg-[#2b6cb0] p-2"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage((prev) =>
                    Math.min(totalPages, prev + 1)
                  )
                }
                className="rounded-lg bg-[#2b6cb0] p-2"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* DETAIL MODAL */}
        <Dialog
          open={detailOpen}
          handler={closeDetail}
          size="lg"
          className="overflow-hidden rounded-2xl"
        >
          <DialogHeader className="flex items-center justify-between border-b">
            <div>
              <Typography
                variant="h5"
                className="font-bold text-[#2b6cb0]"
              >
                Detail Verifikasi KYC
              </Typography>

              <p className="mt-1 text-xs font-normal text-gray-500">
                Informasi dan dokumen Partner
              </p>
            </div>

            <button
              type="button"
              onClick={closeDetail}
              disabled={saving || verifyOpen}
              aria-label="Tutup detail"
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </DialogHeader>

          <DialogBody className="max-h-[70vh] space-y-6 overflow-y-auto p-5">
            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="mb-4 text-xs font-bold uppercase text-blue-600">
                Informasi Partner
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailField
                  label="Nama"
                  value={getPartnerName(selectedPartner)}
                />

                <DetailField
                  label="Email"
                  value={getPartnerEmail(selectedPartner)}
                />

                <DetailField
                  label="Telepon"
                  value={getPartnerPhone(selectedPartner)}
                />

                <DetailField
                  label="Perusahaan"
                  value={selectedPartner?.companyName}
                />

                <DetailField
                  label="Tipe Partner"
                  value={selectedPartner?.type}
                />

                <DetailField
                  label="Status Partner"
                  value={statusLabel(
                    selectedPartner?.status
                  )}
                />
              </div>
            </div>

            {/* DOCUMENTS */}
            <div>
              <Typography
                variant="h6"
                className="mb-4 font-bold text-gray-800"
              >
                Dokumen KYC
              </Typography>

              {getDocuments(selectedPartner).length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300" />

                  <p className="mt-3 text-sm text-gray-500">
                    Dokumen belum tersedia pada respons API.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {getDocuments(selectedPartner).map(
                    (document, index) => {
                      const status = normalizeStatus(
                        document.status
                      );

                      return (
                        <div
                          key={document.id ?? index}
                          className="space-y-4 rounded-2xl border border-gray-200 p-4"
                        >
                          <DocumentPreview
                            document={document}
                            index={index}
                          />

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailField
                              label="ID Dokumen"
                              value={document.id}
                            />

                            <DetailField
                              label="Tanggal Upload"
                              value={formatDate(
                                document.createdAt
                              )}
                            />

                            <DetailField
                              label="Tipe Dokumen"
                              value={getDocumentName(
                                document,
                                index
                              )}
                            />

                            <DetailField
                              label="Tanggal Verifikasi"
                              value={formatDate(
                                document.verifiedAt
                              )}
                            />
                          </div>

                          {document.rejectionReason && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                              <p className="font-semibold">
                                Alasan Penolakan
                              </p>

                              <p className="mt-1">
                                {document.rejectionReason}
                              </p>
                            </div>
                          )}

                          {status === "PENDING" && (
                            <div className="flex flex-wrap gap-3 border-t pt-4">
                              <Button
                                size="sm"
                                disabled={
                                  saving ||
                                  !VERIFY_ENABLED ||
                                  !document.id
                                }
                                onClick={() =>
                                  openVerify(
                                    document,
                                    "APPROVED"
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg bg-green-500 normal-case"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                                Approve
                              </Button>

                              <Button
                                size="sm"
                                disabled={
                                  saving ||
                                  !VERIFY_ENABLED ||
                                  !document.id
                                }
                                onClick={() =>
                                  openVerify(
                                    document,
                                    "REJECTED"
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg bg-red-500 normal-case"
                              >
                                <XCircleIcon className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}

                          {["APPROVED", "VERIFIED"].includes(
                            status
                          ) && (
                            <p className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                              Dokumen sudah disetujui.
                            </p>
                          )}

                          {status === "REJECTED" && (
                            <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                              Dokumen ditolak.
                            </p>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter className="border-t">
            <Button
              variant="outlined"
              color="blue-gray"
              disabled={saving || verifyOpen}
              onClick={closeDetail}
            >
              Tutup
            </Button>
          </DialogFooter>
        </Dialog>

        {/* VERIFICATION CONFIRMATION */}
        <Dialog
          open={verifyOpen}
          handler={() => {
            if (!saving) {
              setVerifyOpen(false);
            }
          }}
          size="sm"
          className="rounded-2xl"
        >
          <DialogHeader className="text-[#2b6cb0]">
            {verifyAction === "APPROVED"
              ? "Setujui Dokumen"
              : "Tolak Dokumen"}
          </DialogHeader>

          <form onSubmit={submitVerification}>
            <DialogBody className="space-y-4">
              <p className="text-sm text-gray-600">
                {verifyAction === "APPROVED"
                  ? "Apakah dokumen sudah diperiksa dan layak disetujui?"
                  : "Masukkan alasan penolakan dokumen."}
              </p>

              <DetailField
                label="Dokumen"
                value={
                  selectedDocument?.documentType || "-"
                }
              />

              {verifyAction === "REJECTED" && (
                <textarea
                  rows={4}
                  required
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  placeholder="Contoh: Gambar tidak terbaca..."
                  className="w-full resize-none rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-red-500"
                />
              )}
            </DialogBody>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="text"
                disabled={saving}
                onClick={() => setVerifyOpen(false)}
              >
                Batal
              </Button>

              <Button
                type="submit"
                disabled={saving || !VERIFY_ENABLED}
                className={
                  verifyAction === "APPROVED"
                    ? "bg-green-500"
                    : "bg-red-500"
                }
              >
                {saving ? "Memproses..." : "Konfirmasi"}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      </div>
    </MainLayout>
  );
}
