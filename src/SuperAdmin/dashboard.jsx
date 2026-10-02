import React, { useState, useEffect } from "react";
import api from "../utils/api";
import MainLayout from "./MainLayout";
import {
  Card,
  Typography,
  Chip,
  Progress,
} from "@material-tailwind/react";
import {
  UserGroupIcon,
  ScaleIcon,
  TrashIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  ArrowDownTrayIcon,
  MegaphoneIcon,
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
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import pinIcon from "../assets/pin.png";
import shadowIcon from "leaflet/dist/images/marker-shadow.png";

const BANDUNG_CENTER = [-6.9175, 107.6191];
const machineIcon = new L.Icon({
  iconUrl: pinIcon,
  iconSize: [60, 60],
  iconAnchor: [30, 60],
  popupAnchor: [0, -60],
  shadowUrl: shadowIcon,
  shadowSize: [60, 60],
});

const extractData = (response) => response?.data?.data ?? response?.data ?? null;

const extractArray = (response) => {
  const data = extractData(response);
  if (Array.isArray(data)) return data;
  return [data?.items, data?.users, data?.machines, data?.wasteTypes]
    .find(Array.isArray) ?? [];
};

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isNaN(number) ? fallback : number;
};

const formatNumber = (value, maximumFractionDigits = 1) =>
  toNumber(value).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });

const formatChange = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "PERIODE INI";
  }
  const number = Number(value);
  return number === 0
    ? "0% VS LAST PERIOD"
    : `${number > 0 ? "+" : ""}${formatNumber(number)}% VS LAST PERIOD`;
};

const normalizeSummary = (rawSummary) => {
  if (!rawSummary || typeof rawSummary !== "object") return {};
  return rawSummary.summary ?? rawSummary.dashboard ?? rawSummary.stats ?? rawSummary;
};


const getWasteCollected = (summary) => {
  const data = normalizeSummary(summary);
  const waste = data?.wasteCollected;
  if (waste && typeof waste === "object" && !Array.isArray(waste)) {
    return toNumber([
      waste.current,
      waste.currentValue,
      waste.currentKg,
      waste.total,
      waste.totalKg,
      waste.totalWeight,
      waste.weight,
      waste.kg,
      waste.value,
    ].find((value) => value != null));
  }
  if (waste !== undefined && waste !== null && typeof waste !== "object") {
    return toNumber(waste);
  }
  return toNumber([
    data?.totalWasteKg,
    data?.totalWasteKG,
    data?.totalWeightKg,
    data?.totalWeightKG,
    data?.wasteCollectedKg,
    data?.wasteCollectedKG,
    data?.wasteKg,
    data?.wasteKG,
    data?.totalWaste,
    data?.totalWeight,
  ].find((value) => value != null));
};

const getWasteChange = (summary) => {
  const data = normalizeSummary(summary);
  const waste = data?.wasteCollected;
  if (waste && typeof waste === "object" && !Array.isArray(waste)) {
    return [
      waste.changePercent,
      waste.percentageChange,
      waste.change,
      waste.growthPercent,
    ].find((value) => value != null) ?? null;
  }
  return [
    data?.wasteChangePercent,
    data?.wasteChange,
    data?.wasteGrowthPercent,
  ].find((value) => value != null) ?? null;
};


const MapController = ({ mapCenter }) => {
  const map = useMap();

  useEffect(() => {
    const timer =
      setTimeout(
        () => {
          map.invalidateSize();
        },
        500
      );

    return () =>
      clearTimeout(
        timer
      );
  }, [map]);

  useEffect(() => {
    if (mapCenter) {
      map.setView(mapCenter, map.getZoom());
    }
  }, [map, mapCenter]);

  return null;
};


const MarkerWithFlyTo = ({
  position,
  icon,
  children,
}) => {
  const map =
    useMap();

  return (
    <Marker
      position={
        position
      }
      icon={
        icon
      }
      eventHandlers={{
        click: () => {
          map.flyTo(
            position,
            16,
            {
              animate:
                true,

              duration:
                0.8,
            }
          );
        },
      }}
    >
      {children}
    </Marker>
  );
};




// ============================================================
// ECOCASH DASHBOARD OVERVIEW - PREMIUM UI
// ============================================================

