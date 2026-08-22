import React, { useState, useEffect } from "react";
import api from "../utils/api";
import MainLayout from "./MainLayout";

// UI Components
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
// LEAFLET
// ============================================================

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import pinIcon from "../assets/pin.png";

// ============================================================
// HELPER EXTRACT RESPONSE
// ============================================================

const extractData = (response) => {
  return response?.data?.data ?? response?.data ?? null;
};

const extractArray = (response) => {
  const data = extractData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.machines)) {
    return data.machines;
  }

  if (Array.isArray(data?.wasteTypes)) {
    return data.wasteTypes;
  }

  return [];
};

// ============================================================
// FORMAT NUMBER
// ============================================================

const formatNumber = (value, maximumFractionDigits = 1) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "0";
  }

  return number.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
};

// ============================================================
// FORMAT PERCENTAGE
// ============================================================

const formatChange = (value) => {
  if (
    value === undefined ||
    value === null ||
    Number.isNaN(Number(value))
  ) {
    return "PERIODE INI";
  }

  const number = Number(value);

  if (number > 0) {
    return `+${formatNumber(number)}% VS LAST PERIOD`;
  }

  if (number < 0) {
    return `${formatNumber(number)}% VS LAST PERIOD`;
  }

  return "0% VS LAST PERIOD";
};

// ============================================================
// MAP CONTROLLER
// ============================================================

