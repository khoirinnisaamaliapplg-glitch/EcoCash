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

import { toast } from "react-toastify";

import api from "../../utils/api";


const DeleteFaqModal = ({
  open,
  handleOpen,
  faq,
  refreshData,
}) => {

  const [
    loading,
    setLoading,
  ] = useState(false);


  // ==========================================
  // DELETE
  // ==========================================

  const submit =
    async () => {

      if (!faq?.id) {

        toast.error(
          "ID FAQ tidak ditemukan"
        );

        return;

      }


      try {

        setLoading(true);


        const response =
          await api.delete(
            `/superadmin/faqs/${faq.id}`
          );


        console.log(
          "DELETE FAQ RESPONSE:",
          response.data
        );


        toast.success(
          response.data?.message ||
            "FAQ berhasil dihapus"
        );


        await refreshData();


        handleOpen();

      } catch (error) {

        console.error(
          "DELETE FAQ ERROR:",
          error?.response?.data ||
            error
        );


        toast.error(
          error?.response?.data
            ?.message ||
            "Gagal menghapus FAQ"
        );

      } finally {

        setLoading(false);

      }

    };


  return (

    <Dialog
      open={open}
      handler={handleOpen}
      size="sm"
    >

      <DialogHeader>

        Hapus FAQ

      </DialogHeader>


      <DialogBody>

        <div
          className="
            flex
            flex-col
            items-center
            py-5
            text-center
          "
        >

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


          <Typography
            variant="h6"
            className="
              mb-2
              text-gray-800
            "
          >

            Hapus FAQ?

          </Typography>


          <Typography
            className="
              max-w-[350px]
              text-sm
              text-gray-500
            "
          >

            FAQ

            <span
              className="
                mx-1
                font-semibold
                text-gray-800
              "
            >

              "{faq?.question}"

            </span>

            akan dihapus secara
            permanen.

          </Typography>

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
            handleOpen
          }
          disabled={
            loading
          }
        >

          Batal

        </Button>


        <Button
          color="red"
          onClick={
            submit
          }
          loading={
            loading
          }
        >

          Hapus

        </Button>

      </DialogFooter>

    </Dialog>

  );
};

export default DeleteFaqModal;