const DashboardOverview = ({
  summary,
  machines,
  totalUsers,
  wasteTypes,
}) => {
  const waste = getWasteCollected(summary);
  const wasteChange = getWasteChange(summary);

  const carbon = toNumber(
    summary?.carbonReduction ??
      summary?.co2 ??
      summary?.totalCarbon ??
      summary?.co2Avoided ??
      summary?.carbonAvoided ??
      0
  );

  const activeMachines = machines.filter((machine) => {
    const status = String(
      machine.status ??
      machine.machineStatus ??
      machine.state ??
      ""
    ).toUpperCase();

    return ["ACTIVE", "ONLINE", "READY", "RUNNING"].includes(status);
  }).length;

  const stats = [
  {
    title: "Total Sampah Terkumpul",
    value: `${formatNumber(waste, 2)} Kg`,
    caption:
      wasteChange !== null
        ? formatChange(wasteChange)
        : "Akumulasi periode terpilih",

    icon: TrashIcon,

    iconClass:
      "bg-gradient-to-br from-amber-300 to-orange-500",

    glowClass:
      "bg-amber-100",
  },

  {
    title: "Jumlah Instansi",
    value: formatNumber(machines.length, 0),
    caption:
      activeMachines > 0
        ? `${activeMachines} unit aktif/online`
        : "Unit terhubung ke EcoCash",

    icon: BuildingOfficeIcon,

    iconClass:
      "bg-gradient-to-br from-teal-400 to-emerald-600",

    glowClass:
      "bg-teal-100",
  },

  {
    title: "Total Pengguna",
    value: formatNumber(totalUsers, 0),
    caption:
      "Seluruh role pengguna",

    icon: UserGroupIcon,

    iconClass:
      "bg-gradient-to-br from-amber-300 to-orange-500",

    glowClass:
      "bg-amber-100",
  },

  {
    title: "CO₂e Direduksi",
    value: `${formatNumber(carbon, 2)} Kg`,
    caption:
      "Estimasi emisi yang dihindari",

    icon: GlobeAltIcon,

    iconClass:
      "bg-gradient-to-br from-teal-400 to-emerald-600",

    glowClass:
      "bg-teal-100",
  },
];

  const topInstitutions = [...machines]
    .map((item) => ({
      ...item,
      collected: toNumber(
        item.totalCollected ??
          item.wasteCollected ??
          item.totalWasteKg ??
          item.collectedKg ??
          item.totalWeight ??
          0
      ),
    }))
    .sort((a, b) => b.collected - a.collected)
    .slice(0, 5);

  const maxCollected = Math.max(
    1,
    ...topInstitutions.map((item) => item.collected)
  );

  const quickActions = [
    {
    label: "Tambah Instalasi",
    icon: <PlusIcon className="h-5 w-5" />,
    className:
      "from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700",
  },
    {
      label: "Unduh Laporan",
      icon: <ArrowDownTrayIcon className="h-5 w-5" />,
      className:
        "from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600",
    },
    {
    label: "Kelola Program",
    icon: <BoltIcon className="h-5 w-5" />,
    className:
      "from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700",
  },
    {
      label: "Kirim Pengumuman",
      icon: <MegaphoneIcon className="h-5 w-5" />,
      className:
        "from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600",
    },
    
  ];

  return (
    <div className="space-y-5">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card
            key={item.title}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
          >
            <div
              className={`absolute -right-7 -top-7 h-24 w-24 rounded-full ${item.glowClass} opacity-60 blur-2xl transition-transform duration-300 group-hover:scale-125`}
            />

            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Typography className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  {item.title}
                </Typography>

                <Typography className="mt-2 text-3xl font-black tracking-tight text-blue-gray-900">
                  {item.value}
                </Typography>

                <div className="mt-2 flex items-center gap-1.5">
                  <ArrowTrendingUpIcon className="h-3.5 w-3.5 text-emerald-500" />
                  <Typography className="truncate text-[10px] font-semibold text-gray-500">
                    {item.caption}
                  </Typography>
                </div>
              </div>

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg ${item.iconClass}`}
              >
                <item.icon
                  className="h-7 w-7 text-white"
                  strokeWidth={2}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ANALYTICS ROW */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* WASTE TYPES */}
        <Card className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] xl:col-span-5">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <Typography className="text-sm font-black text-blue-gray-900">
                Komposisi Jenis Sampah
              </Typography>
              <Typography className="mt-1 text-[10px] font-medium text-gray-400">
                Jenis material & harga yang tersedia
              </Typography>
            </div>

            <div className="rounded-xl bg-emerald-50 px-3 py-1.5">
              <Typography className="text-[10px] font-black text-emerald-600">
                {wasteTypes.length} JENIS
              </Typography>
            </div>
          </div>

          <div className="space-y-2.5">
            {wasteTypes.length > 0 ? (
              wasteTypes.slice(0, 6).map((item, index) => {
                const price =
                  item.price_per_kg ??
                  item.pricePerKg ??
                  item.price ??
                  0;

                const dotClasses = [
                  "bg-emerald-500",
                  "bg-sky-500",
                  "bg-amber-400",
                  "bg-orange-500",
                  "bg-rose-500",
                  "bg-violet-500",
                ];

                return (
                  <div
                    key={item.id ?? index}
                    className="flex items-center justify-between rounded-xl border border-transparent bg-gray-50/80 px-3.5 py-3 transition-all hover:border-gray-100 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          dotClasses[index % dotClasses.length]
                        }`}
                      />
                      <Typography className="truncate text-xs font-bold capitalize text-blue-gray-800">
                        {item.name || item.type || "-"}
                      </Typography>
                    </div>

                    <Typography className="ml-3 whitespace-nowrap text-xs font-black text-emerald-600">
                      Rp {formatNumber(price, 0)}/kg
                    </Typography>
                  </div>
                );
              })
            ) : (
              <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60">
                <Typography className="text-xs font-semibold text-gray-400">
                  Belum ada data jenis sampah
                </Typography>
              </div>
            )}
          </div>
        </Card>

        {/* TOP INSTITUTIONS */}
        <Card className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] xl:col-span-4">
          <div className="mb-5">
            <Typography className="text-sm font-black text-blue-gray-900">
              Top Instansi Pengumpul
            </Typography>
            <Typography className="mt-1 text-[10px] font-medium text-gray-400">
              Berdasarkan data pengumpulan yang tersedia
            </Typography>
          </div>

          <div className="space-y-4">
            {topInstitutions.length > 0 ? (
              topInstitutions.map((item, index) => {
                const width = Math.max(
                  item.collected > 0
                    ? 8
                    : 0,
                  (item.collected / maxCollected) * 100
                );

                return (
                  <div key={item.id ?? index}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[10px] font-black text-emerald-600">
                          {index + 1}
                        </div>
                        <Typography className="truncate text-[11px] font-bold text-blue-gray-700">
                          {item.organization?.name ||
                            item.placeName ||
                            item.name ||
                            item.machineCode ||
                            "Instansi"}
                        </Typography>
                      </div>

                      <Typography className="whitespace-nowrap text-[11px] font-black text-blue-gray-900">
                        {formatNumber(item.collected, 1)} Kg
                      </Typography>
                    </div>

                    <div className="ml-8 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <Typography className="py-10 text-center text-xs font-semibold text-gray-400">
                Belum ada data instansi
              </Typography>
            )}
          </div>
        </Card>

        {/* QUICK ACTION */}
        <Card className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] xl:col-span-3">
          <div className="mb-5">
            <Typography className="text-sm font-black text-blue-gray-900">
              Aksi Cepat
            </Typography>
            <Typography className="mt-1 text-[10px] font-medium text-gray-400">
              Shortcut pengelolaan EcoCash
            </Typography>
          </div>

          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={`${action.label}-${index}`}
                type="button"
                className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl bg-gradient-to-r px-4 py-3 text-left text-xs font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${action.className}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/25">
                  {action.icon}
                </span>
                <span className="block">{action.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};


// FINAL VERSION
// Monitoring Map ditempatkan paling atas
// Statistik double dihapus pada bagian bawah

const Dashboard = () => {
 
  const [
    wasteTypes,
    setWasteTypes,
  ] = useState([]);

  const [
    machines,
    setMachines,
  ] = useState([]);

const [
  totalUsers,
  setTotalUsers,
] = useState(0);

  
  const [
    summary,
    setSummary,
  ] = useState({});

  
  const [
    carbonData,
    setCarbonData,
  ] = useState([]);

  
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    mapCenter,
    setMapCenter,
  ] = useState(BANDUNG_CENTER);

  const [
    period,
    setPeriod,
  ] = useState(
    "month"
  );

  
  useEffect(() => {
    const fetchData =
      async () => {
        try {
          setLoading(
            true
          );

          const [
            resWaste,
            resMachines,
            resUsers,
            resSummary,
            resCarbon,
          ] =
            await Promise.all([
              
              api.get(
                "/waste-types/"
              ),

             
              api.get(
                "/machines/"
              ),

             
              api.get(
                "/admin/users/",
                {
                  params: {
                    page:
                      1,

                    limit:
                      1000,
                  },
                }
              ),

             
              api.get(
                "/admin/dashboard/summary",
                {
                  params: {
                    period,
                  },
                }
              ),

              api.get(
                "/admin/dashboard/carbon",
                {
                  params: {
                    period,

                    granularity:
                      "day",

                    days:
                      period ===
                      "week"
                        ? 7
                        : period ===
                          "year"
                        ? 365
                        : 30,
                  },
                }
              ),
            ]);

         
          const wasteData =
            extractArray(
              resWaste
            );

          setWasteTypes(
            wasteData
          );

          const machineData =
            extractArray(
              resMachines
            );

          setMachines(
            machineData
          );

          const firstMachineWithLocation = machineData.find((machine) => {
            const latitude = Number.parseFloat(
              machine.latitude ?? machine.lat
            );
            const longitude = Number.parseFloat(
              machine.longitude ?? machine.lng
            );
            return !Number.isNaN(latitude) && !Number.isNaN(longitude);
          });

          if (firstMachineWithLocation) {
            setMapCenter([
              Number.parseFloat(
                firstMachineWithLocation.latitude ?? firstMachineWithLocation.lat
              ),
              Number.parseFloat(
                firstMachineWithLocation.longitude ?? firstMachineWithLocation.lng
              ),
            ]);
          }

const total =
  resUsers?.data?.pagination?.total ??
  resUsers?.data?.meta?.total ??
  resUsers?.data?.data?.pagination?.total ??
  resUsers?.data?.total ??
  0;


          setTotalUsers(total);

          const summaryData =
            extractData(
              resSummary
            ) || {};

          setSummary(
            summaryData
          );

          
          const carbonResponse =
            extractData(
              resCarbon
            );

          let carbonItems =
            [];

          if (
            Array.isArray(
              carbonResponse
            )
          ) {
            carbonItems =
              carbonResponse;
          } else if (
            carbonResponse &&
            typeof carbonResponse ===
              "object"
          ) {
            carbonItems =
              carbonResponse.trend ??
              carbonResponse.trends ??
              carbonResponse.series ??
              carbonResponse.points ??
              carbonResponse.items ??
              carbonResponse.data ??
              [];
          }

          if (
            !Array.isArray(
              carbonItems
            )
          ) {
            carbonItems =
              [];
          }

         
          const normalizedCarbon =
            carbonItems.map(
              (
                item,
                index
              ) => {
                const rawDate =
                  item.date ??
                  item.name ??
                  item.label ??
                  item.period ??
                  item.bucket ??
                  item.createdAt ??
                  "";

                let label =
                  rawDate;

                if (
                  rawDate
                ) {
                  const date =
                    new Date(
                      rawDate
                    );

                  if (
                    !Number.isNaN(
                      date.getTime()
                    )
                  ) {
                    if (
                      period ===
                      "year"
                    ) {
                      label =
                        date.toLocaleDateString(
                          "id-ID",
                          {
                            month:
                              "short",
                          }
                        );
                    } else {
                      label =
                        date.toLocaleDateString(
                          "id-ID",
                          {
                            day:
                              "2-digit",

                            month:
                              "short",
                          }
                        );
                    }
                  }
                }

                const reduction =
                  toNumber(
                    item.reduction ??
                      item.co2 ??
                      item.co2e ??
                      item.value ??
                      item.total ??
                      item.totalCo2 ??
                      item.totalCO2 ??
                      item.totalKgCO2e ??
                      item.carbonReduction ??
                      item.carbonReductionKg ??
                      0
                  );

                return {
                  name:
                    label ||
                    `${index + 1}`,

                  reduction,
                };
              }
            );

          setCarbonData(
            normalizedCarbon
          );
        } catch (
          error
        ) {
          console.error(
            "DASHBOARD FETCH ERROR:",
            error
          );

          console.error(
            "DASHBOARD ERROR RESPONSE:",
            error
              ?.response
              ?.data
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    fetchData();
  }, [period]);

  
  const wasteCollected =
    getWasteCollected(
      summary
    );

  const wasteChange =
    getWasteChange(
      summary
    );

 
  
  if (
    loading
  ) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">

        <Typography className="animate-pulse font-black uppercase italic text-blue-600">
          Syncing EcoCash Data...
        </Typography>

      </div>
    );
  }

  return (
    <MainLayout>

      <div className="space-y-6 rounded-[2rem] bg-gradient-to-b from-slate-50/80 via-white to-emerald-50/30 p-1 md:p-2">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

          <div>

            <Typography
              variant="h4"
              className="font-black text-blue-gray-900"
            >
              Dashboard
            </Typography>

            <Typography className="text-xs font-medium text-gray-500">
              Ringkasan aktivitas seluruh instansi dan unit EcoCash
            </Typography>

          </div>

          {/* =================================================
              PERIOD
          ================================================= */}

          <select
            value={
              period
            }
            onChange={(
              event
            ) =>
              setPeriod(
                event.target
                  .value
              )
            }
            className="
              cursor-pointer
              rounded-xl
              border
              border-gray-200
              bg-white
              px-4
              py-2.5
              text-xs
              font-bold
              text-blue-gray-700
              shadow-sm
              outline-none
            "
          >

            <option value="week">
              Minggu Ini
            </option>

            <option value="month">
              Bulan Ini
            </option>

            <option value="year">
              Tahun Ini
            </option>

          </select>

        </div>

        {/* ====================================================
            MAP
        ==================================================== */}

        <section>

          <div className="mb-4 flex items-center gap-2 border-l-4 border-blue-500 pl-3">

            <Typography
              variant="h5"
              className="font-black text-blue-gray-900"
            >
              Monitoring Unit Kontainer AI-IoT
            </Typography>

          </div>

          <Card
            className="
              relative
              z-0
              h-[420px]
              w-full
              overflow-hidden
              rounded-[1.75rem]
              border
              border-gray-100
              bg-gray-100
              shadow-[0_18px_55px_rgba(15,23,42,0.10)]
            "
          >

            <MapContainer
              center={
                mapCenter
              }
              zoom={
                13
              }
              style={{
                width:
                  "100%",

                height:
                  "100%",
              }}
            >

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapController
                mapCenter={
                  mapCenter
                }
              />

              {/* =================================================
                  MACHINE MARKERS
              ================================================= */}

              {machines.map(
                (
                  machine
                ) => {
                  const lat =
                    parseFloat(
                      machine.latitude ?? machine.lat
                    );

                  const lng =
                    parseFloat(
                      machine.longitude ?? machine.lng
                    );

                  if (
                    Number.isNaN(
                      lat
                    ) ||
                    Number.isNaN(
                      lng
                    )
                  ) {
                    return null;
                  }

                  return (
                    <MarkerWithFlyTo
                      key={
                        machine.id
                      }
                      position={[
                        lat,
                        lng,
                      ]}
                      icon={machineIcon}
                    >

                      <Popup
                        minWidth={
                          200
                        }
                        className="custom-popup"
                      >

                        <div className="p-1">

                          <Typography className="text-[10px] font-black uppercase text-blue-600">

                            {machine.machineCode ||
                              machine.code ||
                              "-"}

                          </Typography>

                          <Typography className="text-sm font-bold text-blue-gray-900">

                            {machine.name ||
                              "EcoCash Container"}

                          </Typography>

                          <Typography className="mb-2 text-[10px] italic text-gray-500">

                            {machine.placeName ||
                              machine.address ||
                              "-"}

                          </Typography>

                          <div className="mt-2 space-y-1 border-t pt-2">

                            <div className="flex justify-between text-[10px] font-bold">

                              <span>
                                Kapasitas
                              </span>

                              <span>

                                {toNumber(
                                  machine.fillPercentage,
                                  0
                                )}

                                %

                              </span>

                            </div>

                            <Progress
                              value={
                                toNumber(
                                  machine.fillPercentage,
                                  0
                                )
                              }
                              size="sm"
                              color={
                                toNumber(
                                  machine.fillPercentage,
                                  0
                                ) >
                                80
                                  ? "red"
                                  : "blue"
                              }
                            />

                          </div>

                        </div>

                      </Popup>

                    </MarkerWithFlyTo>
                  );
                }
              )}

            </MapContainer>

            {/* =================================================
                LIVE
            ================================================= */}

            <div className="absolute right-4 top-4 z-[1000]">

              <Chip
                value="LIVE MONITORING"
                className="rounded-full bg-emerald-500 px-4 py-2 text-[10px] font-black tracking-wider shadow-lg"
              />

            </div>

          </Card>

        </section>

        <DashboardOverview
          summary={summary}
          machines={machines}
          totalUsers={totalUsers}
          wasteTypes={wasteTypes}
        />


        {/* ====================================================
            PRICE + CARBON
        ==================================================== */}

        <div className="grid grid-cols-1 gap-6 pb-10 lg:grid-cols-2">

          {/* =================================================
              WASTE PRICE
          ================================================= */}

          <Card className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">

            <Typography className="mb-4 text-xs font-black uppercase italic tracking-widest text-blue-900">
              Waste Prices
            </Typography>

            <div className="space-y-3">

              {wasteTypes.length >
              0 ? (

                wasteTypes.map(
                  (
                    type
                  ) => {
                    const price =
                      type.price_per_kg ??
                      type.pricePerKg ??
                      type.price ??
                      0;

                    return (
                      <PriceRow
                        key={
                          type.id
                        }
                        label={
                          type.name ||
                          type.type ||
                          "-"
                        }
                        price={`Rp.${formatNumber(
                          price,
                          0
                        )}/kg`}
                      />
                    );
                  }
                )

              ) : (

                <div className="py-10 text-center">

                  <Typography className="text-xs font-bold text-gray-400">
                    Belum ada data harga sampah.
                  </Typography>

                </div>

              )}

            </div>

          </Card>

          {/* =================================================
              CARBON
          ================================================= */}

          <Card className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">

            <div className="mb-2 flex items-center justify-between">

              <div>

                <Typography className="text-xs font-black uppercase italic tracking-widest text-blue-900">
                  Carbon Reduction Trend
                </Typography>

                <Typography className="mt-1 text-[10px] font-medium text-gray-400">
                  KG CO₂e AVOIDED
                </Typography>

              </div>

              <Chip
                value="CO₂e"
                color="green"
                size="sm"
                className="text-[9px] font-black"
              />

            </div>

            <div className="h-64 w-full">

              {carbonData.length >
              0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart
                    data={
                      carbonData
                    }
                  >

                    <defs>

                      <linearGradient
                        id="colorGreen"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={
                            0.3
                          }
                        />

                        <stop
                          offset="95%"
                          stopColor="#10b981"
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
                        fontSize:
                          10,

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
                        fontSize:
                          10,

                        fontWeight:
                          "bold",
                      }}
                    />

                    <Tooltip
                      formatter={(
                        value
                      ) => [
                        `${formatNumber(
                          value,
                          2
                        )} kg CO₂e`,

                        "Carbon Reduction",
                      ]}
                      contentStyle={{
                        borderRadius:
                          "15px",

                        border:
                          "none",

                        boxShadow:
                          "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="reduction"
                      stroke="#10b981"
                      strokeWidth={
                        4
                      }
                      fill="url(#colorGreen)"
                    />

                  </AreaChart>

                </ResponsiveContainer>

              ) : (

                <div className="flex h-full flex-col items-center justify-center">

                  <Typography className="text-sm font-bold text-gray-400">
                    Belum ada data karbon
                  </Typography>

                  <Typography className="mt-1 text-[10px] text-gray-400">
                    Data karbon akan muncul setelah terdapat transaksi sampah.
                  </Typography>

                </div>

              )}

            </div>

          </Card>

        </div>

      </div>

    </MainLayout>
  );
};

// ============================================================
// PRICE ROW
// ============================================================

const PriceRow = ({
  label,
  price,
}) => (
  <div className="flex items-center justify-between border-b border-gray-50 px-1 py-2.5 last:border-0">

    <Typography className="text-[11px] font-bold uppercase text-gray-700">
      {label}
    </Typography>

    <Typography className="text-[11px] font-black text-blue-600">
      {price}
    </Typography>

  </div>
);

// ============================================================
// EXPORT
// ============================================================

export default Dashboard;