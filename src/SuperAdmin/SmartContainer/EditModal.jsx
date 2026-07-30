import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

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

// CUSTOM PIN ICON
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

// FIX LEAFLET RESIZE
const ResizeMap = () => {
  const map = useMap();

  useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timeout);
  }, [map]);

  return null;
};

const EditModal = ({
  open,
  handleOpen,
  data,
  refreshData,
}) => {
  const [formData, setFormData] = useState({});
  const [areas, setAreas] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] =
    useState(false);

  const [markerPos, setMarkerPos] =
    useState(defaultCenter);

  // REVERSE GEOCODING
  const fetchAddressInfo = useCallback(
    async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );

        if (!response.ok) {
          throw new Error(
            "Gagal mengambil data alamat"
          );
        }

        const resData = await response.json();

        if (resData?.address) {
          const district =
            resData.address.subdistrict ||
            resData.address.city_district ||
            "";

          const subdistrict =
            resData.address.village ||
            resData.address.suburb ||
            resData.address.neighbourhood ||
            "";

          const fullAddress =
            resData.display_name || "";

          setFormData((prev) => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
            address: fullAddress,
            district:
              district || prev.district,
            subdistrict:
              subdistrict ||
              prev.subdistrict,
          }));
        }
      } catch (error) {
        console.error(
          "Geocoding Error:",
          error
        );

        setFormData((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        }));
      }
    },
    []
  );

  // MAP EVENTS
  const MapEvents = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;

        setMarkerPos({ lat, lng });
        fetchAddressInfo(lat, lng);
      },
    });

    useEffect(() => {
      if (open && markerPos) {
        map.flyTo(
          [
            markerPos.lat,
            markerPos.lng,
          ],
          map.getZoom()
        );
      }
    }, [
      markerPos.lat,
      markerPos.lng,
      map,
      open,
    ]);

    return null;
  };

  // MARKER DRAG
  const markerEventHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;

        if (marker) {
          const { lat, lng } =
            marker.getLatLng();

          setMarkerPos({ lat, lng });
          fetchAddressInfo(lat, lng);
        }
      },
    }),
    [fetchAddressInfo]
  );

  // LOAD MACHINE DATA
  useEffect(() => {
    if (!data || !open) return;

    const cleanId = Number(data.id);

    const initialLat =
      Number.parseFloat(data.latitude) ||
      defaultCenter.lat;

    const initialLng =
      Number.parseFloat(data.longitude) ||
      defaultCenter.lng;

    const currentAreaId =
      data.areaId ??
      data.area?.id ??
      "";

    const currentOrganizationId =
      data.organizationId ??
      data.organization?.id ??
      "";

    setMarkerPos({
      lat: initialLat,
      lng: initialLng,
    });

    setFormData({
      id: cleanId,
      machineCode:
        data.machineCode || "",
      name: data.name || "",
      areaId:
        currentAreaId !== ""
          ? String(currentAreaId)
          : "",
      machineType:
        data.machineType || "BOX",

      // TIPE AKSES MESIN
      accessType:
        data.accessType || "PUBLIC",
      organizationId:
        currentOrganizationId !== ""
          ? String(currentOrganizationId)
          : "",

      locationType:
        data.locationType || "OTHER",
      placeName:
        data.placeName || "",
      latitude:
        String(initialLat),
      longitude:
        String(initialLng),
      address:
        data.address || "",
      district:
        data.district || "",
      subdistrict:
        data.subdistrict || "",
      description:
        data.description || "",
    });
  }, [data, open]);

  // LOAD AREA DAN ORGANIZATION
  useEffect(() => {
    if (!open) return;

    const fetchAreas = async () => {
      try {
        setLoadingAreas(true);

        const response =
          await api.get("/areas");

        const areaData =
          response.data?.data ||
          response.data;

        setAreas(
          Array.isArray(areaData)
            ? areaData.filter(
                (area) => area.isActive
              )
            : []
        );
      } catch (error) {
        console.error(
          "Gagal load area:",
          error.response?.data ||
            error.message
        );

        toast.error(
          "Gagal memuat daftar area."
        );
      } finally {
        setLoadingAreas(false);
      }
    };

    const fetchOrganizations = async () => {
      try {
        setLoadingOrganizations(true);

        const response =
          await api.get("/organizations");

        const organizationData =
          response.data?.data ||
          response.data;

        setOrganizations(
          Array.isArray(organizationData)
            ? organizationData.filter(
                (organization) =>
                  organization.isActive
              )
            : []
        );
      } catch (error) {
        console.error(
          "Gagal load organisasi:",
          error.response?.data ||
            error.message
        );

        toast.error(
          "Gagal memuat daftar organisasi."
        );
      } finally {
        setLoadingOrganizations(false);
      }
    };

    fetchAreas();
    fetchOrganizations();
  }, [open]);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // UPDATE
  const handleUpdate = async () => {
    if (
      !formData.id ||
      Number.isNaN(Number(formData.id))
    ) {
      toast.error(
        "ID Unit tidak valid."
      );
      return;
    }

    if (
      !formData.machineCode?.trim() ||
      !formData.name?.trim() ||
      !formData.areaId
    ) {
      toast.warning(
        "Kode mesin, nama mesin, dan area wajib diisi."
      );
      return;
    }

    if (
      !["PUBLIC", "ORGANIZATION"].includes(
        formData.accessType
      )
    ) {
      toast.warning(
        "Pilih tipe akses mesin."
      );
      return;
    }

    if (
      formData.accessType ===
        "ORGANIZATION" &&
      !formData.organizationId
    ) {
      toast.warning(
        "Pilih organisasi untuk mesin bertipe ORGANIZATION."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        machineCode:
          formData.machineCode
            .trim()
            .toUpperCase(),

        name:
          formData.name.trim(),

        areaId:
          Number(formData.areaId),

        machineType:
          formData.machineType,

        accessType:
          formData.accessType,

        organizationId:
          formData.accessType ===
          "ORGANIZATION"
            ? Number(
                formData.organizationId
              )
            : null,

        locationType:
          formData.locationType ||
          "OTHER",

        latitude:
          Number.parseFloat(
            formData.latitude
          ) || 0,

        longitude:
          Number.parseFloat(
            formData.longitude
          ) || 0,

        address:
          formData.address || "",

        placeName:
          formData.placeName || "",

        district:
          formData.district || "",

        subdistrict:
          formData.subdistrict || "",

        description:
          formData.description || "",
      };

      const response =
        await api.patch(
          `/machines/${formData.id}`,
          payload
        );

      toast.success(
        response.data?.message ||
          "Perubahan berhasil disimpan!"
      );

      handleOpen();

      if (refreshData) {
        await refreshData();
      }
    } catch (error) {
      console.error(
        "PATCH ERROR:",
        error.response?.data ||
          error.message
      );

      const errorMsg =
        error.response?.data?.message ||
        "Gagal memperbarui data unit AIoT.";

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
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
    <Dialog
      open={open}
      handler={handleOpen}
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
            className="font-bold text-blue-gray-900 text-base sm:text-xl"
          >
            Edit Unit AIoT:{" "}
            {formData.machineCode}
          </Typography>
        </div>

        <IconButton
          variant="text"
          color="blue-gray"
          onClick={handleOpen}
        >
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      {/* BODY */}
      <DialogBody
        className="
          overflow-y-auto
          px-3 py-3
          sm:px-6 sm:py-4
          flex-grow
          bg-gray-50/20
          custom-scrollbar
        "
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-8">
          {/* MAP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-green-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs">
                Ubah Posisi Koordinat
              </Typography>
            </div>

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
                    draggable
                    icon={customPinIcon}
                    eventHandlers={
                      markerEventHandlers
                    }
                  />
                </MapContainer>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Latitude"
                name="latitude"
                value={
                  formData.latitude || ""
                }
                readOnly
                className="bg-white"
              />

              <Input
                label="Longitude"
                name="longitude"
                value={
                  formData.longitude || ""
                }
                readOnly
                className="bg-white"
              />
            </div>
          </div>

          {/* FORM */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              <Typography className="font-bold text-gray-800 uppercase text-xs tracking-wider">
                Informasi & Alamat
              </Typography>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Select
                label="Area"
                value={
                  formData.areaId || ""
                }
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    areaId: value,
                  }))
                }
                disabled={loadingAreas}
              >
                {areas.map((area) => (
                  <Option
                    key={area.id}
                    value={String(area.id)}
                  >
                    {area.name}
                  </Option>
                ))}
              </Select>

              <Input
                label="Kode Mesin"
                name="machineCode"
                value={
                  formData.machineCode ||
                  ""
                }
                onChange={handleChange}
              />

              <Input
                label="Nama Mesin"
                name="name"
                value={
                  formData.name || ""
                }
                onChange={handleChange}
              />

              {/* TIPE MESIN DAN TIPE AKSES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Tipe Mesin"
                  value={
                    formData.machineType ||
                    "BOX"
                  }
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      machineType: value,
                    }))
                  }
                >
                  <Option value="BOX">
                    BOX
                  </Option>

                  <Option value="CONTAINER">
                    CONTAINER
                  </Option>
                </Select>

                <Select
                  label="Tipe Akses Mesin"
                  value={
                    formData.accessType ||
                    "PUBLIC"
                  }
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      accessType: value,
                      organizationId:
                        value === "PUBLIC"
                          ? ""
                          : prev.organizationId,
                    }))
                  }
                >
                  <Option value="PUBLIC">
                    PUBLIC
                  </Option>

                  <Option value="ORGANIZATION">
                    ORGANIZATION
                  </Option>
                </Select>
              </div>

              {/* PILIH ORGANISASI */}
              {formData.accessType ===
                "ORGANIZATION" && (
                <Select
                  label="Pilih Organisasi"
                  value={
                    formData.organizationId ||
                    ""
                  }
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      organizationId: value,
                    }))
                  }
                  disabled={
                    loadingOrganizations
                  }
                >
                  {organizations.map(
                    (organization) => (
                      <Option
                        key={organization.id}
                        value={String(
                          organization.id
                        )}
                      >
                        {organization.name}
                      </Option>
                    )
                  )}
                </Select>
              )}

              <Select
                label="Kategori Lokasi"
                value={
                  formData.locationType ||
                  "OTHER"
                }
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    locationType: value,
                  }))
                }
              >
                {locationOptions.map(
                  (option) => (
                    <Option
                      key={option}
                      value={option}
                    >
                      {option.replace(
                        "_",
                        " "
                      )}
                    </Option>
                  )
                )}
              </Select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Kecamatan"
                  name="district"
                  value={
                    formData.district ||
                    ""
                  }
                  onChange={handleChange}
                />

                <Input
                  label="Kelurahan"
                  name="subdistrict"
                  value={
                    formData.subdistrict ||
                    ""
                  }
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Nama Tempat"
                name="placeName"
                value={
                  formData.placeName ||
                  ""
                }
                onChange={handleChange}
              />

              <Textarea
                label="Alamat Lengkap"
                name="address"
                rows={3}
                value={
                  formData.address || ""
                }
                onChange={handleChange}
              />

              <Textarea
                label="Deskripsi"
                name="description"
                rows={2}
                value={
                  formData.description ||
                  ""
                }
                onChange={handleChange}
              />
            </div>
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
          onClick={handleOpen}
          className="w-full sm:w-auto"
        >
          Batal
        </Button>

        <Button
          variant="gradient"
          color="blue"
          onClick={handleUpdate}
          disabled={loading}
          className="w-full sm:w-auto sm:px-10"
        >
          {loading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditModal;