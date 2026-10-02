import React, {
  useEffect,
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
} from "@heroicons/react/24/outline";

import {
  toast,
} from "react-toastify";

import api from "../../utils/api";


// =====================================================
// GET IMAGE URL
// =====================================================

const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  // Kalau backend mengembalikan URL lengkap
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  // URL server backend
  const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:3000";

  if (imageUrl.startsWith("/")) {
    return `${SERVER_URL}${imageUrl}`;
  }

  return `${SERVER_URL}/${imageUrl}`;
};


// =====================================================
// EDIT NEWS
// =====================================================

const EditNewsModal = ({
  open,
  handleOpen,
  news,
  refreshData,
}) => {

  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    form,
    setForm,
  ] = useState({
    title: "",
    content: "",
    isPublished: false,
  });


  // File baru yang dipilih
  const [
    imageFile,
    setImageFile,
  ] = useState(null);


  // Gambar lama dari backend
  const [
    currentImage,
    setCurrentImage,
  ] = useState(null);


  // Preview gambar baru
  const [
    previewImage,
    setPreviewImage,
  ] = useState(null);


  // ===================================================
  // SET DATA NEWS
  // ===================================================

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


    // Mendukung beberapa kemungkinan field backend
    const existingImage =
      news.imageUrl ||
      news.thumbnail ||
      news.thumbnailUrl ||
      news.image ||
      null;


    setCurrentImage(
      existingImage
    );


    // Reset gambar baru
    setImageFile(null);

    setPreviewImage(null);

  }, [news]);


  // ===================================================
  // CLEANUP BLOB PREVIEW
  // ===================================================

  useEffect(() => {

    return () => {

      if (
        previewImage &&
        previewImage.startsWith(
          "blob:"
        )
      ) {

        URL.revokeObjectURL(
          previewImage
        );

      }

    };

  }, [previewImage]);


  // ===================================================
  // HANDLE TEXT
  // ===================================================

  const change = (e) => {

    const {
      name,
      value,
    } = e.target;


    setForm(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );

  };


  // ===================================================
  // HANDLE IMAGE
  // ===================================================

  const handleImageChange = (
    e
  ) => {

    const file =
      e.target.files?.[0];


    if (!file) {
      return;
    }


    // Format gambar
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      toast.error(
        "Format gambar harus JPG, JPEG, PNG, atau WEBP"
      );

      e.target.value = "";

      return;
    }


    // Maksimal 5 MB
    const maxSize =
      5 * 1024 * 1024;


    if (
      file.size > maxSize
    ) {

      toast.error(
        "Ukuran gambar maksimal 5 MB"
      );

      e.target.value = "";

      return;
    }


    // Hapus blob preview sebelumnya
    if (
      previewImage &&
      previewImage.startsWith(
        "blob:"
      )
    ) {

      URL.revokeObjectURL(
        previewImage
      );

    }


    const preview =
      URL.createObjectURL(
        file
      );


    setImageFile(file);

    setPreviewImage(
      preview
    );

  };


  // ===================================================
  // UPDATE
  // ===================================================

  const update =
    async () => {

      // VALIDASI

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


      try {

        setLoading(true);


        // ===============================================
        // FORMDATA
        // ===============================================

        const formData =
          new FormData();


        formData.append(
          "title",
          form.title.trim()
        );


        formData.append(
          "content",
          form.content.trim()
        );


        formData.append(
          "isPublished",
          String(
            form.isPublished
          )
        );


        // Kirim gambar HANYA kalau user memilih gambar baru
        if (imageFile) {

          formData.append(
            "image",
            imageFile
          );

        }


        // DEBUG
        console.log(
          "UPDATE NEWS"
        );

        for (
          const [
            key,
            value,
          ] of formData.entries()
        ) {

          console.log(
            key,
            value
          );

        }


        // ===============================================
        // REQUEST
        // ===============================================

        const response =
          await api.put(
            `/superadmin/news/${news.id}`,
            formData
          );


        console.log(
          "UPDATE RESPONSE:",
          response.data
        );


        toast.success(
          response.data?.message ||
          "Berita berhasil diperbarui"
        );


        // Refresh tabel
        await refreshData();


        // Reset
        setImageFile(null);

        setPreviewImage(null);


        handleOpen();


      } catch (error) {

        console.error(
          "UPDATE ERROR:",
          error?.response?.data ||
          error
        );


        toast.error(
          error?.response?.data
            ?.message ||
          error?.response?.data
            ?.error ||
          "Gagal update berita"
        );


      } finally {

        setLoading(false);

      }

    };


  // ===================================================
  // CLOSE
  // ===================================================

  const handleClose = () => {

    if (loading) {
      return;
    }


    if (
      previewImage &&
      previewImage.startsWith(
        "blob:"
      )
    ) {

      URL.revokeObjectURL(
        previewImage
      );

    }


    setImageFile(null);

    setPreviewImage(null);


    handleOpen();

  };


  // ===================================================
  // IMAGE TO DISPLAY
  // ===================================================

  const displayedImage =
    previewImage ||
    getImageUrl(
      currentImage
    );


  // ===================================================
  // RETURN
  // ===================================================

  return (

    <Dialog
      open={open}
      handler={
        handleClose
      }
      size="md"
    >

      {/* HEADER */}

      <DialogHeader>

        Edit Berita

      </DialogHeader>


      {/* BODY */}

      <DialogBody
        className="
          max-h-[75vh]
          space-y-5
          overflow-y-auto
        "
      >

        {/* TITLE */}

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


        {/* =========================================== */}
        {/* IMAGE */}
        {/* =========================================== */}

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

            Gambar Berita

          </Typography>


          {/* EXISTING / NEW IMAGE PREVIEW */}

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
                  "Gambar berita"
                }
                className="
                  h-56
                  w-full
                  object-cover
                "
                onError={(e) => {

                  console.error(
                    "Gambar gagal dimuat:",
                    displayedImage
                  );

                  e.currentTarget.style.display =
                    "none";

                }}
              />


              {/* LABEL GAMBAR */}

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
                  text-white
                "
              >

                {imageFile
                  ? "Gambar Baru"
                  : "Gambar Saat Ini"}

              </div>

            </div>

          ) : (

            // BELUM ADA GAMBAR

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

                Belum ada gambar

              </Typography>

            </div>

          )}


          {/* ========================================= */}
          {/* UPLOAD */}
          {/* ========================================= */}

          <div>

            <input
              type="file"
              accept="
                image/jpeg,
                image/png,
                image/webp
              "
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
              "
            />


            <Typography
              className="
                mt-2
                text-xs
                text-gray-500
              "
            >

              JPG, PNG, atau WEBP.
              Maksimal 5 MB.

              {currentImage &&
                !imageFile && (
                  <>
                    {" "}
                    Pilih gambar baru
                    jika ingin mengganti
                    gambar saat ini.
                  </>
                )}

            </Typography>

          </div>


          {/* FILE SELECTED */}

          {imageFile && (

            <div
              className="
                rounded-lg
                bg-blue-50
                px-4
                py-3
              "
            >

              <Typography
                className="
                  text-xs
                  font-medium
                  text-blue-700
                "
              >

                Gambar baru:{" "}
                {imageFile.name}

              </Typography>

            </div>

          )}

        </div>


        {/* =========================================== */}
        {/* CONTENT */}
        {/* =========================================== */}

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


        {/* =========================================== */}
        {/* STATUS */}
        {/* =========================================== */}

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


      {/* FOOTER */}

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
            bg-blue-600
            shadow-none
          "
          loading={
            loading
          }
          onClick={
            update
          }
        >

          Update

        </Button>

      </DialogFooter>

    </Dialog>

  );

};


export default EditNewsModal;