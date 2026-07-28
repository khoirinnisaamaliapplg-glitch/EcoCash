import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  IconButton,
  Input,
  Spinner,
} from "@material-tailwind/react";
import {
  BuildingOffice2Icon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

import api from "../../../utils/api";
import CreateOrganizationModal from "./createmodal";
import EditOrganizationModal from "./editmodal";
import DeleteOrganizationModal from "./deletemodal";

const OrganizationPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await api.get("/organizations", {
        headers: getHeaders(),
      });

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setOrganizations(data);
    } catch (error) {
      console.error("GET ORGANIZATIONS ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Gagal mengambil data organization."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const filteredOrganizations = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return organizations;
    }

    return organizations.filter((organization) =>
      organization.name?.toLowerCase().includes(keyword)
    );
  }, [organizations, search]);

  const handleOpenCreateModal = () => {
    setCreateModalOpen((previous) => !previous);
  };

  const handleOpenEditModal = (organization = null) => {
    if (organization) {
      setSelectedOrganization(organization);
      setEditModalOpen(true);
      return;
    }

    setEditModalOpen(false);
    setSelectedOrganization(null);
  };

  const handleOpenDeleteModal = (organization = null) => {
    if (organization) {
      setSelectedOrganization(organization);
      setDeleteModalOpen(true);
      return;
    }

    setDeleteModalOpen(false);
    setSelectedOrganization(null);
  };

  return (
    <>
      <Card className="rounded-[28px] shadow-sm">
        <CardHeader
          floated={false}
          shadow={false}
          className="m-0 rounded-t-[28px] bg-white px-6 py-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Typography
                variant="h5"
                className="font-bold text-blue-900"
              >
                Data Organization
              </Typography>

              <Typography
                variant="small"
                className="mt-1 text-blue-gray-500"
              >
                Kelola organization yang terdaftar di dalam sistem.
              </Typography>
            </div>

            <Button
              onClick={handleOpenCreateModal}
              className="flex items-center justify-center gap-2 bg-[#2b6cb0]"
            >
              <PlusIcon className="h-5 w-5" />
              Tambah Organization
            </Button>
          </div>
        </CardHeader>

        <CardBody className="px-6 pb-6">
          <div className="mb-5 max-w-md">
            <Input
              label="Cari Organization"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-blue-gray-100">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr className="bg-blue-gray-50">
                  <th className="border-b border-blue-gray-100 px-5 py-4">
                    <Typography
                      variant="small"
                      className="font-bold text-blue-gray-700"
                    >
                      No.
                    </Typography>
                  </th>

                  <th className="border-b border-blue-gray-100 px-5 py-4">
                    <Typography
                      variant="small"
                      className="font-bold text-blue-gray-700"
                    >
                      Nama Organization
                    </Typography>
                  </th>

                  <th className="border-b border-blue-gray-100 px-5 py-4">
                    <Typography
                      variant="small"
                      className="text-center font-bold text-blue-gray-700"
                    >
                      Aksi
                    </Typography>
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="py-14 text-center">
                      <div className="flex justify-center">
                        <Spinner className="h-8 w-8" />
                      </div>

                      <Typography
                        variant="small"
                        className="mt-3 text-blue-gray-500"
                      >
                        Memuat data organization...
                      </Typography>
                    </td>
                  </tr>
                ) : filteredOrganizations.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-14 text-center">
                      <BuildingOffice2Icon className="mx-auto mb-3 h-12 w-12 text-blue-gray-300" />

                      <Typography
                        variant="small"
                        className="text-blue-gray-500"
                      >
                        {search
                          ? "Organization tidak ditemukan."
                          : "Belum ada data organization."}
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  filteredOrganizations.map((organization, index) => (
                    <tr
                      key={organization.id}
                      className="border-b border-blue-gray-50 transition-colors hover:bg-blue-gray-50/40 last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <Typography
                          variant="small"
                          className="font-medium text-blue-gray-700"
                        >
                          {index + 1}
                        </Typography>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-blue-50 p-2.5">
                            <BuildingOffice2Icon className="h-5 w-5 text-blue-700" />
                          </div>

                          <div>
                            <Typography
                              variant="small"
                              className="font-semibold text-blue-gray-900"
                            >
                              {organization.name}
                            </Typography>

                            <Typography
                              variant="small"
                              className="text-xs text-blue-gray-400"
                            >
                              ID: {organization.id}
                            </Typography>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <IconButton
                            variant="text"
                            color="blue"
                            onClick={() =>
                              handleOpenEditModal(organization)
                            }
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </IconButton>

                          <IconButton
                            variant="text"
                            color="red"
                            onClick={() =>
                              handleOpenDeleteModal(organization)
                            }
                          >
                            <TrashIcon className="h-5 w-5" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredOrganizations.length > 0 && (
            <Typography
              variant="small"
              className="mt-4 text-blue-gray-500"
            >
              Total: {filteredOrganizations.length} organization
            </Typography>
          )}
        </CardBody>
      </Card>

      <CreateOrganizationModal
        open={createModalOpen}
        handleOpen={handleOpenCreateModal}
        refreshData={fetchOrganizations}
      />

      <EditOrganizationModal
        open={editModalOpen}
        handleOpen={() => handleOpenEditModal()}
        organization={selectedOrganization}
        refreshData={fetchOrganizations}
      />

      <DeleteOrganizationModal
        open={deleteModalOpen}
        handleOpen={() => handleOpenDeleteModal()}
        organization={selectedOrganization}
        refreshData={fetchOrganizations}
      />
    </>
  );
};

export default OrganizationPage;