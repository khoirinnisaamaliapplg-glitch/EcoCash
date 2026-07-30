import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Typography,
  IconButton,
  Textarea,
  Spinner,
  Select,
  Option,
} from "@material-tailwind/react";

import {
  XMarkIcon,
  CpuChipIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import api from "../../utils/api";
import { toast } from "react-toastify";

// LEAFLET
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// PIN CUSTOM
import pinImage from "../../assets/pin.png";
import shadowImage from "leaflet/dist/images/marker-shadow.png";

// CUSTOM ICON
const customPinIcon = L.icon({
  iconUrl: pinImage,
  shadowUrl: shadowImage,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -34],
  shadowSize: [41, 41],
});

const defaultCenter = {
  lat: -7.3333,
  lng: 108.2225,
};

// FIX LEAFLET RESIZE DI MODAL
const ResizeMap = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
};

const CreateModal = ({
  open,
  handleOpen,
  refreshData,
  onMachineCreated,
}) => {
  const initialState = {
    machineCode: "",
    name: "",
    areaId: "",
    machineType: "BOX",
    accessType: "PUBLIC",
    organizationId: "",
    locationType: "OTHER",
    latitude: "-7.3333",
    longitude: "108.2225",
    district: "",
    subdistrict: "",
    address: "",
    placeName: "",
    description: "",
  };

  const [form, setForm] = useState(initialState);
  const [areas, setAreas] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [markerPos, setMarkerPos] = useState(defaultCenter);

  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [createdMachine, setCreatedMachine] = useState({
    id: null,
    machineCode: "",
    name: "",
    apiKey: "",
  });

  // REVERSE GEOCODING
  const fetchAddressInfo = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );

      if (!response.ok)
        throw new Error("Gagal mengambil data alamat");

      const data = await response.json();

      if (data && data.address) {
        const district =
          data.address.subdistrict ||
          data.address.city_district ||
          "";

        const subdistrict =
          data.address.village ||
          data.address.suburb ||
          data.address.neighbourhood ||
          "";

        const fullAddress = data.display_name || "";

        setForm((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          address: fullAddress,
          district: district || prev.district,
          subdistrict: subdistrict || prev.subdistrict,
        }));
      }
    } catch (error) {
      console.error("Geocoding Error:", error);

      setForm((prev) => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }));
    }
  }, []);

  // MAP EVENTS
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;

        setMarkerPos({ lat, lng });
        fetchAddressInfo(lat, lng);
      },
    });

    return null;
  };

  // MARKER DRAG
  const markerEventHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;

        if (marker != null) {
          const { lat, lng } = marker.getLatLng();

          setMarkerPos({ lat, lng });
          fetchAddressInfo(lat, lng);
        }
      },
    }),
    [fetchAddressInfo]
  );

  // LOAD AREA & GPS
  useEffect(() => {
    if (open) {
      const fetchAreas = async () => {
        try {
          setLoadingAreas(true);

          const response = await api.get("/areas");

          const areaData =
            response.data?.data || response.data;

          setAreas(
            Array.isArray(areaData)
              ? areaData.filter((area) => area.isActive)
              : []
          );
        } catch (err) {
          console.error("Gagal load area:", err);
          toast.error("Gagal mengambil data area.");
        } finally {
          setLoadingAreas(false);
        }
      };

      const fetchOrganizations = async () => {
        try {
          setLoadingOrganizations(true);

          const response = await api.get("/organizations");
          const organizationData =
            response.data?.data || response.data;

          setOrganizations(
            Array.isArray(organizationData)
              ? organizationData.filter(
                  (organization) => organization.isActive
                )
              : []
          );
        } catch (err) {
          console.error("Gagal load organisasi:", err);
          toast.error("Gagal mengambil data organisasi.");
        } finally {
          setLoadingOrganizations(false);
        }
      };

      fetchAreas();
      fetchOrganizations();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userPos = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };

            setMarkerPos(userPos);

            fetchAddressInfo(
              userPos.lat,
              userPos.lng
            );
          },
          () => {
            fetchAddressInfo(
              defaultCenter.lat,
              defaultCenter.lng
            );
          }
        );
      } else {
        fetchAddressInfo(
          defaultCenter.lat,
          defaultCenter.lng
        );
      }
    }
  }, [open, fetchAddressInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetCreateForm = () => {
    setForm(initialState);
    setMarkerPos(defaultCenter);
  };

  const handleCopyApiKey = async () => {
    if (!createdMachine.apiKey) {
      toast.error("API Key tidak tersedia.");
      return;
    }

    try {
      await navigator.clipboard.writeText(createdMachine.apiKey);
      toast.success("API Key berhasil disalin!");
    } catch (error) {
      console.error("Gagal menyalin API Key:", error);

      const textarea = document.createElement("textarea");
      textarea.value = createdMachine.apiKey;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      toast.success("API Key berhasil disalin!");
    }
  };

  const handleCloseApiKeyDialog = () => {
    setApiKeyDialogOpen(false);
    setCreatedMachine({
      id: null,
      machineCode: "",
      name: "",
      apiKey: "",
    });
  };

  const handleSubmit = async () => {
    if (
      !form.machineCode.trim() ||
      !form.name.trim() ||
      !form.areaId
    ) {
      toast.warning("Harap isi Kode, Nama, dan Area!");
      return;
    }

    if (!["PUBLIC", "ORGANIZATION"].includes(form.accessType)) {
      toast.warning("Pilih tipe akses mesin!");
      return;
    }

    if (
      form.accessType === "ORGANIZATION" &&
      !form.organizationId
    ) {
      toast.warning(
        "Pilih organisasi untuk mesin ORGANIZATION!"
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        machineCode: form.machineCode.trim().toUpperCase(),
        name: form.name.trim(),
        areaId: Number(form.areaId),
        machineType: form.machineType,
        accessType: form.accessType,
        organizationId:
          form.accessType === "ORGANIZATION"
            ? Number(form.organizationId)
            : null,
        locationType: form.locationType || "OTHER",
        latitude: Number(form.latitude) || 0,
        longitude: Number(form.longitude) || 0,
        district: form.district || "",
        subdistrict: form.subdistrict || "",
        address: form.address || "",
        placeName: form.placeName || "",
        description: form.description || "",
      };

      const response = await api.post("/machines", payload);

      // Struktur backend:
      // {
      //   message: "Machine created successfully",
      //   data: machine,
      //   apiKey: "..."
      // }
      const machineData = response.data?.data;
      const apiKey =
        response.data?.apiKey ||
        response.data?.data?.apiKey;

      if (!machineData) {
        throw new Error(
          "Data mesin tidak ditemukan pada response backend."
        );
      }

      if (!apiKey) {
        throw new Error(
          "API Key tidak ditemukan pada response backend."
        );
      }

      const createdResult = {
        ...machineData,
        apiKey,
      };

      setCreatedMachine({
        id: machineData.id,
        machineCode:
          machineData.machineCode || payload.machineCode,
        name: machineData.name || payload.name,
        apiKey,
      });

      // Kirim hasil create ke index agar API Key dapat muncul pada tabel.
      if (onMachineCreated) {
        onMachineCreated(createdResult);
      }

      resetCreateForm();
      handleOpen();
      setApiKeyDialogOpen(true);

      if (refreshData) {
        await refreshData();
      }

      toast.success(
        response.data?.message ||
          "Mesin berhasil ditambahkan!"
      );
    } catch (error) {
      console.error(
        "Create machine error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetCreateForm();
    handleOpen();
  };

  const locationOptions = [
    "OFFICE",
    "HOTEL",
    "MALL",
    "MARKET",
    "SCHOOL_CAMPUS",
    "RT_RW",
    "PARK",
    "HOSPITAL",
    "OTHER",
  ];

  return (
    <>
      <Dialog
      open={open}
      handler={handleClose}
      size="xl"
      className="
        rounded-none sm:rounded-2xl
        w-screen sm:w-full
        min-w-[100vw] sm:min-w-0
        h-screen sm:h-auto
        max-h-screen sm:max-h-[95vh]
        flex flex-col
        overflow-hidden
        m-0 sm:m-4
      "
    >
      {/* HEADER */}
      <DialogHeader className="flex justify-between items-center border-b px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <CpuChipIcon className="h-6 w-6 text-blue-600" />
          </div>

          <Typography
            variant="h5"
            className="font-bold text-blue-gray-900 text-lg sm:text-xl"
          >
            Tambah Unit AIoT Baru
          </Typography>
        </div>

        <IconButton
          variant="text"
          color="blue-gray"
          onClick={handleClose}
        >
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      {/* BODY */}
      <DialogBody
        className="
          overflow-y-auto
          flex-grow
          bg-gray-50/20
          px-3 py-3
          sm:px-6 sm:py-4
        "
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-8">

          {/* KIRI */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-green-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs">
                Lokasi Penempatan
              </Typography>
            </div>

            {/* MAP */}
            <div
              className="
                h-[250px]
                sm:h-[320px]
                md:h-[350px]
                w-full
                rounded-2xl
                overflow-hidden
                border-2 border-white
                shadow-lg
                bg-gray-100
                relative
                z-0
              "
            >
              {open && (
                <MapContainer
                  center={[
                    markerPos.lat,
                    markerPos.lng,
                  ]}
                  zoom={15}
                  tap={false}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <ResizeMap />

                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapEvents />

                  <Marker
                    position={[
                      markerPos.lat,
                      markerPos.lng,
                    ]}
                    draggable={true}
                    icon={customPinIcon}
                    eventHandlers={
                      markerEventHandlers
                    }
                  />
                </MapContainer>
              )}
            </div>

            {/* LAT LNG */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Latitude"
                name="latitude"
                value={form.latitude}
                readOnly
                className="bg-white"
              />

              <Input
                label="Longitude"
                name="longitude"
                value={form.longitude}
                readOnly
                className="bg-white"
              />
            </div>
          </div>

          {/* KANAN */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">
                Informasi & Alamat
              </Typography>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Select
                label="Pilih Area Wilayah"
                value={
                  form.areaId
                    ? form.areaId.toString()
                    : ""
                }
                onChange={(v) =>
                  setForm({
                    ...form,
                    areaId: v,
                  })
                }
                disabled={loadingAreas}
              >
                {areas.map((area) => (
                  <Option
                    key={area.id}
                    value={area.id.toString()}
                  >
                    {area.name}
                  </Option>
                ))}
              </Select>

              <Select
                label="Tipe Akses Mesin"
                value={form.accessType}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    accessType: value,
                    organizationId:
                      value === "PUBLIC"
                        ? ""
                        : prev.organizationId,
                  }))
                }
              >
                <Option value="PUBLIC">PUBLIC</Option>
                <Option value="ORGANIZATION">
                  ORGANIZATION
                </Option>
              </Select>

              {form.accessType === "ORGANIZATION" && (
                <Select
                  label="Pilih Organisasi"
                  value={
                    form.organizationId
                      ? form.organizationId.toString()
                      : ""
                  }
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      organizationId: value,
                    }))
                  }
                  disabled={loadingOrganizations}
                >
                  {organizations.map((organization) => (
                    <Option
                      key={organization.id}
                      value={organization.id.toString()}
                    >
                      {organization.name}
                    </Option>
                  ))}
                </Select>
              )}

              <Input
                label="Kode Mesin"
                name="machineCode"
                value={form.machineCode}
                onChange={handleChange}
              />

              <Input
                label="Nama Mesin"
                name="name"
                value={form.name}
                onChange={handleChange}
              />

              {/* DISTRICT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Kecamatan (Otomatis)"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                />

                <Input
                  label="Kelurahan (Otomatis)"
                  name="subdistrict"
                  value={form.subdistrict}
                  onChange={handleChange}
                />
              </div>

              <Textarea
                label="Alamat Lengkap"
                name="address"
                rows={3}
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* BAWAH */}
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Tempat (Gedung/Toko)"
              name="placeName"
              value={form.placeName}
              onChange={handleChange}
            />

            <Select
              label="Kategori Lokasi"
              value={form.locationType}
              onChange={(v) =>
                setForm({
                  ...form,
                  locationType: v,
                })
              }
            >
              {locationOptions.map((opt) => (
                <Option
                  key={opt}
                  value={opt}
                >
                  {opt.replace("_", " ")}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </DialogBody>

      {/* FOOTER */}
      <DialogFooter
        className="
          border-t
          p-3 sm:p-4
          gap-2
          bg-white
          flex-col sm:flex-row
        "
      >
        <Button
          variant="text"
          color="red"
          onClick={handleClose}
          className="w-full sm:w-auto"
        >
          Batal
        </Button>

        <Button
          variant="gradient"
          color="blue"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto sm:px-10"
        >
          {loading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            "Simpan Mesin"
          )}
        </Button>
      </DialogFooter>
      </Dialog>

      {/* DIALOG API KEY - NILAI DIAMBIL DARI response.data.apiKey */}
      <Dialog
        open={apiKeyDialogOpen}
        handler={() => {}}
        size="md"
        dismiss={{
          enabled: false,
        }}
        className="rounded-2xl overflow-hidden"
      >
        <DialogHeader className="flex items-center gap-3 border-b border-gray-200">
          <div className="rounded-full bg-green-50 p-2">
            <CheckCircleIcon className="h-7 w-7 text-green-600" />
          </div>

          <div>
            <Typography
              variant="h5"
              className="font-bold text-gray-900"
            >
              Mesin Berhasil Dibuat
            </Typography>

            <Typography className="text-sm font-normal text-gray-500">
              Simpan API Key untuk konfigurasi perangkat.
            </Typography>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-5">
          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <Typography className="text-xs font-semibold uppercase text-green-800">
              Informasi Mesin
            </Typography>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Typography className="text-xs text-gray-500">
                  Kode Mesin
                </Typography>

                <Typography className="font-bold text-gray-900">
                  {createdMachine.machineCode}
                </Typography>
              </div>

              <div>
                <Typography className="text-xs text-gray-500">
                  Nama Mesin
                </Typography>

                <Typography className="font-bold text-gray-900">
                  {createdMachine.name}
                </Typography>
              </div>
            </div>
          </div>

          <div>
            <Typography className="mb-2 text-sm font-bold text-gray-800">
              API Key
            </Typography>

            <div className="flex items-start gap-2 rounded-xl border border-blue-gray-100 bg-blue-gray-50 p-3">
              <Typography className="flex-1 break-all font-mono text-sm text-blue-gray-900">
                {createdMachine.apiKey}
              </Typography>

              <IconButton
                variant="text"
                color="blue"
                onClick={handleCopyApiKey}
                title="Salin API Key"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </IconButton>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <Typography className="text-xs leading-relaxed text-amber-900">
              API Key digunakan oleh perangkat mesin untuk terhubung
              ke backend. Simpan key ini dan jangan membagikannya
              kepada pihak yang tidak berkepentingan.
            </Typography>
          </div>
        </DialogBody>

        <DialogFooter className="flex flex-col gap-2 border-t border-gray-200 sm:flex-row">
          <Button
            variant="outlined"
            color="blue"
            onClick={handleCopyApiKey}
            className="flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            Salin API Key
          </Button>

          <Button
            color="green"
            onClick={handleCloseApiKeyDialog}
            className="w-full sm:w-auto"
          >
            Saya Sudah Menyimpannya
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default CreateModal;