import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import MainLayout from "../MainLayout";

import {
  Card,
  Typography,
  Button,
  Input,
  Chip,
} from "@material-tailwind/react";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  PencilSquareIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";

import api from "../../utils/api";

import CreateBotModal from "./CreateBotModal";
import EditBotModal from "./EditBotModal";
import DeleteBotModal from "./DeleteBotModal";


const TABLE_HEAD = [
  {
    label: "Menu Bot",
    value: "key",
  },
  {
    label: "Pesan",
    value: "message",
  },
  {
    label: "Options",
    value: null,
  },
  {
    label: "Status",
    value: "isActive",
  },
  {
    label: "Created",
    value: "createdAt",
  },
  {
    label: "Action",
    value: null,
  },
];


const BotIndex = () => {

  const [bots, setBots] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const limit = 10;

  const [sortBy, setSortBy] =
    useState("key");

  const [sortOrder, setSortOrder] =
    useState("asc");


  const [openCreate, setOpenCreate] =
    useState(false);

  const [openEdit, setOpenEdit] =
    useState(false);

  const [openDelete, setOpenDelete] =
    useState(false);

  const [selectedBot, setSelectedBot] =
    useState(null);


  // =========================================
  // FETCH BOT MENUS
  // =========================================

  const fetchBots =
    useCallback(async () => {

      try {

        setLoading(true);

        const response =
          await api.get(
            "/admin/bot/menus"
          );

        console.log(
          "BOT MENUS RESPONSE:",
          response.data
        );

        setBots(
          Array.isArray(
            response.data?.data
          )
            ? response.data.data
            : []
        );

      } catch (error) {

        console.error(
          "GET BOT MENUS ERROR:",
          error?.response?.data ||
            error
        );

        toast.error(
          error?.response?.data
            ?.message ||
            "Gagal mengambil menu bot"
        );

      } finally {

        setLoading(false);

      }

    }, []);


  useEffect(() => {

    fetchBots();

  }, [fetchBots]);


  // =========================================
  // SEARCH
  // =========================================

  const filteredBots =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return bots;
      }

      return bots.filter(
        (item) => {

          return (
            String(
              item.key || ""
            )
              .toLowerCase()
              .includes(keyword) ||

            String(
              item.message || ""
            )
              .toLowerCase()
              .includes(keyword)
          );

        }
      );

    }, [
      bots,
      search,
    ]);


  // =========================================
  // SORT
  // =========================================

  const sortedBots =
    useMemo(() => {

      return [
        ...filteredBots,
      ].sort(
        (a, b) => {

          const first =
            String(
              a?.[sortBy] ?? ""
            ).toLowerCase();

          const second =
            String(
              b?.[sortBy] ?? ""
            ).toLowerCase();

          if (first < second) {

            return sortOrder === "asc"
              ? -1
              : 1;

          }

          if (first > second) {

            return sortOrder === "asc"
              ? 1
              : -1;

          }

          return 0;

        }
      );

    }, [
      filteredBots,
      sortBy,
      sortOrder,
    ]);


  // =========================================
  // CLIENT PAGINATION
  // =========================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        sortedBots.length / limit
      )
    );


  const paginatedBots =
    useMemo(() => {

      const start =
        (page - 1) * limit;

      return sortedBots.slice(
        start,
        start + limit
      );

    }, [
      sortedBots,
      page,
    ]);


  useEffect(() => {

    if (page > totalPages) {
      setPage(totalPages);
    }

  }, [
    page,
    totalPages,
  ]);


  // =========================================
  // SORT HANDLER
  // =========================================

  const handleSort = (
    field
  ) => {

    if (!field) return;

    if (sortBy === field) {

      setSortOrder(
        (prev) =>
          prev === "asc"
            ? "desc"
            : "asc"
      );

    } else {

      setSortBy(field);
      setSortOrder("asc");

    }

  };


  // =========================================
  // EDIT
  // =========================================

  const handleEdit = (
    item
  ) => {

    setSelectedBot(item);

    setOpenEdit(true);

  };


  // =========================================
  // DELETE
  // =========================================

  const handleDelete = (
    item
  ) => {

    setSelectedBot(item);

    setOpenDelete(true);

  };


  return (

    <MainLayout>

      <div
        className="
          space-y-6
          p-4
          md:p-0
        "
      >

        {/* HEADER */}

        <div>

          <Typography
            variant="h4"
            className="
              font-bold
              text-[#2b6cb0]
            "
          >
            Bot Management
          </Typography>

          <Typography
            className="
              text-sm
              text-gray-500
            "
          >
            Kelola struktur menu
            chatbot EcoCash
          </Typography>

        </div>


        {/* ACTION */}

        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <Button
            onClick={() =>
              setOpenCreate(true)
            }
            className="
              flex
              w-fit
              items-center
              gap-2
              rounded-xl
              bg-[#66bb6a]
              normal-case
              shadow-none
            "
          >

            <PlusIcon
              className="h-5 w-5"
            />

            Tambah Menu Bot

          </Button>


          <div
            className="
              w-full
              lg:w-80
            "
          >

            <Input
              label="Cari menu bot..."
              icon={
                <MagnifyingGlassIcon
                  className="h-5 w-5"
                />
              }
              value={search}
              onChange={(e) => {

                setSearch(
                  e.target.value
                );

                setPage(1);

              }}
            />

          </div>

        </div>


        {/* TABLE */}

        <Card
          className="
            overflow-hidden
            rounded-2xl
            border
            border-green-50
            shadow-sm
          "
        >

          <div
            className="
              overflow-x-auto
            "
          >

            <table
              className="
                w-full
                min-w-[1200px]
                table-auto
                text-left
              "
            >

              <thead>

                <tr
                  className="
                    bg-green-50
                  "
                >

                  {TABLE_HEAD.map(
                    (head) => (

                      <th
                        key={head.label}
                        onClick={() =>
                          handleSort(
                            head.value
                          )
                        }
                        className={`
                          border-b
                          p-5

                          ${
                            head.value
                              ? "cursor-pointer"
                              : ""
                          }
                        `}
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
                              text-xs
                              font-bold
                              uppercase
                              text-[#2b6cb0]
                            "
                          >
                            {head.label}
                          </Typography>


                          {head.value && (

                            <ChevronUpDownIcon
                              className="
                                h-4
                                w-4
                              "
                            />

                          )}

                        </div>

                      </th>

                    )
                  )}

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="
                        p-10
                        text-center
                        text-gray-500
                      "
                    >
                      Loading...
                    </td>

                  </tr>

                ) : paginatedBots.length ===
                  0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="
                        p-10
                        text-center
                        text-gray-400
                      "
                    >
                      Belum ada menu bot
                    </td>

                  </tr>

                ) : (

                  paginatedBots.map(
                    (item) => (

                      <tr
                        key={item.id}
                        className="
                          border-b
                          hover:bg-green-50/30
                        "
                      >

                        {/* MENU */}

                        <td className="p-5">

                          <div
                            className="
                              flex
                              items-center
                              gap-3
                            "
                          >

                            <div
                              className="
                                flex
                                h-12
                                w-12
                                flex-shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-50
                              "
                            >

                              <ChatBubbleLeftRightIcon
                                className="
                                  h-6
                                  w-6
                                  text-[#2b6cb0]
                                "
                              />

                            </div>


                            <div>

                              <Typography
                                className="
                                  max-w-[220px]
                                  truncate
                                  font-bold
                                  text-gray-800
                                "
                              >
                                {item.key}
                              </Typography>

                              <p
                                className="
                                  mt-1
                                  max-w-[200px]
                                  truncate
                                  text-xs
                                  text-gray-400
                                "
                              >
                                ID: {item.id}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* MESSAGE */}

                        <td className="p-5">

                          <Typography
                            className="
                              max-w-[350px]
                              truncate
                              text-sm
                              text-gray-700
                            "
                          >
                            {item.message || "-"}
                          </Typography>

                        </td>


                        {/* OPTIONS */}

                        <td className="p-5">

                          <div
                            className="
                              flex
                              flex-col
                              gap-1
                            "
                          >

                            <Typography
                              className="
                                text-sm
                                font-semibold
                                text-gray-800
                              "
                            >
                              {
                                item.options
                                  ?.length || 0
                              } Options
                            </Typography>


                            {item.options
                              ?.slice(0, 2)
                              .map(
                                (option) => (

                                  <Typography
                                    key={
                                      option.id
                                    }
                                    className="
                                      max-w-[220px]
                                      truncate
                                      text-xs
                                      text-gray-500
                                    "
                                  >
                                    •{" "}
                                    {
                                      option.label
                                    }
                                  </Typography>

                                )
                              )}


                            {item.options
                              ?.length > 2 && (

                              <Typography
                                className="
                                  text-xs
                                  text-blue-500
                                "
                              >
                                +
                                {
                                  item.options
                                    .length -
                                  2
                                } lainnya
                              </Typography>

                            )}

                          </div>

                        </td>


                        {/* STATUS */}

                        <td className="p-5">

                          <Chip
                            value={
                              item.isActive
                                ? "ACTIVE"
                                : "INACTIVE"
                            }
                            color={
                              item.isActive
                                ? "green"
                                : "red"
                            }
                            className="
                              w-fit
                              text-xs
                              font-bold
                            "
                          />

                        </td>


                        {/* CREATED */}

                        <td
                          className="
                            p-5
                            text-sm
                            text-gray-700
                          "
                        >

                          {item.createdAt
                            ? new Date(
                                item.createdAt
                              )
                                .toLocaleDateString(
                                  "id-ID",
                                  {
                                    day:
                                      "2-digit",
                                    month:
                                      "short",
                                    year:
                                      "numeric",
                                  }
                                )
                            : "-"}

                        </td>


                        {/* ACTION */}

                        <td className="p-5">

                          <div
                            className="
                              flex
                              gap-2
                            "
                          >

                            <Button
                              size="sm"
                              onClick={() =>
                                handleEdit(
                                  item
                                )
                              }
                              className="
                                rounded-lg
                                bg-blue-500
                                p-2.5
                                shadow-none
                              "
                            >

                              <PencilSquareIcon
                                className="
                                  h-4
                                  w-4
                                "
                              />

                            </Button>


                            <Button
                              size="sm"
                              onClick={() =>
                                handleDelete(
                                  item
                                )
                              }
                              className="
                                rounded-lg
                                bg-red-500
                                p-2.5
                                shadow-none
                              "
                            >

                              <TrashIcon
                                className="
                                  h-4
                                  w-4
                                "
                              />

                            </Button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>


          {/* PAGINATION */}

          <div
            className="
              flex
              items-center
              justify-between
              border-t
              p-5
            "
          >

            <Typography
              className="
                text-sm
                text-gray-600
              "
            >
              Page {page} /{" "}
              {totalPages}
            </Typography>


            <div className="flex gap-2">

              <Button
                size="sm"
                disabled={
                  page <= 1
                }
                onClick={() =>
                  setPage(
                    (prev) =>
                      prev - 1
                  )
                }
              >

                <ChevronLeftIcon
                  className="h-4 w-4"
                />

              </Button>


              <Button
                size="sm"
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage(
                    (prev) =>
                      prev + 1
                  )
                }
              >

                <ChevronRightIcon
                  className="h-4 w-4"
                />

              </Button>

            </div>

          </div>

        </Card>

      </div>


      <CreateBotModal
        open={openCreate}
        handleOpen={() =>
          setOpenCreate(false)
        }
        refreshData={fetchBots}
        menus={bots}
      />


      {selectedBot && (

        <EditBotModal
          open={openEdit}
          handleOpen={() => {

            setOpenEdit(false);
            setSelectedBot(null);

          }}
          bot={selectedBot}
          menus={bots}
          refreshData={fetchBots}
        />

      )}


      {selectedBot && (

        <DeleteBotModal
          open={openDelete}
          handleOpen={() => {

            setOpenDelete(false);
            setSelectedBot(null);

          }}
          bot={selectedBot}
          refreshData={fetchBots}
        />

      )}

    </MainLayout>

  );
};

export default BotIndex;