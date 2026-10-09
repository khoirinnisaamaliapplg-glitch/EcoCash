
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import MainLayout from "../MainLayout";

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
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PaperClipIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";
import api from "../../utils/api";

// ======================================================
// API CHAT ADMIN
// ======================================================

const API = {
  rooms: "/chat/admin/rooms",
  history: (id) =>
    `/chat/history/${encodeURIComponent(id)}`,
  send: "/chat/admin/message",
  close: (id) =>
    `/chat/admin/room/${encodeURIComponent(id)}/close`,
};

// ======================================================
// TABLE HEADER
// ======================================================

const TABLE_HEAD = [
  { label: "Partner", value: "partner" },
  { label: "Pesan Terakhir", value: "message" },
  { label: "Status", value: "status" },
  { label: "Terakhir Update", value: "updatedAt" },
  { label: "Aksi", value: null },
];

// ======================================================
// AUTH HELPERS
// ======================================================

// Data login disimpan oleh login.jsx ke key userData.
const getLoggedInAdmin = () => {
  try {
    const saved = localStorage.getItem("userData");

    if (!saved) return null;

    const user = JSON.parse(saved);

    return user && typeof user === "object"
      ? user
      : null;
  } catch (error) {
    console.error("Gagal membaca userData:", error);
    return null;
  }
};

const isValidId = (id) => {
  if (id === null || id === undefined || id === "") {
    return false;
  }

  return (
    Number.isSafeInteger(Number(id)) &&
    Number(id) > 0
  );
};

const resolveAdminId = (user, propId) => {
  // Prioritaskan ID dari autentikasi yang tersedia.
  const candidates = [
    user?.id,
    user?.userId,
    user?.user_id,
    user?.sub,
    propId,
  ];

  return candidates.find(isValidId) ?? null;
};

// ======================================================
// DATA HELPERS
// ======================================================

const getPartnerName = (room) => {
  return (
    room?.partner?.name ||
    room?.partner?.businessName ||
    room?.partner?.companyName ||
    room?.partner?.user?.name ||
    `Partner #${room?.partnerId ?? "-"}`
  );
};

const getLastMessage = (room) => {
  return Array.isArray(room?.messages)
    ? room.messages[0]
    : null;
};

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

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getError = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Terjadi kesalahan pada sistem."
  );
};

// ======================================================
// PARTNER REPORTS
// ======================================================

