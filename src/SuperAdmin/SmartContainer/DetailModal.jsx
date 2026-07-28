import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogBody,
  IconButton,
  Typography,
  Button,
  Spinner,
} from "@material-tailwind/react";
import {
  XMarkIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Chart from "react-apexcharts";
import api from "../../utils/api";

const formatWasteType = (value) => {
  if (!value) return "Lainnya";

  const labels = {
    PLASTIC: "Plastik",
    PLASTIK: "Plastik",
    PAPER: "Kertas",
    KERTAS: "Kertas",
    GLASS: "Kaca",
    KACA: "Kaca",
    METAL: "Logam",
    CAN: "Kaleng",
    CANS: "Kaleng",
    KALENG: "Kaleng",
    ORGANIC: "Organik",
    ORGANIK: "Organik",
    COOKING_OIL: "Minyak Jelantah",
    USED_COOKING_OIL: "Minyak Jelantah",
    JELANTAH: "Minyak Jelantah",
    TEXTILE: "Tekstil",
    RESIDUAL: "Residu",
    OTHER: "Lainnya",
  };

  const normalized = String(value).trim().toUpperCase();

  return (
    labels[normalized] ||
    normalized
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
};

const getWasteType = (item) => {
  return (
    item?.wasteType?.name ||
    item?.wasteType?.code ||
    item?.wasteType ||
    item?.wasteTypeName ||
    item?.type ||
    item?.name ||
    "OTHER"
  );
};

const getWeight = (item) => {
  const value =
    item?.totalWeight ??
    item?.weight ??
    item?.currentWeight ??
    item?.value ??
    item?.amount ??
    item?.quantity ??
    item?._sum?.weight ??
    item?._sum?.totalWeight ??
    0;

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const getTransactionDate = (item) => {
  const rawDate =
    item?.createdAt ||
    item?.transactionDate ||
    item?.date ||
    item?.timestamp;

  if (!rawDate) return null;

  const date = new Date(rawDate);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatChartDate = (date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

const DetailModal = ({ open, handleOpen, data }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [machineDetail, setMachineDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRendered, setIsRendered] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  useEffect(() => {
    if (!open) {
      setIsRendered(false);
      setShowCalendar(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      setIsRendered(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    let cancelled = false;

    const fetchMachineById = async () => {
      if (!open || !data?.id) return;

      setLoading(true);
      setErrorMessage("");
      setMachineDetail(null);

      try {
        const token = localStorage.getItem("token");

        const response = await api.get(`/machines/${data.id}`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        });

        /*
         * Backend mengirim:
         * {
         *   message: "...",
         *   data: {...}
         * }
         */
        const machine = response.data?.data;

        console.log("Detail machine:", machine);

        if (!machine) {
          throw new Error("Data machine tidak ditemukan");
        }

        if (!cancelled) {
          setMachineDetail(machine);
        }
      } catch (error) {
        console.error(
          "Gagal mengambil detail machine:",
          error.response?.data || error.message
        );

        if (!cancelled) {
          setErrorMessage(
            error.response?.data?.message ||
              "Gagal mengambil detail smart container"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMachineById();

    return () => {
      cancelled = true;
    };
  }, [open, data?.id]);

  const activeData = machineDetail || data;

  /*
   * Mengambil sumber data apa pun yang sudah tersedia
   * dari backend atau data tabel sebelumnya.
   */
  const rawChartData = useMemo(() => {
    const source =
      activeData?.wasteHistory ??
      activeData?.wasteTypes ??
      activeData?.wasteTypeSummary ??
      activeData?.wasteSummary ??
      activeData?.history ??
      [];

    if (Array.isArray(source)) {
      return source;
    }

    /*
     * Mendukung bentuk:
     * {
     *   PLASTIC: 500,
     *   PAPER: 300
     * }
     */
    if (source && typeof source === "object") {
      return Object.entries(source).map(([wasteType, value]) => ({
        wasteType,
        weight:
          typeof value === "object"
            ? value?.totalWeight ??
              value?.weight ??
              value?.value ??
              0
            : value,
      }));
    }

    return [];
  }, [activeData]);

  /*
   * Mengubah data yang tersedia menjadi format ApexCharts.
   */
  const curveData = useMemo(() => {
    if (!rawChartData.length) {
      return {
        categories: [],
        series: [],
        totalWeight: 0,
        totalTransactions: 0,
      };
    }

    /*
     * Kondisi pertama:
     * history hanya berupa array angka.
     *
     * Contoh:
     * [100, 200, 300]
     */
    const allNumbers = rawChartData.every(
      (item) =>
        typeof item === "number" ||
        (typeof item === "string" &&
          Number.isFinite(Number(item)))
    );

    if (allNumbers) {
      const wasteNames =
        activeData?.wasteTypeNames ||
        activeData?.wasteTypes ||
        [];

      const categories = rawChartData.map((_, index) => {
        const wasteName = Array.isArray(wasteNames)
          ? wasteNames[index]
          : null;

        if (typeof wasteName === "string") {
          return formatWasteType(wasteName);
        }

        if (wasteName && typeof wasteName === "object") {
          return formatWasteType(getWasteType(wasteName));
        }

        return `Data ${index + 1}`;
      });

      const values = rawChartData.map((item) => Number(item) || 0);

      return {
        categories,
        series: [
          {
            name: "Berat",
            data: values,
          },
        ],
        totalWeight: values.reduce(
          (total, value) => total + value,
          0
        ),
        totalTransactions: values.length,
      };
    }

    /*
     * Menentukan apakah data memiliki tanggal transaksi.
     */
    const hasTransactionDate = rawChartData.some(
      (item) => getTransactionDate(item) !== null
    );

    /*
     * Kondisi kedua:
     * Data memiliki tanggal.
     *
     * Setiap waste type menjadi satu garis,
     * sedangkan sumbu X menggunakan tanggal.
     */
    if (hasTransactionDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start) {
        start.setHours(0, 0, 0, 0);
      }

      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      const groupedByDate = {};
      const wasteTypeSet = new Set();

      let totalWeight = 0;
      let totalTransactions = 0;

      rawChartData.forEach((item) => {
        const transactionDate = getTransactionDate(item);

        if (!transactionDate) return;

        if (start && transactionDate < start) return;
        if (end && transactionDate > end) return;

        const wasteType = formatWasteType(getWasteType(item));
        const weight = getWeight(item);

        /*
         * YYYY-MM-DD dipakai agar tanggal mudah diurutkan.
         */
        const dateKey = [
          transactionDate.getFullYear(),
          String(transactionDate.getMonth() + 1).padStart(2, "0"),
          String(transactionDate.getDate()).padStart(2, "0"),
        ].join("-");

        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = {};
        }

        groupedByDate[dateKey][wasteType] =
          (groupedByDate[dateKey][wasteType] || 0) +
          weight;

        wasteTypeSet.add(wasteType);

        totalWeight += weight;
        totalTransactions += 1;
      });

      const dateKeys = Object.keys(groupedByDate).sort();

      const categories = dateKeys.map((dateKey) => {
        const [year, month, day] = dateKey
          .split("-")
          .map(Number);

        return formatChartDate(
          new Date(year, month - 1, day)
        );
      });

      const series = Array.from(wasteTypeSet).map(
        (wasteType) => ({
          name: wasteType,
          data: dateKeys.map(
            (dateKey) =>
              groupedByDate[dateKey]?.[wasteType] || 0
          ),
        })
      );

      return {
        categories,
        series,
        totalWeight,
        totalTransactions,
      };
    }

    /*
     * Kondisi ketiga:
     * Data memiliki waste type tetapi tidak memiliki tanggal.
     *
     * Kurva dibuat berdasarkan kategori waste type.
     */
    const groupedByWasteType = {};

    rawChartData.forEach((item) => {
      const wasteType = formatWasteType(getWasteType(item));
      const weight = getWeight(item);

      groupedByWasteType[wasteType] =
        (groupedByWasteType[wasteType] || 0) +
        weight;
    });

    const categories = Object.keys(groupedByWasteType);
    const values = Object.values(groupedByWasteType);

    return {
      categories,
      series: [
        {
          name: "Berat",
          data: values,
        },
      ],
      totalWeight: values.reduce(
        (total, value) => total + value,
        0
      ),
      totalTransactions: rawChartData.length,
    };
  }, [rawChartData, activeData, startDate, endDate]);

  const chartConfig = useMemo(
    () => ({
      type: "area",
      height: 300,

      series: curveData.series,

      options: {
        chart: {
          type: "area",
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
        },

        stroke: {
          curve: "smooth",
          width: 3,
        },

        markers: {
          size: 4,
          hover: {
            size: 6,
          },
        },

        xaxis: {
          categories: curveData.categories,
          labels: {
            rotate: -30,
            trim: false,
            style: {
              fontSize: "11px",
            },
          },
        },

        yaxis: {
          min: 0,
          title: {
            text: "Berat (gram)",
          },
          labels: {
            formatter: (value) =>
              new Intl.NumberFormat("id-ID").format(
                Math.round(value)
              ),
          },
        },

        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.35,
            opacityTo: 0.05,
            stops: [0, 90, 100],
          },
        },

        dataLabels: {
          enabled: false,
        },

        legend: {
          show: true,
          position: "top",
          horizontalAlign: "left",
        },

        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: (value) =>
              `${new Intl.NumberFormat("id-ID").format(
                value
              )} gram`,
          },
        },

        grid: {
          borderColor: "#eeeeee",
          strokeDashArray: 4,
        },

        noData: {
          text: "Belum ada data yang dapat ditampilkan",
        },
      },
    }),
    [curveData]
  );

  const getDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];

    const firstDayIndex = date.getDay();

    for (let i = 0; i < firstDayIndex; i += 1) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    return days;
  };

  const handleDateClick = (date) => {
    if (!date) return;

    if (!startDate || endDate) {
      setStartDate(date);
      setEndDate(null);
      return;
    }

    if (date < startDate) {
      setStartDate(date);
      setEndDate(null);
      return;
    }

    setEndDate(date);
  };

  const formatDate = (date) => {
    if (!date) return "Pilih Tanggal";

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const handleClose = () => {
    setShowCalendar(false);
    setMachineDetail(null);
    setErrorMessage("");
    setStartDate(null);
    setEndDate(null);

    handleOpen();
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      handler={handleClose}
      size="lg"
      className="rounded-[32px] outline-none"
    >
      <div className="flex items-center justify-between border-b border-gray-50 px-8 py-5">
        <Typography
          variant="h5"
          className="font-bold text-[#2b6cb0]"
        >
          {loading
            ? "Memuat..."
            : `Smart Kontainer ${
                activeData?.machineCode ||
                activeData?.code ||
                ""
              }`}
        </Typography>

        <IconButton
          variant="text"
          color="blue-gray"
          onClick={handleClose}
          className="rounded-full"
        >
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </div>

      <DialogBody className="grid max-h-[80vh] grid-cols-1 gap-8 overflow-y-auto p-8 md:grid-cols-12">
        {loading ? (
          <div className="col-span-12 flex justify-center py-20">
            <Spinner className="h-12 w-12 text-blue-500" />
          </div>
        ) : errorMessage ? (
          <div className="col-span-12 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <Typography className="font-semibold text-red-700">
              {errorMessage}
            </Typography>
          </div>
        ) : (
          <>
            <div className="space-y-8 md:col-span-8">
              <div className="min-h-[360px] rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex justify-between gap-4">
                  <div>
                    <Typography className="font-bold text-blue-900">
                      Kurva Data Sampah
                    </Typography>

                    <Typography className="text-xs text-gray-400">
                      Kurva mengikuti data yang tersedia dari API
                    </Typography>
                  </div>

                  <div className="text-right">
                    <Typography className="text-xs font-semibold text-blue-600">
                      {curveData.totalTransactions} data
                    </Typography>

                    <Typography className="text-xs text-gray-400">
                      Total{" "}
                      {new Intl.NumberFormat("id-ID").format(
                        curveData.totalWeight
                      )}{" "}
                      gram
                    </Typography>
                  </div>
                </div>

                {isRendered ? (
                  curveData.series.length > 0 &&
                  curveData.categories.length > 0 ? (
                    <Chart
                      options={chartConfig.options}
                      series={chartConfig.series}
                      type={chartConfig.type}
                      height={chartConfig.height}
                      className="w-full"
                    />
                  ) : (
                    <div className="flex min-h-[270px] flex-col items-center justify-center">
                      <Typography className="text-sm text-gray-400">
                        Backend belum mengirim data history atau
                        waste type
                      </Typography>
                    </div>
                  )
                ) : (
                  <div className="flex min-h-[270px] items-center justify-center">
                    <Spinner className="h-7 w-7 text-blue-500" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Typography
                  variant="small"
                  className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#2b6cb0]"
                >
                  Filter Riwayat Berdasarkan Tanggal
                </Typography>

                <div className="flex flex-col items-center gap-4 md:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowCalendar(true)}
                    className="flex w-full flex-1 flex-col rounded-2xl border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-blue-300"
                  >
                    <Typography className="mb-1 ml-1 text-[10px] font-bold uppercase text-gray-400">
                      Dari Tanggal
                    </Typography>

                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-blue-500" />

                      <Typography
                        className={`text-sm font-semibold ${
                          startDate
                            ? "text-blue-900"
                            : "text-gray-400"
                        }`}
                      >
                        {formatDate(startDate)}
                      </Typography>
                    </div>
                  </button>

                  <div className="hidden font-bold text-gray-300 md:block">
                    —
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCalendar(true)}
                    className="flex w-full flex-1 flex-col rounded-2xl border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-blue-300"
                  >
                    <Typography className="mb-1 ml-1 text-[10px] font-bold uppercase text-gray-400">
                      Sampai Tanggal
                    </Typography>

                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-blue-500" />

                      <Typography
                        className={`text-sm font-semibold ${
                          endDate
                            ? "text-blue-900"
                            : "text-gray-400"
                        }`}
                      >
                        {formatDate(endDate)}
                      </Typography>
                    </div>
                  </button>
                </div>

                {(startDate || endDate) && (
                  <Button
                    variant="text"
                    size="sm"
                    className="normal-case text-red-500"
                    onClick={() => {
                      setStartDate(null);
                      setEndDate(null);
                    }}
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4 md:col-span-4">
              <div className="rounded-[24px] border border-blue-50 bg-blue-50/50 p-6">
                <Typography className="mb-1 text-[10px] font-bold uppercase text-gray-500">
                  Nama Kontainer
                </Typography>

                <Typography className="mb-4 font-bold text-blue-900">
                  {activeData?.name || "-"}
                </Typography>

                <Typography className="mb-1 text-[10px] font-bold uppercase text-gray-500">
                  Lokasi Terdaftar
                </Typography>

                <Typography className="mb-4 font-bold text-blue-900">
                  {activeData?.placeName ||
                    activeData?.address ||
                    activeData?.location ||
                    "-"}
                </Typography>

                <Typography className="mb-1 text-[10px] font-bold uppercase text-gray-500">
                  Status Mesin
                </Typography>

                <Typography className="mb-4 font-bold text-blue-900">
                  {activeData?.status || "-"}
                </Typography>

                <Typography className="mb-1 text-[10px] font-bold uppercase text-gray-500">
                  Kapasitas Saat Ini
                </Typography>

                <div className="flex items-end gap-1">
                  <Typography className="text-4xl font-black text-blue-900">
                    {activeData?.fillLevel ??
                      activeData?.fill ??
                      0}
                  </Typography>

                  <Typography className="mb-1 text-xl font-bold text-blue-600">
                    %
                  </Typography>
                </div>
              </div>
            </div>
          </>
        )}

        {showCalendar && (
          <>
            <button
              type="button"
              aria-label="Tutup kalender"
              className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-sm"
              onClick={() => setShowCalendar(false)}
            />

            <div className="fixed left-1/2 top-1/2 z-[999] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-white p-7 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <Typography className="text-lg font-bold text-blue-900">
                  {months[viewDate.getMonth()]}{" "}
                  {viewDate.getFullYear()}
                </Typography>

                <div className="flex gap-1">
                  <IconButton
                    variant="text"
                    size="sm"
                    onClick={() =>
                      setViewDate(
                        new Date(
                          viewDate.getFullYear(),
                          viewDate.getMonth() - 1,
                          1
                        )
                      )
                    }
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </IconButton>

                  <IconButton
                    variant="text"
                    size="sm"
                    onClick={() =>
                      setViewDate(
                        new Date(
                          viewDate.getFullYear(),
                          viewDate.getMonth() + 1,
                          1
                        )
                      )
                    }
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </IconButton>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-7 text-center text-[11px] font-black uppercase text-blue-200">
                {[
                  "Min",
                  "Sen",
                  "Sel",
                  "Rab",
                  "Kam",
                  "Jum",
                  "Sab",
                ].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1 text-center">
                {getDaysInMonth().map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} />;
                  }

                  const isStart =
                    startDate &&
                    startDate.toDateString() ===
                      date.toDateString();

                  const isEnd =
                    endDate &&
                    endDate.toDateString() ===
                      date.toDateString();

                  const isBetween =
                    startDate &&
                    endDate &&
                    date > startDate &&
                    date < endDate;

                  return (
                    <button
                      type="button"
                      key={date.toISOString()}
                      onClick={() => handleDateClick(date)}
                      className={`cursor-pointer rounded-xl py-3 text-sm font-semibold ${
                        isStart || isEnd
                          ? "bg-blue-700 text-white shadow-lg"
                          : "text-gray-600"
                      } ${
                        isBetween
                          ? "rounded-none bg-blue-50 text-blue-800"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <Button
                fullWidth
                className="mt-8 rounded-2xl bg-[#2b6cb0] py-4 normal-case"
                onClick={() => setShowCalendar(false)}
              >
                Terapkan Filter
              </Button>
            </div>
          </>
        )}
      </DialogBody>
    </Dialog>
  );
};

export default DetailModal;