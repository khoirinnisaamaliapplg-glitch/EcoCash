import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Button,
  Typography,
} from "@material-tailwind/react";

import {
  PhotoIcon,
  ArrowPathIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";

import api from "../../utils/api";


const EditNewsModal = ({
  open,
  handleOpen,
  news,
  refreshData,
}) => {

  // =====================================================
  // STATE
  // =====================================================

  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);


  const [
    form,
    setForm,
  ] = useState({
    title: "",
    content: "",
    isPublished: false,
  });


  // =====================================================
  // GAMBAR LAMA DARI NEWS API
  // =====================================================

  const [
    currentImage,
    setCurrentImage,
  ] = useState(null);


  // =====================================================
  // HANDLE GAMBAR BARU DARI ENDPOINT UPLOAD
  // =====================================================

  const [
    uploadedImage,
    setUploadedImage,
  ] = useState(null);


  // =====================================================
  // TRUE JIKA USER INGIN HAPUS COVER
  // =====================================================

  const [
    removeImage,
    setRemoveImage,
  ] = useState(false);


  const fileInputRef =
    useRef(null);


  // =====================================================
  // SET DATA NEWS
  // =====================================================

  useEffect(() => {

    if (!news) {
      return;
    }


    setForm({
      title:
        news.title || "",

      content:
        news.content || "",

      isPublished:
        news.isPublished ?? false,
    });


    /*
      PENTING:

      Gunakan URL yang diberikan News API.

      Jangan bikin URL Cloudinary manual.
    */

    setCurrentImage(
      news.imageUrl ||
      news.imageThumbnailUrl ||
      null
    );


    setUploadedImage(
      null
    );


    setRemoveImage(
      false
    );


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";

    }

  }, [news, open]);


  // =====================================================
  // TEXT CHANGE
  // =====================================================

  const change = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target;


    setForm(
      (prev) => ({
        ...prev,

        [name]:
          value,
      })
    );

  };


  // =====================================================
  // VALIDASI FILE
  // =====================================================

  const validateImage = (
    file
  ) => {

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      toast.error(
        "Format gambar harus JPEG, PNG, atau WebP"
      );

      return false;

    }


    const maxSize =
      5 * 1024 * 1024;


    if (
      file.size > maxSize
    ) {

      toast.error(
        "Ukuran gambar maksimal 5 MB"
      );

      return false;

    }


    return true;

  };


  // =====================================================
  // HANDLE ERROR UPLOAD
  // =====================================================

  const handleUploadError = (
    error
  ) => {

    console.error(
      "UPLOAD IMAGE ERROR:",
      error?.response?.data ||
        error
    );


    const status =
      error?.response?.status;


    if (status === 400) {

      toast.error(
        "Periksa gambar dan coba lagi"
      );

      return;

    }


    if (status === 401) {

      toast.error(
        "Sesi login berakhir. Silakan login kembali."
      );

      return;

    }


    if (status === 403) {

      toast.error(
        "Gambar tidak valid. Silakan upload ulang."
      );

      return;

    }


    if (
      status === 500 ||
      status === 502
    ) {

      toast.error(
        "Upload gambar gagal. Silakan coba lagi."
      );

      return;

    }


    toast.error(
      error?.response?.data?.message ||
        "Gagal mengupload gambar"
    );

  };


  // =====================================================
  // UPLOAD GAMBAR BARU
  // =====================================================

  const uploadImage =
    async (
      file
    ) => {

      if (!file) {
        return;
      }


      if (
        !validateImage(
          file
        )
      ) {

        if (
          fileInputRef.current
        ) {

          fileInputRef.current.value =
            "";

        }

        return;

      }


      try {

        setUploadingImage(
          true
        );


        const imageForm =
          new FormData();


        /*
          WAJIB field = image
        */

        imageForm.append(
          "image",
          file
        );


        /*
          PENTING:

          JANGAN menambahkan header:

          Content-Type:
          multipart/form-data

          Axios / Browser akan
          membuat multipart boundary
          secara otomatis.
        */

        const response =
          await api.post(
            "/superadmin/news/images",
            imageForm
          );


        console.log(
          "UPLOAD RESPONSE:",
          response.data
        );


        /*
          Support response langsung:

          {
            provider,
            publicId,
            url,
            thumbnailUrl
          }

          ataupun:

          {
            data: {
              provider,
              publicId,
              ...
            }
          }
        */

        const imageData =
          response.data?.data ||
          response.data;


        if (
          !imageData?.provider ||
          !imageData?.publicId
        ) {

          throw new Error(
            "Response upload gambar tidak valid"
          );

        }


        setUploadedImage(
          imageData
        );


        /*
          Karena user upload gambar baru,
          berarti jangan hapus cover.
        */

        setRemoveImage(
          false
        );


        toast.success(
          "Gambar baru berhasil diupload"
        );


      } catch (error) {

        setUploadedImage(
          null
        );


        if (
          fileInputRef.current
        ) {

          fileInputRef.current.value =
            "";

        }


        handleUploadError(
          error
        );


      } finally {

        setUploadingImage(
          false
        );

      }

    };


  // =====================================================
  // FILE CHANGE
  // =====================================================

  const handleImageChange = (
    e
  ) => {

    const file =
      e.target.files?.[0];


    if (!file) {
      return;
    }


    uploadImage(
      file
    );

  };


  // =====================================================
  // HAPUS COVER
  // =====================================================

  const handleRemoveImage =
    () => {

      setRemoveImage(
        true
      );


      setUploadedImage(
        null
      );


      if (
        fileInputRef.current
      ) {

        fileInputRef.current.value =
          "";

      }


      toast.info(
        "Cover akan dihapus setelah berita diperbarui"
      );

    };


  // =====================================================
  // BATAL HAPUS / KEMBALI KE GAMBAR LAMA
  // =====================================================

  const handleUseExistingImage =
    () => {

      setRemoveImage(
        false
      );


      setUploadedImage(
        null
      );


      if (
        fileInputRef.current
      ) {

        fileInputRef.current.value =
          "";

      }

    };


  // =====================================================
  // UPDATE NEWS
  // =====================================================

  const update =
    async () => {

      // ===================================================
      // VALIDASI
      // ===================================================

      if (
        !form.title.trim()
      ) {

        toast.warning(
          "Judul berita wajib diisi"
        );

        return;

      }


      if (
        !form.content.trim()
      ) {

        toast.warning(
          "Konten berita wajib diisi"
        );

        return;

      }


      if (
        uploadingImage
      ) {

        toast.warning(
          "Tunggu upload gambar selesai"
        );

        return;

      }


      try {

        setLoading(
          true
        );


        // =================================================
        // PAYLOAD JSON
        // =================================================

        const payload = {

          title:
            form.title.trim(),

          content:
            form.content.trim(),

          isPublished:
            form.isPublished,

        };


        // =================================================
        // CASE 1:
        // REMOVE IMAGE
        //
        // Kirim keduanya null
        // =================================================

        if (
          removeImage
        ) {

          payload.imageProvider =
            null;

          payload.imagePublicId =
            null;

        }


        // =================================================
        // CASE 2:
        // REPLACE IMAGE
        //
        // Kirim handle gambar baru
        // =================================================

        else if (
          uploadedImage
        ) {

          payload.imageProvider =
            uploadedImage.provider;

          payload.imagePublicId =
            uploadedImage.publicId;

        }


        // =================================================
        // CASE 3:
        // KEEP EXISTING IMAGE
        //
        // Jangan kirim imageProvider
        // Jangan kirim imagePublicId
        // =================================================


        console.log(
          "UPDATE NEWS PAYLOAD:",
          payload
        );


        const response =
          await api.put(
            `/superadmin/news/${news.id}`,
            payload
          );


        console.log(
          "UPDATE NEWS RESPONSE:",
          response.data
        );


        toast.success(
          response.data?.message ||
            "Berita berhasil diperbarui"
        );


        await refreshData();


        resetImageState();


        handleOpen();


      } catch (error) {

        console.error(
          "UPDATE NEWS ERROR:",
          error?.response?.data ||
            error
        );


        const status =
          error?.response?.status;


        if (status === 400) {

          toast.error(
            error?.response?.data?.message ||
              "Data berita atau gambar tidak valid"
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
            "Gambar tidak valid. Silakan upload ulang."
          );

        } else {

          toast.error(
            error?.response?.data?.message ||
              "Gagal memperbarui berita"
          );

        }


      } finally {

        setLoading(
          false
        );

      }

    };


  // =====================================================
  // RESET IMAGE STATE
  // =====================================================

  const resetImageState =
    () => {

      setUploadedImage(
        null
      );


      setRemoveImage(
        false
      );


      if (
        fileInputRef.current
      ) {

        fileInputRef.current.value =
          "";

      }

    };


  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose =
    () => {

      if (
        loading ||
        uploadingImage
      ) {

        return;

      }


      resetImageState();


      handleOpen();

    };


  // =====================================================
  // GAMBAR YANG DITAMPILKAN
  // =====================================================

  const displayedImage =
    removeImage
      ? null
      : uploadedImage
      ? (
          uploadedImage.thumbnailUrl ||
          uploadedImage.url ||
          null
        )
      : currentImage;


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <Dialog
      open={
        open
      }
      handler={
        handleClose
      }
      size="md"
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <DialogHeader>

        Edit Berita

      </DialogHeader>


      {/* ================================================= */}
      {/* BODY */}
      {/* ================================================= */}

      <DialogBody
        className="
          max-h-[75vh]
          space-y-5
          overflow-y-auto
        "
      >

        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <Input
          label="Judul Berita"
          name="title"
          value={
            form.title
          }
          onChange={
            change
          }
        />


        {/* ================================================= */}
        {/* IMAGE */}
        {/* ================================================= */}

        <div
          className="
            space-y-3
          "
        >

          <Typography
            className="
              text-sm
              font-medium
              text-gray-700
            "
          >

            Cover Berita

          </Typography>


          {/* =============================================== */}
          {/* PREVIEW */}
          {/* =============================================== */}

          {displayedImage ? (

            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-gray-50
              "
            >

              <img
                src={
                  displayedImage
                }
                alt={
                  form.title ||
                  "Cover berita"
                }
                className="
                  h-56
                  w-full
                  object-cover
                "
              />


              {/* LABEL */}

              <div
                className="
                  absolute
                  bottom-3
                  left-3
                  rounded-lg
                  bg-black/60
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-white
                "
              >

                {uploadedImage
                  ? "Cover Baru"
                  : "Cover Saat Ini"}

              </div>

            </div>

          ) : (

            <div
              className="
                flex
                h-48
                w-full
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-gray-300
                bg-gray-50
              "
            >

              {uploadingImage ? (

                <>

                  <ArrowPathIcon
                    className="
                      mb-2
                      h-9
                      w-9
                      animate-spin
                      text-blue-500
                    "
                  />


                  <Typography
                    className="
                      text-sm
                      text-gray-500
                    "
                  >

                    Mengupload gambar...

                  </Typography>

                </>

              ) : (

                <>

                  <PhotoIcon
                    className="
                      mb-2
                      h-10
                      w-10
                      text-gray-400
                    "
                  />


                  <Typography
                    className="
                      text-sm
                      text-gray-500
                    "
                  >

                    {removeImage
                      ? "Cover akan dihapus"
                      : "Belum ada cover"}

                  </Typography>

                </>

              )}

            </div>

          )}


          {/* =============================================== */}
          {/* FILE INPUT */}
          {/* =============================================== */}

          <input
            ref={
              fileInputRef
            }
            type="file"
            accept="
              image/jpeg,
              image/png,
              image/webp
            "
            disabled={
              uploadingImage ||
              loading
            }
            onChange={
              handleImageChange
            }
            className="
              block
              w-full
              cursor-pointer
              rounded-xl
              border
              border-gray-300
              bg-white
              text-sm
              text-gray-600

              file:mr-4
              file:border-0
              file:bg-[#2b6cb0]
              file:px-4
              file:py-3
              file:text-sm
              file:font-medium
              file:text-white

              hover:file:bg-blue-700

              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />


          <Typography
            className="
              text-xs
              text-gray-500
            "
          >

            JPEG, PNG, atau WebP.
            Maksimal 5 MB.

          </Typography>


          {/* =============================================== */}
          {/* INFO UPLOAD BARU */}
          {/* =============================================== */}

          {uploadedImage && (

            <div
              className="
                rounded-xl
                border
                border-green-100
                bg-green-50
                p-3
              "
            >

              <Typography
                className="
                  text-xs
                  font-semibold
                  text-green-700
                "
              >

                Cover baru berhasil
                diupload

              </Typography>


              <Typography
                className="
                  mt-1
                  text-xs
                  text-gray-600
                "
              >

                {uploadedImage.width &&
                uploadedImage.height
                  ? `${uploadedImage.width} × ${uploadedImage.height}px`
                  : ""}


                {uploadedImage.format
                  ? ` • ${uploadedImage.format.toUpperCase()}`
                  : ""}

              </Typography>

            </div>

          )}


          {/* =============================================== */}
          {/* IMAGE ACTIONS */}
          {/* =============================================== */}

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >

            {/* HAPUS COVER */}

            {(currentImage ||
              uploadedImage) &&
              !removeImage && (

              <Button
                size="sm"
                variant="outlined"
                color="red"
                disabled={
                  loading ||
                  uploadingImage
                }
                onClick={
                  handleRemoveImage
                }
                className="
                  flex
                  items-center
                  gap-2
                  normal-case
                "
              >

                <TrashIcon
                  className="
                    h-4
                    w-4
                  "
                />

                Hapus Cover

              </Button>

            )}


            {/* BATAL GANTI */}

            {uploadedImage &&
              currentImage &&
              !removeImage && (

              <Button
                size="sm"
                variant="outlined"
                disabled={
                  loading ||
                  uploadingImage
                }
                onClick={
                  handleUseExistingImage
                }
                className="
                  flex
                  items-center
                  gap-2
                  normal-case
                "
              >

                <ArrowUturnLeftIcon
                  className="
                    h-4
                    w-4
                  "
                />

                Gunakan Cover Lama

              </Button>

            )}


            {/* BATAL HAPUS */}

            {removeImage &&
              currentImage && (

              <Button
                size="sm"
                variant="outlined"
                disabled={
                  loading ||
                  uploadingImage
                }
                onClick={
                  handleUseExistingImage
                }
                className="
                  flex
                  items-center
                  gap-2
                  normal-case
                "
              >

                <ArrowUturnLeftIcon
                  className="
                    h-4
                    w-4
                  "
                />

                Batalkan Hapus

              </Button>

            )}

          </div>

        </div>


        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <Textarea
          label="Konten Berita"
          name="content"
          value={
            form.content
          }
          onChange={
            change
          }
          rows={7}
        />


        {/* ================================================= */}
        {/* STATUS */}
        {/* ================================================= */}

        <div>

          <label
            className="
              mb-2
              block
              text-sm
              font-medium
              text-gray-700
            "
          >

            Status Berita

          </label>


          <select
            name="isPublished"
            value={
              String(
                form.isPublished
              )
            }
            onChange={(e) => {

              setForm(
                (prev) => ({
                  ...prev,

                  isPublished:
                    e.target.value ===
                    "true",
                })
              );

            }}
            className="
              w-full
              rounded-lg
              border
              border-gray-300
              bg-white
              p-3
              text-sm
              outline-none

              focus:border-blue-500
            "
          >

            <option
              value="false"
            >
              Draft
            </option>


            <option
              value="true"
            >
              Published
            </option>

          </select>

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
            loading ||
            uploadingImage
          }
        >

          Batal

        </Button>


        <Button
          className="
            bg-blue-600
            shadow-none
          "
          loading={
            loading
          }
          disabled={
            uploadingImage
          }
          onClick={
            update
          }
        >

          {uploadingImage
            ? "Uploading..."
            : "Update"}

        </Button>

      </DialogFooter>

    </Dialog>

  );

};


export default EditNewsModal;