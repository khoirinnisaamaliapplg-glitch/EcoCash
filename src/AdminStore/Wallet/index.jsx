import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Card,
  Typography,
  Button,
  Chip,
} from "@material-tailwind/react";

import {
  WalletIcon,
  BanknotesIcon,
  ArrowPathIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import {
  toast,
} from "react-toastify";

import MainLayout from "../MainLayout";
import api from "../../utils/api";

// ============================================================
// API ENDPOINT
// ============================================================

const STORE_WALLET_ENDPOINT =
  "/wallets/store";

const STORE_WALLET_TRANSACTIONS_ENDPOINT =
  "/wallets/store/transactions";

// ============================================================
// FORMAT RUPIAH
// ============================================================

const formatCurrency = (value) => {
  const number =
    Number(value || 0);

  return number.toLocaleString(
    "id-ID"
  );
};

// ============================================================
// FORMAT TANGGAL
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
// GET TOKEN HEADER
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

  /*
    Kemungkinan:

    {
      success: true,
      data: {
        id,
        storeId,
        ...
      }
    }
  */

  if (
    responseData?.data &&
    !Array.isArray(
      responseData.data
    )
  ) {
    // Jika controller membungkus lagi:
    // data: { wallet: {...} }

    if (
      responseData.data
        ?.wallet
    ) {
      return responseData
        .data.wallet;
    }

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
  let data = [];
  let meta = {};

  if (!responseData) {
    return {
      data,
      meta,
    };
  }

  /*
    Bentuk 1:

    {
      success: true,
      data: [...],
      meta: {...}
    }
  */

  if (
    Array.isArray(
      responseData.data
    )
  ) {
    data =
      responseData.data;

    meta =
      responseData.meta ||
      {};

    return {
      data,
      meta,
    };
  }

  /*
    Bentuk 2:

    {
      success: true,
      data: {
        data: [...],
        meta: {...}
      }
    }
  */

  if (
    Array.isArray(
      responseData?.data
        ?.data
    )
  ) {
    data =
      responseData.data
        .data;

    meta =
      responseData.data
        .meta ||
      responseData.meta ||
      {};

    return {
      data,
      meta,
    };
  }

  /*
    Bentuk 3:

    {
      data: {
        transactions: [...]
      }
    }
  */

  if (
    Array.isArray(
      responseData?.data
        ?.transactions
    )
  ) {
    data =
      responseData.data
        .transactions;

    meta =
      responseData.data
        .meta ||
      responseData.meta ||
      {};

    return {
      data,
      meta,
    };
  }

  /*
    Bentuk langsung array
  */

  if (
    Array.isArray(
      responseData
    )
  ) {
    data =
      responseData;
  }

  return {
    data,
    meta,
  };
};

// ============================================================
// TRANSACTION IN / OUT
// ============================================================

const isIncomingTransaction = (
  type,
  amount
) => {
  const normalized =
    String(
      type || ""
    ).toUpperCase();

  const incomingTypes = [
    "CREDIT",
    "INCOME",
    "DEPOSIT",
    "REFUND",
    "TOPUP",
    "SALE",
    "PAYMENT_RECEIVED",
  ];

  const outgoingTypes = [
    "DEBIT",
    "WITHDRAW",
    "WITHDRAWAL",
    "PAYMENT",
    "PURCHASE",
    "TRANSFER_OUT",
  ];

  if (
    incomingTypes.some(
      (item) =>
        normalized.includes(
          item
        )
    )
  ) {
    return true;
  }

  if (
    outgoingTypes.some(
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
// TRANSACTION CHIP COLOR
// ============================================================

const getTransactionColor = (
  type,
  amount
) => {
  return isIncomingTransaction(
    type,
    amount
  )
    ? "green"
    : "red";
};

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({
  title,
  value,
  description,
  icon,
  iconBackground,
}) => {
  return (
    <Card
      className="
        rounded-2xl
        border
        border-gray-100
        p-5
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
              text-[10px]
              font-black
              uppercase
              tracking-wider
              text-gray-400
            "
          >
            {title}
          </Typography>

          <Typography
            variant="h5"
            className="
              mt-1
              font-black
              text-blue-900
            "
          >
            {value}
          </Typography>

          {description && (
            <Typography
              className="
                mt-1
                text-[10px]
                text-gray-400
              "
            >
              {description}
            </Typography>
          )}
        </div>

        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${iconBackground}
          `}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

// ============================================================
// COMPONENT
// ============================================================

const StoreWalletManagement = () => {
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
    loadingWallet,
    setLoadingWallet,
  ] = useState(true);

  const [
    loadingTransactions,
    setLoadingTransactions,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [
    page,
    setPage,
  ] = useState(1);

  const [limit] =
    useState(10);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  // ==========================================================
  // GET STORE WALLET
  // ==========================================================

  const fetchWallet =
    useCallback(
      async (
        showError = true
      ) => {
        try {
          setLoadingWallet(
            true
          );

          console.log(
            "GET STORE WALLET:",
            STORE_WALLET_ENDPOINT
          );

          const response =
            await api.get(
              STORE_WALLET_ENDPOINT,
              {
                headers:
                  getHeaders(),
              }
            );

          console.log(
            "STORE WALLET RESPONSE:",
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
            "GET STORE WALLET ERROR:",
            error
          );

          console.error(
            "STATUS:",
            error.response
              ?.status
          );

          console.error(
            "MESSAGE:",
            error.response
              ?.data?.message
          );

          console.error(
            "CODE:",
            error.response
              ?.data?.code
          );

          console.error(
            "DATA:",
            error.response
              ?.data
          );

          setWallet(
            null
          );

          if (showError) {
            if (
              error.response
                ?.status ===
              404
            ) {
              toast.error(
                error.response
                  ?.data
                  ?.message ||
                  "Store atau Store Wallet belum ditemukan."
              );
            } else if (
              error.response
                ?.status ===
              403
            ) {
              toast.error(
                "Anda tidak memiliki akses ke Store Wallet."
              );
            } else {
              toast.error(
                error.response
                  ?.data
                  ?.message ||
                  "Gagal memuat Store Wallet."
              );
            }
          }

          return false;
        } finally {
          setLoadingWallet(
            false
          );
        }
      },
      []
    );

  // ==========================================================
  // GET TRANSACTIONS
  // ==========================================================

  const fetchTransactions =
    useCallback(
      async (
        showError = true
      ) => {
        try {
          setLoadingTransactions(
            true
          );

          console.log(
            "GET STORE WALLET TRANSACTIONS:",
            STORE_WALLET_TRANSACTIONS_ENDPOINT
          );

          const response =
            await api.get(
              STORE_WALLET_TRANSACTIONS_ENDPOINT,
              {
                headers:
                  getHeaders(),

                params: {
                  page,
                  limit,
                  sortBy:
                    "createdAt",
                  order:
                    "desc",
                },
              }
            );

          console.log(
            "STORE WALLET TRANSACTION RESPONSE:",
            response.data
          );

          const result =
            extractTransactions(
              response.data
            );

          setTransactions(
            result.data
          );

          const meta =
            result.meta ||
            {};

          const totalData =
            Number(
              meta.total ??
                result.data
                  .length ??
                0
            );

          const pages =
            Number(
              meta.totalPages ??
                Math.ceil(
                  totalData /
                    limit
                ) ??
                1
            );

          setTotal(
            totalData
          );

          setTotalPages(
            Math.max(
              1,
              pages || 1
            )
          );

          return true;
        } catch (error) {
          console.error(
            "GET STORE TRANSACTIONS ERROR:",
            error
          );

          console.error(
            "STATUS:",
            error.response
              ?.status
          );

          console.error(
            "MESSAGE:",
            error.response
              ?.data?.message
          );

          console.error(
            "CODE:",
            error.response
              ?.data?.code
          );

          console.error(
            "DATA:",
            error.response
              ?.data
          );

          setTransactions(
            []
          );

          setTotal(0);
          setTotalPages(1);

          if (showError) {
            toast.error(
              error.response
                ?.data
                ?.message ||
                "Gagal memuat transaksi Store Wallet."
            );
          }

          return false;
        } finally {
          setLoadingTransactions(
            false
          );
        }
      },
      [
        page,
        limit,
      ]
    );

  // ==========================================================
  // LOAD WALLET ONCE
  // ==========================================================

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // ==========================================================
  // LOAD TRANSACTIONS WHEN PAGE CHANGES
  // ==========================================================

  useEffect(() => {
    fetchTransactions();
  }, [
    fetchTransactions,
  ]);

  // ==========================================================
  // FIX PAGE
  // ==========================================================

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

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    async () => {
      try {
        setRefreshing(
          true
        );

        const [
          walletSuccess,
          transactionSuccess,
        ] =
          await Promise.all([
            fetchWallet(
              false
            ),
            fetchTransactions(
              false
            ),
          ]);

        if (
          walletSuccess &&
          transactionSuccess
        ) {
          toast.success(
            "Store Wallet berhasil diperbarui."
          );
        } else {
          toast.warning(
            "Sebagian data Wallet gagal diperbarui."
          );
        }
      } finally {
        setRefreshing(
          false
        );
      }
    };

  // ==========================================================
  // MAIN LOADING
  // ==========================================================

  const initialLoading =
    loadingWallet &&
    !wallet;

  if (
    initialLoading
  ) {
    return (
      <MainLayout>
        <div
          className="
            flex
            h-[70vh]
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
            Memuat Store Wallet...
          </Typography>
        </div>
      </MainLayout>
    );
  }

  // ==========================================================
  // WALLET NOT FOUND
  // ==========================================================

  if (
    !wallet &&
    !loadingWallet
  ) {
    return (
      <MainLayout>
        <div
          className="
            flex
            min-h-[70vh]
            items-center
            justify-center
            p-4
          "
        >
          <Card
            className="
              w-full
              max-w-lg
              rounded-[28px]
              border
              border-red-100
              p-8
              text-center
              shadow-sm
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-red-50
              "
            >
              <WalletIcon
                className="
                  h-8
                  w-8
                  text-red-500
                "
              />
            </div>

            <Typography
              variant="h5"
              className="
                mt-5
                font-black
                text-blue-900
              "
            >
              Store Wallet Tidak Ditemukan
            </Typography>

            <Typography
              className="
                mt-2
                text-sm
                leading-relaxed
                text-gray-500
              "
            >
              Pastikan akun
              STORE_ADMIN sudah
              terhubung dengan Store
              dan Store tersebut sudah
              memiliki Wallet.
            </Typography>

            <Button
              onClick={() =>
                fetchWallet()
              }
              className="
                mx-auto
                mt-6
                flex
                items-center
                gap-2
                rounded-xl
                bg-blue-600
                normal-case
                shadow-none
              "
            >
              <ArrowPathIcon className="h-4 w-4" />

              Coba Lagi
            </Button>
          </Card>
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
          space-y-6
          p-4
          md:p-0
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
            md:flex-row
            md:items-end
            md:justify-between
          "
        >
          <div>
            <Typography
              variant="h4"
              className="
                font-bold
                text-[#2b6cb0]
              "
            >
              Store Wallet
            </Typography>

            <Typography
              className="
                text-sm
                text-gray-500
              "
            >
              Saldo dan riwayat
              transaksi wallet milik
              Store
            </Typography>
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
              w-fit
              items-center
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

            {refreshing
              ? "Memperbarui..."
              : "Refresh"}
          </Button>
        </div>

        {/* ==================================================
            WALLET HERO
        ================================================== */}

        <Card
          className="
            overflow-hidden
            rounded-[28px]
            bg-gradient-to-r
            from-[#2b6cb0]
            to-[#4299e1]
            p-7
            text-white
            shadow-lg
          "
        >
          <div
            className="
              flex
              flex-col
              gap-7
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            {/* LEFT */}

            <div>
              <div
                className="
                  mb-5
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/15
                  "
                >
                  <BuildingStorefrontIcon className="h-6 w-6" />
                </div>

                <div>
                  <Typography
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-widest
                      text-blue-100
                    "
                  >
                    Store
                  </Typography>

                  <Typography
                    variant="h5"
                    className="font-black"
                  >
                    {wallet?.storeName ||
                      "-"}
                  </Typography>
                </div>
              </div>

              <Typography
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-blue-100
                "
              >
                Saldo Saat Ini
              </Typography>

              <Typography
                variant="h2"
                className="
                  mt-1
                  font-black
                "
              >
                Rp{" "}
                {formatCurrency(
                  wallet?.balance
                )}
              </Typography>

              <Typography
                className="
                  mt-3
                  text-[10px]
                  text-blue-100
                "
              >
                Wallet ID:{" "}
                {wallet?.id ??
                  "-"}
                {" • "}
                Store ID:{" "}
                {wallet?.storeId ??
                  "-"}
              </Typography>
            </div>

            {/* RIGHT */}

            <div
              className="
                min-w-[220px]
                rounded-2xl
                border
                border-white/20
                bg-white/10
                p-6
                backdrop-blur
              "
            >
              <Typography
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wider
                  text-blue-100
                "
              >
                Total Transactions
              </Typography>

              <Typography
                variant="h3"
                className="
                  mt-2
                  font-black
                "
              >
                {wallet
                  ?.totalTransactions ??
                  0}
              </Typography>

              <Typography
                className="
                  mt-2
                  text-[10px]
                  text-blue-100
                "
              >
                Currency:{" "}
                {wallet?.currency ||
                  "IDR"}
              </Typography>
            </div>
          </div>
        </Card>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-3
          "
        >
          <SummaryCard
            title="Saldo Wallet"
            value={`Rp ${formatCurrency(
              wallet?.balance
            )}`}
            description="Saldo Store saat ini"
            icon={
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            }
            iconBackground="bg-green-50"
          />

          <SummaryCard
            title="Total Transaksi"
            value={
              wallet
                ?.totalTransactions ??
              0
            }
            description="Seluruh transaksi wallet"
            icon={
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            }
            iconBackground="bg-blue-50"
          />

          <SummaryCard
            title="Store"
            value={
              wallet?.storeName ||
              "-"
            }
            description={`Store ID: ${
              wallet?.storeId ??
              "-"
            }`}
            icon={
              <BuildingStorefrontIcon className="h-6 w-6 text-purple-600" />
            }
            iconBackground="bg-purple-50"
          />
        </div>

        {/* ==================================================
            TRANSACTION TABLE
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
          {/* TABLE HEADER */}

          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-blue-gray-50
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <Typography
                className="
                  font-black
                  text-blue-900
                "
              >
                Riwayat Transaksi
              </Typography>

              <Typography
                className="
                  text-[10px]
                  text-gray-400
                "
              >
                Seluruh transaksi
                Store Wallet
              </Typography>
            </div>

            <Chip
              value={`${total} transaksi`}
              variant="ghost"
              color="blue"
              className="
                w-fit
                text-[10px]
              "
            />
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table
              className="
                w-full
                min-w-[1050px]
                table-auto
                text-left
              "
            >
              <thead>
                <tr className="bg-[#e3f2fd]/50">
                  {[
                    "ID",
                    "Tipe",
                    "Jumlah",
                    "Saldo Sebelum",
                    "Saldo Sesudah",
                    "Deskripsi",
                    "Tanggal",
                  ].map(
                    (
                      header
                    ) => (
                      <th
                        key={
                          header
                        }
                        className="
                          border-b
                          border-blue-gray-50
                          p-5
                        "
                      >
                        <Typography
                          className="
                            text-[10px]
                            font-black
                            uppercase
                            tracking-wider
                            text-[#2b6cb0]
                          "
                        >
                          {
                            header
                          }
                        </Typography>
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {loadingTransactions ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="
                        p-12
                        text-center
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          items-center
                          gap-3
                        "
                      >
                        <div
                          className="
                            h-8
                            w-8
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
                            text-gray-400
                          "
                        >
                          Memuat transaksi...
                        </Typography>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length >
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
                            border-b
                            border-blue-gray-50/50
                            transition-colors
                            hover:bg-blue-50/20
                          "
                        >
                          {/* ID */}

                          <td className="p-5">
                            <Typography
                              className="
                                text-xs
                                font-bold
                                text-gray-600
                              "
                            >
                              #
                              {
                                transaction.id
                              }
                            </Typography>
                          </td>

                          {/* TYPE */}

                          <td className="p-5">
                            <div
                              className="
                                flex
                                items-center
                                gap-2
                              "
                            >
                              <div
                                className={`
                                  flex
                                  h-9
                                  w-9
                                  items-center
                                  justify-center
                                  rounded-lg

                                  ${
                                    incoming
                                      ? "bg-green-50"
                                      : "bg-red-50"
                                  }
                                `}
                              >
                                {incoming ? (
                                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                                )}
                              </div>

                              <Chip
                                value={
                                  transaction.type ||
                                  "-"
                                }
                                variant="ghost"
                                color={getTransactionColor(
                                  transaction.type,
                                  transaction.amount
                                )}
                                size="sm"
                                className="
                                  w-fit
                                  text-[9px]
                                "
                              />
                            </div>
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

                          {/* BEFORE */}

                          <td className="p-5">
                            <Typography
                              className="
                                text-xs
                                font-medium
                                text-gray-600
                              "
                            >
                              Rp{" "}
                              {formatCurrency(
                                transaction.balanceBefore
                              )}
                            </Typography>
                          </td>

                          {/* AFTER */}

                          <td className="p-5">
                            <Typography
                              className="
                                text-xs
                                font-black
                                text-blue-800
                              "
                            >
                              Rp{" "}
                              {formatCurrency(
                                transaction.balanceAfter
                              )}
                            </Typography>
                          </td>

                          {/* DESCRIPTION */}

                          <td className="p-5">
                            <Typography
                              className="
                                max-w-[260px]
                                text-xs
                                leading-relaxed
                                text-gray-500
                              "
                            >
                              {transaction.description ||
                                "-"}
                            </Typography>
                          </td>

                          {/* CREATED AT */}

                          <td className="p-5">
                            <Typography
                              className="
                                whitespace-nowrap
                                text-xs
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
                      colSpan={7}
                      className="
                        p-14
                        text-center
                      "
                    >
                      <WalletIcon
                        className="
                          mx-auto
                          mb-3
                          h-11
                          w-11
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
              className="
                text-xs
                font-medium
                text-gray-500
              "
            >
              Total{" "}
              <strong className="text-blue-700">
                {total}
              </strong>{" "}
              transaksi
            </Typography>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <Button
                variant="outlined"
                size="sm"
                disabled={
                  page <= 1 ||
                  loadingTransactions
                }
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
                className="
                  flex
                  items-center
                  gap-1
                  rounded-lg
                  border-blue-gray-100
                  normal-case
                "
              >
                <ChevronLeftIcon className="h-3 w-3" />

                Prev
              </Button>

              <div
                className="
                  min-w-[80px]
                  text-center
                "
              >
                <Typography
                  className="
                    text-xs
                    font-black
                    text-blue-700
                  "
                >
                  {page} /{" "}
                  {totalPages}
                </Typography>
              </div>

              <Button
                variant="outlined"
                size="sm"
                disabled={
                  page >=
                    totalPages ||
                  loadingTransactions
                }
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
                className="
                  flex
                  items-center
                  gap-1
                  rounded-lg
                  border-blue-gray-100
                  normal-case
                "
              >
                Next

                <ChevronRightIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>

        {/* ==================================================
            WALLET INFORMATION
        ================================================== */}

        <Card
          className="
            rounded-2xl
            border
            border-gray-100
            p-5
            shadow-sm
          "
        >
          <Typography
            className="
              mb-4
              font-black
              text-blue-900
            "
          >
            Informasi Wallet
          </Typography>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              text-sm
              md:grid-cols-2
              lg:grid-cols-4
            "
          >
            <div>
              <Typography
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  text-gray-400
                "
              >
                Wallet ID
              </Typography>

              <Typography
                className="
                  mt-1
                  font-black
                  text-gray-800
                "
              >
                {wallet?.id ??
                  "-"}
              </Typography>
            </div>

            <div>
              <Typography
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  text-gray-400
                "
              >
                Store ID
              </Typography>

              <Typography
                className="
                  mt-1
                  font-black
                  text-gray-800
                "
              >
                {wallet?.storeId ??
                  "-"}
              </Typography>
            </div>

            <div>
              <Typography
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  text-gray-400
                "
              >
                Dibuat
              </Typography>

              <Typography
                className="
                  mt-1
                  font-medium
                  text-gray-700
                "
              >
                {formatDate(
                  wallet?.createdAt
                )}
              </Typography>
            </div>

            <div>
              <Typography
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  text-gray-400
                "
              >
                Terakhir Update
              </Typography>

              <Typography
                className="
                  mt-1
                  font-medium
                  text-gray-700
                "
              >
                {formatDate(
                  wallet?.updatedAt
                )}
              </Typography>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StoreWalletManagement;