import React, {
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
} from "@material-tailwind/react";

import { toast } from "react-toastify";

import api from "../../utils/api";


const CreateFaqModal = ({
  open,
  handleOpen,
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
    question: "",
    answer: "",
    category: "",
    isActive: true,
  });


  // ==========================================
  // HANDLE CHANGE
  // ==========================================

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

        [name]:
          name === "isActive"
            ? value === "true"
            : value,
      })
    );

  };


  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {

    setForm({
      question: "",
      answer: "",
      category: "",
      isActive: true,
    });

  };


  // ==========================================
  // SUBMIT
  // ==========================================

  const submit =
    async () => {

      if (
        !form.question.trim()
      ) {

        toast.warning(
          "Pertanyaan wajib diisi"
        );

        return;

      }


      if (
        !form.answer.trim()
      ) {

        toast.warning(
          "Jawaban wajib diisi"
        );

        return;

      }


      try {

        setLoading(true);


        const payload = {

          question:
            form.question.trim(),

          answer:
            form.answer.trim(),

          category:
            form.category.trim(),

          isActive:
            form.isActive,

        };


        console.log(
          "CREATE FAQ PAYLOAD:",
          payload
        );


        const response =
          await api.post(
            "/superadmin/faqs",
            payload
          );


        console.log(
          "CREATE FAQ RESPONSE:",
          response.data
        );


        toast.success(
          response.data?.message ||
            "FAQ berhasil dibuat"
        );


        resetForm();


        await refreshData();


        handleOpen();

      } catch (error) {

        console.error(
          "CREATE FAQ ERROR:",
          error?.response?.data ||
            error
        );


        toast.error(
          error?.response?.data
            ?.message ||
            "Gagal membuat FAQ"
        );

      } finally {

        setLoading(false);

      }

    };


  // ==========================================
  // CLOSE
  // ==========================================

  const handleClose = () => {

    if (loading) return;

    resetForm();

    handleOpen();

  };


  return (

    <Dialog
      open={open}
      handler={handleClose}
      size="md"
    >

      <DialogHeader>

        Tambah FAQ

      </DialogHeader>


      <DialogBody
        className="
          space-y-5
        "
      >

        {/* QUESTION */}

        <Textarea
          label="Pertanyaan"
          name="question"
          value={
            form.question
          }
          onChange={
            handleChange
          }
          rows={3}
        />


        {/* ANSWER */}

        <Textarea
          label="Jawaban"
          name="answer"
          value={
            form.answer
          }
          onChange={
            handleChange
          }
          rows={6}
        />


        {/* CATEGORY */}

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


        {/* STATUS */}

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

            Status FAQ

          </label>


          <select
            name="isActive"
            value={
              String(
                form.isActive
              )
            }
            onChange={
              handleChange
            }
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

            <option value="true">

              Active

            </option>

            <option value="false">

              Inactive

            </option>

          </select>

        </div>

      </DialogBody>


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
          onClick={
            submit
          }
          loading={
            loading
          }
          className="
            bg-[#66bb6a]
            shadow-none
          "
        >
          Simpan
        </Button>

      </DialogFooter>

    </Dialog>

  );
};

export default CreateFaqModal;