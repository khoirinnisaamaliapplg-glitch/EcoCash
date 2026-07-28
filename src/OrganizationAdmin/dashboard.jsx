import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../utils/api";
import MainLayout from "./MainLayout";

import {
  Card,
  Typography,
  Chip,
  Spinner,
} from "@material-tailwind/react";

import {
  UserGroupIcon,
  ScaleIcon,
  TrashIcon,
  CheckCircleIcon,
  BuildingOffice2Icon,
  IdentificationIcon,
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

/*
 * Data grafik sementara.
 * Nantinya dapat diganti dari endpoint transaksi organisasi.
 */
const chartData = [
  { name: "Jan", reduction: 0 },
  { name: "Feb", reduction: 0 },
  { name: "Mar", reduction: 0 },
  { name: "Apr", reduction: 0 },
];

/*
 * Mengambil data user yang sudah disimpan ketika login.
 */
const getLoggedInUser = () => {
  try {
    const rawUser =
      localStorage.getItem("userData") ||
      localStorage.getItem("user");

    return rawUser
      ? JSON.parse(rawUser)
      : null;
  } catch (error) {
    console.error(
      "Gagal membaca data user login:",
      error
    );

    return null;
  }
};

/*
 * Mengambil array dari response API.
 */
const extractArray = (response) => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  return [];
};

/*
 * Membandingkan ID dengan aman.
 */
const isSameId = (
  firstId,
  secondId
) => {
  if (
    firstId === null ||
    firstId === undefined ||
    secondId === null ||
    secondId === undefined
  ) {
    return false;
  }

  return (
    Number(firstId) ===
    Number(secondId)
  );
};

