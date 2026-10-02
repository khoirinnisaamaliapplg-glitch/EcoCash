import React, {
  useState,
} from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
} from "@material-tailwind/react";

import {
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import {
  toast,
} from "react-toastify";

import api from "../../utils/api";


const DeleteNewsModal = ({
  open,
  handleOpen,
  news,
  refreshData,
}) => {

  const [
    loading,
    setLoading,
  ] = useState(false);


  // =====================================================
  // DELETE NEWS
  // =====================================================

  const remove =
    async () => {

      if (!news?.id) {

        toast.error(
          "ID berita tidak ditemukan"
        );

        return;
      }


      try {

        setLoading(true);


        const response =
          await api.delete(
            `/superadmin/news/${news.id}`
          );


        console.log(
          "DELETE NEWS RESPONSE:",
          response.data
        );


        toast.success(
          response.data?.message ||
          "Berita berhasil dihapus"
        );


        // refresh table
        await refreshData();


        // tutup modal
        handleOpen();


      } catch (error) {

        console.error(
          "DELETE NEWS ERROR:",
          error?.response?.data ||
          error
        );


        const status =
          error?.response?.status;


        if (status === 400) {

          toast.error(
            error?.response?.data?.message ||
            "Berita tidak dapat dihapus"
          );

        } else if (
          status === 401
        ) {

          toast.error(
            "Sesi login berakhir. Silakan login kembali."
          );

        } else if (
          status === 403
        ) {

          toast.error(
            "Anda tidak memiliki izin untuk menghapus berita ini."
          );

        } else if (
          status === 404
        ) {

          toast.error(
            "Berita tidak ditemukan."
          );

        } else {

          toast.error(
            error?.response?.data?.message ||
            "Gagal menghapus berita"
          );

        }


      } finally {

        setLoading(false);

      }

    };


  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose =
    () => {

      if (loading) {
        return;
      }

      handleOpen();

    };


  // =====================================================
  // IMAGE
  // =====================================================

  const imageUrl =
    news?.imageThumbnailUrl ||
    news?.imageUrl ||
    null;


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <Dialog
      open={open}
      handler={
        handleClose
      }
      size="sm"
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <DialogHeader>

        Hapus Berita

      </DialogHeader>


      {/* ================================================= */}
      {/* BODY */}
      {/* ================================================= */}

      <DialogBody>

        <div
          className="
            flex
            flex-col
            items-center
            py-4
            text-center
          "
        >

          {/* WARNING ICON */}

          <div
            className="
              mb-4
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-red-50
            "
          >

            <ExclamationTriangleIcon
              className="
                h-8
                w-8
                text-red-500
              "
            />

          </div>


          {/* IMAGE */}

          {imageUrl && (

            <div
              className="
                mb-4
                h-36
                w-full
                overflow-hidden
                rounded-xl
                border
                border-gray-200
              "
            >

              <img
                src={imageUrl}
                alt={
                  news?.title ||
                  "Cover berita"
                }
                className="
                  h-full
                  w-full
                  object-cover
                "
              />

            </div>

          )}


          {/* TITLE */}

          <Typography
            variant="h6"
            className="
              mb-2
              text-gray-800
            "
          >

            Yakin ingin menghapus berita?

          </Typography>


          {/* DESCRIPTION */}

          <Typography
            className="
              max-w-[360px]
              text-sm
              text-gray-500
            "
          >

            Berita

            <span
              className="
                mx-1
                font-semibold
                text-gray-800
              "
            >
              "{news?.title}"
            </span>

            akan dihapus secara permanen.

          </Typography>

        </div>

      </DialogBody>


      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <DialogFooter
        className="
          gap-2
        "
      >

        <Button
          variant="text"
          onClick={
            handleClose
          }
          disabled={
            loading
          }
        >

          Batal

        </Button>


        <Button
          className="
            bg-red-600
            shadow-none
          "
          loading={
            loading
          }
          onClick={
            remove
          }
        >

          Hapus

        </Button>

      </DialogFooter>

    </Dialog>

  );

};


export default DeleteNewsModal;