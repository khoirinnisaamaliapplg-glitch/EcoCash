import React, {
  useCallback,
  useEffect,
  useMemo,
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
  Chip,
  Spinner,
  Button,
} from "@material-tailwind/react";

import {
  HeartIcon,
  GiftIcon,
  UserGroupIcon,
  BanknotesIcon,
  CheckCircleIcon,
  BuildingLibraryIcon,
  IdentificationIcon,
  ChartBarIcon,
  ArrowPathIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ============================================================
// FORMAT RUPIAH
// ============================================================

const formatRupiah = (value) => {
  return Number(
    value || 0
  ).toLocaleString("id-ID");
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
// USER LOGIN
// ============================================================

const getLoggedInUser = () => {
  try {
    const rawUser =
      localStorage.getItem(
        "userData"
      );

    if (!rawUser) {
      return null;
    }

    return JSON.parse(
      rawUser
    );
  } catch (error) {
    console.error(
      "GAGAL MEMBACA USER:",
      error
    );

    return null;
  }
};

// ============================================================
// NORMALIZE FOUNDATION
// ============================================================

const extractFoundations = (
  responseData
) => {
  if (
    Array.isArray(
      responseData
    )
  ) {
    return responseData;
  }

  if (
    Array.isArray(
      responseData?.data
    )
  ) {
    return responseData.data;
  }

  if (
    Array.isArray(
      responseData?.data
        ?.foundations
    )
  ) {
    return responseData
      .data.foundations;
  }

  if (
    Array.isArray(
      responseData
        ?.foundations
    )
  ) {
    return responseData
      .foundations;
  }

  return [];
};

// ============================================================
// NORMALIZE CHARITIES
// ============================================================

const extractCharities = (
  responseData
) => {
  if (
    Array.isArray(
      responseData
    )
  ) {
    return responseData;
  }

  if (
    Array.isArray(
      responseData?.data
    )
  ) {
    return responseData.data;
  }

  if (
    Array.isArray(
      responseData?.data
        ?.charities
    )
  ) {
    return responseData
      .data.charities;
  }

  if (
    Array.isArray(
      responseData
        ?.charities
    )
  ) {
    return responseData
      .charities;
  }

  return [];
};

// ============================================================
// NORMALIZE DONATIONS
// ============================================================

const extractDonations = (
  responseData
) => {
  if (
    Array.isArray(
      responseData
    )
  ) {
    return responseData;
  }

  if (
    Array.isArray(
      responseData?.data
    )
  ) {
    return responseData.data;
  }

  if (
    Array.isArray(
      responseData?.data
        ?.data
    )
  ) {
    return responseData
      .data.data;
  }

  if (
    Array.isArray(
      responseData?.data
        ?.donations
    )
  ) {
    return responseData
      .data.donations;
  }

  if (
    Array.isArray(
      responseData
        ?.donations
    )
  ) {
    return responseData
      .donations;
  }

  return [];
};

// ============================================================
// GENERATE CHART 6 BULAN
// ============================================================

const buildChartData = (
  donations
) => {
  const now =
    new Date();

  const months = [];

  for (
    let index = 5;
    index >= 0;
    index--
  ) {
    const date =
      new Date(
        now.getFullYear(),
        now.getMonth() -
          index,
        1
      );

    months.push({
      year:
        date.getFullYear(),

      month:
        date.getMonth(),

      name:
        date.toLocaleDateString(
          "id-ID",
          {
            month:
              "short",
          }
        ),

      donation: 0,
    });
  }

  donations.forEach(
    (donation) => {
      if (
        !donation
          ?.createdAt
      ) {
        return;
      }

      const date =
        new Date(
          donation.createdAt
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return;
      }

      const target =
        months.find(
          (month) =>
            month.year ===
              date.getFullYear() &&
            month.month ===
              date.getMonth()
        );

      if (target) {
        target.donation +=
          Number(
            donation.amount ||
              0
          );
      }
    }
  );

  return months;
};

// ============================================================
// DASHBOARD
// ============================================================

const FoundationDashboard = () => {
  const navigate =
    useNavigate();

  // ==========================================================
  // USER
  // ==========================================================

  const userData =
    useMemo(
      () =>
        getLoggedInUser(),
      []
    );

  // ==========================================================
  // STATE
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
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    foundation,
    setFoundation,
  ] = useState(null);

  const [
    charities,
    setCharities,
  ] = useState([]);

  const [
    donations,
    setDonations,
  ] = useState([]);

  // ==========================================================
  // ADMIN NAME
  // ==========================================================

  const adminName =
    userData?.name ||
    userData?.username ||
    userData?.email ||
    "Foundation Admin";

  // ==========================================================
  // GET FOUNDATION
  // ==========================================================

  const fetchFoundation =
    useCallback(
      async () => {
        const response =
          await api.get(
            "/foundations",
            {
              headers:
                getHeaders(),
            }
          );

        console.log(
          "DASHBOARD FOUNDATION:",
          response.data
        );

        const data =
          extractFoundations(
            response.data
          );

        setFoundation(
          data[0] ||
            null
        );
      },
      []
    );

  // ==========================================================
  // GET CHARITIES
  // ==========================================================

  const fetchCharities =
    useCallback(
      async () => {
        const response =
          await api.get(
            "/charities",
            {
              headers:
                getHeaders(),

              params: {
                page: 1,
                limit: 100,
                sortBy:
                  "createdAt",
                order:
                  "desc",
              },
            }
          );

        console.log(
          "DASHBOARD CHARITIES:",
          response.data
        );

        setCharities(
          extractCharities(
            response.data
          )
        );
      },
      []
    );

  // ==========================================================
  // GET DONATIONS
  // ==========================================================

  const fetchDonations =
    useCallback(
      async () => {
        try {
          const response =
            await api.get(
              "/donations",
              {
                headers:
                  getHeaders(),

                params: {
                  page: 1,
                  limit: 100,
                  sortBy:
                    "createdAt",
                  order:
                    "desc",
                },
              }
            );

          console.log(
            "DASHBOARD DONATIONS:",
            response.data
          );

          setDonations(
            extractDonations(
              response.data
            )
          );
        } catch (error) {
          console.error(
            "GET DONATIONS DASHBOARD ERROR:",
            error
          );

          // Charity tetap dapat ditampilkan
          // walaupun endpoint donation gagal.

          setDonations([]);
        }
      },
      []
    );

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const loadDashboard =
    useCallback(
      async () => {
        try {
          setErrorMessage("");

          await Promise.all([
            fetchFoundation(),
            fetchCharities(),
            fetchDonations(),
          ]);
        } catch (error) {
          console.error(
            "FOUNDATION DASHBOARD ERROR:",
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

          setErrorMessage(
            error.response
              ?.data?.message ||
              "Gagal mengambil data Dashboard Foundation."
          );
        }
      },
      [
        fetchFoundation,
        fetchCharities,
        fetchDonations,
      ]
    );

  // ==========================================================
  // INIT
  // ==========================================================

  useEffect(() => {
    const init =
      async () => {
        try {
          setLoading(true);

          await loadDashboard();
        } finally {
          setLoading(
            false
          );
        }
      };

    init();
  }, [loadDashboard]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    async () => {
      try {
        setRefreshing(
          true
        );

        await loadDashboard();
      } finally {
        setRefreshing(
          false
        );
      }
    };

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary =
    useMemo(() => {
      // ======================================================
      // TOTAL PROGRAM
      // ======================================================

      const totalPrograms =
        charities.length;

      // ======================================================
      // ACTIVE PROGRAM
      // ======================================================

      const activePrograms =
        charities.filter(
          (charity) =>
            charity.isActive !==
              false &&
            String(
              charity.status ||
                "ACTIVE"
            ).toUpperCase() ===
              "ACTIVE"
        ).length;

      // ======================================================
      // TOTAL TARGET
      // ======================================================

      const totalTarget =
        charities.reduce(
          (
            total,
            charity
          ) =>
            total +
            Number(
              charity.targetAmount ||
                0
            ),
          0
        );

      // ======================================================
      // TOTAL COLLECTED
      // ======================================================

      const totalCollected =
        charities.reduce(
          (
            total,
            charity
          ) =>
            total +
            Number(
              charity.collectedAmount ||
                0
            ),
          0
        );

      // ======================================================
      // TOTAL DONATION
      // ======================================================

      const totalDonation =
        donations.reduce(
          (
            total,
            donation
          ) =>
            total +
            Number(
              donation.amount ||
                0
            ),
          0
        );

      // ======================================================
      // UNIQUE DONORS
      // ======================================================

      const donorIds =
        new Set();

      donations.forEach(
        (donation) => {
          const donorId =
            donation.userId ??
            donation.donorId ??
            donation.user
              ?.id ??
            donation.donor
              ?.id ??
            null;

          if (
            donorId !==
            null
          ) {
            donorIds.add(
              donorId
            );
          }
        }
      );

      const totalDonors =
        donorIds.size >
        0
          ? donorIds.size
          : donations.length;

      return {
        totalPrograms,
        activePrograms,
        totalDonors,
        totalDonation,
        totalTarget,
        totalCollected,
      };
    }, [
      charities,
      donations,
    ]);

  // ==========================================================
  // RECENT PROGRAM
  // ==========================================================

  const recentPrograms =
    useMemo(
      () =>
        [...charities]
          .sort(
            (
              first,
              second
            ) =>
              new Date(
                second.createdAt ||
                  0
              ) -
              new Date(
                first.createdAt ||
                  0
              )
          )
          .slice(
            0,
            5
          ),
      [charities]
    );

  // ==========================================================
  // RECENT DONATION
  // ==========================================================

  const recentDonations =
    useMemo(
      () =>
        [...donations]
          .sort(
            (
              first,
              second
            ) =>
              new Date(
                second.createdAt ||
                  0
              ) -
              new Date(
                first.createdAt ||
                  0
              )
          )
          .slice(
            0,
            5
          ),
      [donations]
    );

  // ==========================================================
  // CHART
  // ==========================================================

  const chartData =
    useMemo(
      () =>
        buildChartData(
          donations
        ),
      [donations]
    );

  // ==========================================================
  // FOUNDATION
  // ==========================================================

  const foundationName =
    foundation?.name ||
    "Foundation";

  const foundationId =
    foundation?.id ||
    "-";

  const foundationActive =
    foundation?.isActive !==
    false;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <MainLayout>
        <div
          className="
            flex
            h-96
            w-full
            flex-col
            items-center
            justify-center
            gap-4
          "
        >
          <Spinner className="h-12 w-12 text-blue-600" />

          <Typography
            className="
              font-black
              uppercase
              text-blue-900
            "
          >
            Memuat Dashboard
            Foundation...
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

      <div className="space-y-6 pb-10">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <section
          className="
            flex
            flex-col
            justify-between
            gap-4
            px-2

            md:flex-row
            md:items-end
          "
        >
          <div>

            <Typography
              variant="h4"
              className="
                font-black
                tracking-tight
                text-blue-900
              "
            >
              Dashboard Foundation
            </Typography>

            <Typography
              className="
                mt-1
                text-sm
                font-medium
                text-gray-500
              "
            >
              Monitoring Charity dan
              Donation Foundation
              EcoCash
            </Typography>

          </div>

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
              onClick={
                handleRefresh
              }
              disabled={
                refreshing
              }
              className="
                flex
                items-center
                gap-2
                rounded-xl
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

            <Button
              size="sm"
              onClick={() =>
                navigate(
                  "/FoundationAdmin/charities"
                )
              }
              className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-[#66bb6a]
                normal-case
                shadow-none
              "
            >
              <PlusIcon className="h-4 w-4" />

              Charity
            </Button>

          </div>

        </section>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {errorMessage && (

          <Card
            className="
              border
              border-amber-200
              bg-amber-50
              p-4
              shadow-none
            "
          >

            <Typography
              className="
                text-sm
                font-semibold
                text-amber-800
              "
            >
              {errorMessage}
            </Typography>

          </Card>

        )}

        {/* ====================================================
            FOUNDATION PROFILE
        ==================================================== */}

        <Card
          className="
            relative
            overflow-hidden

            rounded-[2rem]

            border
            border-blue-100

            bg-gradient-to-r
            from-blue-900
            via-blue-700
            to-blue-500

            p-7

            text-white

            shadow-xl
          "
        >

          <div
            className="
              absolute
              -right-12
              -top-12
              h-48
              w-48
              rounded-full
              bg-white/10
            "
          />

          <div
            className="
              relative
              z-10

              flex
              flex-col
              justify-between
              gap-6

              md:flex-row
              md:items-center
            "
          >

            <div
              className="
                flex
                items-center
                gap-5
              "
            >

              <div
                className="
                  flex
                  h-16
                  w-16
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  bg-white/15
                "
              >

                {foundation
                  ?.logoUrl ? (

                  <img
                    src={
                      foundation.logoUrl
                    }
                    alt={
                      foundationName
                    }
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />

                ) : (

                  <BuildingLibraryIcon className="h-9 w-9 text-white" />

                )}

              </div>

              <div>

                <Typography
                  className="
                    mb-1
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.25em]
                    text-blue-100
                  "
                >
                  Foundation Anda
                </Typography>

                <Typography
                  variant="h3"
                  className="
                    font-black
                    text-white
                  "
                >
                  {foundationName}
                </Typography>

                <Typography
                  className="
                    mt-2
                    text-xs
                    font-medium
                    text-blue-100
                  "
                >
                  Selamat datang,{" "}
                  {adminName}
                </Typography>

              </div>

            </div>

            <div
              className="
                flex
                flex-col
                items-start
                gap-2
                md:items-end
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2

                  rounded-xl
                  bg-white/10
                  px-4
                  py-2
                "
              >

                <IdentificationIcon className="h-4 w-4" />

                <Typography className="text-xs font-bold">
                  Foundation ID:{" "}
                  {foundationId}
                </Typography>

              </div>

              <Chip
                value={
                  foundationActive
                    ? "ACTIVE"
                    : "INACTIVE"
                }
                className={
                  foundationActive
                    ? "rounded-full bg-green-500 text-[9px] font-black"
                    : "rounded-full bg-red-500 text-[9px] font-black"
                }
              />

            </div>

          </div>

        </Card>

        {/* ====================================================
            STATISTICS
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-5

            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          <StatCard
            title="Total Charity"
            value={
              summary.totalPrograms
            }
            subValue="PROGRAM FOUNDATION"
            color="bg-blue-800"
            icon={
              <HeartIcon className="h-6 w-6 text-white" />
            }
          />

          <StatCard
            title="Charity Aktif"
            value={
              summary.activePrograms
            }
            subValue="SEDANG BERJALAN"
            color="bg-green-500"
            icon={
              <CheckCircleIcon className="h-6 w-6 text-white" />
            }
          />

          <StatCard
            title="Donatur"
            value={
              summary.totalDonors
            }
            subValue="TOTAL DONATUR"
            color="bg-purple-500"
            icon={
              <UserGroupIcon className="h-6 w-6 text-white" />
            }
          />

          <StatCard
            title="Total Donation"
            value={`Rp ${formatRupiah(
              summary.totalDonation
            )}`}
            subValue="DANA DONASI"
            color="bg-amber-500"
            icon={
              <GiftIcon className="h-6 w-6 text-white" />
            }
          />

        </div>

        {/* ====================================================
            FINANCIAL
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
          "
        >

          <FinancialCard
            title="Total Target Charity"
            value={
              summary.totalTarget
            }
            description="Akumulasi target seluruh Charity Foundation"
            icon={
              <ChartBarIcon className="h-7 w-7 text-white" />
            }
          />

          <FinancialCard
            title="Dana Terkumpul"
            value={
              summary.totalCollected
            }
            description="Akumulasi collectedAmount seluruh Charity"
            icon={
              <BanknotesIcon className="h-7 w-7 text-white" />
            }
          />

        </div>

        {/* ====================================================
            CHARITY + CHART
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-6
            lg:grid-cols-2
          "
        >

          {/* CHARITY TERBARU */}

          <Card
            className="
              rounded-[2rem]
              border
              border-gray-100
              bg-white
              p-6
              shadow-sm
            "
          >

            <div
              className="
                mb-5
                flex
                items-center
                justify-between
              "
            >

              <Typography
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-black
                  uppercase
                  tracking-widest
                  text-blue-900
                "
              >

                <HeartIcon className="h-4 w-4 text-blue-600" />

                Charity Terbaru

              </Typography>

              <Button
                variant="text"
                size="sm"
                onClick={() =>
                  navigate(
                    "/FoundationAdmin/charities"
                  )
                }
                className="
                  rounded-xl
                  normal-case
                  text-blue-700
                "
              >
                Lihat Semua
              </Button>

            </div>

            <div className="space-y-2">

              {recentPrograms.map(
                (
                  program
                ) => (

                  <ProgramRow
                    key={
                      program.id
                    }
                    program={
                      program
                    }
                  />

                )
              )}

              {recentPrograms.length ===
                0 && (

                <EmptyState
                  icon={
                    <HeartIcon className="h-8 w-8" />
                  }
                  message="Belum ada Charity."
                />

              )}

            </div>

          </Card>

          {/* CHART */}

          <Card
            className="
              rounded-[2rem]
              border
              border-gray-100
              bg-white
              p-6
              shadow-sm
            "
          >

            <div
              className="
                mb-2
                flex
                items-center
                justify-between
              "
            >

              <Typography
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-widest
                  text-blue-900
                "
              >
                Tren Donation
              </Typography>

              <ChartBarIcon className="h-5 w-5 text-blue-600" />

            </div>

            <Typography
              className="
                mb-4
                text-[10px]
                text-gray-400
              "
            >
              Total Donation dalam
              enam bulan terakhir
            </Typography>

            <div className="h-64 w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={
                    chartData
                  }
                >

                  <defs>

                    <linearGradient
                      id="foundationDonationTrend"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#2b6cb0"
                        stopOpacity={
                          0.3
                        }
                      />

                      <stop
                        offset="95%"
                        stopColor="#2b6cb0"
                        stopOpacity={
                          0
                        }
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={
                      false
                    }
                    stroke="#f1f5f9"
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={
                      false
                    }
                    tickLine={
                      false
                    }
                    tick={{
                      fontSize: 10,
                      fontWeight:
                        "bold",
                    }}
                  />

                  <YAxis
                    axisLine={
                      false
                    }
                    tickLine={
                      false
                    }
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <Tooltip
                    formatter={(
                      value
                    ) => [
                      `Rp ${formatRupiah(
                        value
                      )}`,
                      "Donation",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="donation"
                    stroke="#2b6cb0"
                    strokeWidth={
                      4
                    }
                    fill="url(#foundationDonationTrend)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </Card>

        </div>

        {/* ====================================================
            DONATION TERBARU
        ==================================================== */}

        <Card
          className="
            rounded-[2rem]
            border
            border-gray-100
            bg-white
            p-6
            shadow-sm
          "
        >

          <div
            className="
              mb-5
              flex
              flex-col
              justify-between
              gap-2

              sm:flex-row
              sm:items-center
            "
          >

            <Typography
              className="
                flex
                items-center
                gap-2

                text-xs
                font-black
                uppercase
                tracking-widest
                text-blue-900
              "
            >

              <GiftIcon className="h-4 w-4 text-blue-600" />

              Donation Terbaru

            </Typography>

            <Typography
              className="
                text-[10px]
                text-gray-400
              "
            >
              Donation terbaru dari
              seluruh Charity
              Foundation
            </Typography>

          </div>

          {recentDonations.length >
          0 ? (

            <div className="overflow-x-auto">

              <table
                className="
                  w-full
                  min-w-[850px]
                  text-left
                "
              >

                <thead>

                  <tr className="border-b border-gray-100">

                    {[
                      "Donatur",
                      "Charity",
                      "Nominal",
                      "Tanggal",
                    ].map(
                      (
                        item
                      ) => (

                        <th
                          key={
                            item
                          }
                          className="
                            p-4
                            text-[10px]
                            font-black
                            uppercase
                            tracking-wider
                            text-gray-400
                          "
                        >
                          {item}
                        </th>

                      )
                    )}

                  </tr>

                </thead>

                <tbody>

                  {recentDonations.map(
                    (
                      donation
                    ) => (

                      <DonationRow
                        key={
                          donation.id
                        }
                        donation={
                          donation
                        }
                      />

                    )
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <EmptyState
              icon={
                <GiftIcon className="h-8 w-8" />
              }
              message="Belum ada Donation."
            />

          )}

        </Card>

      </div>

    </MainLayout>
  );
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  title,
  value,
  subValue,
  icon,
  color,
}) => (
  <Card
    className="
      flex
      flex-row
      items-center
      justify-between

      rounded-[1.5rem]

      border
      border-gray-100

      bg-white

      p-5

      shadow-sm
    "
  >

    <div>

      <Typography
        className="
          mb-1
          text-[10px]
          font-black
          uppercase
          tracking-widest
          text-gray-400
        "
      >
        {title}
      </Typography>

      <Typography
        variant="h3"
        className="
          break-words
          font-black
          text-blue-900
        "
      >
        {value}
      </Typography>

      <Typography
        className="
          mt-1
          text-[9px]
          font-bold
          uppercase
          text-blue-600
        "
      >
        {subValue}
      </Typography>

    </div>

    <div
      className={`
        ${color}
        rounded-2xl
        p-4
        shadow-lg
      `}
    >
      {icon}
    </div>

  </Card>
);

// ============================================================
// FINANCIAL CARD
// ============================================================

const FinancialCard = ({
  title,
  value,
  description,
  icon,
}) => (
  <Card
    className="
      flex
      items-center
      gap-5

      rounded-[1.5rem]

      border
      border-blue-100

      bg-blue-50/40

      p-5

      shadow-sm
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

        bg-blue-700
      "
    >
      {icon}
    </div>

    <div>

      <Typography
        className="
          text-[10px]
          font-black
          uppercase
          tracking-wider
          text-gray-500
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
        Rp{" "}
        {formatRupiah(
          value
        )}
      </Typography>

      <Typography
        className="
          mt-1
          text-[9px]
          text-gray-400
        "
      >
        {description}
      </Typography>

    </div>

  </Card>
);

// ============================================================
// PROGRAM ROW
// ============================================================

const ProgramRow = ({
  program,
}) => {
  const isActive =
    program.isActive !==
      false &&
    String(
      program.status ||
        "ACTIVE"
    ).toUpperCase() ===
      "ACTIVE";

  const target =
    Number(
      program.targetAmount ||
        0
    );

  const collected =
    Number(
      program.collectedAmount ||
        0
    );

  const progress =
    target > 0
      ? Math.min(
          100,
          Math.round(
            (collected /
              target) *
              100
          )
        )
      : 0;

  return (
    <div
      className="
        rounded-xl
        border
        border-gray-100
        p-4
        transition
        hover:bg-blue-50/40
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center

              rounded-xl
              bg-blue-100
            "
          >

            <HeartIcon className="h-5 w-5 text-blue-700" />

          </div>

          <div className="min-w-0">

            <Typography
              className="
                truncate
                text-xs
                font-black
                text-blue-gray-900
              "
            >
              {program.name ||
                "Charity"}
            </Typography>

            <Typography
              className="
                mt-1
                text-[9px]
                text-gray-500
              "
            >
              Rp{" "}
              {formatRupiah(
                collected
              )}
              {" / "}
              Rp{" "}
              {formatRupiah(
                target
              )}
            </Typography>

          </div>

        </div>

        <Chip
          value={
            program.status ||
            (isActive
              ? "ACTIVE"
              : "INACTIVE")
          }
          className={
            isActive
              ? "rounded-full bg-green-50 text-[8px] font-black text-green-700"
              : "rounded-full bg-gray-100 text-[8px] font-black text-gray-600"
          }
        />

      </div>

      {/* PROGRESS */}

      <div className="mt-3">

        <div
          className="
            mb-1
            flex
            justify-between
          "
        >

          <Typography className="text-[9px] text-gray-400">
            Progress
          </Typography>

          <Typography className="text-[9px] font-black text-blue-700">
            {progress}%
          </Typography>

        </div>

        <div
          className="
            h-1.5
            overflow-hidden
            rounded-full
            bg-gray-100
          "
        >

          <div
            className="
              h-full
              rounded-full
              bg-blue-600
            "
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
};

// ============================================================
// DONATION ROW
// ============================================================

const DonationRow = ({
  donation,
}) => {
  const donorName =
    donation.user?.name ||
    donation.donor?.name ||
    donation.user
      ?.username ||
    donation.donor
      ?.username ||
    donation.user
      ?.email ||
    donation.donor
      ?.email ||
    donation.donorName ||
    "Donatur";

  const charityName =
    donation.charity?.name ||
    donation.program?.name ||
    donation.charityName ||
    donation.programName ||
    "-";

  return (
    <tr
      className="
        border-b
        border-gray-50
        hover:bg-blue-50/20
      "
    >

      <td className="p-4">

        <Typography
          className="
            text-xs
            font-black
            text-blue-900
          "
        >
          {donorName}
        </Typography>

      </td>

      <td className="p-4">

        <Typography
          className="
            text-xs
            font-semibold
            text-gray-600
          "
        >
          {charityName}
        </Typography>

      </td>

      <td className="p-4">

        <Typography
          className="
            text-xs
            font-black
            text-green-600
          "
        >
          Rp{" "}
          {formatRupiah(
            donation.amount
          )}
        </Typography>

      </td>

      <td className="p-4">

        <Typography
          className="
            whitespace-nowrap
            text-xs
            text-gray-500
          "
        >
          {formatDate(
            donation.createdAt
          )}
        </Typography>

      </td>

    </tr>
  );
};

// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = ({
  icon,
  message,
}) => (
  <div
    className="
      flex
      flex-col
      items-center
      justify-center
      gap-2

      py-10

      text-center
      text-gray-400
    "
  >

    {icon}

    <Typography
      className="
        text-xs
        font-semibold
      "
    >
      {message}
    </Typography>

  </div>
);

export default FoundationDashboard;