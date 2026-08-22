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
  Avatar,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Chip,
  Spinner,
} from "@material-tailwind/react";

import {
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  TruckIcon,
  ClockIcon,
  XCircleIcon,
  BanknotesIcon,
  CubeIcon,
  MapPinIcon,
  PhoneIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";

import api from "../../utils/api";

// ============================================================
// ENDPOINT SESUAI SWAGGER BACKEND
// ============================================================

const ORDERS_ENDPOINT = "/orders";

const getAcceptEndpoint = (id) =>
  `/orders/${id}/accept`;

const getShipEndpoint = (id) =>
  `/orders/${id}/ship`;

const getDeliverEndpoint = (id) =>
  `/orders/${id}/deliver`;

const getCancelEndpoint = (id) =>
  `/orders/${id}/cancel`;

// ============================================================
// FORMAT RUPIAH
// ============================================================

const formatRupiah = (value) => {
  return Number(value || 0).toLocaleString(
    "id-ID"
  );
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ============================================================
// NORMALIZE RESPONSE ORDER
// ============================================================

const extractOrders = (responseData) => {
  if (!responseData) {
    return [];
  }

  // RESPONSE LANGSUNG ARRAY
  if (Array.isArray(responseData)) {
    return responseData;
  }

  // {
  //   data: [...]
  // }
  if (Array.isArray(responseData.data)) {
    return responseData.data;
  }

  // {
  //   data: {
  //      data: [...]
  //   }
  // }
  if (
    Array.isArray(
      responseData?.data?.data
    )
  ) {
    return responseData.data.data;
  }

  // {
  //   orders: [...]
  // }
  if (
    Array.isArray(
      responseData.orders
    )
  ) {
    return responseData.orders;
  }

  // {
  //   data: {
  //      orders: [...]
  //   }
  // }
  if (
    Array.isArray(
      responseData?.data?.orders
    )
  ) {
    return responseData.data.orders;
  }

  return [];
};

// ============================================================
// STATUS CONFIG
// ============================================================

const STATUS_CONFIG = {
  PENDING: {
    label: "Menunggu Pembayaran",
    chip:
      "bg-amber-50 text-amber-700 border border-amber-100",
    icon: ClockIcon,
  },

  PAID: {
    label: "Sudah Dibayar",
    chip:
      "bg-emerald-50 text-emerald-700 border border-emerald-100",
    icon: BanknotesIcon,
  },

  PROCESSING: {
    label: "Diproses",
    chip:
      "bg-blue-50 text-blue-700 border border-blue-100",
    icon: CubeIcon,
  },

  SHIPPED: {
    label: "Dikirim",
    chip:
      "bg-indigo-50 text-indigo-700 border border-indigo-100",
    icon: TruckIcon,
  },

  DELIVERED: {
    label: "Sudah Sampai",
    chip:
      "bg-cyan-50 text-cyan-700 border border-cyan-100",
    icon: CheckCircleIcon,
  },

  COMPLETED: {
    label: "Selesai",
    chip:
      "bg-green-50 text-green-700 border border-green-100",
    icon: CheckCircleIcon,
  },

  CANCELLED: {
    label: "Dibatalkan",
    chip:
      "bg-red-50 text-red-700 border border-red-100",
    icon: XCircleIcon,
  },
};

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({ status }) => {
  const normalized = String(
    status || ""
  ).toUpperCase();

  const config =
    STATUS_CONFIG[normalized] || {
      label: normalized || "-",
      chip:
        "bg-gray-50 text-gray-600 border border-gray-100",
      icon: ClockIcon,
    };

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        whitespace-nowrap
        rounded-full
        px-3
        py-1.5
        text-[10px]
        font-black
        uppercase
        ${config.chip}
      `}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
};

// ============================================================
// PESANAN MASUK
// ============================================================

const PesananMasuk = () => {
  // ==========================================================
  // DATA
  // ==========================================================

  const [
    dataPesanan,
    setDataPesanan,
  ] = useState([]);

  // ==========================================================
  // LOADING
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState("");

  // ==========================================================
  // STATUS FILTER
  // ==========================================================

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  // ==========================================================
  // PAGINATION FRONTEND
  // ==========================================================

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const itemsPerPage = 10;

  // ==========================================================
  // GET ORDERS
  // ==========================================================

  const fetchOrders =
    useCallback(async () => {
      try {
        setLoading(true);

        console.log(
          "GET ORDERS:",
          ORDERS_ENDPOINT
        );

        // ====================================================
        // JANGAN KIRIM PARAM DULU
        // SUPAYA TIDAK TERKENA VALIDATOR QUERY BACKEND
        // ====================================================

        const response =
          await api.get(
            ORDERS_ENDPOINT
          );

        console.log(
          "ORDERS RESPONSE:",
          response.data
        );

        const orders =
          extractOrders(
            response.data
          );

        setDataPesanan(
          orders
        );
      } catch (error) {
        console.error(
          "GET ORDERS ERROR:",
          error
        );

        console.error(
          "STATUS:",
          error.response?.status
        );

        console.error(
          "MESSAGE:",
          error.response?.data?.message
        );

        console.error(
          "CODE:",
          error.response?.data?.code
        );

        console.error(
          "DATA:",
          error.response?.data
        );

        setDataPesanan([]);

        toast.error(
          error.response?.data?.message ||
            "Gagal memuat data pesanan."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  // ==========================================================
  // LOAD
  // ==========================================================

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ==========================================================
  // RESET PAGE
  // ==========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
  ]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    async () => {
      try {
        setRefreshing(true);

        await fetchOrders();

        toast.success(
          "Data pesanan diperbarui."
        );
      } finally {
        setRefreshing(false);
      }
    };

  // ==========================================================
  // EXECUTE ACTION
  // ==========================================================

  const executeOrderAction =
    async ({
      order,
      action,
      endpoint,
      successMessage,
      confirmMessage,
    }) => {
      if (
        confirmMessage &&
        !window.confirm(
          confirmMessage
        )
      ) {
        return;
      }

      try {
        setActionLoading(
          `${order.id}-${action}`
        );

        console.log(
          "ORDER ACTION:",
          action
        );

        console.log(
          "ENDPOINT:",
          endpoint
        );

        // ====================================================
        // SWAGGER MENGGUNAKAN POST
        // ====================================================

        const response =
          await api.post(
            endpoint
          );

        console.log(
          "ORDER ACTION RESPONSE:",
          response.data
        );

        toast.success(
          successMessage
        );

        await fetchOrders();
      } catch (error) {
        console.error(
          `ORDER ${action} ERROR:`,
          error
        );

        console.error(
          "STATUS:",
          error.response?.status
        );

        console.error(
          "MESSAGE:",
          error.response?.data?.message
        );

        console.error(
          "CODE:",
          error.response?.data?.code
        );

        console.error(
          "DATA:",
          error.response?.data
        );

        toast.error(
          error.response?.data?.message ||
            "Gagal memperbarui pesanan."
        );
      } finally {
        setActionLoading(null);
      }
    };

  // ==========================================================
  // PAID -> PROCESSING
  // ==========================================================

  const handleAccept = (order) => {
    executeOrderAction({
      order,

      action: "accept",

      endpoint:
        getAcceptEndpoint(
          order.id
        ),

      successMessage:
        "Pesanan diterima dan mulai diproses.",

      confirmMessage:
        `Terima pesanan #${order.id}?`,
    });
  };

  // ==========================================================
  // PROCESSING -> SHIPPED
  // ==========================================================

  const handleShip = (order) => {
    executeOrderAction({
      order,

      action: "ship",

      endpoint:
        getShipEndpoint(
          order.id
        ),

      successMessage:
        "Pesanan ditandai sudah dikirim.",

      confirmMessage:
        `Tandai pesanan #${order.id} sebagai sudah dikirim?`,
    });
  };

  // ==========================================================
  // SHIPPED -> DELIVERED
  // ==========================================================

  const handleDeliver = (
    order
  ) => {
    executeOrderAction({
      order,

      action: "deliver",

      endpoint:
        getDeliverEndpoint(
          order.id
        ),

      successMessage:
        "Pesanan ditandai sudah sampai.",

      confirmMessage:
        `Pastikan pesanan #${order.id} sudah sampai kepada pembeli.`,
    });
  };

  // ==========================================================
  // CANCEL
  // ==========================================================

  const handleCancel = (
    order
  ) => {
    executeOrderAction({
      order,

      action: "cancel",

      endpoint:
        getCancelEndpoint(
          order.id
        ),

      successMessage:
        "Pesanan berhasil dibatalkan.",

      confirmMessage:
        `Yakin ingin membatalkan pesanan #${order.id}?`,
    });
  };

  // ==========================================================
  // NET AMOUNT
  // ==========================================================

  const getNetAmount = (
    order
  ) => {
    if (
      order.netAmount !==
        undefined &&
      order.netAmount !==
        null
    ) {
      return Number(
        order.netAmount
      );
    }

    return (
      Number(
        order.totalAmount ||
          0
      ) -
      Number(
        order.discountAmount ||
          0
      )
    );
  };

  // ==========================================================
  // CUSTOMER NAME
  // ==========================================================

  const getCustomerName = (
    order
  ) => {
    return (
      order.shippingRecipient ||
      order.user?.name ||
      order.user?.username ||
      order.user?.email ||
      "Pembeli"
    );
  };

  // ==========================================================
  // CUSTOMER PHONE
  // ==========================================================

  const getCustomerPhone = (
    order
  ) => {
    return (
      order.shippingPhone ||
      order.user?.phoneNumber ||
      "-"
    );
  };

  // ==========================================================
  // PRODUCT IMAGE
  // ==========================================================

  const getProductImage = (
    order
  ) => {
    return (
      order.orderItems?.[0]
        ?.product?.imageUrl ||
      null
    );
  };

  // ==========================================================
  // PRODUCT SUMMARY
  // ==========================================================

  const getProductSummary = (
    order
  ) => {
    const items =
      order.orderItems || [];

    if (
      items.length === 0
    ) {
      return "-";
    }

    const first =
      items[0];

    const name =
      first.product?.name ||
      `Produk #${first.productId}`;

    const quantity =
      first.quantity || 0;

    if (
      items.length === 1
    ) {
      return `${name} × ${quantity}`;
    }

    return `${name} × ${quantity} +${items.length - 1} produk lainnya`;
  };

  // ==========================================================
  // FILTER DATA
  // ==========================================================

  const filteredOrders =
    useMemo(() => {
      let result = [
        ...dataPesanan,
      ];

      // ======================================================
      // SEARCH CLIENT SIDE
      // ======================================================

      const keyword =
        search
          .trim()
          .toLowerCase();

      if (keyword) {
        result =
          result.filter(
            (order) => {
              const orderId =
                String(
                  order.id ||
                    ""
                ).toLowerCase();

              const customer =
                String(
                  getCustomerName(
                    order
                  )
                ).toLowerCase();

              const phone =
                String(
                  getCustomerPhone(
                    order
                  )
                ).toLowerCase();

              const recipient =
                String(
                  order.shippingRecipient ||
                    ""
                ).toLowerCase();

              const address =
                String(
                  order.shippingAddress ||
                    ""
                ).toLowerCase();

              const products =
                (
                  order.orderItems ||
                  []
                )
                  .map(
                    (item) =>
                      item.product
                        ?.name ||
                      ""
                  )
                  .join(" ")
                  .toLowerCase();

              return (
                orderId.includes(
                  keyword
                ) ||
                customer.includes(
                  keyword
                ) ||
                phone.includes(
                  keyword
                ) ||
                recipient.includes(
                  keyword
                ) ||
                address.includes(
                  keyword
                ) ||
                products.includes(
                  keyword
                )
              );
            }
          );
      }

      // ======================================================
      // STATUS FILTER
      // ======================================================

      if (statusFilter) {
        result =
          result.filter(
            (order) =>
              String(
                order.status ||
                  ""
              ).toUpperCase() ===
              statusFilter
          );
      }

      // ======================================================
      // URUTKAN TERBARU
      // ======================================================

      result.sort(
        (a, b) => {
          return (
            new Date(
              b.createdAt ||
                0
            ) -
            new Date(
              a.createdAt ||
                0
            )
          );
        }
      );

      return result;
    }, [
      dataPesanan,
      search,
      statusFilter,
    ]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalItems =
    filteredOrders.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems /
          itemsPerPage
      )
    );

  const paginatedOrders =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        itemsPerPage;

      return filteredOrders.slice(
        start,
        start +
          itemsPerPage
      );
    }, [
      filteredOrders,
      currentPage,
    ]);

  // ==========================================================
  // COUNTER STATUS
  // ==========================================================

  const getStatusCount = (
    status
  ) => {
    return dataPesanan.filter(
      (order) =>
        String(
          order.status || ""
        ).toUpperCase() ===
        status
    ).length;
  };

  // ==========================================================
  // ACTION MENU
  // ==========================================================

  const renderAction = (
    order
  ) => {
    const status =
      String(
        order.status || ""
      ).toUpperCase();

    // ========================================================
    // PENDING
    // ========================================================

    if (
      status === "PENDING"
    ) {
      return (
        <div className="space-y-1">
          <Typography
            className="
              text-[10px]
              font-bold
              text-amber-600
            "
          >
            Menunggu pembayaran
          </Typography>

          <Button
            size="sm"
            variant="text"
            color="red"
            disabled={
              actionLoading !==
              null
            }
            onClick={() =>
              handleCancel(
                order
              )
            }
            className="
              p-0
              text-[10px]
              normal-case
            "
          >
            Batalkan
          </Button>
        </div>
      );
    }

    // ========================================================
    // DELIVERED
    // ========================================================

    if (
      status === "DELIVERED"
    ) {
      return (
        <div
          className="
            max-w-[150px]
          "
        >
          <Typography
            className="
              text-[10px]
              font-black
              leading-relaxed
              text-cyan-700
            "
          >
            Menunggu konfirmasi pembeli
          </Typography>
        </div>
      );
    }

    // ========================================================
    // COMPLETED
    // ========================================================

    if (
      status === "COMPLETED"
    ) {
      return (
        <Typography
          className="
            text-[10px]
            font-black
            text-green-600
          "
        >
          Pesanan selesai
        </Typography>
      );
    }

    // ========================================================
    // CANCELLED
    // ========================================================

    if (
      status === "CANCELLED"
    ) {
      return (
        <Typography
          className="
            text-[10px]
            font-black
            text-red-500
          "
        >
          Pesanan dibatalkan
        </Typography>
      );
    }

    // ========================================================
    // PAID / PROCESSING / SHIPPED
    // ========================================================

    return (
      <Menu placement="bottom-end">
        <MenuHandler>
          <Button
            size="sm"
            variant="outlined"
            disabled={
              actionLoading !==
              null
            }
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border-blue-100
              px-4
              py-2
              text-[10px]
              font-black
              text-blue-700
              normal-case
            "
          >
            {actionLoading?.startsWith(
              `${order.id}-`
            )
              ? "Memproses..."
              : "Aksi"}

            <ChevronDownIcon className="h-3 w-3" />
          </Button>
        </MenuHandler>

        <MenuList
          className="
            min-w-[220px]
            rounded-2xl
            p-2
            shadow-xl
          "
        >
          {/* ===============================================
              PAID -> PROCESSING
          =============================================== */}

          {status ===
            "PAID" && (
            <>
              <MenuItem
                onClick={() =>
                  handleAccept(
                    order
                  )
                }
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  py-3
                  font-bold
                  text-blue-700
                "
              >
                <CheckCircleIcon className="h-5 w-5" />

                Terima Pesanan
              </MenuItem>

              <MenuItem
                onClick={() =>
                  handleCancel(
                    order
                  )
                }
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  py-3
                  font-bold
                  text-red-600
                "
              >
                <XCircleIcon className="h-5 w-5" />

                Batalkan Pesanan
              </MenuItem>
            </>
          )}

          {/* ===============================================
              PROCESSING -> SHIPPED
          =============================================== */}

          {status ===
            "PROCESSING" && (
            <>
              <MenuItem
                onClick={() =>
                  handleShip(
                    order
                  )
                }
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  py-3
                  font-bold
                  text-indigo-700
                "
              >
                <TruckIcon className="h-5 w-5" />

                Kirim Pesanan
              </MenuItem>

              <MenuItem
                onClick={() =>
                  handleCancel(
                    order
                  )
                }
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  py-3
                  font-bold
                  text-red-600
                "
              >
                <XCircleIcon className="h-5 w-5" />

                Batalkan Pesanan
              </MenuItem>
            </>
          )}

          {/* ===============================================
              SHIPPED -> DELIVERED
          =============================================== */}

          {status ===
            "SHIPPED" && (
            <MenuItem
              onClick={() =>
                handleDeliver(
                  order
                )
              }
              className="
                flex
                items-center
                gap-3
                rounded-xl
                py-3
                font-bold
                text-cyan-700
              "
            >
              <CheckCircleIcon className="h-5 w-5" />

              Tandai Sudah Sampai
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    );
  };

  // ==========================================================
  // FILTER OPTIONS
  // ==========================================================

  const filterOptions = [
    {
      label: "Semua",
      value: "",
      count:
        dataPesanan.length,
    },

    {
      label: "Menunggu Bayar",
      value: "PENDING",
      count:
        getStatusCount(
          "PENDING"
        ),
    },

    {
      label: "Dibayar",
      value: "PAID",
      count:
        getStatusCount(
          "PAID"
        ),
    },

    {
      label: "Diproses",
      value:
        "PROCESSING",
      count:
        getStatusCount(
          "PROCESSING"
        ),
    },

    {
      label: "Dikirim",
      value: "SHIPPED",
      count:
        getStatusCount(
          "SHIPPED"
        ),
    },

    {
      label: "Sampai",
      value:
        "DELIVERED",
      count:
        getStatusCount(
          "DELIVERED"
        ),
    },

    {
      label: "Selesai",
      value:
        "COMPLETED",
      count:
        getStatusCount(
          "COMPLETED"
        ),
    },

    {
      label: "Dibatalkan",
      value:
        "CANCELLED",
      count:
        getStatusCount(
          "CANCELLED"
        ),
    },
  ];

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <MainLayout>
      <div
        className="
          min-h-screen
          space-y-6
          bg-gray-50/50
          p-4
          md:p-6
        "
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <Typography
              variant="h3"
              className="
                flex
                items-center
                gap-3
                font-black
                tracking-tight
                text-blue-900
              "
            >
              <ArchiveBoxIcon className="h-8 w-8 text-blue-600" />

              Pesanan Masuk
            </Typography>

            <Typography
              className="
                mt-2
                text-sm
                text-gray-500
              "
            >
              Kelola pesanan marketplace
              yang masuk ke Store Anda.
            </Typography>
          </div>

          <div
            className="
              flex
              w-full
              flex-col
              gap-3
              sm:flex-row
              lg:w-auto
            "
          >
            <div className="w-full sm:w-80">
              <Input
                label="Cari pesanan, pelanggan, produk..."
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                icon={
                  <MagnifyingGlassIcon className="h-5 w-5 text-blue-500" />
                }
                className="bg-white"
              />
            </div>

            <Button
              variant="outlined"
              onClick={
                handleRefresh
              }
              disabled={
                refreshing
              }
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border-blue-100
                normal-case
              "
            >
              <ArrowPathIcon
                className={`
                  h-4
                  w-4
                  ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                `}
              />

              Refresh
            </Button>
          </div>
        </div>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
            md:grid-cols-4
          "
        >
          <SummaryCard
            title="Pesanan Dibayar"
            value={getStatusCount(
              "PAID"
            )}
            icon={
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            }
            iconBg="bg-green-50"
          />

          <SummaryCard
            title="Sedang Diproses"
            value={getStatusCount(
              "PROCESSING"
            )}
            icon={
              <CubeIcon className="h-6 w-6 text-blue-600" />
            }
            iconBg="bg-blue-50"
          />

          <SummaryCard
            title="Sedang Dikirim"
            value={getStatusCount(
              "SHIPPED"
            )}
            icon={
              <TruckIcon className="h-6 w-6 text-indigo-600" />
            }
            iconBg="bg-indigo-50"
          />

          <SummaryCard
            title="Selesai"
            value={getStatusCount(
              "COMPLETED"
            )}
            icon={
              <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
            }
            iconBg="bg-emerald-50"
          />
        </div>

        {/* ==================================================
            FLOW INFO
        ================================================== */}

        <Card
          className="
            rounded-2xl
            border
            border-blue-100
            bg-blue-50/50
            p-4
            shadow-none
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            <FlowItem
              text="Sudah Dibayar"
              icon={
                <BanknotesIcon className="h-4 w-4" />
              }
            />

            <span className="text-gray-300">
              →
            </span>

            <FlowItem
              text="Diproses"
              icon={
                <CubeIcon className="h-4 w-4" />
              }
            />

            <span className="text-gray-300">
              →
            </span>

            <FlowItem
              text="Dikirim"
              icon={
                <TruckIcon className="h-4 w-4" />
              }
            />

            <span className="text-gray-300">
              →
            </span>

            <FlowItem
              text="Sampai"
              icon={
                <CheckCircleIcon className="h-4 w-4" />
              }
            />

            <span className="text-gray-300">
              →
            </span>

            <FlowItem
              text="Konfirmasi User"
              icon={
                <UserIcon className="h-4 w-4" />
              }
            />

            <span className="text-gray-300">
              →
            </span>

            <FlowItem
              text="Selesai"
              icon={
                <CheckCircleIcon className="h-4 w-4" />
              }
            />
          </div>
        </Card>

        {/* ==================================================
            FILTER
        ================================================== */}

        <div
          className="
            flex
            gap-2
            overflow-x-auto
            pb-2
          "
        >
          {filterOptions.map(
            (filter) => (
              <Button
                key={
                  filter.value ||
                  "ALL"
                }
                size="sm"
                variant={
                  statusFilter ===
                  filter.value
                    ? "filled"
                    : "outlined"
                }
                color={
                  statusFilter ===
                  filter.value
                    ? "blue"
                    : "blue-gray"
                }
                onClick={() =>
                  setStatusFilter(
                    filter.value
                  )
                }
                className="
                  flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-full
                  normal-case
                "
              >
                {filter.label}

                <span
                  className={`
                    rounded-full
                    px-2
                    py-0.5
                    text-[9px]
                    ${
                      statusFilter ===
                      filter.value
                        ? "bg-white/20"
                        : "bg-gray-100"
                    }
                  `}
                >
                  {filter.count}
                </span>
              </Button>
            )
          )}
        </div>

        {/* ==================================================
            TABLE
        ================================================== */}

        <Card
          className="
            overflow-hidden
            rounded-[2rem]
            border
            border-gray-100
            bg-white
            shadow-xl
            shadow-gray-200/40
          "
        >
          {/* ================================================
              TABLE HEADER
          ================================================ */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-gray-100
              p-5
            "
          >
            <div>
              <Typography
                className="
                  font-black
                  text-blue-900
                "
              >
                Daftar Pesanan
              </Typography>

              <Typography
                className="
                  mt-1
                  text-[10px]
                  text-gray-400
                "
              >
                {totalItems} pesanan
                ditemukan
              </Typography>
            </div>

            {statusFilter && (
              <StatusBadge
                status={
                  statusFilter
                }
              />
            )}
          </div>

          {/* ================================================
              TABLE CONTENT
          ================================================ */}

          <div className="overflow-x-auto">
            <table
              className="
                w-full
                min-w-[1300px]
                table-auto
                text-left
              "
            >
              <thead>
                <tr
                  className="
                    border-b
                    border-blue-100
                    bg-blue-50/50
                  "
                >
                  {[
                    "Pesanan",
                    "Pelanggan",
                    "Produk",
                    "Pembayaran",
                    "Total",
                    "Alamat",
                    "Status",
                    "Aksi",
                  ].map(
                    (head) => (
                      <th
                        key={head}
                        className="
                          p-5
                          text-[10px]
                          font-black
                          uppercase
                          tracking-widest
                          text-blue-500
                        "
                      >
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {/* ===========================================
                    LOADING
                =========================================== */}

                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-16 text-center"
                    >
                      <Spinner className="mx-auto h-9 w-9 text-blue-600" />

                      <Typography
                        className="
                          mt-3
                          text-sm
                          font-medium
                          text-gray-400
                        "
                      >
                        Memuat pesanan...
                      </Typography>
                    </td>
                  </tr>
                ) : paginatedOrders.length >
                  0 ? (
                  paginatedOrders.map(
                    (order) => {
                      const productImage =
                        getProductImage(
                          order
                        );

                      return (
                        <tr
                          key={order.id}
                          className="
                            border-b
                            border-gray-50
                            transition-colors
                            hover:bg-blue-50/20
                          "
                        >
                          {/* =================================
                              ORDER
                          ================================= */}

                          <td className="p-5">
                            <Typography
                              className="
                                text-sm
                                font-black
                                text-blue-700
                              "
                            >
                              #{order.id}
                            </Typography>

                            <Typography
                              className="
                                mt-1
                                whitespace-nowrap
                                text-[10px]
                                text-gray-400
                              "
                            >
                              {formatDate(
                                order.createdAt
                              )}
                            </Typography>
                          </td>

                          {/* =================================
                              CUSTOMER
                          ================================= */}

                          <td className="p-5">
                            <Typography
                              className="
                                max-w-[180px]
                                truncate
                                text-sm
                                font-black
                                text-gray-800
                              "
                            >
                              {getCustomerName(
                                order
                              )}
                            </Typography>

                            <div
                              className="
                                mt-1
                                flex
                                items-center
                                gap-1
                              "
                            >
                              <PhoneIcon className="h-3 w-3 text-gray-400" />

                              <Typography
                                className="
                                  text-[10px]
                                  text-gray-500
                                "
                              >
                                {getCustomerPhone(
                                  order
                                )}
                              </Typography>
                            </div>
                          </td>

                          {/* =================================
                              PRODUCT
                          ================================= */}

                          <td className="p-5">
                            <div
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >
                              {productImage ? (
                                <Avatar
                                  src={
                                    productImage
                                  }
                                  variant="rounded"
                                  size="sm"
                                  className="object-cover"
                                />
                              ) : (
                                <div
                                  className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-blue-50
                                  "
                                >
                                  <ShoppingBagIcon className="h-5 w-5 text-blue-500" />
                                </div>
                              )}

                              <div>
                                <Typography
                                  className="
                                    max-w-[220px]
                                    text-xs
                                    font-black
                                    text-gray-700
                                  "
                                >
                                  {getProductSummary(
                                    order
                                  )}
                                </Typography>

                                <Typography
                                  className="
                                    mt-1
                                    text-[9px]
                                    text-gray-400
                                  "
                                >
                                  {order
                                    .orderItems
                                    ?.length ||
                                    0}{" "}
                                  jenis produk
                                </Typography>
                              </div>
                            </div>
                          </td>

                          {/* =================================
                              PAYMENT
                          ================================= */}

                          <td className="p-5">
                            <Typography
                              className="
                                text-xs
                                font-black
                                uppercase
                                text-gray-700
                              "
                            >
                              {order.paymentMethod ||
                                "WALLET"}
                            </Typography>

                            {Number(
                              order.discountAmount ||
                                0
                            ) > 0 && (
                              <Typography
                                className="
                                  mt-1
                                  text-[9px]
                                  font-bold
                                  text-green-600
                                "
                              >
                                Diskon Rp{" "}
                                {formatRupiah(
                                  order.discountAmount
                                )}
                              </Typography>
                            )}

                            {Number(
                              order.shippingFee ||
                                0
                            ) > 0 && (
                              <Typography
                                className="
                                  mt-1
                                  text-[9px]
                                  text-gray-400
                                "
                              >
                                Ongkir Rp{" "}
                                {formatRupiah(
                                  order.shippingFee
                                )}
                              </Typography>
                            )}
                          </td>

                          {/* =================================
                              TOTAL
                          ================================= */}

                          <td className="p-5">
                            <Typography
                              className="
                                whitespace-nowrap
                                text-sm
                                font-black
                                text-blue-900
                              "
                            >
                              Rp{" "}
                              {formatRupiah(
                                getNetAmount(
                                  order
                                )
                              )}
                            </Typography>
                          </td>

                          {/* =================================
                              ADDRESS
                          ================================= */}

                          <td className="p-5">
                            {order.shippingAddress ? (
                              <div
                                className="
                                  flex
                                  max-w-[250px]
                                  items-start
                                  gap-2
                                "
                              >
                                <MapPinIcon
                                  className="
                                    mt-0.5
                                    h-4
                                    w-4
                                    shrink-0
                                    text-blue-500
                                  "
                                />

                                <Typography
                                  className="
                                    line-clamp-3
                                    text-[10px]
                                    leading-relaxed
                                    text-gray-500
                                  "
                                >
                                  {order.shippingAddress}
                                </Typography>
                              </div>
                            ) : (
                              <Typography
                                className="
                                  text-xs
                                  text-gray-400
                                "
                              >
                                -
                              </Typography>
                            )}
                          </td>

                          {/* =================================
                              STATUS
                          ================================= */}

                          <td className="p-5">
                            <StatusBadge
                              status={
                                order.status
                              }
                            />
                          </td>

                          {/* =================================
                              ACTION
                          ================================= */}

                          <td className="p-5">
                            {renderAction(
                              order
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="
                        p-16
                        text-center
                      "
                    >
                      <ArchiveBoxIcon
                        className="
                          mx-auto
                          h-12
                          w-12
                          text-gray-300
                        "
                      />

                      <Typography
                        className="
                          mt-3
                          text-sm
                          font-black
                          text-gray-400
                        "
                      >
                        Tidak ada pesanan.
                      </Typography>

                      <Typography
                        className="
                          mt-1
                          text-[10px]
                          text-gray-400
                        "
                      >
                        Pesanan pembeli akan
                        tampil di halaman ini.
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ==================================================
              PAGINATION
          ================================================== */}

          {!loading &&
            totalItems > 0 && (
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  border-t
                  border-gray-100
                  p-5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <Typography
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  Menampilkan{" "}
                  <strong className="text-blue-700">
                    {Math.min(
                      (currentPage -
                        1) *
                        itemsPerPage +
                        1,
                      totalItems
                    )}
                  </strong>
                  {" - "}
                  <strong className="text-blue-700">
                    {Math.min(
                      currentPage *
                        itemsPerPage,
                      totalItems
                    )}
                  </strong>
                  {" dari "}
                  <strong className="text-blue-700">
                    {totalItems}
                  </strong>{" "}
                  pesanan
                </Typography>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <Button
                    size="sm"
                    variant="outlined"
                    disabled={
                      currentPage <=
                      1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (previous) =>
                          Math.max(
                            1,
                            previous -
                              1
                          )
                      )
                    }
                    className="
                      rounded-xl
                      normal-case
                    "
                  >
                    Sebelumnya
                  </Button>

                  <Typography
                    className="
                      min-w-[70px]
                      text-center
                      text-xs
                      font-black
                      text-blue-700
                    "
                  >
                    {currentPage} /{" "}
                    {totalPages}
                  </Typography>

                  <Button
                    size="sm"
                    variant="outlined"
                    disabled={
                      currentPage >=
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (previous) =>
                          Math.min(
                            totalPages,
                            previous +
                              1
                          )
                      )
                    }
                    className="
                      rounded-xl
                      normal-case
                    "
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            )}
        </Card>
      </div>
    </MainLayout>
  );
};

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({
  title,
  value,
  icon,
  iconBg,
}) => {
  return (
    <Card
      className="
        rounded-2xl
        border
        border-gray-100
        p-4
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <div>
          <Typography
            className="
              text-[9px]
              font-black
              uppercase
              tracking-wider
              text-gray-400
            "
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            className="
              mt-1
              font-black
              text-blue-900
            "
          >
            {value}
          </Typography>
        </div>

        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            ${iconBg}
          `}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

// ============================================================
// FLOW ITEM
// ============================================================

const FlowItem = ({
  text,
  icon,
}) => {
  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      <div
        className="
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          bg-white
          text-blue-600
          shadow-sm
        "
      >
        {icon}
      </div>

      <Typography
        className="
          whitespace-nowrap
          text-[9px]
          font-black
          uppercase
          text-blue-900
        "
      >
        {text}
      </Typography>
    </div>
  );
};

export default PesananMasuk;