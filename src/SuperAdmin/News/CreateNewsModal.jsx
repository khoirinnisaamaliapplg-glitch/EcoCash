import React, { useState } from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Textarea,
} from "@material-tailwind/react";

import { toast } from "react-toastify";
import api from "../../utils/api";

const CreateNewsModal = ({
  open,
  handleOpen,
  refreshData,
}) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
    status: "DRAFT",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // HANDLE IMAGE
  // =========================
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validasi tipe file
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Format gambar harus JPG, PNG, atau WEBP");
      return;
    }

    // Validasi maksimal 5 MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5 MB");
      return;
    }

    setThumbnail(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  // =========================
  // SUBMIT
  // =========================
  const submit = async () => {
    try {
      if (!form.title.trim()) {
        toast.warning("Judul berita wajib diisi");
        return;
      }

      if (!thumbnail) {
        toast.warning("Thumbnail wajib dipilih");
        return;
      }

      setLoading(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("category", form.category);
      formData.append("content", form.content);
      formData.append("status", form.status);

      // FILE GAMBAR
      formData.append("thumbnail", thumbnail);

      await api.post(
        "/superadmin/news",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Berita berhasil dibuat");

      refreshData();

      // reset
      setForm({
        title: "",
        category: "",
        content: "",
        status: "DRAFT",
      });

      setThumbnail(null);

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setPreview(null);

      handleOpen();
    } catch (error) {
      console.error(
        "Create News Error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Gagal membuat berita"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const handleClose = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setThumbnail(null);

    setForm({
      title: "",
      category: "",
      content: "",
      status: "DRAFT",
    });

    handleOpen();
  };

  return (
    <Dialog
      open={open}
      handler={handleClose}
      size="md"
    >
      <DialogHeader>
        Tambah Berita
      </DialogHeader>

      <DialogBody className="space-y-4">

        {/* JUDUL */}
        <Input
          label="Judul Berita"
          name="title"
          value={form.title}
          onChange={handleChange}
        />

        {/* KATEGORI */}
        <Input
          label="Kategori"
          name="category"
          value={form.category}
          onChange={handleChange}
        />

        {/* UPLOAD THUMBNAIL */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Thumbnail Berita
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="
              block
              w-full
              cursor-pointer
              rounded-lg
              border
              border-gray-300
              bg-white
              text-sm
              text-gray-700
              file:mr-4
              file:border-0
              file:bg-green-600
              file:px-4
              file:py-3
              file:text-sm
              file:font-medium
              file:text-white
              hover:file:bg-green-700
            "
          />

          <p className="mt-1 text-xs text-gray-500">
            JPG, PNG, atau WEBP. Maksimal 5 MB.
          </p>
        </div>

        {/* PREVIEW */}
        {preview && (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <img
              src={preview}
              alt="Preview thumbnail"
              className="
                h-52
                w-full
                object-cover
              "
            />
          </div>
        )}

        {/* CONTENT */}
        <Textarea
          label="Isi Berita"
          name="content"
          value={form.content}
          onChange={handleChange}
        />

        {/* STATUS */}
        <select
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            p-3
            outline-none
            focus:border-green-500
          "
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="DRAFT">
            Draft
          </option>

          <option value="PUBLISHED">
            Published
          </option>
        </select>

      </DialogBody>

      <DialogFooter className="gap-2">

        <Button
          variant="text"
          onClick={handleClose}
          disabled={loading}
        >
          Batal
        </Button>

        <Button
          className="bg-green-600"
          loading={loading}
          onClick={submit}
        >
          Simpan
        </Button>

      </DialogFooter>
    </Dialog>
  );
};

export default CreateNewsModal;