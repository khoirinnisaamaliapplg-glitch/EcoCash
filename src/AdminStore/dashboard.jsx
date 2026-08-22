import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import MainLayout from "./MainLayout";

import api from "../utils/api";

import {
  Card,
  Typography,
  Button,
  Chip,
} from "@material-tailwind/react";

import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  WalletIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingStorefrontIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// ============================================================
// API
// ============================================================

const STORE_WALLET_ENDPOINT =
  "/wallets/store";

const STORE_WALLET_TRANSACTIONS_ENDPOINT =
  "/wallets/store/transactions";

// ============================================================
// FORMAT CURRENCY
// ============================================================

const formatCurrency = (value) => {
  return Number(
    value || 0
  ).toLocaleString(
    "id-ID"
  );
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

// ============================================================
// TOKEN
// ============================================================

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

// ============================================================
// EXTRACT WALLET
// ============================================================

const extractWallet = (
  responseData
) => {
  if (!responseData) {
    return null;
  }

  if (
    responseData?.data &&
    !Array.isArray(
      responseData.data
    )
  ) {
    return responseData.data;
  }

  return responseData;
};

// ============================================================
// EXTRACT TRANSACTIONS
// ============================================================

const extractTransactions = (
  responseData
) => {
  if (!responseData) {
    return [];
  }

  // ==========================================================
  // RESPONSE:
  // {
  //   success: true,
  //   data: {
  //     data: [...],
  //     meta: {...}
  //   }
  // }
  // ==========================================================

  if (
    Array.isArray(
      responseData?.data
        ?.data
    )
  ) {
    return responseData.data
      .data;
  }

  // ==========================================================
  // RESPONSE:
  // {
  //   success: true,
  //   data: [...]
  // }
  // ==========================================================

  if (
    Array.isArray(
      responseData?.data
    )
  ) {
    return responseData.data;
  }

  if (
    Array.isArray(
      responseData
    )
  ) {
    return responseData;
  }

  return [];
};

// ============================================================
// TRANSACTION TYPE
// ============================================================

const isIncomingTransaction = (
  type,
  amount
) => {
  const normalized =
    String(
      type || ""
    ).toUpperCase();

  const incoming = [
    "CREDIT",
    "INCOME",
    "DEPOSIT",
    "TOPUP",
    "REFUND",
    "SALE",
    "PAYMENT_RECEIVED",
  ];

  const outgoing = [
    "DEBIT",
    "PAYMENT",
    "WITHDRAW",
    "WITHDRAWAL",
    "PURCHASE",
    "TRANSFER_OUT",
  ];

  if (
    incoming.some(
      (item) =>
        normalized.includes(
          item
        )
    )
  ) {
    return true;
  }

  if (
    outgoing.some(
      (item) =>
        normalized.includes(
          item
        )
    )
  ) {
    return false;
  }

  return Number(
    amount || 0
  ) >= 0;
};

// ============================================================
// DASHBOARD STORE
// ============================================================

const DashboardStore = () => {
  const navigate =
    useNavigate();

  // ==========================================================
  // WALLET
  // ==========================================================

  const [
    wallet,
    setWallet,
  ] = useState(null);

  // ==========================================================
  // TRANSACTIONS
  // ==========================================================

  const [
    transactions,
    setTransactions,
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

  // ==========================================================
  // GET STORE WALLET
  // ==========================================================

  const fetchWallet =
    useCallback(
      async () => {
        try {
          const response =
            await api.get(
              STORE_WALLET_ENDPOINT,
              {
                headers:
                  getHeaders(),
              }
            );

          console.log(
            "DASHBOARD STORE WALLET:",
            response.data
          );

          const result =
            extractWallet(
              response.data
            );

          setWallet(
            result
          );

          return true;
        } catch (error) {
          console.error(
            "DASHBOARD STORE WALLET ERROR:",
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

          setWallet(
            null
          );

          return false;
        }
      },
      []
    );

  // ==========================================================
  // GET RECENT TRANSACTIONS
  // ==========================================================

  const fetchTransactions =
    useCallback(
      async () => {
        try {
          const response =
            await api.get(
              STORE_WALLET_TRANSACTIONS_ENDPOINT,
              {
                headers:
                  getHeaders(),

                params: {
                  page: 1,
                  limit: 5,
                  sortBy:
                    "createdAt",
                  order:
                    "desc",
                },
              }
            );

          console.log(
            "DASHBOARD STORE TRANSACTIONS:",
            response.data
          );

          const result =
            extractTransactions(
              response.data
            );

          setTransactions(
            result
          );

          return true;
        } catch (error) {
          console.error(
            "DASHBOARD STORE TRANSACTION ERROR:",
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

          setTransactions(
            []
          );

          return false;
        }
      },
      []
    );

  // ==========================================================
  // FETCH DASHBOARD
  // ==========================================================

  const fetchDashboard =
    useCallback(
      async () => {
        try {
          setLoading(true);

          await Promise.all([
            fetchWallet(),
            fetchTransactions(),
          ]);
        } finally {
          setLoading(false);
        }
      },
      [
        fetchWallet,
        fetchTransactions,
      ]
    );

  // ==========================================================
  // INIT
  // ==========================================================

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    async () => {
      try {
        setRefreshing(
          true
        );

        await Promise.all([
          fetchWallet(),
          fetchTransactions(),
        ]);
      } finally {
        setRefreshing(
          false
        );
      }
    };

  // ==========================================================
  // STATS
  // ==========================================================

  const stats = [
    {
      title:
        "Saldo Store",

      value:
        `Rp ${formatCurrency(
          wallet?.balance
        )}`,

      unit:
        wallet?.currency ||
        "IDR",

      icon:
        WalletIcon,

      gradient:
        "from-blue-500 to-blue-700",

      iconBackground:
        "bg-blue-50",

      iconColor:
        "text-blue-600",

      action:
        () =>
          navigate(
            "/store/wallet"
          ),
    },

    {
      title:
        "Total Transaksi",

      value:
        wallet
          ?.totalTransactions ??
        0,

      unit:
        "Transaksi Wallet",

      icon:
        CreditCardIcon,

      gradient:
        "from-indigo-500 to-indigo-700",

      iconBackground:
        "bg-indigo-50",

      iconColor:
        "text-indigo-600",

      action:
        () =>
          navigate(
            "/store/wallet"
          ),
    },

    {
      title:
        "Store",

      value:
        wallet?.storeName ||
        "-",

      unit:
        `Store ID: ${
          wallet?.storeId ??
          "-"
        }`,

      icon:
        BuildingStorefrontIcon,

      gradient:
        "from-cyan-500 to-cyan-700",

      iconBackground:
        "bg-cyan-50",

      iconColor:
        "text-cyan-600",
    },
  ];

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <MainLayout>

        <div
          className="
            flex
            min-h-[70vh]
            flex-col
            items-center
            justify-center
            gap-3
          "
        >

          <div
            className="
              h-10
              w-10

              animate-spin

              rounded-full

              border-4
              border-blue-100
              border-t-blue-600
            "
          />

          <Typography
            className="
              text-sm
              font-medium
              text-gray-500
            "
          >
            Memuat Dashboard Store...
          </Typography>

        </div>

      </MainLayout>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <MainLayout>

      <div
        className="
          space-y-8
          animate-fade-in
        "
      >

        {/* ==================================================
            WELCOME BANNER
        ================================================== */}

        <div
          className="
            relative
            overflow-hidden

            rounded-[2.5rem]

            bg-blue-700

            p-8
            md:p-10

            shadow-xl
            shadow-blue-200/60
          "
        >

          {/* BACKGROUND */}

          <div
            className="
              absolute
              right-0
              top-0

              -mr-20
              -mt-20

              h-80
              w-80

              rounded-full

              bg-white/10

              blur-3xl
            "
          />

          <div
            className="
              absolute
              bottom-0
              left-1/2

              h-40
              w-40

              rounded-full

              bg-cyan-300/10

              blur-3xl
            "
          />

          {/* CONTENT */}

          <div
            className="
              relative
              z-10

              flex
              flex-col
              gap-7

              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div>

              <div
                className="
                  mb-3

                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center

                    rounded-xl

                    bg-white/15
                  "
                >
                  <BuildingStorefrontIcon
                    className="
                      h-6
                      w-6
                      text-white
                    "
                  />
                </div>

                <Typography
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-blue-100
                  "
                >
                  Store Admin
                </Typography>

              </div>

              <Typography
                variant="h2"
                className="
                  mb-2
                  font-black
                  tracking-tight
                  text-white
                "
              >
                Selamat Datang,
                Admin Store! 👋
              </Typography>

              <Typography
                className="
                  max-w-xl
                  font-medium
                  leading-relaxed
                  text-blue-100
                "
              >
                Kelola produk,
                pesanan, pengiriman,
                voucher dan pantau
                saldo Store Wallet
                EcoCash dari satu
                dashboard.
              </Typography>

            </div>

            {/* ACTION */}

            <div
              className="
                flex
                flex-col
                gap-3

                sm:flex-row
              "
            >

              <Button
                size="lg"
                color="white"
                onClick={() =>
                  navigate(
                    "/store/produk"
                  )
                }
                className="
                  flex
                  items-center
                  justify-center
                  gap-3

                  rounded-2xl

                  font-black
                  normal-case

                  text-blue-700

                  shadow-xl

                  transition-transform

                  hover:scale-105
                "
              >
                <PlusIcon
                  className="
                    h-5
                    w-5
                    stroke-[3]
                  "
                />

                Tambah Produk
              </Button>

              <Button
                size="lg"
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

                  rounded-2xl

                  border-white/30

                  text-white

                  normal-case

                  hover:bg-white/10
                "
              >
                <ArrowPathIcon
                  className={`
                    h-5
                    w-5

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

        </div>

        {/* ==================================================
            WALLET SUMMARY HERO
        ================================================== */}

        <Card
          className="
            overflow-hidden

            rounded-[2rem]

            border
            border-blue-100

            p-6

            shadow-lg
            shadow-blue-100/40
          "
        >

          <div
            className="
              flex
              flex-col
              gap-6

              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-4
              "
            >

              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center

                  rounded-2xl

                  bg-green-50
                "
              >
                <BanknotesIcon
                  className="
                    h-7
                    w-7
                    text-green-600
                  "
                />
              </div>

              <div>

                <Typography
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-widest
                    text-gray-400
                  "
                >
                  Store Wallet Balance
                </Typography>

                <Typography
                  variant="h3"
                  className="
                    mt-1
                    font-black
                    text-blue-900
                  "
                >
                  Rp{" "}
                  {formatCurrency(
                    wallet?.balance
                  )}
                </Typography>

                <Typography
                  className="
                    mt-1
                    text-xs
                    text-gray-400
                  "
                >
                  {wallet?.storeName ||
                    "Store"}

                  {" • "}

                  Wallet ID:{" "}

                  {wallet?.id ??
                    "-"}
                </Typography>

              </div>

            </div>

            <Button
              onClick={() =>
                navigate(
                  "/store/wallet"
                )
              }
              className="
                rounded-xl

                bg-[#66bb6a]

                normal-case
                shadow-none
              "
            >
              Lihat Store Wallet
            </Button>

          </div>

        </Card>

        {/* ==================================================
            STATS
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-6

            md:grid-cols-3
          "
        >

          {stats.map(
            (
              stat,
              index
            ) => {

              const Icon =
                stat.icon;

              return (

                <Card
                  key={
                    index
                  }
                  onClick={
                    stat.action
                  }
                  className={`
                    group

                    overflow-hidden

                    rounded-[2rem]

                    border
                    border-gray-100

                    bg-white

                    shadow-lg
                    shadow-gray-200/40

                    transition-all
                    duration-300

                    hover:-translate-y-1
                    hover:shadow-xl

                    ${
                      stat.action
                        ? "cursor-pointer"
                        : ""
                    }
                  `}
                >

                  <div className="p-6">

                    <div
                      className="
                        mb-7

                        flex
                        items-start
                        justify-between
                      "
                    >

                      <div
                        className={`
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center

                          rounded-2xl

                          ${stat.iconBackground}

                          transition-transform
                          duration-300

                          group-hover:scale-110
                        `}
                      >
                        <Icon
                          className={`
                            h-6
                            w-6

                            ${stat.iconColor}
                          `}
                        />
                      </div>

                      {index ===
                        0 && (

                        <Chip
                          value="IDR"
                          variant="ghost"
                          color="green"
                          className="
                            rounded-full
                            text-[9px]
                            font-black
                          "
                        />

                      )}

                    </div>

                    <Typography
                      className="
                        mb-2
                        text-[10px]
                        font-black
                        uppercase
                        tracking-widest
                        text-gray-400
                      "
                    >
                      {stat.title}
                    </Typography>

                    <Typography
                      variant="h4"
                      className="
                        break-words
                        font-black
                        tracking-tight
                        text-blue-900
                      "
                    >
                      {stat.value}
                    </Typography>

                    <Typography
                      className="
                        mt-2
                        text-xs
                        font-medium
                        text-gray-400
                      "
                    >
                      {stat.unit}
                    </Typography>

                  </div>

                  <div
                    className={`
                      h-1.5
                      w-full

                      bg-gradient-to-r

                      ${stat.gradient}

                      opacity-30
                    `}
                  />

                </Card>

              );
            }
          )}

        </div>

        {/* ==================================================
            QUICK MENU
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4

            sm:grid-cols-3
          "
        >

          <QuickMenu
            title="Produk Saya"
            description="Kelola produk marketplace"
            icon={
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            }
            onClick={() =>
              navigate(
                "/store/produk"
              )
            }
          />

          <QuickMenu
            title="Pesanan Masuk"
            description="Kelola pesanan pembeli"
            icon={
              <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600" />
            }
            onClick={() =>
              navigate(
                "/store/pesanan"
              )
            }
          />

          <QuickMenu
            title="Pengiriman"
            description="Pantau status pengiriman"
            icon={
              <TruckIcon className="h-6 w-6 text-cyan-600" />
            }
            onClick={() =>
              navigate(
                "/store/shipping"
              )
            }
          />

        </div>

        {/* ==================================================
            RECENT WALLET TRANSACTIONS
        ================================================== */}

        <Card
          className="
            overflow-hidden

            rounded-[2rem]

            border
            border-gray-100

            shadow-lg
            shadow-gray-200/40
          "
        >

          {/* HEADER */}

          <div
            className="
              flex
              flex-col
              gap-4

              border-b
              border-gray-50

              bg-white

              p-6

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-4
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center

                  rounded-2xl

                  bg-blue-50
                "
              >
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-700" />
              </div>

              <div>

                <Typography
                  variant="h5"
                  className="
                    font-black
                    text-blue-900
                  "
                >
                  Aktivitas Wallet Terbaru
                </Typography>

                <Typography
                  className="
                    text-[10px]
                    text-gray-400
                  "
                >
                  Lima transaksi
                  Store Wallet terbaru
                </Typography>

              </div>

            </div>

            <Button
              variant="text"
              size="sm"
              onClick={() =>
                navigate(
                  "/store/wallet"
                )
              }
              className="
                rounded-xl

                font-black
                normal-case

                text-blue-700

                hover:bg-blue-50
              "
            >
              Lihat Semua
            </Button>

          </div>

          {/* TABLE */}

          <div
            className="
              overflow-x-auto
              bg-white
            "
          >

            <table
              className="
                w-full
                min-w-[900px]
                table-auto
                text-left
              "
            >

              <thead>

                <tr
                  className="
                    bg-gray-50/70

                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.15em]
                    text-gray-400
                  "
                >
                  <th className="p-5">
                    Transaksi
                  </th>

                  <th className="p-5">
                    Tipe
                  </th>

                  <th className="p-5">
                    Jumlah
                  </th>

                  <th className="p-5">
                    Saldo
                  </th>

                  <th className="p-5">
                    Tanggal
                  </th>
                </tr>

              </thead>

              <tbody
                className="
                  divide-y
                  divide-gray-50
                "
              >

                {transactions.length >
                0 ? (

                  transactions.map(
                    (
                      transaction
                    ) => {

                      const incoming =
                        isIncomingTransaction(
                          transaction.type,
                          transaction.amount
                        );

                      return (

                        <tr
                          key={
                            transaction.id
                          }
                          className="
                            transition-colors
                            hover:bg-gray-50/50
                          "
                        >

                          {/* TRANSACTION */}

                          <td className="p-5">

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >

                              <div
                                className={`
                                  flex
                                  h-10
                                  w-10
                                  items-center
                                  justify-center

                                  rounded-xl

                                  ${
                                    incoming
                                      ? "bg-green-50"
                                      : "bg-red-50"
                                  }
                                `}
                              >

                                {incoming ? (

                                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />

                                ) : (

                                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />

                                )}

                              </div>

                              <div>

                                <Typography
                                  className="
                                    text-sm
                                    font-black
                                    text-gray-800
                                  "
                                >
                                  #
                                  {
                                    transaction.id
                                  }
                                </Typography>

                                <Typography
                                  className="
                                    max-w-[260px]
                                    truncate

                                    text-[10px]
                                    text-gray-400
                                  "
                                >
                                  {transaction.description ||
                                    "Wallet Transaction"}
                                </Typography>

                              </div>

                            </div>

                          </td>

                          {/* TYPE */}

                          <td className="p-5">

                            <Chip
                              size="sm"
                              variant="ghost"
                              value={
                                transaction.type ||
                                "-"
                              }
                              color={
                                incoming
                                  ? "green"
                                  : "red"
                              }
                              className="
                                w-fit
                                rounded-lg
                                text-[9px]
                                font-black
                              "
                            />

                          </td>

                          {/* AMOUNT */}

                          <td className="p-5">

                            <Typography
                              className={`
                                text-sm
                                font-black

                                ${
                                  incoming
                                    ? "text-green-600"
                                    : "text-red-500"
                                }
                              `}
                            >
                              {incoming
                                ? "+"
                                : "-"}

                              Rp{" "}

                              {formatCurrency(
                                Math.abs(
                                  Number(
                                    transaction.amount ||
                                      0
                                  )
                                )
                              )}
                            </Typography>

                          </td>

                          {/* BALANCE */}

                          <td className="p-5">

                            <Typography
                              className="
                                text-sm
                                font-black
                                text-blue-900
                              "
                            >
                              Rp{" "}

                              {formatCurrency(
                                transaction.balanceAfter
                              )}
                            </Typography>

                          </td>

                          {/* DATE */}

                          <td className="p-5">

                            <Typography
                              className="
                                whitespace-nowrap

                                text-xs
                                font-medium
                                text-gray-500
                              "
                            >
                              {formatDate(
                                transaction.createdAt
                              )}
                            </Typography>

                          </td>

                        </tr>

                      );
                    }
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={5}
                      className="
                        p-12
                        text-center
                      "
                    >

                      <WalletIcon
                        className="
                          mx-auto
                          mb-3

                          h-10
                          w-10

                          text-gray-300
                        "
                      />

                      <Typography
                        className="
                          text-sm
                          font-bold
                          text-gray-400
                        "
                      >
                        Belum ada transaksi
                        Store Wallet.
                      </Typography>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </Card>

      </div>

    </MainLayout>
  );
};

// ============================================================
// QUICK MENU
// ============================================================

const QuickMenu = ({
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <Card
      onClick={
        onClick
      }
      className="
        group
        cursor-pointer

        rounded-2xl

        border
        border-gray-100

        p-5

        shadow-sm

        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-blue-100
        hover:shadow-lg
        hover:shadow-blue-100/30
      "
    >

      <div
        className="
          flex
          items-center
          gap-4
        "
      >

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center

            rounded-xl

            bg-gray-50

            transition-transform

            group-hover:scale-110
          "
        >
          {icon}
        </div>

        <div>

          <Typography
            className="
              text-sm
              font-black
              text-blue-900
            "
          >
            {title}
          </Typography>

          <Typography
            className="
              mt-1
              text-[10px]
              text-gray-400
            "
          >
            {description}
          </Typography>

        </div>

      </div>

    </Card>
  );
};

export default DashboardStore;