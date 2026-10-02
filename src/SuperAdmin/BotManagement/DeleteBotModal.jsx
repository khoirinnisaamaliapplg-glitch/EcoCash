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


const DeleteBotModal = ({
  open,
  handleOpen,
  bot,
  refreshData,
}) => {

  const [loading, setLoading] =
    useState(false);


  const submit =
    async () => {

      if (!bot?.id) {
        return;
      }


      try {

        setLoading(true);


        await api.delete(
          `/admin/bot/menus/${bot.id}`
        );


        toast.success(
          "Menu bot berhasil dihapus"
        );


        await refreshData();

        handleOpen();

      } catch (error) {

        console.error(
          "DELETE BOT ERROR:",
          error?.response?.data ||
            error
        );


        toast.error(
          error?.response?.data
            ?.message ||
            "Gagal menghapus menu bot"
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
        Hapus Menu Bot
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
            Hapus menu bot?
          </Typography>


          <Typography
            className="
              text-sm
              text-gray-500
            "
          >

            Menu

            <span
              className="
                mx-1
                font-bold
                text-gray-800
              "
            >
              {bot?.key}
            </span>

            akan dihapus secara
            permanen.

          </Typography>

        </div>

      </DialogBody>


      <DialogFooter
        className="gap-2"
      >

        <Button
          variant="text"
          onClick={handleOpen}
          disabled={loading}
        >
          Batal
        </Button>


        <Button
          color="red"
          onClick={submit}
          loading={loading}
        >
          Hapus
        </Button>

      </DialogFooter>

    </Dialog>

  );
};

export default DeleteBotModal;