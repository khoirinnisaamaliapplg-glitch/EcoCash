import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import api from "../../utils/api";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Typography,
  Textarea,
  Spinner,
  IconButton,
} from "@material-tailwind/react";

import { XMarkIcon } from "@heroicons/react/24/outline";

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

// PIN
import pinImage from "../../assets/pin.png";

import shadowImage from "leaflet/dist/images/marker-shadow.png";

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

// FIX RESIZE MAP
const ResizeMap = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);

  return null;
};

const CreateStoreModal = ({
  open,
  handleOpen,
  onSuccess,
}) => {

  const initialState = {
    name: "",
    address: "",
    district: "",
    subdistrict: "",
    latitude: "-7.3333",
    longitude: "108.2225",
    areaId: "",

    admin: {
      name: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
    },
  };

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState(initialState);

  const [markerPos, setMarkerPos] =
    useState(defaultCenter);

  // REVERSE GEOCODING
  const fetchAddressInfo =
    useCallback(async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );

        const data =
          await response.json();

        if (data && data.address) {
          setFormData((prev) => ({
            ...prev,

            latitude:
              lat.toFixed(6),

            longitude:
              lng.toFixed(6),

            address:
              data.display_name ||
              "",

            district:
              data.address
                .subdistrict ||
              data.address
                .city_district ||
              "",

            subdistrict:
              data.address
                .village ||
              data.address
                .suburb ||
              "",
          }));
        }
      } catch (error) {
        setFormData((prev) => ({
          ...prev,
          latitude:
            lat.toFixed(6),
          longitude:
            lng.toFixed(6),
        }));
      }
    }, []);

  // MAP EVENTS
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setMarkerPos({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });

        fetchAddressInfo(
          e.latlng.lat,
          e.latlng.lng
        );
      },
    });

    return null;
  };

  // DRAG MARKER
  const markerEventHandlers =
    useMemo(
      () => ({
        dragend(e) {
          const { lat, lng } =
            e.target.getLatLng();

          setMarkerPos({
            lat,
            lng,
          });

          fetchAddressInfo(
            lat,
            lng
          );
        },
      }),
      [fetchAddressInfo]
    );

  // GET USER LOCATION
  useEffect(() => {
    if (open) {
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

          () =>
            fetchAddressInfo(
              defaultCenter.lat,
              defaultCenter.lng
            )
        );
      }
    }
  }, [open, fetchAddressInfo]);

  // HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value } =
      e.target;

    if (name.includes("admin.")) {
      const field =
        name.split(".")[1];

      setFormData((prev) => ({
        ...prev,

        admin: {
          ...prev.admin,
          [field]: value,
        },
      }));

    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // SUBMIT
  const handleSubmit =
    async () => {

      if (
        !formData.name ||
        !formData.areaId ||
        !formData.admin.email
      ) {
        toast.warn(
          "Mohon isi: Nama Toko, ID Area, dan Email Admin"
        );

        return;
      }

      setLoading(true);

      try {
        await api.post("/stores", {
          ...formData,

          areaId: Number(
            formData.areaId
          ),

          latitude:
            parseFloat(
              formData.latitude
            ),

          longitude:
            parseFloat(
              formData.longitude
            ),
        });

        toast.success(
          "Toko berhasil ditambahkan!"
        );

        onSuccess();

        handleClose();

      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Gagal menambah toko"
        );

      } finally {
        setLoading(false);
      }
    };

  // CLOSE
  const handleClose = () => {
    setFormData(initialState);

    setMarkerPos(defaultCenter);

    handleOpen();
  };

  return (
    <Dialog
      open={open}
      handler={handleClose}
      size="xl"
      className="
        w-screen
        h-screen
        sm:h-auto
        sm:max-h-[95vh]
        max-w-[100vw]
        sm:max-w-6xl
        rounded-none
        sm:rounded-2xl
        flex
        flex-col
        overflow-hidden
        m-0
        sm:m-4
      "
    >

      {/* HEADER */}
      <DialogHeader
        className="
          flex
          items-center
          justify-between
          border-b
          px-4
          sm:px-6
          py-4
          shrink-0
        "
      >
        <Typography
          variant="h5"
          className="
            font-black
            text-base
            sm:text-xl
          "
        >
          Tambah Unit Toko Baru
        </Typography>

        <IconButton
          variant="text"
          onClick={handleClose}
        >
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      {/* BODY */}
      <DialogBody
        className="
          overflow-y-auto
          px-4
          sm:px-6
          py-4
          flex-1
        "
      >

        <div
          className="
            grid
            grid-cols-1
            xl:grid-cols-2
            gap-6
            xl:gap-8
          "
        >

          {/* MAP */}
          <div className="space-y-4">

            <Typography
              className="
                font-bold
                text-blue-600
                border-l-4
                border-blue-600
                pl-2
                text-[11px]
                uppercase
                italic
              "
            >
              Titik Lokasi Toko
            </Typography>

            <div
              className="
                h-[250px]
                sm:h-[320px]
                md:h-[400px]
                w-full
                rounded-2xl
                overflow-hidden
                shadow-lg
                border-2
                border-white
              "
            >
              {open && (
                <MapContainer
                  center={[
                    markerPos.lat,
                    markerPos.lng,
                  ]}
                  zoom={15}
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <ResizeMap />

                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  <MapEvents />

                  <Marker
                    position={[
                      markerPos.lat,
                      markerPos.lng,
                    ]}
                    draggable={true}
                    icon={
                      customPinIcon
                    }
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
                value={
                  formData.latitude
                }
                readOnly
              />

              <Input
                label="Longitude"
                value={
                  formData.longitude
                }
                readOnly
              />
            </div>
          </div>

          {/* FORM */}
          <div className="space-y-4">

            <Typography
              className="
                font-bold
                text-blue-600
                border-l-4
                border-blue-600
                pl-2
                text-[11px]
                uppercase
                italic
              "
            >
              Informasi Alamat
            </Typography>

            <Input
              label="Nama Toko"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <Input
              label="ID Area (Angka)"
              name="areaId"
              type="number"
              value={formData.areaId}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <Input
                label="Kecamatan"
                name="district"
                value={
                  formData.district
                }
                onChange={
                  handleChange
                }
              />

              <Input
                label="Kelurahan"
                name="subdistrict"
                value={
                  formData.subdistrict
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <Textarea
              label="Alamat Lengkap"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ADMIN */}
        <div
          className="
            space-y-4
            pt-6
            border-t
            mt-6
          "
        >

          <Typography
            className="
              font-bold
              text-green-600
              border-l-4
              border-green-600
              pl-2
              text-[11px]
              uppercase
              italic
            "
          >
            Registrasi Akun Admin
            Toko
          </Typography>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >

            <Input
              label="Nama Lengkap"
              name="admin.name"
              value={
                formData.admin.name
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="No WhatsApp"
              name="admin.phoneNumber"
              value={
                formData.admin
                  .phoneNumber
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="Username"
              name="admin.username"
              value={
                formData.admin
                  .username
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="Email"
              type="email"
              name="admin.email"
              value={
                formData.admin.email
              }
              onChange={
                handleChange
              }
            />

            <div className="md:col-span-2">
              <Input
                label="Password"
                type="password"
                name="admin.password"
                value={
                  formData.admin
                    .password
                }
                onChange={
                  handleChange
                }
              />
            </div>
          </div>
        </div>
      </DialogBody>

      {/* FOOTER */}
      <DialogFooter
        className="
          border-t
          px-4
          sm:px-6
          py-4
          gap-3
          shrink-0
          flex-col
          sm:flex-row
        "
      >

        <Button
          fullWidth
          className="sm:w-auto"
          variant="text"
          color="red"
          onClick={handleClose}
        >
          Batal
        </Button>

        <Button
          fullWidth
          className="
            sm:w-auto
            bg-blue-700
            px-10
            rounded-full
            font-bold
          "
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Spinner className="h-4 w-4 mx-auto" />
          ) : (
            "Simpan Toko"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateStoreModal;