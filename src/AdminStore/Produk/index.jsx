import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import api from "../../utils/api";
import MainLayout from "../MainLayout";

import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

import {
  Card,
  Typography,
  Button,
  IconButton,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";

import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

import {
  toast,
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const ProdukIndex = () => {
  // ============================================================
  // PRODUCT DATA
  // ============================================================

  const [products, setProducts] = useState([]);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalProducts, setTotalProducts] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  // ============================================================
  // QUERY
  // ============================================================

  const [params, setParams] =
    useState({
      page: 1,
      limit: 10,
      search: "",
      sortBy: "name",
      order: "asc",
    });

  // ============================================================
  // MODAL
  // ============================================================

  const [openAdd, setOpenAdd] =
    useState(false);

  const [openEdit, setOpenEdit] =
    useState(false);

  const [openDelete, setOpenDelete] =
    useState(false);

  // ============================================================
  // EDIT / DELETE FORM DATA
  // ============================================================

  const [formData, setFormData] =
    useState({
      id: "",
      name: "",
      stock: 0,
      price: 0,
      weight: 0,
      description: "",
      storeId: "",

      // DISCOUNT
      discountMode: "NONE",
      discountPrice: "",
      discountPercent: "",
    });

  // ============================================================
  // FETCH PRODUCT
  //
  // GET /products/my
  // ============================================================

  const fetchProducts =
    useCallback(async () => {
      setLoading(true);

      try {
        const response =
          await api.get(
            "/products/my",
            {
              params,
            }
          );

        console.log(
          "PRODUCT RESPONSE:",
          response.data
        );

        const productData =
          response?.data?.data || [];

        const meta =
          response?.data?.meta || {};

        setProducts(
          Array.isArray(productData)
            ? productData
            : []
        );

        setTotalPages(
          meta.totalPages || 1
        );

        setTotalProducts(
          meta.total ||
            productData.length ||
            0
        );
      } catch (error) {
        console.error(
          "PRODUCT ERROR:",
          error?.response?.data ||
            error
        );

        toast.error(
          error?.response?.data
            ?.message ||
            "Gagal memuat produk"
        );
      } finally {
        setLoading(false);
      }
    }, [params]);

  // ============================================================
  // LOAD
  // ============================================================

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ============================================================
  // CREATE PRODUCT
  //
  // Payload sudah dibuat dari AddProductModal
  // ============================================================

  const submitAdd = async (
    payload
  ) => {
    try {
      console.log(
        "CREATE PRODUCT PAYLOAD:",
        payload
      );

      await api.post(
        "/products",
        payload
      );

      toast.success(
        "Produk berhasil ditambahkan!"
      );

      // Refresh product
      await fetchProducts();

      /*
        return true supaya AddProductModal
        mengetahui create berhasil dan
        modal boleh ditutup/reset.
      */
      return true;
    } catch (error) {
      console.error(
        "CREATE PRODUCT ERROR:",
        error?.response?.data ||
          error
      );

      toast.error(
        error?.response?.data
          ?.message ||
          "Gagal menyimpan produk"
      );

      return false;
    }
  };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const handleOpenEdit = (
    product
  ) => {
    const normalPrice =
      Number(product.price || 0);

    const hasDiscount =
      product.discountPrice !==
        null &&
      product.discountPrice !==
        undefined &&
      Number(
        product.discountPrice
      ) < normalPrice;

    const discountPrice =
      hasDiscount
        ? Number(
            product.discountPrice
          )
        : "";

    /*
      Backend tidak menyimpan
      discountPercent.

      Jadi untuk keperluan tampilan
      kita hitung ulang dari:
      price dan discountPrice.
    */

    const discountPercent =
      hasDiscount &&
      normalPrice > 0
        ? Math.round(
            ((normalPrice -
              discountPrice) /
              normalPrice) *
              100
          )
        : "";

    setFormData({
      id:
        product.id,

      name:
        product.name || "",

      stock:
        product.stock ?? 0,

      price:
        normalPrice,

      weight:
        product.weight ?? 0,

      description:
        product.description || "",

      storeId:
        product.storeId ||
        product.store?.id ||
        "",

      // ==============================================
      // DISCOUNT
      // ==============================================

      discountMode:
        hasDiscount
          ? "PRICE"
          : "NONE",

      discountPrice,

      discountPercent,
    });

    setOpenEdit(true);
  };

  // ============================================================
  // UPDATE PRODUCT
  // ============================================================

  const submitEdit = async () => {
    try {
      const payload = {
        name:
          formData.name.trim(),

        description:
          formData.description
            ?.trim() || "",

        price:
          Number(
            formData.price
          ),

        stock:
          Number(
            formData.stock
          ),

        weight:
          Number(
            formData.weight || 0
          ),
      };

      // ========================================================
      // NO DISCOUNT
      //
      // null digunakan untuk menghapus discount lama
      // ========================================================

      if (
        formData.discountMode ===
        "NONE"
      ) {
        payload.discountPrice =
          null;
      }

      // ========================================================
      // PERCENTAGE DISCOUNT
      //
      // Jangan kirim discountPrice
      // ========================================================

      if (
        formData.discountMode ===
        "PERCENT"
      ) {
        payload.discountPercent =
          Number(
            formData.discountPercent
          );
      }

      // ========================================================
      // FIXED DISCOUNT PRICE
      //
      // Jangan kirim discountPercent
      // ========================================================

      if (
        formData.discountMode ===
        "PRICE"
      ) {
        payload.discountPrice =
          Number(
            formData.discountPrice
          );
      }

      console.log(
        "UPDATE PRODUCT PAYLOAD:",
        payload
      );

      await api.patch(
        `/products/${formData.id}`,
        payload
      );

      toast.success(
        "Produk berhasil diperbarui"
      );

      setOpenEdit(false);

      await fetchProducts();
    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error?.response?.data ||
          error
      );

      toast.error(
        error?.response?.data
          ?.message ||
          "Gagal update produk"
      );
    }
  };

  // ============================================================
  // OPEN DELETE
  // ============================================================

  const handleOpenDelete = (
    product
  ) => {
    setFormData((prev) => ({
      ...prev,
      ...product,
    }));

    setOpenDelete(true);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const submitDelete = async () => {
    try {
      await api.delete(
        `/products/${formData.id}`
      );

      toast.success(
        "Produk berhasil dihapus"
      );

      setOpenDelete(false);

      await fetchProducts();
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error?.response?.data ||
          error
      );

      toast.error(
        error?.response?.data
          ?.message ||
          "Gagal menghapus produk"
      );
    }
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = (
    event
  ) => {
    setParams((prev) => ({
      ...prev,

      search:
        event.target.value,

      page: 1,
    }));
  };

  // ============================================================
  // SORT
  // ============================================================

  const handleSort = (
    value
  ) => {
    setParams((prev) => ({
      ...prev,

      sortBy: value,

      page: 1,
    }));
  };

  // ============================================================
  // ORDER
  // ============================================================

  const handleOrder = (
    value
  ) => {
    setParams((prev) => ({
      ...prev,

      order: value,

      page: 1,
    }));
  };

  // ============================================================
  // PREVIOUS PAGE
  // ============================================================

  const handlePrevious = () => {
    setParams((prev) => ({
      ...prev,

      page: Math.max(
        prev.page - 1,
        1
      ),
    }));
  };

  // ============================================================
  // NEXT PAGE
  // ============================================================

  const handleNext = () => {
    setParams((prev) => ({
      ...prev,

      page: Math.min(
        prev.page + 1,
        totalPages
      ),
    }));
  };

  // ============================================================
  // CALCULATE DISCOUNT PERCENT
  // ============================================================

  const calculateDiscountPercent = (
    price,
    discountPrice
  ) => {
    const normalPrice =
      Number(price);

    const salePrice =
      Number(discountPrice);

    if (
      normalPrice <= 0 ||
      discountPrice === null ||
      discountPrice ===
        undefined ||
      salePrice >=
        normalPrice
    ) {
      return 0;
    }

    return Math.round(
      ((normalPrice -
        salePrice) /
        normalPrice) *
        100
    );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <MainLayout>

      <ToastContainer
        position="top-right"
        autoClose={3000}
      />

      <div className="p-4 space-y-6">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

          <div>

            <Typography
              variant="h4"
              className="font-black text-blue-900 uppercase italic"
            >
              Inventory Produk
            </Typography>

            <Typography className="text-gray-500 text-sm font-bold uppercase tracking-tight">
              Manajemen Stok, Harga & Diskon EcoCash Store
            </Typography>

          </div>

          <Button
            onClick={() =>
              setOpenAdd(true)
            }
            className="
              bg-blue-600
              flex
              items-center
              gap-2
              rounded-2xl
              shadow-lg
              uppercase
              font-black
              italic
              px-6
            "
          >

            <PlusIcon className="h-5 w-5 stroke-[3]" />

            Tambah Produk

          </Button>

        </div>

        {/* ====================================================
            FILTER
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-4
            gap-4
            bg-white
            p-5
            rounded-[25px]
            border-2
            border-blue-50
            shadow-sm
          "
        >

          {/* SEARCH */}

          <div className="md:col-span-2">

            <Input
              label="Cari Nama Produk..."
              icon={
                <MagnifyingGlassIcon className="h-5 w-5 text-blue-500" />
              }
              value={
                params.search
              }
              onChange={
                handleSearch
              }
              className="rounded-xl"
            />

          </div>

          {/* SORT */}

          <Select
            label="Urutkan"
            value={
              params.sortBy
            }
            onChange={
              handleSort
            }
          >

            <Option value="name">
              Nama
            </Option>

            <Option value="price">
              Harga
            </Option>

            <Option value="stock">
              Stok
            </Option>

          </Select>

          {/* ORDER */}

          <Select
            label="Order"
            value={
              params.order
            }
            onChange={
              handleOrder
            }
          >

            <Option value="asc">
              A-Z (Terkecil)
            </Option>

            <Option value="desc">
              Z-A (Terbesar)
            </Option>

          </Select>

        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <Card
          className="
            overflow-hidden
            border-2
            border-blue-100
            rounded-[30px]
            shadow-sm
            bg-white
          "
        >

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px] text-left border-collapse">

              {/* =================================================
                  HEADER TABLE
              ================================================= */}

              <thead>

                <tr className="bg-blue-50/50">

                  {[
                    "Info Produk",
                    "Status Stok",
                    "Harga Normal",
                    "Diskon",
                    "Harga Jual",
                    "Aksi",
                  ].map(
                    (head) => (

                      <th
                        key={head}
                        className="
                          p-5
                          text-[10px]
                          font-black
                          uppercase
                          text-blue-900/60
                          tracking-widest
                          border-b
                          border-blue-100
                        "
                      >
                        {head}
                      </th>

                    )
                  )}

                </tr>

              </thead>

              {/* =================================================
                  TABLE BODY
              ================================================= */}

              <tbody>

                {/* LOADING */}

                {loading ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="p-10 text-center text-blue-600 font-bold italic"
                    >
                      Memuat data...
                    </td>

                  </tr>

                ) : products.length >
                  0 ? (

                  products.map(
                    (row) => {
                      const normalPrice =
                        Number(
                          row.price ||
                            0
                        );

                      const hasDiscount =
                        row.discountPrice !==
                          null &&
                        row.discountPrice !==
                          undefined &&
                        Number(
                          row.discountPrice
                        ) <
                          normalPrice;

                      const salePrice =
                        hasDiscount
                          ? Number(
                              row.discountPrice
                            )
                          : normalPrice;

                      const discountPercent =
                        hasDiscount
                          ? calculateDiscountPercent(
                              normalPrice,
                              salePrice
                            )
                          : 0;

                      return (

                        <tr
                          key={
                            row.id
                          }
                          className="
                            border-b
                            border-blue-50
                            hover:bg-blue-50/20
                            transition-all
                          "
                        >

                          {/* ===================================
                              INFO PRODUCT
                          =================================== */}

                          <td className="p-5">

                            <Typography className="font-black text-sm text-blue-900 uppercase">
                              {row.name}
                            </Typography>

                            <Typography className="text-[10px] text-gray-400 font-bold italic line-clamp-1">
                              {row.description ||
                                "Tidak ada deskripsi"}
                            </Typography>

                          </td>

                          {/* ===================================
                              STOCK
                          =================================== */}

                          <td className="p-5">

                            <span
                              className={`
                                px-3
                                py-1
                                rounded-xl
                                text-[10px]
                                font-black
                                uppercase

                                ${
                                  Number(
                                    row.stock
                                  ) <
                                  10
                                    ? "bg-red-50 text-red-600 border border-red-100"
                                    : "bg-green-50 text-green-600 border border-green-100"
                                }
                              `}
                            >
                              {row.stock} Unit
                            </span>

                          </td>

                          {/* ===================================
                              NORMAL PRICE
                          =================================== */}

                          <td className="p-5">

                            <Typography
                              className={`
                                text-sm
                                font-black

                                ${
                                  hasDiscount
                                    ? "text-gray-400 line-through"
                                    : "text-blue-800"
                                }
                              `}
                            >
                              Rp{" "}
                              {normalPrice.toLocaleString(
                                "id-ID"
                              )}
                            </Typography>

                          </td>

                          {/* ===================================
                              DISCOUNT
                          =================================== */}

                          <td className="p-5">

                            {hasDiscount ? (

                              <div className="flex items-center gap-2">

                                <TagIcon className="h-4 w-4 text-red-500" />

                                <span
                                  className="
                                    px-3
                                    py-1
                                    rounded-xl
                                    text-[10px]
                                    font-black
                                    uppercase
                                    bg-red-50
                                    text-red-600
                                    border
                                    border-red-100
                                  "
                                >
                                  -
                                  {
                                    discountPercent
                                  }
                                  %
                                </span>

                              </div>

                            ) : (

                              <span className="text-[10px] font-bold text-gray-400 uppercase">
                                Tidak ada
                              </span>

                            )}

                          </td>

                          {/* ===================================
                              SALE PRICE
                          =================================== */}

                          <td className="p-5">

                            {hasDiscount ? (

                              <div>

                                <Typography className="text-sm font-black text-green-600">
                                  Rp{" "}
                                  {salePrice.toLocaleString(
                                    "id-ID"
                                  )}
                                </Typography>

                                <Typography className="text-[9px] text-red-400 font-black uppercase tracking-wider">
                                  Special Price
                                </Typography>

                              </div>

                            ) : (

                              <Typography className="text-sm font-black text-blue-800">
                                Rp{" "}
                                {normalPrice.toLocaleString(
                                  "id-ID"
                                )}
                              </Typography>

                            )}

                          </td>

                          {/* ===================================
                              ACTION
                          =================================== */}

                          <td className="p-5">

                            <div className="flex gap-2">

                              <IconButton
                                variant="text"
                                color="blue"
                                onClick={() =>
                                  handleOpenEdit(
                                    row
                                  )
                                }
                                className="bg-blue-50 rounded-xl"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </IconButton>

                              <IconButton
                                variant="text"
                                color="red"
                                onClick={() =>
                                  handleOpenDelete(
                                    row
                                  )
                                }
                                className="bg-red-50 rounded-xl"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </IconButton>

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )

                ) : (

                  /* ===========================================
                      EMPTY
                  =========================================== */

                  <tr>

                    <td
                      colSpan={6}
                      className="p-10 text-center text-gray-400 font-bold uppercase italic"
                    >
                      Produk Kosong
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* ==================================================
              PAGINATION
          ================================================== */}

          <div
            className="
              flex
              flex-col
              sm:flex-row
              justify-between
              items-center
              gap-4
              p-5
              border-t
              border-blue-50
            "
          >

            {/* TOTAL */}

            <Typography className="text-[10px] font-black text-gray-400 uppercase">

              Total Produk:{" "}
              {totalProducts}

            </Typography>

            {/* PAGE */}

            <div className="flex items-center gap-3">

              <IconButton
                variant="outlined"
                size="sm"
                disabled={
                  params.page <= 1
                }
                onClick={
                  handlePrevious
                }
                className="rounded-xl"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </IconButton>

              <Typography className="text-xs font-black text-blue-900">

                Halaman{" "}
                {params.page}
                {" / "}
                {totalPages}

              </Typography>

              <IconButton
                variant="outlined"
                size="sm"
                disabled={
                  params.page >=
                  totalPages
                }
                onClick={
                  handleNext
                }
                className="rounded-xl"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </IconButton>

            </div>

          </div>

        </Card>

        {/* ====================================================
            CREATE MODAL
        ==================================================== */}

        <AddProductModal
          open={
            openAdd
          }
          handleOpen={() =>
            setOpenAdd(
              (prev) =>
                !prev
            )
          }
          onConfirm={
            submitAdd
          }
        />

        {/* ====================================================
            UPDATE MODAL
        ==================================================== */}

        <EditProductModal
          open={
            openEdit
          }
          setOpen={
            setOpenEdit
          }
          formData={
            formData
          }
          setFormData={
            setFormData
          }
          handleUpdate={
            submitEdit
          }
        />

        {/* ====================================================
            DELETE MODAL
        ==================================================== */}

        <DeleteConfirmModal
          open={
            openDelete
          }
          setOpen={
            setOpenDelete
          }
          onConfirm={
            submitDelete
          }
          productName={
            formData.name
          }
        />

      </div>

    </MainLayout>
  );
};

export default ProdukIndex;