const MapController = ({ setZoomLevel }) => {
  const map = useMapEvents({
    zoomend() {
      setZoomLevel(map.getZoom());
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

// ============================================================
// MARKER FLY TO
// ============================================================

const MarkerWithFlyTo = ({
  position,
  icon,
  children,
}) => {
  const map = useMap();

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: () => {
          map.flyTo(position, 16, {
            animate: true,
            duration: 0.8,
          });
        },
      }}
    >
      {children}
    </Marker>
  );
};

// ============================================================
// DASHBOARD
// ============================================================

const Dashboard = () => {
  // ==========================================================
  // DATA LAMA
  // ==========================================================

  const [wasteTypes, setWasteTypes] = useState([]);
  const [machines, setMachines] = useState([]);

  // USER TETAP MENGGUNAKAN LOGIKA LAMA
  const [users, setUsers] = useState([]);

  // ==========================================================
  // DASHBOARD STATISTICS
  // ==========================================================

  const [summary, setSummary] = useState({});
  const [carbonData, setCarbonData] = useState([]);

  // ==========================================================
  // STATE
  // ==========================================================

  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(13);

  // Periode statistik
  const [period, setPeriod] = useState("month");

  // ==========================================================
  // FETCH DATA
  // ==========================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          resWaste,
          resMachines,
          resUsers,
          resSummary,
          resCarbon,
        ] = await Promise.all([
          // ====================================================
          // DATA LAMA
          // ====================================================

          api.get("/waste-types/"),

          api.get("/machines/"),

          // USER TETAP SEPERTI DASHBOARD SEBELUMNYA
          api.get("/admin/users/"),

          // ====================================================
          // DASHBOARD BARU
          // ====================================================

          api.get("/admin/dashboard/summary", {
            params: {
              period,
            },
          }),

          api.get("/admin/dashboard/carbon", {
            params: {
              period,
              granularity: "day",
              days:
                period === "week"
                  ? 7
                  : period === "year"
                  ? 365
                  : 30,
            },
          }),
        ]);

        // ====================================================
        // WASTE TYPES
        // ====================================================

        const wasteData = extractArray(resWaste);

        setWasteTypes(wasteData);

        // ====================================================
        // MACHINES
        // ====================================================

        const machineData = extractArray(resMachines);

        setMachines(machineData);

        // ====================================================
        // USERS
        // LOGIKA SAMA DENGAN DASHBOARD LAMA
        // ====================================================

        const userData = extractArray(resUsers);

        setUsers(userData);

        console.log("USERS:", userData);
        console.log("TOTAL USERS:", userData.length);

        // ====================================================
        // SUMMARY
        // ====================================================

        const summaryData = extractData(resSummary) || {};

        console.log("DASHBOARD SUMMARY:", summaryData);

        setSummary(summaryData);

        // ====================================================
        // CARBON
        // ====================================================

        const carbonResponse = extractData(resCarbon);

        console.log("CARBON RESPONSE:", carbonResponse);

        let carbonItems = [];

        // Response langsung array
        if (Array.isArray(carbonResponse)) {
          carbonItems = carbonResponse;
        }

        // Response object
        else if (carbonResponse) {
          carbonItems =
            carbonResponse.trend ||
            carbonResponse.trends ||
            carbonResponse.series ||
            carbonResponse.points ||
            carbonResponse.items ||
            carbonResponse.data ||
            [];
        }

        if (!Array.isArray(carbonItems)) {
          carbonItems = [];
        }

        // ====================================================
        // NORMALISASI DATA CARBON UNTUK RECHARTS
        // ====================================================

        const normalizedCarbon = carbonItems.map(
          (item, index) => {
            const rawDate =
              item.date ||
              item.name ||
              item.label ||
              item.period ||
              item.bucket ||
              item.createdAt ||
              "";

            let label = rawDate;

            // Kalau date valid → buat format Indonesia
            if (rawDate) {
              const date = new Date(rawDate);

              if (!Number.isNaN(date.getTime())) {
                if (period === "year") {
                  label = date.toLocaleDateString(
                    "id-ID",
                    {
                      month: "short",
                    }
                  );
                } else {
                  label = date.toLocaleDateString(
                    "id-ID",
                    {
                      day: "2-digit",
                      month: "short",
                    }
                  );
                }
              }
            }

            return {
              name: label || `${index + 1}`,

              reduction: Number(
                item.reduction ??
                  item.co2 ??
                  item.co2e ??
                  item.value ??
                  item.total ??
                  item.totalCo2 ??
                  item.totalCO2 ??
                  item.totalKgCO2e ??
                  item.carbonReduction ??
                  0
              ),
            };
          }
        );

        console.log(
          "NORMALIZED CARBON:",
          normalizedCarbon
        );

        setCarbonData(normalizedCarbon);
      } catch (error) {
        console.error(
          "Dashboard Fetch Error:",
          error?.response?.data || error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  // ==========================================================
  // WASTE COLLECTED
  // ==========================================================

  /*
    Mendukung beberapa kemungkinan response backend.

    Contoh:
    wasteCollected: {
      value: 12.5,
      changePercent: 80
    }

    atau:

    wasteCollected: 12.5
  */

  const wasteCollected =
    summary?.wasteCollected?.value ??
    summary?.wasteCollected?.total ??
    summary?.wasteCollected ??
    summary?.totalWasteKg ??
    summary?.totalWaste ??
    summary?.wasteKg ??
    summary?.waste ??
    0;

  const wasteChange =
    summary?.wasteCollected?.changePercent ??
    summary?.wasteCollected?.change ??
    summary?.wasteChangePercent ??
    summary?.wasteChange ??
    null;

  // ==========================================================
  // MAP ICON
  // ==========================================================

  const getDynamicIcon = (currentZoom) => {
    const baseSize = 90;

    const dynamicSize = Math.max(
      35,
      baseSize *
        Math.pow(
          1.22,
          currentZoom - 13
        )
    );

    return new L.Icon({
      iconUrl: pinIcon,

      iconSize: [
        dynamicSize,
        dynamicSize,
      ],

      iconAnchor: [
        dynamicSize / 2,
        dynamicSize,
      ],

      popupAnchor: [
        0,
        -dynamicSize,
      ],
    });
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Typography className="animate-pulse font-black text-blue-600 uppercase italic">
          Syncing EcoCash Data...
        </Typography>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* ====================================================
            HEADER + FILTER
        ==================================================== */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <Typography
              variant="h4"
              className="font-black text-blue-gray-900"
            >
              Dashboard
            </Typography>

            <Typography className="text-xs text-gray-500 font-medium">
              EcoCash Smart Circular Waste Platform
            </Typography>
          </div>

          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value)
            }
            className="
              bg-white
              border
              border-gray-200
              rounded-xl
              px-4
              py-2.5
              text-xs
              font-bold
              text-blue-gray-700
              outline-none
              shadow-sm
              cursor-pointer
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
            SECTION 1
            MONITORING MAP
        ==================================================== */}

        <section>
          <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3 mb-4">

            <Typography
              variant="h5"
              className="font-bold text-blue-gray-900 uppercase italic"
            >
              Monitoring Unit Kontainer AI-IoT
            </Typography>

          </div>

          <Card
            className="
              w-full
              h-[400px]
              rounded-2xl
              overflow-hidden
              border-2
              border-white
              shadow-lg
              bg-gray-100
              z-0
              relative
            "
          >

            <MapContainer
              center={[
                -7.3333,
                108.2225,
              ]}
              zoom={13}
              style={{
                width: "100%",
                height: "100%",
              }}
            >

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapController
                setZoomLevel={
                  setZoomLevel
                }
              />

              {/* =================================================
                  MACHINE MARKERS
              ================================================= */}

              {machines.map((m) => {
                const lat = parseFloat(
                  m.latitude
                );

                const lng = parseFloat(
                  m.longitude
                );

                if (
                  Number.isNaN(lat) ||
                  Number.isNaN(lng)
                ) {
                  return null;
                }

                return (
                  <MarkerWithFlyTo
                    key={m.id}
                    position={[
                      lat,
                      lng,
                    ]}
                    icon={getDynamicIcon(
                      zoomLevel
                    )}
                  >

                    <Popup
                      minWidth={200}
                      className="custom-popup"
                    >

                      <div className="p-1">

                        <Typography className="font-black text-blue-600 text-[10px] uppercase">
                          {m.machineCode ||
                            m.code ||
                            "-"}
                        </Typography>

                        <Typography className="font-bold text-blue-gray-900 text-sm">
                          {m.name ||
                            "EcoCash Container"}
                        </Typography>

                        <Typography className="text-[10px] text-gray-500 mb-2 italic">
                          {m.placeName ||
                            m.address ||
                            "-"}
                        </Typography>

                        <div className="space-y-1 mt-2 border-t pt-2">

                          <div className="flex justify-between text-[10px] font-bold">

                            <span>
                              Kapasitas
                            </span>

                            <span>
                              {m.fillPercentage ||
                                0}
                              %
                            </span>

                          </div>

                          <Progress
                            value={
                              Number(
                                m.fillPercentage
                              ) || 0
                            }
                            size="sm"
                            color={
                              Number(
                                m.fillPercentage
                              ) > 80
                                ? "red"
                                : "blue"
                            }
                          />

                        </div>

                      </div>

                    </Popup>

                  </MarkerWithFlyTo>
                );
              })}

            </MapContainer>

            {/* =================================================
                LIVE LABEL
            ================================================= */}

            <div className="absolute top-4 right-4 z-[1000]">

              <Chip
                value="LIVE MONITORING"
                className="bg-blue-600 px-4 shadow-lg text-[10px] font-black"
              />

            </div>

          </Card>
        </section>

        {/* ====================================================
            SECTION 2
            STATISTIC CARDS
        ==================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* WASTE */}

          <StatCard
            title="Waste Collected"
            value={`${formatNumber(
              wasteCollected
            )} Kg`}
            subValue={
              wasteChange !== null
                ? formatChange(
                    wasteChange
                  )
                : "TOTAL WASTE COLLECTED"
            }
            color="bg-green-500"
            icon={
              <ScaleIcon className="h-6 w-6 text-white" />
            }
          />

          {/* =================================================
              USERS

              PENTING:
              Tetap menggunakan users.length
              seperti kode dashboard lama.
          ================================================= */}

          <StatCard
            title="Users Active"
            value={users.length}
            subValue="TOTAL SUPERVISED"
            color="bg-blue-500"
            icon={
              <UserGroupIcon className="h-6 w-6 text-white" />
            }
          />

          {/* =================================================
              CONTAINERS

              Tetap menggunakan machines.length
              seperti kode dashboard lama.
          ================================================= */}

          <StatCard
            title="Containers"
            value={machines.length}
            subValue="UNIT AKTIF"
            color="bg-teal-500"
            icon={
              <TrashIcon className="h-6 w-6 text-white" />
            }
          />

        </div>

        {/* ====================================================
            SECTION 3
            WASTE PRICES & CARBON
        ==================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">

          {/* =================================================
              WASTE PRICES
          ================================================= */}

          <Card className="p-6 border border-gray-100 shadow-sm rounded-[2rem] bg-white">

            <Typography className="font-black text-blue-900 mb-4 text-xs uppercase italic tracking-widest">
              Waste Prices
            </Typography>

            <div className="space-y-3">

              {wasteTypes.length > 0 ? (
                wasteTypes.map((t) => {

                  const price =
                    t.price_per_kg ??
                    t.pricePerKg ??
                    t.price ??
                    0;

                  return (
                    <PriceRow
                      key={t.id}
                      label={
                        t.name ||
                        t.type ||
                        "-"
                      }
                      price={`Rp.${formatNumber(
                        price,
                        0
                      )}/kg`}
                    />
                  );
                })
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
              CARBON REDUCTION
          ================================================= */}

          <Card className="p-6 border border-gray-100 shadow-sm bg-white rounded-[2rem]">

            <div className="flex items-center justify-between mb-2">

              <div>

                <Typography className="font-black text-blue-900 text-xs uppercase italic tracking-widest">
                  Carbon Reduction Trend
                </Typography>

                <Typography className="text-[10px] text-gray-400 font-medium mt-1">
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

            <div className="w-full h-64">

              {carbonData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart
                    data={carbonData}
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
                          stopOpacity={0.3}
                        />

                        <stop
                          offset="95%"
                          stopColor="#10b981"
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
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    />

                    <Tooltip
                      formatter={(value) => [
                        `${formatNumber(
                          value
                        )} kg CO₂e`,
                        "Carbon Reduction",
                      ]}
                      contentStyle={{
                        borderRadius:
                          "15px",
                        border: "none",
                        boxShadow:
                          "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="reduction"
                      stroke="#10b981"
                      strokeWidth={4}
                      fill="url(#colorGreen)"
                    />

                  </AreaChart>

                </ResponsiveContainer>

              ) : (

                <div className="h-full flex flex-col items-center justify-center">

                  <Typography className="font-bold text-gray-400 text-sm">
                    Belum ada data karbon
                  </Typography>

                  <Typography className="text-[10px] text-gray-400 mt-1">
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
      p-5
      flex
      flex-row
      items-center
      justify-between
      rounded-[1.5rem]
      bg-white
      border
      border-gray-100
      shadow-sm
    "
  >

    <div className="min-w-0">

      <Typography className="text-gray-500 text-[10px] font-black uppercase tracking-tighter">
        {title}
      </Typography>

      <Typography
        variant="h3"
        className="text-blue-900 font-black"
      >
        {value}
      </Typography>

      <Typography className="text-blue-500 text-[9px] font-black italic">
        {subValue}
      </Typography>

    </div>

    <div
      className={`
        ${color}
        p-4
        rounded-2xl
        shadow-lg
        ml-3
      `}
    >
      {icon}
    </div>

  </Card>
);

// ============================================================
// PRICE ROW
// ============================================================

const PriceRow = ({
  label,
  price,
}) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 px-1">

    <Typography className="text-[11px] font-bold text-gray-700 uppercase">
      {label}
    </Typography>

    <Typography className="text-[11px] font-black text-blue-600">
      {price}
    </Typography>

  </div>
);

export default Dashboard;