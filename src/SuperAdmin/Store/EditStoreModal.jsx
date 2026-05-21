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
  IconButton,
  Spinner,
} from "@material-tailwind/react";

import {
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

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

// FIX MAP RESIZE
const ResizeMap = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);

  return null;
};

const EditStoreModal = ({
  open,
  handleOpen,
  data,
  onSuccess,
}) => {

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
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
        phoneNumber: "",
      },
    });

  const [markerPos, setMarkerPos] =
    useState(defaultCenter);

  // SET DATA
  useEffect(() => {
    if (data && open) {

      const lat =
        parseFloat(data.latitude) ||
        defaultCenter.lat;

      const lng =
        parseFloat(data.longitude) ||
        defaultCenter.lng;

      setFormData({
        name: data.name || "",
        address:
          data.address || "",

        district:
          data.district || "",

        subdistrict:
          data.subdistrict ||
          "",

        latitude:
          lat.toString(),

        longitude:
          lng.toString(),

        areaId:
          data.areaId || "",

        admin: {
          name:
            data.admin?.name ||
            "",

          username:
            data.admin
              ?.username || "",

          email:
            data.admin?.email ||
            "",

          phoneNumber:
            data.admin
              ?.phoneNumber ||
            "",
        },
      });

      setMarkerPos({
        lat,
        lng,
      });
    }
  }, [data, open]);

  // REVERSE GEOCODING
  const fetchAddressInfo =
    useCallback(async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );

        const result =
          await response.json();

        if (
          result &&
          result.address
        ) {
          setFormData((prev) => ({
            ...prev,

            latitude:
              lat.toFixed(6),

            longitude:
              lng.toFixed(6),

            address:
              result.display_name ||
              prev.address,

            district:
              result.address
                .subdistrict ||
              result.address
                .city_district ||
              prev.district,

            subdistrict:
              result.address
                .village ||
              result.address
                .suburb ||
              prev.subdistrict,
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

          const {
            lat,
            lng,
          } = e.target.getLatLng();

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

  // HANDLE INPUT
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

      setLoading(true);

      try {

        await api.patch(
          `/stores/${data.id}`,
          {
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
          }
        );

        toast.success(
          "Berhasil update data toko!"
        );

        onSuccess();

        handleOpen();

      } catch (error) {

        toast.error(
          error.response?.data
            ?.message ||
            "Gagal update toko"
        );

      } finally {

        setLoading(false);
      }
    };

  return (
    <Dialog
      open={open}
      handler={handleOpen}
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

        <div className="flex items-center gap-3">

          <div className="p-2 rounded-lg bg-blue-50">
            <PencilSquareIcon className="h-5 w-5 text-blue-700" />
          </div>

          <Typography
            variant="h5"
            className="
              text-base
              sm:text-xl
              font-bold
              text-blue-900
            "
          >
            Edit Toko
          </Typography>
        </div>

        <IconButton
          variant="text"
          onClick={handleOpen}
        >
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      {/* BODY */}
      <DialogBody
        className="
          px-4
          sm:px-6
          py-4
          overflow-y-auto
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
                border-2
                shadow-inner
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
                text-green-600
                border-l-4
                border-green-600
                pl-2
                text-[11px]
                uppercase
                italic
              "
            >
              Informasi Toko
            </Typography>

            <Input
              label="Nama Toko"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <Input
              label="ID Area"
              type="number"
              name="areaId"
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
            mt-6
            border-t
          "
        >

          <Typography
            className="
              font-bold
              text-purple-600
              border-l-4
              border-purple-600
              pl-2
              text-[11px]
              uppercase
              italic
            "
          >
            Data Admin Toko
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
              label="Nama Admin"
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
          onClick={handleOpen}
        >
          Batal
        </Button>

        <Button
          fullWidth
          className="
            sm:w-auto
            bg-blue-700
            px-10
            rounded-xl
          "
          onClick={handleSubmit}
          disabled={loading}
        >

          {loading ? (
            <Spinner className="h-4 w-4 mx-auto" />
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditStoreModal;