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
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";

import api from "../../utils/api";

import CreateFaqModal from "./CreateFaqModal";
import EditFaqModal from "./EditFaqModal";
import DeleteFaqModal from "./DeleteFaqModal";


// ======================================================
// TABLE HEADER
// ======================================================

const TABLE_HEAD = [
  {
    label: "Pertanyaan",
    value: "question",
  },
  {
    label: "Jawaban",
    value: "answer",
  },
  {
    label: "Kategori",
    value: "category",
  },
  {
    label: "Status",
    value: "isActive",
  },
  {
    label: "Dibuat",
    value: "createdAt",
  },
  {
    label: "Aksi",
    value: null,
  },
];


// ======================================================
// FAQ INDEX
// ======================================================

const FaqIndex = () => {

  const [faqs, setFaqs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const limit = 10;

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [sortBy, setSortBy] =
    useState("question");

  const [
    sortOrder,
    setSortOrder,
  ] = useState("asc");

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
    selectedFaq,
    setSelectedFaq,
  ] = useState(null);


  // ======================================================
  // GET FAQ
  // ======================================================

  const fetchFaqs =
    useCallback(async () => {

      try {

        setLoading(true);

        const response =
          await api.get(
            "/faqs",
            {
              params: {
                page,
                limit,
                search,
              },
            }
          );

        console.log(
          "FAQ RESPONSE:",
          response.data
        );

        setFaqs(
          Array.isArray(
            response.data?.data
          )
            ? response.data.data
            : []
        );

        setTotalPages(
          response.data?.meta
            ?.totalPages || 1
        );

      } catch (error) {

        console.error(
          "GET FAQ ERROR:",
          error?.response?.data ||
            error
        );

        toast.error(
          error?.response?.data
            ?.message ||
            "Gagal mengambil data FAQ"
        );

      } finally {

        setLoading(false);

      }

    }, [
      page,
      search,
    ]);


  // ======================================================
  // LOAD DATA
  // ======================================================

  useEffect(() => {

    fetchFaqs();

  }, [fetchFaqs]);


  // ======================================================
  // SORT
  // ======================================================

  const sortedFaqs =
    useMemo(() => {

      return [...faqs].sort(
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
      faqs,
      sortBy,
      sortOrder,
    ]);


  // ======================================================
  // HANDLE SORT
  // ======================================================

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


  // ======================================================
  // HANDLE EDIT
  // ======================================================

  const handleEdit = (
    faq
  ) => {

    setSelectedFaq(faq);

    setOpenEdit(true);

  };


  // ======================================================
  // HANDLE DELETE
  // ======================================================

  const handleDelete = (
    faq
  ) => {

    setSelectedFaq(faq);

    setOpenDelete(true);

  };


  // ======================================================
  // RETURN
  // ======================================================

  return (

    <MainLayout>

      <div
        className="
          space-y-6
          p-4
          md:p-0
        "
      >

        {/* ============================================= */}
        {/* HEADER */}
        {/* ============================================= */}

        <div>

          <Typography
            variant="h4"
            className="
              font-bold
              text-[#2b6cb0]
            "
          >
            FAQ Management
          </Typography>


          <Typography
            className="
              text-sm
              text-gray-500
            "
          >
            Kelola pertanyaan dan
            jawaban umum EcoCash
          </Typography>

        </div>


        {/* ============================================= */}
        {/* ACTION */}
        {/* ============================================= */}

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
              hover:shadow-none
            "
          >

            <PlusIcon
              className="
                h-5
                w-5
              "
            />

            Tambah FAQ

          </Button>


          <div
            className="
              w-full
              lg:w-80
            "
          >

            <Input
              label="Cari FAQ..."
              icon={

                <MagnifyingGlassIcon
                  className="
                    h-5
                    w-5
                  "
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


        {/* ============================================= */}
        {/* TABLE */}
        {/* ============================================= */}

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

              {/* TABLE HEAD */}

              <thead>

                <tr
                  className="
                    bg-green-50
                  "
                >

                  {TABLE_HEAD.map(
                    (head) => (

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


              {/* TABLE BODY */}

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

                ) : sortedFaqs.length ===
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
                      Belum ada FAQ
                    </td>

                  </tr>

                ) : (

                  sortedFaqs.map(
                    (faq) => (

                      <tr
                        key={faq.id}
                        className="
                          border-b
                          transition-colors
                          hover:bg-green-50/30
                        "
                      >

                        {/* QUESTION */}

                        <td
                          className="
                            p-5
                          "
                        >

                          <div
                            className="
                              flex
                              items-start
                              gap-3
                            "
                          >

                            <div
                              className="
                                flex
                                h-11
                                w-11
                                flex-shrink-0
                                items-center
                                justify-center

                                rounded-xl
                                bg-blue-50
                              "
                            >

                              <QuestionMarkCircleIcon
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
                                  max-w-[280px]
                                  font-bold
                                  text-gray-800
                                "
                              >
                                {
                                  faq.question ||
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
                                ID: {faq.id}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* ANSWER */}

                        <td
                          className="
                            p-5
                          "
                        >

                          <Typography
                            className="
                              max-w-[350px]
                              truncate
                              text-sm
                              text-gray-600
                            "
                          >
                            {
                              faq.answer ||
                              "-"
                            }
                          </Typography>

                        </td>


                        {/* CATEGORY */}

                        <td
                          className="
                            p-5
                          "
                        >

                          {faq.category ? (

                            <Chip
                              value={
                                faq.category
                              }
                              variant="ghost"
                              color="blue"
                              className="
                                w-fit
                                text-xs
                              "
                            />

                          ) : (

                            <Typography
                              className="
                                text-sm
                                text-gray-400
                              "
                            >
                              -
                            </Typography>

                          )}

                        </td>


                        {/* STATUS */}

                        <td
                          className="
                            p-5
                          "
                        >

                          <Chip
                            value={
                              faq.isActive === false
                                ? "INACTIVE"
                                : "ACTIVE"
                            }
                            color={
                              faq.isActive === false
                                ? "red"
                                : "green"
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

                          {faq.createdAt
                            ? new Date(
                                faq.createdAt
                              ).toLocaleDateString(
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

                            <Button
                              size="sm"
                              onClick={() =>
                                handleEdit(
                                  faq
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
                                  faq
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


          {/* ============================================= */}
          {/* PAGINATION */}
          {/* ============================================= */}

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

              <Button
                size="sm"
                disabled={
                  page === 1
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
                "
              >

                <ChevronLeftIcon
                  className="
                    h-4
                    w-4
                  "
                />

              </Button>


              <Button
                size="sm"
                disabled={
                  page >=
                  totalPages
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


      {/* CREATE */}

      <CreateFaqModal
        open={openCreate}
        handleOpen={() =>
          setOpenCreate(false)
        }
        refreshData={
          fetchFaqs
        }
      />


      {/* EDIT */}

      {selectedFaq && (

        <EditFaqModal
          open={openEdit}
          handleOpen={() => {

            setOpenEdit(false);

            setSelectedFaq(null);

          }}
          faq={
            selectedFaq
          }
          refreshData={
            fetchFaqs
          }
        />

      )}


      {/* DELETE */}

      {selectedFaq && (

        <DeleteFaqModal
          open={openDelete}
          handleOpen={() => {

            setOpenDelete(false);

            setSelectedFaq(null);

          }}
          faq={
            selectedFaq
          }
          refreshData={
            fetchFaqs
          }
        />

      )}

    </MainLayout>

  );
};

export default FaqIndex;