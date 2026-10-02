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
  NewspaperIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";

import api from "../../utils/api";

import CreateNewsModal from "./CreateNewsModal";
import EditNewsModal from "./EditNewsModal";
import DeleteNewsModal from "./DeleteNewsModal";


// ==========================================================
// TABLE HEADER
// ==========================================================

const TABLE_HEAD = [
  {
    label: "Gambar",
    value: null,
  },
  {
    label: "News",
    value: "title",
  },
  {
    label: "Content",
    value: "content",
  },
  {
    label: "Author",
    value: null,
  },
  {
    label: "Status",
    value: "isPublished",
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


// ==========================================================
// NEWS THUMBNAIL
// ==========================================================

const NewsThumbnail = ({
  item,
}) => {

  const [
    imageError,
    setImageError,
  ] = useState(false);


  /*
    PENTING:

    Gunakan URL langsung dari News API.

    LIST / TABLE:
    imageThumbnailUrl

    Fallback:
    imageUrl

    Jangan membuat Cloudinary URL secara manual.
  */

  const imageUrl =
    item?.imageThumbnailUrl ||
    item?.imageUrl ||
    null;


  // Reset error jika item berubah
  useEffect(() => {

    setImageError(false);

  }, [
    imageUrl,
  ]);


  // ========================================================
  // PLACEHOLDER
  // ========================================================

  if (
    !imageUrl ||
    imageError
  ) {

    return (

      <div
        className="
          flex
          h-full
          w-full
          items-center
          justify-center
          bg-green-50
        "
      >

        <NewspaperIcon
          className="
            h-7
            w-7
            text-green-600
          "
        />

      </div>

    );

  }


  // ========================================================
  // IMAGE
  // ========================================================

  return (

    <img
      src={
        imageUrl
      }
      alt={
        item?.title ||
        "Thumbnail berita"
      }
      onError={() =>
        setImageError(true)
      }
      className="
        h-full
        w-full
        object-cover
      "
    />

  );

};


// ==========================================================
// NEWS INDEX
// ==========================================================

const NewsIndex = () => {

  // ========================================================
  // STATE
  // ========================================================

  const [
    news,
    setNews,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    page,
    setPage,
  ] = useState(1);


  const limit = 10;


  const [
    totalPages,
    setTotalPages,
  ] = useState(1);


  const [
    sortBy,
    setSortBy,
  ] = useState(
    "title"
  );


  const [
    sortOrder,
    setSortOrder,
  ] = useState(
    "asc"
  );


  // ========================================================
  // MODALS
  // ========================================================

  const [
    openCreate,
    setOpenCreate,
  ] = useState(false);


  const [
    openEdit,
    setOpenEdit,
  ] = useState(false);


  const [
    openDelete,
    setOpenDelete,
  ] = useState(false);


  const [
    selectedNews,
    setSelectedNews,
  ] = useState(null);


  // ========================================================
  // GET NEWS
  // ========================================================

  const fetchNews =
    useCallback(async () => {

      try {

        setLoading(true);


        const response =
          await api.get(
            "/superadmin/news",
            {
              params: {
                page,
                limit,
                search,
              },
            }
          );


        console.log(
          "NEWS RESPONSE:",
          response.data
        );


        // ==================================================
        // NEWS DATA
        // ==================================================

        const newsData =
          Array.isArray(
            response.data?.data
          )
            ? response.data.data
            : [];


        setNews(
          newsData
        );


        // ==================================================
        // PAGINATION
        // ==================================================

        const meta =
          response.data?.meta ||
          response.data?.pagination ||
          {};


        const apiTotalPages =
          Number(
            meta?.totalPages ??
            meta?.pages ??
            1
          );


        setTotalPages(
          Math.max(
            1,
            apiTotalPages
          )
        );


      } catch (error) {

        console.error(
          "GET NEWS ERROR:",
          error?.response?.data ||
          error
        );


        toast.error(
          error?.response?.data
            ?.message ||
          "Gagal mengambil data news"
        );


      } finally {

        setLoading(false);

      }

    }, [
      page,
      search,
    ]);


  // ========================================================
  // USE EFFECT
  // ========================================================

  useEffect(() => {

    fetchNews();

  }, [
    fetchNews,
  ]);


  // ========================================================
  // SORT NEWS
  // ========================================================

  const sortedNews =
    useMemo(() => {

      return [
        ...news,
      ].sort(
        (
          a,
          b
        ) => {

          const first =
            String(
              a?.[sortBy] ??
              ""
            ).toLowerCase();


          const second =
            String(
              b?.[sortBy] ??
              ""
            ).toLowerCase();


          if (
            first <
            second
          ) {

            return (
              sortOrder ===
              "asc"
                ? -1
                : 1
            );

          }


          if (
            first >
            second
          ) {

            return (
              sortOrder ===
              "asc"
                ? 1
                : -1
            );

          }


          return 0;

        }
      );

    }, [
      news,
      sortBy,
      sortOrder,
    ]);


  // ========================================================
  // HANDLE SORT
  // ========================================================

  const handleSort = (
    field
  ) => {

    if (!field) {
      return;
    }


    if (
      sortBy === field
    ) {

      setSortOrder(
        (prev) =>
          prev === "asc"
            ? "desc"
            : "asc"
      );

    } else {

      setSortBy(
        field
      );

      setSortOrder(
        "asc"
      );

    }

  };


  // ========================================================
  // EDIT
  // ========================================================

  const handleEdit = (
    item
  ) => {

    setSelectedNews(
      item
    );

    setOpenEdit(
      true
    );

  };


  // ========================================================
  // DELETE
  // ========================================================

  const handleDelete = (
    item
  ) => {

    setSelectedNews(
      item
    );

    setOpenDelete(
      true
    );

  };


  // ========================================================
  // CLOSE CREATE
  // ========================================================

  const handleCreateClose =
    () => {

      setOpenCreate(
        false
      );

    };


  // ========================================================
  // CLOSE EDIT
  // ========================================================

  const handleEditClose =
    () => {

      setOpenEdit(
        false
      );

      setSelectedNews(
        null
      );

    };


  // ========================================================
  // CLOSE DELETE
  // ========================================================

  const handleDeleteClose =
    () => {

      setOpenDelete(
        false
      );

      setSelectedNews(
        null
      );

    };


  // ========================================================
  // RETURN
  // ========================================================

  return (

    <MainLayout>

      <div
        className="
          space-y-6
          p-4
          md:p-0
        "
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div>

          <Typography
            variant="h4"
            className="
              font-bold
              text-[#2b6cb0]
            "
          >

            News Management

          </Typography>


          <Typography
            className="
              text-sm
              text-gray-500
            "
          >

            Kelola berita dan
            informasi terbaru
            EcoCash

          </Typography>

        </div>


        {/* ================================================= */}
        {/* ACTION */}
        {/* ================================================= */}

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
              setOpenCreate(
                true
              )
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
              hover:shadow-none
            "
          >

            <PlusIcon
              className="
                h-5
                w-5
              "
            />

            Tambah News

          </Button>


          {/* SEARCH */}

          <div
            className="
              w-full
              lg:w-80
            "
          >

            <Input
              label="Cari berita..."
              icon={

                <MagnifyingGlassIcon
                  className="
                    h-5
                    w-5
                  "
                />

              }
              value={
                search
              }
              onChange={(
                e
              ) => {

                setSearch(
                  e.target.value
                );

                setPage(
                  1
                );

              }}
            />

          </div>

        </div>


        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

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
                min-w-[1250px]
                table-auto
                text-left
              "
            >

              {/* =========================================== */}
              {/* TABLE HEAD */}
              {/* =========================================== */}

              <thead>

                <tr
                  className="
                    bg-green-50
                  "
                >

                  {TABLE_HEAD.map(
                    (
                      head
                    ) => (

                      <th
                        key={
                          head.label
                        }
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
                            gap-2
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

                            {
                              head.label
                            }

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


              {/* =========================================== */}
              {/* TABLE BODY */}
              {/* =========================================== */}

              <tbody>

                {loading ? (

                  // =========================================
                  // LOADING
                  // =========================================

                  <tr>

                    <td
                      colSpan="7"
                      className="
                        p-10
                        text-center
                        text-gray-500
                      "
                    >

                      Loading...

                    </td>

                  </tr>

                ) : sortedNews.length ===
                  0 ? (

                  // =========================================
                  // EMPTY
                  // =========================================

                  <tr>

                    <td
                      colSpan="7"
                      className="
                        p-10
                        text-center
                        text-gray-400
                      "
                    >

                      Belum ada berita

                    </td>

                  </tr>

                ) : (

                  // =========================================
                  // NEWS DATA
                  // =========================================

                  sortedNews.map(
                    (
                      item
                    ) => (

                      <tr
                        key={
                          item.id
                        }
                        className="
                          border-b
                          transition-colors
                          hover:bg-green-50/30
                        "
                      >

                        {/* ================================= */}
                        {/* GAMBAR */}
                        {/* ================================= */}

                        <td
                          className="
                            p-5
                          "
                        >

                          <div
                            className="
                              h-16
                              w-24
                              overflow-hidden
                              rounded-xl
                              border
                              border-gray-200
                              bg-gray-50
                            "
                          >

                            <NewsThumbnail
                              item={
                                item
                              }
                            />

                          </div>

                        </td>


                        {/* ================================= */}
                        {/* NEWS */}
                        {/* ================================= */}

                        <td
                          className="
                            p-5
                          "
                        >

                          <div
                            className="
                              min-w-0
                            "
                          >

                            <Typography
                              className="
                                max-w-[220px]
                                truncate
                                font-bold
                                text-gray-800
                              "
                            >

                              {
                                item.title ||
                                "-"
                              }

                            </Typography>


                            <p
                              className="
                                mt-1
                                max-w-[220px]
                                truncate
                                text-xs
                                text-gray-400
                              "
                            >

                              ID: {
                                item.id
                              }

                            </p>

                          </div>

                        </td>


                        {/* ================================= */}
                        {/* CONTENT */}
                        {/* ================================= */}

                        <td
                          className="
                            p-5
                          "
                        >

                          <Typography
                            className="
                              max-w-[300px]
                              truncate
                              text-sm
                              text-gray-700
                            "
                          >

                            {
                              item.content ||
                              "-"
                            }

                          </Typography>

                        </td>


                        {/* ================================= */}
                        {/* AUTHOR */}
                        {/* ================================= */}

                        <td
                          className="
                            p-5
                          "
                        >

                          <Typography
                            className="
                              font-medium
                              text-gray-700
                            "
                          >

                            {
                              item.author
                                ?.name ||

                              item.author
                                ?.fullName ||

                              item.authorName ||

                              "-"
                            }

                          </Typography>

                        </td>


                        {/* ================================= */}
                        {/* STATUS */}
                        {/* ================================= */}

                        <td
                          className="
                            p-5
                          "
                        >

                          <Chip
                            value={
                              item.isPublished
                                ? "PUBLISHED"
                                : "DRAFT"
                            }
                            color={
                              item.isPublished
                                ? "green"
                                : "orange"
                            }
                            className="
                              w-fit
                              text-xs
                              font-bold
                            "
                          />

                        </td>


                        {/* ================================= */}
                        {/* CREATED */}
                        {/* ================================= */}

                        <td
                          className="
                            p-5
                            text-sm
                            text-gray-700
                          "
                        >

                          {
                            item.createdAt
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
                              : "-"
                          }

                        </td>


                        {/* ================================= */}
                        {/* ACTION */}
                        {/* ================================= */}

                        <td
                          className="
                            p-5
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            {/* EDIT */}

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
                                hover:bg-blue-600
                                hover:shadow-none
                              "
                            >

                              <PencilSquareIcon
                                className="
                                  h-4
                                  w-4
                                "
                              />

                            </Button>


                            {/* DELETE */}

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
                                hover:bg-red-600
                                hover:shadow-none
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


          {/* ================================================= */}
          {/* PAGINATION */}
          {/* ================================================= */}

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


            <div
              className="
                flex
                gap-2
              "
            >

              {/* PREVIOUS */}

              <Button
                size="sm"
                disabled={
                  page <= 1 ||
                  loading
                }
                onClick={() =>
                  setPage(
                    (prev) =>
                      Math.max(
                        prev - 1,
                        1
                      )
                  )
                }
                className="
                  rounded-lg
                  bg-[#2b6cb0]
                  p-2.5
                  shadow-none
                "
              >

                <ChevronLeftIcon
                  className="
                    h-4
                    w-4
                  "
                />

              </Button>


              {/* NEXT */}

              <Button
                size="sm"
                disabled={
                  page >=
                    totalPages ||
                  loading
                }
                onClick={() =>
                  setPage(
                    (prev) =>
                      Math.min(
                        prev + 1,
                        totalPages
                      )
                  )
                }
                className="
                  rounded-lg
                  bg-[#2b6cb0]
                  p-2.5
                  shadow-none
                "
              >

                <ChevronRightIcon
                  className="
                    h-4
                    w-4
                  "
                />

              </Button>

            </div>

          </div>

        </Card>

      </div>


      {/* =================================================== */}
      {/* CREATE MODAL */}
      {/* =================================================== */}

      <CreateNewsModal
        open={
          openCreate
        }
        handleOpen={
          handleCreateClose
        }
        refreshData={
          fetchNews
        }
      />


      {/* =================================================== */}
      {/* EDIT MODAL */}
      {/* =================================================== */}

      {selectedNews && (

        <EditNewsModal
          open={
            openEdit
          }
          handleOpen={
            handleEditClose
          }
          news={
            selectedNews
          }
          refreshData={
            fetchNews
          }
        />

      )}


      {/* =================================================== */}
      {/* DELETE MODAL */}
      {/* =================================================== */}

      {selectedNews && (

        <DeleteNewsModal
          open={
            openDelete
          }
          handleOpen={
            handleDeleteClose
          }
          news={
            selectedNews
          }
          refreshData={
            fetchNews
          }
        />

      )}

    </MainLayout>

  );

};


export default NewsIndex;