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
  Button,
  Textarea,
} from "@material-tailwind/react";

import { toast } from "react-toastify";

import api from "../../utils/api";


const EditFaqModal = ({
  open,
  handleOpen,
  faq,
  refreshData,
}) => {

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingDetail,
    setLoadingDetail,
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
  // GET DETAIL FAQ
  // ==========================================

  useEffect(() => {

    if (
      !open ||
      !faq?.id
    ) {
      return;
    }


    const fetchDetail =
      async () => {

        try {

          setLoadingDetail(
            true
          );


          const response =
            await api.get(
              `/faqs/${faq.id}`
            );


          console.log(
            "FAQ DETAIL RESPONSE:",
            response.data
          );


          const data =
            response.data?.data;


          setForm({

            question:
              data?.question ||
              "",

            answer:
              data?.answer ||
              "",

            category:
              data?.category ||
              "",

            isActive:
              data?.isActive ??
              true,

          });

        } catch (error) {

          console.error(
            "GET FAQ DETAIL ERROR:",
            error?.response?.data ||
              error
          );


          toast.error(
            error?.response?.data
              ?.message ||
              "Gagal mengambil detail FAQ"
          );


          // fallback pakai data tabel

          setForm({

            question:
              faq?.question ||
              "",

            answer:
              faq?.answer ||
              "",

            category:
              faq?.category ||
              "",

            isActive:
              faq?.isActive ??
              true,

          });

        } finally {

          setLoadingDetail(
            false
          );

        }

      };


    fetchDetail();

  }, [
    open,
    faq,
  ]);


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
  // UPDATE
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
          "UPDATE FAQ PAYLOAD:",
          payload
        );


        const response =
          await api.put(
            `/superadmin/faqs/${faq.id}`,
            payload
          );


        console.log(
          "UPDATE FAQ RESPONSE:",
          response.data
        );


        toast.success(
          response.data?.message ||
            "FAQ berhasil diperbarui"
        );


        await refreshData();


        handleOpen();

      } catch (error) {

        console.error(
          "UPDATE FAQ ERROR:",
          error?.response?.data ||
            error
        );


        toast.error(
          error?.response?.data
            ?.message ||
            "Gagal memperbarui FAQ"
        );

      } finally {

        setLoading(false);

      }

    };


  return (

    <Dialog
      open={open}
      handler={handleOpen}
      size="md"
    >

      <DialogHeader>

        Edit FAQ

      </DialogHeader>


      <DialogBody
        className="
          space-y-5
        "
      >

        {loadingDetail ? (

          <div
            className="
              py-10
              text-center
              text-gray-500
            "
          >

            Mengambil detail FAQ...

          </div>

        ) : (

          <>

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

          </>

        )}

      </DialogBody>


      <DialogFooter
        className="
          gap-2
        "
      >

        <Button
          variant="text"
          onClick={
            handleOpen
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
          disabled={
            loadingDetail
          }
          className="
            bg-blue-500
            shadow-none
          "
        >

          Update

        </Button>

      </DialogFooter>

    </Dialog>

  );
};

export default EditFaqModal;