const DashboardOrganization = () => {
  const [users, setUsers] =
    useState([]);

  const [wasteTypes, setWasteTypes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const userData = useMemo(
    () => getLoggedInUser(),
    []
  );

  const token =
    localStorage.getItem("token");

  /*
   * Organization ID diambil dari data user login.
   */
  const myOrganizationId =
    userData?.organizationId ??
    userData?.organization?.id ??
    null;

  /*
   * Nama organisasi diambil langsung dari data login.
   * Tidak memanggil endpoint organisasi lagi.
   */
  const organizationName =
    userData?.organization?.name ||
    userData?.organizationName ||
    userData?.organization_name ||
    "Organisasi Anda";

  const organizationIsActive =
    userData?.organization?.isActive ??
    userData?.organizationIsActive ??
    true;

  const fetchData = useCallback(
    async () => {
      if (!token) {
        setErrorMessage(
          "Token login tidak ditemukan."
        );

        setLoading(false);
        return;
      }

      if (!myOrganizationId) {
        setErrorMessage(
          "Organization ID tidak ditemukan pada data login."
        );

        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        setLoading(true);
        setErrorMessage("");

        const [
          usersResult,
          wasteResult,
        ] = await Promise.allSettled([
          api.get(
            "/admin/users/",
            config
          ),

          api.get(
            "/waste-types/",
            config
          ),
        ]);

        /*
         * Ambil user organisasi.
         */
        if (
          usersResult.status ===
          "fulfilled"
        ) {
          const allUsers =
            extractArray(
              usersResult.value
            );

          /*
           * Filter tambahan di frontend.
           * Backend tetap harus membatasi user
           * berdasarkan req.user.organizationId.
           */
          const organizationUsers =
            allUsers.filter((user) => {
              const userOrganizationId =
                user.organizationId ??
                user.organization?.id;

              return isSameId(
                userOrganizationId,
                myOrganizationId
              );
            });

          setUsers(
            organizationUsers
          );
        } else {
          console.error(
            "Gagal mengambil user organisasi:",
            usersResult.reason
          );

          setErrorMessage(
            "Data user organisasi belum berhasil dimuat."
          );
        }

        /*
         * Ambil kategori waste.
         */
        if (
          wasteResult.status ===
          "fulfilled"
        ) {
          setWasteTypes(
            extractArray(
              wasteResult.value
            )
          );
        } else {
          console.error(
            "Gagal mengambil kategori waste:",
            wasteResult.reason
          );
        }
      } catch (error) {
        console.error(
          "Gagal mengambil dashboard organisasi:",
          error
        );

        setErrorMessage(
          error.response?.data?.message ||
            "Gagal mengambil data dashboard organisasi."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      token,
      myOrganizationId,
    ]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /*
   * Menghitung user aktif.
   */
  const activeUsers = useMemo(
    () =>
      users.filter((user) => {
        if (
          user.isActive !== undefined
        ) {
          return user.isActive;
        }

        if (
          user.staffProfile?.isActive !==
          undefined
        ) {
          return (
            user.staffProfile.isActive
          );
        }

        return true;
      }),
    [users]
  );

  /*
   * Menghitung regular user.
   */
  const regularUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.role === "REGULAR_USER"
      ),
    [users]
  );

  /*
   * Menghitung admin organisasi.
   */
  const organizationAdmins =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.role ===
            "ORGANIZATION_ADMIN"
        ),
      [users]
    );

  /*
   * Menampilkan enam user terbaru.
   */
  const latestUsers = useMemo(
    () =>
      [...users]
        .sort(
          (
            firstUser,
            secondUser
          ) => {
            const firstDate =
              new Date(
                firstUser.createdAt ||
                  0
              ).getTime();

            const secondDate =
              new Date(
                secondUser.createdAt ||
                  0
              ).getTime();

            return (
              secondDate -
              firstDate
            );
          }
        )
        .slice(0, 6),
    [users]
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-96 w-full flex-col items-center justify-center gap-4 bg-white/50">
          <Spinner className="h-12 w-12 text-blue-600" />

          <Typography className="animate-pulse font-black uppercase italic text-blue-900">
            Sinkronisasi data organisasi...
          </Typography>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">
        {/* HEADER */}
        <section className="flex flex-col justify-between gap-4 px-2 md:flex-row md:items-end">
          <div>
            <Typography
              variant="h4"
              className="font-black uppercase italic tracking-tight text-blue-900"
            >
              Dashboard Organization
            </Typography>

            <Typography className="mt-1 text-sm font-medium text-gray-500">
              Monitoring data organisasi
              dan anggota
            </Typography>
          </div>

          <Chip
            value="Organization Admin"
            className="w-fit rounded-full bg-blue-600 px-4 text-[10px] font-black shadow-lg"
          />
        </section>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <Card className="border border-amber-200 bg-amber-50 p-4 shadow-none">
            <Typography className="text-sm font-semibold text-amber-800">
              {errorMessage}
            </Typography>
          </Card>
        )}

        {/* INFORMASI ORGANISASI */}
        <Card className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 p-7 text-white shadow-xl">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />

          <div className="absolute -bottom-20 right-20 h-52 w-52 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <BuildingOffice2Icon className="h-9 w-9 text-white" />
              </div>

              <div>
                <Typography className="mb-1 text-[10px] font-black uppercase tracking-[0.25em] text-blue-100">
                  Organisasi Anda
                </Typography>

                <Typography
                  variant="h3"
                  className="font-black text-white"
                >
                  {organizationName}
                </Typography>

                <Typography className="mt-2 text-xs font-medium text-blue-100">
                  Selamat datang,{" "}
                  {userData?.name ||
                    userData?.username ||
                    "Organization Admin"}
                </Typography>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
                <IdentificationIcon className="h-4 w-4" />

                <Typography className="text-xs font-bold">
                  Organization ID:{" "}
                  {myOrganizationId || "-"}
                </Typography>
              </div>

              <Chip
                value={
                  organizationIsActive
                    ? "ACTIVE"
                    : "INACTIVE"
                }
                className={
                  organizationIsActive
                    ? "rounded-full bg-green-500 text-[9px] font-black"
                    : "rounded-full bg-red-500 text-[9px] font-black"
                }
              />
            </div>
          </div>
        </Card>

        {/* STATISTIK */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total User"
            value={users.length}
            subValue="USER ORGANISASI"
            color="bg-blue-800"
            icon={
              <UserGroupIcon className="h-6 w-6 text-white" />
            }
          />

          <StatCard
            title="User Aktif"
            value={activeUsers.length}
            subValue="AKUN AKTIF"
            color="bg-green-500"
            icon={
              <CheckCircleIcon className="h-6 w-6 text-white" />
            }
          />

          <StatCard
            title="Regular User"
            value={regularUsers.length}
            subValue="ANGGOTA ORGANISASI"
            color="bg-blue-600"
            icon={
              <UserGroupIcon className="h-6 w-6 text-white" />
            }
          />

          <StatCard
            title="Organization Admin"
            value={
              organizationAdmins.length
            }
            subValue="ADMIN ORGANISASI"
            color="bg-blue-400"
            icon={
              <BuildingOffice2Icon className="h-6 w-6 text-white" />
            }
          />
        </div>

        {/* USER DAN GRAFIK */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* USER TERBARU */}
          <Card className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <Typography className="flex items-center gap-2 text-xs font-black uppercase italic tracking-widest text-blue-900">
                <UserGroupIcon className="h-4 w-4 text-blue-600" />

                User Organisasi Terbaru
              </Typography>

              <Chip
                value={`${users.length} USER`}
                className="rounded-full bg-blue-50 text-[9px] font-black text-blue-700"
              />
            </div>

            <div className="max-h-[300px] space-y-2 overflow-y-auto pr-2">
              {latestUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                />
              ))}

              {latestUsers.length ===
                0 && (
                <EmptyState
                  icon={
                    <UserGroupIcon className="h-8 w-8" />
                  }
                  message="Belum ada user pada organisasi ini."
                />
              )}
            </div>
          </Card>

          {/* GRAFIK EMISI */}
          <Card className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Typography className="text-xs font-black uppercase italic tracking-widest text-blue-900">
                Tren Reduksi Emisi Organisasi
              </Typography>

              <ScaleIcon className="h-5 w-5 text-blue-600" />
            </div>

            <Typography className="mb-4 text-[10px] text-gray-400">
              Grafik akan mengikuti data
              transaksi dan dampak lingkungan
              organisasi.
            </Typography>

            <div className="h-64 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={chartData}
                >
                  <defs>
                    <linearGradient
                      id="organizationTrend"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#2b6cb0"
                        stopOpacity={0.3}
                      />

                      <stop
                        offset="95%"
                        stopColor="#2b6cb0"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fontWeight: "bold",
                      fill: "#64748b",
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fontWeight: "bold",
                      fill: "#64748b",
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "15px",
                      border: "none",
                      boxShadow:
                        "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="reduction"
                    stroke="#2b6cb0"
                    strokeWidth={4}
                    fill="url(#organizationTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* KATEGORI WASTE */}
        <Card className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <Typography className="flex items-center gap-2 text-xs font-black uppercase italic tracking-widest text-blue-900">
              <TrashIcon className="h-4 w-4 text-blue-600" />

              Daftar Kategori Waste
            </Typography>

            <Typography className="text-[10px] font-semibold text-gray-400">
              Data kategori sampah
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {wasteTypes.map(
              (wasteType) => (
                <WasteTypeCard
                  key={wasteType.id}
                  wasteType={wasteType}
                />
              )
            )}

            {wasteTypes.length ===
              0 && (
              <div className="md:col-span-2 xl:col-span-3">
                <EmptyState
                  icon={
                    <TrashIcon className="h-8 w-8" />
                  }
                  message="Kategori waste belum tersedia."
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

/*
 * KOMPONEN STATISTIK
 */
const StatCard = ({
  title,
  value,
  subValue,
  icon,
  color,
}) => (
  <Card className="flex flex-row items-center justify-between rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
    <div>
      <Typography className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
        {title}
      </Typography>

      <Typography
        variant="h3"
        className="font-black text-blue-900"
      >
        {value}
      </Typography>

      <Typography className="mt-1 text-[9px] font-bold uppercase italic text-blue-600">
        {subValue}
      </Typography>
    </div>

    <div
      className={`${color} rounded-2xl p-4 shadow-lg`}
    >
      {icon}
    </div>
  </Card>
);

/*
 * KOMPONEN USER
 */
const UserRow = ({ user }) => {
  const userIsActive =
    user.isActive ??
    user.staffProfile?.isActive ??
    true;

  const initial =
    user.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "U";

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-50 p-3 transition hover:bg-blue-50/50">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-700">
          {initial}
        </div>

        <div className="min-w-0">
          <Typography className="truncate text-xs font-black text-blue-gray-900">
            {user.name ||
              "Nama user"}
          </Typography>

          <Typography className="truncate text-[10px] text-gray-500">
            {user.email ||
              user.username ||
              "-"}
          </Typography>
        </div>
      </div>

      <div className="ml-3 text-right">
        <Chip
          value={
            userIsActive
              ? "ACTIVE"
              : "INACTIVE"
          }
          className={
            userIsActive
              ? "rounded-full bg-green-50 text-[8px] font-black text-green-700"
              : "rounded-full bg-red-50 text-[8px] font-black text-red-700"
          }
        />

        <Typography className="mt-1 text-[8px] font-bold uppercase text-gray-400">
          {String(
            user.role || "USER"
          ).replaceAll("_", " ")}
        </Typography>
      </div>
    </div>
  );
};

/*
 * KOMPONEN WASTE TYPE
 */
const WasteTypeCard = ({
  wasteType,
}) => {
  const price =
    wasteType.pricePerKg ??
    wasteType.price_per_kg ??
    wasteType.price ??
    0;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
      <div>
        <Typography className="text-xs font-black uppercase text-gray-700">
          {wasteType.name ||
            "Waste Type"}
        </Typography>

        <Typography className="mt-1 text-[9px] font-semibold text-gray-400">
          Nilai tukar per kilogram
        </Typography>
      </div>

      <Typography className="text-sm font-black text-blue-900">
        Rp{" "}
        {Number(price).toLocaleString(
          "id-ID"
        )}
        /kg
      </Typography>
    </div>
  );
};

/*
 * KOMPONEN EMPTY STATE
 */
const EmptyState = ({
  icon,
  message,
}) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-gray-400">
    {icon}

    <Typography className="text-xs font-semibold italic">
      {message}
    </Typography>
  </div>
);

export default DashboardOrganization;