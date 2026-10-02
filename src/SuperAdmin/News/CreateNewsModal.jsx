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
  Button,
  Textarea,
  Typography,
} from "@material-tailwind/react";

import {
  PhotoIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";

import api from "../../utils/api";


const CreateNewsModal = ({
  open,
  handleOpen,
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
    category: "",
    content: "",
    status: "DRAFT",

    // Cloudinary handle
    imageProvider: null,
    imagePublicId: null,
  });


  // Preview URL dari API upload
  const [
    imagePreview,
    setImagePreview,
  ] = useState(null);


  // Informasi image upload
  const [
    uploadedImage,
    setUploadedImage,
  ] = useState(null);


  const fileInputRef =
    useRef(null);


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (
    e
  ) => {

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


  // =====================================================
  // VALIDATE IMAGE
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
  // HANDLE UPLOAD ERROR
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
        "Upload gambar gagal"
    );

  };


  // =====================================================
  // UPLOAD IMAGE TO CLOUDINARY VIA BACKEND
  // =====================================================

  const uploadImage = async (
    file
  ) => {

    if (!file) {
      return;
    }


    if (
      !validateImage(file)
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

      setUploadingImage(true);


      const uploadForm =
        new FormData();


      // WAJIB field "image"
      uploadForm.append(
        "image",
        file
      );


      /*
        PENTING:

        Jangan tambahkan:

        headers: {
          "Content-Type": "multipart/form-data"
        }

        Browser / Axios akan otomatis membuat
        multipart boundary.
      */

      const response =
        await api.post(
          "/superadmin/news/images",
          uploadForm
        );


      console.log(
        "IMAGE UPLOAD RESPONSE:",
        response.data
      );


      /*
        Mendukung response:

        {
          provider: "...",
          publicId: "...",
          url: "...",
          ...
        }

        ataupun:

        {
          data: {
            provider: "...",
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


      // ===============================================
      // SIMPAN HANDLE CLOUDINARY
      // ===============================================

      setForm(
        (prev) => ({
          ...prev,

          imageProvider:
            imageData.provider,

          imagePublicId:
            imageData.publicId,
        })
      );


      // ===============================================
      // SIMPAN DATA GAMBAR
      // ===============================================

      setUploadedImage(
        imageData
      );


      // ===============================================
      // PREVIEW
      //
      // Gunakan URL dari API.
      // JANGAN membuat Cloudinary URL manual.
      // ===============================================

      setImagePreview(
        imageData.thumbnailUrl ||
        imageData.url ||
        null
      );


      toast.success(
        "Gambar berhasil diupload"
      );


    } catch (error) {

      // Reset jika upload gagal

      setForm(
        (prev) => ({
          ...prev,

          imageProvider: null,
          imagePublicId: null,
        })
      );


      setUploadedImage(
        null
      );


      setImagePreview(
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

      setUploadingImage(false);

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
  // CREATE NEWS
  // =====================================================

  const submit =
    async () => {

      // ===============================================
      // VALIDATION
      // ===============================================

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
          "Isi berita wajib diisi"
        );

        return;

      }


      if (
        uploadingImage
      ) {

        toast.warning(
          "Tunggu proses upload gambar selesai"
        );

        return;

      }


      /*
        Pair harus selalu lengkap.

        Tidak boleh:
        imageProvider ada
        tapi imagePublicId kosong.

        Atau sebaliknya.
      */

      const hasProvider =
        Boolean(
          form.imageProvider
        );

      const hasPublicId =
        Boolean(
          form.imagePublicId
        );


      if (
        hasProvider !==
        hasPublicId
      ) {

        toast.error(
          "Data gambar tidak lengkap. Silakan upload ulang."
        );

        return;

      }


      try {

        setLoading(true);


        // ===============================================
        // PAYLOAD NEWS
        //
        // BUKAN FormData.
        // Kirim JSON biasa.
        // ===============================================

        const payload = {

          title:
            form.title.trim(),

          content:
            form.content.trim(),

        };


        /*
          Pertahankan category/status jika API News
          kamu memang menerima field ini.
        */

        if (
          form.category.trim()
        ) {

          payload.category =
            form.category.trim();

        }


        payload.status =
          form.status;


        // ===============================================
        // COVER IMAGE
        // ===============================================

        if (
          form.imageProvider &&
          form.imagePublicId
        ) {

          payload.imageProvider =
            form.imageProvider;

          payload.imagePublicId =
            form.imagePublicId;

        }


        console.log(
          "CREATE NEWS PAYLOAD:",
          payload
        );


        const response =
          await api.post(
            "/superadmin/news",
            payload
          );


        console.log(
          "CREATE NEWS RESPONSE:",
          response.data
        );


        toast.success(
          response.data?.message ||
            "Berita berhasil dibuat"
        );


        await refreshData();


        resetForm();


        handleOpen();


      } catch (error) {

        console.error(
          "CREATE NEWS ERROR:",
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
              "Gagal membuat berita"
          );

        }


      } finally {

        setLoading(false);

      }

    };


  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setForm({
      title: "",
      category: "",
      content: "",
      status: "DRAFT",

      imageProvider: null,
      imagePublicId: null,
    });


    setUploadedImage(
      null
    );


    setImagePreview(
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
  // CLOSE MODAL
  // =====================================================

  const handleClose = () => {

    if (
      loading ||
      uploadingImage
    ) {

      return;

    }


    resetForm();


    handleOpen();

  };


  // =====================================================
  // RESET WHEN MODAL CLOSED EXTERNALLY
  // =====================================================

  useEffect(() => {

    if (!open) {

      resetForm();

    }

  }, [open]);


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <Dialog
      open={open}
      handler={handleClose}
      size="md"
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <DialogHeader>

        Tambah Berita

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
            handleChange
          }
        />


        {/* ================================================= */}
        {/* CATEGORY */}
        {/* ================================================= */}

        <Input
          label="Kategori"
          name="category"
          value={
            form.category
          }
          onChange={
            handleChange
          }
        />


        {/* ================================================= */}
        {/* COVER IMAGE */}
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
          {/* IMAGE PREVIEW */}
          {/* =============================================== */}

          {imagePreview ? (

            <div
              className="
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-gray-50
              "
            >

              <img
                src={
                  imagePreview
                }
                alt="Preview cover berita"
                className="
                  h-52
                  w-full
                  object-cover
                "
              />

            </div>

          ) : (

            <div
              className="
                flex
                h-44
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
                    Belum ada cover
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
              file:bg-green-600
              file:px-4
              file:py-3
              file:text-sm
              file:font-medium
              file:text-white

              hover:file:bg-green-700

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
          {/* UPLOAD INFO */}
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
                Gambar berhasil
                tersimpan
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

        </div>


        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <Textarea
          label="Isi Berita"
          name="content"
          value={
            form.content
          }
          onChange={
            handleChange
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
            className="
              w-full
              rounded-lg
              border
              border-gray-300
              bg-white
              p-3
              text-sm
              outline-none

              focus:border-green-500
            "
            name="status"
            value={
              form.status
            }
            onChange={
              handleChange
            }
          >

            <option
              value="DRAFT"
            >
              Draft
            </option>


            <option
              value="PUBLISHED"
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
            bg-green-600
            shadow-none
          "
          loading={
            loading
          }
          disabled={
            uploadingImage
          }
          onClick={
            submit
          }
        >

          {uploadingImage
            ? "Uploading..."
            : "Simpan"}

        </Button>

      </DialogFooter>

    </Dialog>

  );

};


export default CreateNewsModal;