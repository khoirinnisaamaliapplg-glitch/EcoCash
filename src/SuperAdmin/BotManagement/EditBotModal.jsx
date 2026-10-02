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
  Typography,
} from "@material-tailwind/react";

import {
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";

import api from "../../utils/api";


const EditBotModal = ({
  open,
  handleOpen,
  bot,
  refreshData,
  menus = [],
}) => {

  const [loading, setLoading] =
    useState(false);

  const [
    loadingDetail,
    setLoadingDetail,
  ] = useState(false);


  const [form, setForm] =
    useState({
      key: "",
      message: "",
      isActive: true,
      options: [],
    });


  // ======================================
  // DETAIL
  // ======================================

  useEffect(() => {

    if (
      !open ||
      !bot?.id
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
              `/admin/bot/menus/${bot.id}`
            );


          const data =
            response.data?.data;


          setForm({

            key:
              data?.key || "",

            message:
              data?.message || "",

            isActive:
              data?.isActive ??
              true,

            options:
              Array.isArray(
                data?.options
              )
                ? data.options.map(
                    (
                      option,
                      index
                    ) => ({

                      label:
                        option.label ||
                        "",

                      action:
                        option.action ||
                        "SUB_MENU",

                      targetKey:
                        option.targetKey ||
                        "",

                      url:
                        option.url ||
                        "",

                      orderIndex:
                        option.orderIndex ??
                        index + 1,

                    })
                  )
                : [],

          });

        } catch (error) {

          console.error(
            error
          );

          toast.error(
            "Gagal mengambil detail bot"
          );

        } finally {

          setLoadingDetail(
            false
          );

        }

      };


    fetchDetail();

  }, [
    open,
    bot,
  ]);


  // ======================================
  // NORMAL FORM
  // ======================================

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


  // ======================================
  // OPTIONS
  // ======================================

  const addOption = () => {

    setForm(
      (prev) => ({

        ...prev,

        options: [
          ...prev.options,

          {
            label: "",
            action:
              "SUB_MENU",
            targetKey: "",
            url: "",
            orderIndex:
              prev.options
                .length + 1,
          },
        ],

      })
    );

  };


  const removeOption = (
    index
  ) => {

    setForm(
      (prev) => ({

        ...prev,

        options:
          prev.options
            .filter(
              (_, i) =>
                i !== index
            )
            .map(
              (item, i) => ({
                ...item,
                orderIndex:
                  i + 1,
              })
            ),

      })
    );

  };


  const handleOptionChange = (
    index,
    field,
    value
  ) => {

    setForm(
      (prev) => {

        const options =
          [...prev.options];


        options[index] = {

          ...options[index],

          [field]:
            value,

        };


        if (
          field === "action"
        ) {

          if (
            value ===
            "SUB_MENU"
          ) {

            options[
              index
            ].url = "";

          } else {

            options[
              index
            ].targetKey =
              "";

          }

        }


        return {

          ...prev,

          options,

        };

      }
    );

  };


  // ======================================
  // UPDATE
  // ======================================

  const submit =
    async () => {

      if (
        !form.message.trim()
      ) {

        toast.warning(
          "Pesan bot wajib diisi"
        );

        return;

      }


      try {

        setLoading(true);


        const payload = {

          message:
            form.message,

          isActive:
            form.isActive,

          options:
            form.options.map(
              (
                option,
                index
              ) => ({

                label:
                  option.label,

                action:
                  option.action,

                targetKey:
                  option.action ===
                  "SUB_MENU"
                    ? option.targetKey ||
                      null
                    : null,

                url:
                  option.action ===
                    "LINK" ||
                  option.action ===
                    "WHATSAPP"
                    ? option.url ||
                      null
                    : null,

                orderIndex:
                  index + 1,

              })
            ),

        };


        await api.patch(
          `/admin/bot/menus/${bot.id}`,
          payload
        );


        toast.success(
          "Menu bot berhasil diperbarui"
        );


        await refreshData();

        handleOpen();

      } catch (error) {

        console.error(
          "UPDATE BOT ERROR:",
          error?.response?.data ||
            error
        );


        toast.error(
          error?.response?.data
            ?.message ||
            "Gagal memperbarui menu bot"
        );

      } finally {

        setLoading(false);

      }

    };


  return (

    <Dialog
      open={open}
      handler={handleOpen}
      size="lg"
    >

      <DialogHeader>
        Edit Menu Bot
      </DialogHeader>


      <DialogBody
        className="
          max-h-[75vh]
          space-y-5
          overflow-y-auto
        "
      >

        {loadingDetail ? (

          <div
            className="
              py-10
              text-center
            "
          >
            Mengambil detail...
          </div>

        ) : (

          <>

            {/* KEY */}

            <Input
              label="Key Menu"
              value={form.key}
              disabled
            />


            <Typography
              className="
                -mt-3
                text-xs
                text-gray-500
              "
            >
              Key tidak dapat
              diubah setelah menu
              dibuat.
            </Typography>


            {/* MESSAGE */}

            <Textarea
              label="Pesan Bot"
              name="message"
              value={
                form.message
              }
              onChange={
                handleChange
              }
              rows={5}
            />


            {/* STATUS */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Status
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
                "
              >

                <option
                  value="true"
                >
                  Active
                </option>

                <option
                  value="false"
                >
                  Inactive
                </option>

              </select>

            </div>


            {/* OPTIONS */}

            <div
              className="
                flex
                items-center
                justify-between
                border-t
                pt-5
              "
            >

              <Typography
                variant="h6"
              >
                Options
              </Typography>


              <Button
                size="sm"
                onClick={
                  addOption
                }
                className="
                  flex
                  items-center
                  gap-2
                  bg-[#2b6cb0]
                  normal-case
                "
              >

                <PlusIcon
                  className="
                    h-4
                    w-4
                  "
                />

                Tambah Option

              </Button>

            </div>


            {form.options.map(
              (
                option,
                index
              ) => (

                <div
                  key={index}
                  className="
                    space-y-4
                    rounded-xl
                    border
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      justify-between
                    "
                  >

                    <Typography
                      className="
                        font-semibold
                      "
                    >
                      Option{" "}
                      {index + 1}
                    </Typography>


                    <Button
                      size="sm"
                      variant="text"
                      color="red"
                      onClick={() =>
                        removeOption(
                          index
                        )
                      }
                    >

                      <TrashIcon
                        className="
                          h-5
                          w-5
                        "
                      />

                    </Button>

                  </div>


                  <Input
                    label="Label"
                    value={
                      option.label
                    }
                    onChange={(
                      e
                    ) =>
                      handleOptionChange(
                        index,
                        "label",
                        e.target.value
                      )
                    }
                  />


                  <select
                    value={
                      option.action
                    }
                    onChange={(
                      e
                    ) =>
                      handleOptionChange(
                        index,
                        "action",
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      p-3
                    "
                  >

                    <option
                      value="SUB_MENU"
                    >
                      Sub Menu
                    </option>

                    <option
                      value="LINK"
                    >
                      Link
                    </option>

                    <option
                      value="WHATSAPP"
                    >
                      WhatsApp
                    </option>

                  </select>


                  {option.action ===
                    "SUB_MENU" && (

                    <select
                      value={
                        option.targetKey
                      }
                      onChange={(
                        e
                      ) =>
                        handleOptionChange(
                          index,
                          "targetKey",
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        p-3
                      "
                    >

                      <option value="">
                        Pilih Target
                        Menu
                      </option>

                      {menus
                        .filter(
                          (menu) =>
                            menu.key !==
                            form.key
                        )
                        .map(
                          (menu) => (

                            <option
                              key={
                                menu.id
                              }
                              value={
                                menu.key
                              }
                            >
                              {
                                menu.key
                              }
                            </option>

                          )
                        )}

                    </select>

                  )}


                  {(option.action ===
                    "LINK" ||
                    option.action ===
                      "WHATSAPP") && (

                    <Input
                      label={
                        option.action ===
                        "WHATSAPP"
                          ? "URL WhatsApp"
                          : "URL"
                      }
                      value={
                        option.url
                      }
                      onChange={(
                        e
                      ) =>
                        handleOptionChange(
                          index,
                          "url",
                          e.target.value
                        )
                      }
                    />

                  )}

                </div>

              )
            )}

          </>

        )}

      </DialogBody>


      <DialogFooter
        className="gap-2"
      >

        <Button
          variant="text"
          onClick={handleOpen}
        >
          Batal
        </Button>

        <Button
          onClick={submit}
          loading={loading}
          disabled={
            loadingDetail
          }
          className="
            bg-blue-500
          "
        >
          Update
        </Button>

      </DialogFooter>

    </Dialog>

  );
};

export default EditBotModal;