const PartnerReports = ({ adminId: adminIdProp }) => {
  // ====================================================
  // USER LOGIN
  // ====================================================

  const loggedInAdmin = useMemo(
    () => getLoggedInAdmin(),
    []
  );

  const adminId = resolveAdminId(
    loggedInAdmin,
    adminIdProp
  );

  const adminRole = String(
    loggedInAdmin?.role ||
      localStorage.getItem("userRole") ||
      ""
  )
    .trim()
    .toUpperCase();

  // ====================================================
  // STATE
  // ====================================================

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [openChat, setOpenChat] = useState(false);
  const [selectedRoomId, setSelectedRoomId] =
    useState(null);

  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const [message, setMessage] = useState("");
  const [attachmentUrl, setAttachmentUrl] =
    useState("");
  const [showAttachment, setShowAttachment] =
    useState(false);

  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const bottomRef = useRef(null);
  const activeRoomRef = useRef(null);
  const historySeq = useRef(0);
  const busyRef = useRef(false);

  // ====================================================
  // SELECTED ROOM
  // ====================================================

  const selectedRoom = useMemo(() => {
    return (
      rooms.find(
        (room) =>
          String(room.id) === String(selectedRoomId)
      ) || null
    );
  }, [rooms, selectedRoomId]);

  // ====================================================
  // GET ALL ROOMS
  // ====================================================

  const fetchRooms = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);

        const response = await api.get(API.rooms);

        const result = response.data?.data;

        if (!Array.isArray(result)) {
          throw new Error(
            "Format data room tidak sesuai."
          );
        }

        setRooms(result);
      } catch (error) {
        console.error("GET CHAT ROOMS:", error);

        if (!silent) {
          toast.error(getError(error));
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    []
  );

  // ====================================================
  // GET CHAT HISTORY
  // ====================================================

  const fetchHistory = useCallback(
    async (roomId, silent = false) => {
      if (!roomId) return;

      const requestId = ++historySeq.current;

      try {
        if (!silent) setLoadingHistory(true);

        const response = await api.get(
          API.history(roomId)
        );

        const result = response.data?.data;

        if (!Array.isArray(result)) {
          throw new Error(
            "Format riwayat chat tidak sesuai."
          );
        }

        if (
          requestId === historySeq.current &&
          String(activeRoomRef.current) ===
            String(roomId)
        ) {
          setMessages(result);
        }
      } catch (error) {
        console.error("GET CHAT HISTORY:", error);

        if (!silent) {
          toast.error(getError(error));
        }
      } finally {
        if (requestId === historySeq.current) {
          setLoadingHistory(false);
        }
      }
    },
    []
  );

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // ====================================================
  // AUTO REFRESH 10 DETIK
  // ====================================================

  useEffect(() => {
    const timer = setInterval(() => {
      if (
        document.visibilityState !== "visible" ||
        busyRef.current
      ) {
        return;
      }

      fetchRooms(true);

      if (activeRoomRef.current) {
        fetchHistory(activeRoomRef.current, true);
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [fetchRooms, fetchHistory]);

  // ====================================================
  // FILTER & SORT
  // ====================================================

  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return [...rooms]
      .filter((room) => {
        const last = getLastMessage(room);

        const searchable = [
          getPartnerName(room),
          room.id,
          room.partnerId,
          last?.message,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          searchable.includes(keyword) &&
          (filter === "ALL" ||
            room.status === filter)
        );
      })
      .sort((a, b) => {
        let first = "";
        let second = "";

        if (sortBy === "partner") {
          first = getPartnerName(a);
          second = getPartnerName(b);
        } else if (sortBy === "message") {
          first = getLastMessage(a)?.message || "";
          second = getLastMessage(b)?.message || "";
        } else {
          first = a?.[sortBy] || "";
          second = b?.[sortBy] || "";
        }

        if (sortBy === "updatedAt") {
          const aTime =
            new Date(first).getTime() || 0;
          const bTime =
            new Date(second).getTime() || 0;

          return sortOrder === "asc"
            ? aTime - bTime
            : bTime - aTime;
        }

        const result = String(first).localeCompare(
          String(second),
          "id"
        );

        return sortOrder === "asc"
          ? result
          : -result;
      });
  }, [rooms, search, filter, sortBy, sortOrder]);

  // ====================================================
  // PAGINATION
  // ====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRooms.length / limit)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleRooms = filteredRooms.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const handleSort = (field) => {
    if (!field) return;

    if (sortBy === field) {
      setSortOrder((old) =>
        old === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }

    setPage(1);
  };

  // ====================================================
  // OPEN CHAT
  // ====================================================

  const openRoom = (room) => {
    activeRoomRef.current = room.id;
    historySeq.current += 1;

    setSelectedRoomId(room.id);
    setMessages([]);
    setMessage("");
    setAttachmentUrl("");
    setShowAttachment(false);
    setOpenChat(true);

    fetchHistory(room.id);
  };

  // ====================================================
  // CLOSE CHAT MODAL
  // ====================================================

  const closeModal = () => {
    if (busyRef.current) return;

    activeRoomRef.current = null;
    historySeq.current += 1;

    setOpenChat(false);
    setSelectedRoomId(null);
    setMessages([]);
    setMessage("");
    setAttachmentUrl("");
    setShowAttachment(false);
  };

  // ====================================================
  // SEND ADMIN MESSAGE
  // ====================================================

  const sendMessage = async (event) => {
    event?.preventDefault();

    if (busyRef.current || !selectedRoom) return;

    const text = message.trim();
    const attachment = attachmentUrl.trim();
    const roomId = selectedRoom.id;

    if (!text && !attachment) {
      toast.warning("Masukkan pesan terlebih dahulu.");
      return;
    }

    if (selectedRoom.status === "CLOSED") {
      toast.warning("Percakapan sudah ditutup.");
      return;
    }

    if (adminRole !== "SUPER_ADMIN") {
      toast.error(
        "Akun aktif bukan Super Admin."
      );
      return;
    }

    if (!isValidId(adminId)) {
      toast.error(
        "ID Admin tidak ditemukan di data login."
      );
      return;
    }

    try {
      busyRef.current = true;
      setSending(true);

      await api.post(API.send, {
        roomId,
        senderId: Number(adminId),
        message: text,
        attachmentUrl: attachment || null,
      });

      setMessage("");
      setAttachmentUrl("");
      setShowAttachment(false);

      await Promise.all([
        fetchHistory(roomId),
        fetchRooms(true),
      ]);

      toast.success("Balasan berhasil dikirim.");
    } catch (error) {
      console.error("SEND ADMIN MESSAGE:", error);
      toast.error(getError(error));
    } finally {
      busyRef.current = false;
      setSending(false);
    }
  };

  // ====================================================
  // CLOSE ROOM
  // ====================================================

  const closeRoom = async () => {
    if (
      busyRef.current ||
      !selectedRoom ||
      selectedRoom.status === "CLOSED"
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Yakin ingin menyelesaikan laporan ini?"
    );

    if (!confirmed) return;

    try {
      busyRef.current = true;
      setClosing(true);

      const roomId = selectedRoom.id;

      await api.patch(API.close(roomId));

      setRooms((previous) =>
        previous.map((room) =>
          String(room.id) === String(roomId)
            ? { ...room, status: "CLOSED" }
            : room
        )
      );

      toast.success(
        "Laporan berhasil diselesaikan."
      );

      await fetchRooms(true);
    } catch (error) {
      console.error("CLOSE CHAT:", error);
      toast.error(getError(error));
    } finally {
      busyRef.current = false;
      setClosing(false);
    }
  };

  // ====================================================
  // SCROLL CHAT
  // ====================================================

  useEffect(() => {
    if (openChat) {
      bottomRef.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    }
  }, [messages, openChat]);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-0">

        {/* HEADER */}
        <div>
          <Typography
            variant="h4"
            className="font-bold text-[#2b6cb0]"
          >
            Laporan Partner
          </Typography>

          <Typography className="text-sm text-gray-500">
            Kelola laporan masalah dan komunikasi
            EcoCash Partner
          </Typography>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex flex-wrap items-center gap-3">

            <Button
              onClick={() => fetchRooms()}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#66bb6a] normal-case shadow-none hover:shadow-none"
            >
              <ArrowPathIcon
                className={`h-5 w-5 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Refresh Data
            </Button>

            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="OPEN">Aktif</option>
              <option value="CLOSED">Selesai</option>
            </select>
          </div>

          <div className="w-full lg:w-80">
            <Input
              label="Cari Partner..."
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

        {/* TABLE */}
        <Card className="overflow-hidden rounded-2xl border border-green-50 shadow-sm">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] table-auto text-left">

              <thead>
                <tr className="bg-green-50">
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head.label}
                      onClick={() =>
                        handleSort(head.value)
                      }
                      className={`border-b p-5 ${
                        head.value
                          ? "cursor-pointer"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Typography className="text-xs font-bold uppercase text-[#2b6cb0]">
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

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-gray-500"
                    >
                      Memuat laporan Partner...
                    </td>
                  </tr>
                ) : visibleRooms.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-gray-400"
                    >
                      Belum ada laporan Partner
                    </td>
                  </tr>
                ) : (
                  visibleRooms.map((room) => {
                    const last = getLastMessage(room);

                    return (
                      <tr
                        key={room.id}
                        className="border-b transition-colors hover:bg-green-50/30"
                      >
                        {/* PARTNER */}
                        <td className="p-5">
                          <div className="flex items-start gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                              <BuildingOffice2Icon className="h-6 w-6 text-[#2b6cb0]" />
                            </div>

                            <div>
                              <Typography className="max-w-[230px] font-bold text-gray-800">
                                {getPartnerName(room)}
                              </Typography>

                              <p className="mt-1 text-xs text-gray-400">
                                Room ID: {room.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* MESSAGE */}
                        <td className="p-5">
                          <Typography className="max-w-[300px] truncate text-sm text-gray-600">
                            {last?.message ||
                              (last?.attachmentUrl
                                ? "Lampiran"
                                : "Belum ada pesan")}
                          </Typography>
                        </td>

                        {/* STATUS */}
                        <td className="p-5">
                          <Chip
                            value={room.status || "-"}
                            color={
                              room.status === "OPEN"
                                ? "green"
                                : "blue-gray"
                            }
                            className="w-fit text-xs font-bold"
                          />
                        </td>

                        {/* DATE */}
                        <td className="p-5 text-sm text-gray-700">
                          {formatDate(room.updatedAt)}
                        </td>

                        {/* ACTION */}
                        <td className="p-5">
                          <Button
                            size="sm"
                            onClick={() => openRoom(room)}
                            className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2.5 normal-case shadow-none"
                          >
                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                            Chat
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

            <Typography className="text-sm text-gray-600">
              Page {currentPage} / {totalPages}
              <span className="ml-2 text-gray-400">
                ({filteredRooms.length} laporan)
              </span>
            </Typography>

            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={currentPage === 1}
                onClick={() =>
                  setPage((old) =>
                    Math.max(1, old - 1)
                  )
                }
                className="rounded-lg bg-[#2b6cb0] p-2.5"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage((old) =>
                    Math.min(totalPages, old + 1)
                  )
                }
                className="rounded-lg bg-[#2b6cb0] p-2.5"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* CHAT MODAL */}
        <Dialog
          open={openChat}
          handler={closeModal}
          size="lg"
          className="overflow-hidden rounded-2xl"
        >

          {/* CHAT HEADER */}
          <DialogHeader className="flex items-center justify-between border-b">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-blue-50 p-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-[#2b6cb0]" />
              </div>

              <div>
                <Typography
                  variant="h5"
                  className="font-bold text-[#2b6cb0]"
                >
                  {getPartnerName(selectedRoom)}
                </Typography>

                <Typography className="text-xs font-normal text-gray-500">
                  Percakapan EcoCash Partner
                </Typography>
              </div>
            </div>

            <button
              type="button"
              onClick={closeModal}
              disabled={sending || closing}
              aria-label="Tutup chat"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </DialogHeader>

          {/* CHAT BODY */}
          <DialogBody className="p-0">
            <div className="flex h-[420px] flex-col">

              <div className="flex items-center justify-between border-b px-5 py-3">
                <Typography className="text-xs text-gray-500">
                  Room: {selectedRoom?.id || "-"}
                </Typography>

                <Chip
                  value={selectedRoom?.status || "-"}
                  color={
                    selectedRoom?.status === "OPEN"
                      ? "green"
                      : "blue-gray"
                  }
                  className="text-xs"
                />
              </div>

              {/* MESSAGES */}
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-gray-50 p-5">

                {loadingHistory ? (
                  <p className="py-10 text-center text-sm text-gray-400">
                    Memuat pesan...
                  </p>
                ) : messages.length === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-400">
                    Belum ada pesan.
                  </p>
                ) : (
                  messages.map((item) => {
                    const isAdmin =
                      item.senderType === "ADMIN";

                    return (
                      <div
                        key={item.id}
                        className={`flex ${
                          isAdmin
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                            isAdmin
                              ? "rounded-br-sm bg-[#2b6cb0] text-white"
                              : "rounded-bl-sm border bg-white text-gray-800"
                          }`}
                        >
                          <p className="mb-1 text-xs font-semibold">
                            {isAdmin
                              ? "Super Admin"
                              : "EcoCash Partner"}
                          </p>

                          {item.message && (
                            <p className="whitespace-pre-wrap break-words text-sm">
                              {item.message}
                            </p>
                          )}

                          {item.attachmentUrl && (
                            <a
                              href={item.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 flex items-center gap-1 break-all text-xs underline"
                            >
                              <PaperClipIcon className="h-4 w-4" />
                              Lihat Lampiran
                            </a>
                          )}

                          <p
                            className={`mt-2 text-right text-[10px] ${
                              isAdmin
                                ? "text-blue-100"
                                : "text-gray-400"
                            }`}
                          >
                            {formatTime(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={bottomRef} />
              </div>
            </div>
          </DialogBody>

          {/* CHAT FOOTER */}
          <DialogFooter className="block border-t p-4">

            {selectedRoom?.status === "CLOSED" ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
                <CheckCircleIcon className="h-5 w-5" />
                Laporan telah diselesaikan
              </div>
            ) : (
              <div className="w-full space-y-3">

                {showAttachment && (
                  <Input
                    type="url"
                    label="URL Lampiran"
                    value={attachmentUrl}
                    onChange={(e) =>
                      setAttachmentUrl(e.target.value)
                    }
                  />
                )}

                <form
                  onSubmit={sendMessage}
                  className="flex items-end gap-2"
                >

                  <button
                    type="button"
                    onClick={() =>
                      setShowAttachment((old) => !old)
                    }
                    title="Tambahkan URL lampiran"
                    className="rounded-lg p-3 text-gray-500 hover:bg-gray-100"
                  >
                    <PaperClipIcon className="h-5 w-5" />
                  </button>

                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) =>
                      setMessage(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Tulis balasan untuk Partner..."
                    className="min-w-0 flex-1 resize-none rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-blue-500"
                  />

                  <Button
                    type="submit"
                    disabled={
                      sending ||
                      !isValidId(adminId) ||
                      (!message.trim() &&
                        !attachmentUrl.trim())
                    }
                    className="rounded-xl bg-[#2b6cb0] p-3 shadow-none"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </Button>
                </form>

                {/* AUTH VALIDATION */}
                {!isValidId(adminId) && (
                  <p className="text-xs text-amber-700">
                    ID Admin tidak ditemukan dalam data
                    login. Periksa field ID pada JWT.
                  </p>
                )}

                {/* CLOSE ROOM */}
                <div className="flex justify-end">
                  <Button
                    onClick={closeRoom}
                    disabled={closing || sending}
                    className="flex items-center gap-2 rounded-xl bg-[#66bb6a] normal-case shadow-none"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    {closing
                      ? "Memproses..."
                      : "Tandai Selesai"}
                  </Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default PartnerReports;
