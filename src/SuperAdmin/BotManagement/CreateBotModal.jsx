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
  Typography,
} from "@material-tailwind/react";

import {
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";

import api from "../../utils/api";


const emptyOption = () => ({
  label: "",
  action: "SUB_MENU",
  targetKey: "",
  url: "",
  orderIndex: 1,
});


const CreateBotModal = ({
  open,
  handleOpen,
  refreshData,
  menus = [],
}) => {

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      key: "",
      message: "",
      isActive: true,
      options: [],
    });


  // =========================================
  // FORM CHANGE
  // =========================================

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


  // =========================================
  // ADD OPTION
  // =========================================

  const addOption = () => {

    setForm(
      (prev) => ({
        ...prev,

        options: [
          ...prev.options,
          {
            ...emptyOption(),

            orderIndex:
              prev.options.length +
              1,
          },
        ],
      })
    );

  };


  // =========================================
  // REMOVE OPTION
  // =========================================

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
              (option, i) => ({
                ...option,
                orderIndex:
                  i + 1,
              })
            ),

      })
    );

  };


  // =========================================
  // OPTION CHANGE
  // =========================================

  const handleOptionChange = (
    index,
    field,
    value
  ) => {

    setForm(
      (prev) => {

        const options = [
          ...prev.options,
        ];

        options[index] = {
          ...options[index],
          [field]: value,
        };


        // reset field yang
        // tidak relevan

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


  // =========================================
  // RESET
  // =========================================

  const resetForm = () => {

    setForm({
      key: "",
      message: "",
      isActive: true,
      options: [],
    });

  };


  // =========================================
  // SUBMIT
  // =========================================

  const submit =
    async () => {

      if (
        !form.key.trim()
      ) {

        toast.warning(
          "Key menu wajib diisi"
        );

        return;

      }


      if (
        !form.message.trim()
      ) {

        toast.warning(
          "Pesan bot wajib diisi"
        );

        return;

      }


      const invalidOption =
        form.options.find(
          (option) =>
            !option.label.trim()
        );

      if (invalidOption) {

        toast.warning(
          "Semua label option wajib diisi"
        );

        return;

      }


      try {

        setLoading(true);


        const payload = {

          key:
            form.key.trim(),

          message:
            form.message.trim(),

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


        console.log(
          "CREATE BOT PAYLOAD:",
          payload
        );


        await api.post(
          "/admin/bot/menus",
          payload
        );


        toast.success(
          "Menu bot berhasil dibuat"
        );


        resetForm();

        await refreshData();

        handleOpen();

      } catch (error) {

        console.error(
          "CREATE BOT ERROR:",
          error?.response?.data ||
            error
        );


        toast.error(
          error?.response?.data
            ?.message ||
            "Gagal membuat menu bot"
        );

      } finally {

        setLoading(false);

      }

    };


  const handleClose = () => {

    resetForm();

    handleOpen();

  };


  return (

    <Dialog
      open={open}
      handler={handleClose}
      size="lg"
    >

      <DialogHeader>

        Tambah Menu Bot

      </DialogHeader>


      <DialogBody
        className="
          max-h-[75vh]
          space-y-5
          overflow-y-auto
        "
      >

        {/* KEY */}

        <Input
          label="Key Menu"
          name="key"
          value={form.key}
          onChange={handleChange}
        />


        <Typography
          className="
            -mt-3
            text-xs
            text-gray-500
          "
        >
          Contoh:
          main_menu,
          tentang_ecocash,
          layanan
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
              text-gray-700
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

            <option value="true">
              Active
            </option>

            <option value="false">
              Inactive
            </option>

          </select>

        </div>


        {/* OPTIONS HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-t
            pt-5
          "
        >

          <div>

            <Typography
              variant="h6"
            >
              Options
            </Typography>

            <Typography
              className="
                text-xs
                text-gray-500
              "
            >
              Tombol pilihan yang
              akan ditampilkan ke
              pengguna
            </Typography>

          </div>


          <Button
            size="sm"
            onClick={addOption}
            className="
              flex
              items-center
              gap-2
              bg-[#2b6cb0]
              normal-case
              shadow-none
            "
          >

            <PlusIcon
              className="h-4 w-4"
            />

            Tambah Option

          </Button>

        </div>


        {/* OPTIONS */}

        {form.options.length ===
          0 && (

          <div
            className="
              rounded-xl
              border
              border-dashed
              border-gray-300
              p-6
              text-center
              text-sm
              text-gray-400
            "
          >
            Belum ada option
          </div>

        )}


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
                border-gray-200
                bg-gray-50/50
                p-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <Typography
                  className="
                    font-semibold
                    text-gray-800
                  "
                >
                  Option{" "}
                  {index + 1}
                </Typography>


                <Button
                  size="sm"
                  color="red"
                  variant="text"
                  onClick={() =>
                    removeOption(
                      index
                    )
                  }
                  className="p-2"
                >

                  <TrashIcon
                    className="
                      h-5
                      w-5
                    "
                  />

                </Button>

              </div>


              {/* LABEL */}

              <Input
                label="Label Tombol"
                value={
                  option.label
                }
                onChange={(e) =>
                  handleOptionChange(
                    index,
                    "label",
                    e.target.value
                  )
                }
              />


              {/* ACTION */}

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
                  Action
                </label>

                <select
                  value={
                    option.action
                  }
                  onChange={(e) =>
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

              </div>


              {/* SUB MENU */}

              {option.action ===
                "SUB_MENU" && (

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
                    Target Menu
                  </label>

                  <select
                    value={
                      option.targetKey
                    }
                    onChange={(e) =>
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
                      Pilih target
                      menu
                    </option>

                    {menus.map(
                      (menu) => (

                        <option
                          key={
                            menu.id
                          }
                          value={
                            menu.key
                          }
                        >
                          {menu.key}
                        </option>

                      )
                    )}

                  </select>

                </div>

              )}


              {/* LINK / WA */}

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
                  onChange={(e) =>
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

      </DialogBody>


      <DialogFooter
        className="gap-2"
      >

        <Button
          variant="text"
          onClick={handleClose}
          disabled={loading}
        >
          Batal
        </Button>


        <Button
          onClick={submit}
          loading={loading}
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

export default CreateBotModal;