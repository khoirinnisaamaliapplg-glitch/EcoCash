import React, {
  useEffect,
  useState,
} from "react";

import {
  Card,
  Typography,
  Chip,
  Input,
} from "@material-tailwind/react";

import {
  BanknotesIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import MainLayout from "../MainLayout";

import api from "../../utils/api";



const DonationsIndex = () => {
  const [
    donations,
    setDonations,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  useEffect(() => {
    const fetchData =
      async () => {
        try {
          const response =
            await api.get(
              FOUNDATION_API.donations
            );

          const data =
            Array.isArray(
              response.data?.data
            )
              ? response.data.data
              : [];

          setDonations(
            data
          );
        } catch (error) {
          console.error(
            error
          );
        }
      };

    fetchData();
  }, []);

  const filtered =
    donations.filter(
      (item) => {
        const keyword =
          search.toLowerCase();

        return (
          String(
            item.user?.name ||
              item.donor?.name ||
              ""
          )
            .toLowerCase()
            .includes(
              keyword
            ) ||
          String(
            item.charity?.name ||
              ""
          )
            .toLowerCase()
            .includes(
              keyword
            )
        );
      }
    );

  const total =
    donations.reduce(
      (
        current,
        item
      ) =>
        current +
        Number(
          item.amount ||
            0
        ),
      0
    );

  return (
    <MainLayout>

      <div className="space-y-6">

        <div>

          <Typography
            variant="h4"
            className="font-black text-blue-900"
          >
            Donations
          </Typography>

          <Typography className="text-sm text-gray-500">
            Seluruh Donation pada Charity Foundation
          </Typography>

        </div>

        <div className="grid md:grid-cols-2 gap-4">

          <Card className="p-5">

            <Typography className="text-[10px] uppercase text-gray-400 font-black">
              Total Donation
            </Typography>

            <Typography
              variant="h3"
              className="text-blue-900 font-black"
            >
              {donations.length}
            </Typography>

          </Card>

          <Card className="p-5">

            <Typography className="text-[10px] uppercase text-gray-400 font-black">
              Total Dana
            </Typography>

            <Typography
              variant="h3"
              className="text-green-600 font-black"
            >
              Rp{" "}
              {total.toLocaleString(
                "id-ID"
              )}
            </Typography>

          </Card>

        </div>

        <Card className="p-4">

          <Input
            label="Cari donatur atau Charity..."
            value={
              search
            }
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            icon={
              <MagnifyingGlassIcon className="h-5 w-5" />
            }
          />

        </Card>

        <Card className="overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead className="bg-blue-50">

                <tr>

                  {[
                    "Donatur",
                    "Charity",
                    "Nominal",
                    "Message",
                    "Tanggal",
                    "Status",
                  ].map(
                    (head) => (
                      <th
                        key={
                          head
                        }
                        className="p-4 text-left text-[10px] uppercase text-blue-800"
                      >
                        {head}
                      </th>
                    )
                  )}

                </tr>

              </thead>

              <tbody>

                {filtered.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                      className="border-b border-gray-50"
                    >

                      <td className="p-4">

                        <Typography className="font-black text-sm text-blue-900">
                          {item.user?.name ||
                            item.donor
                              ?.name ||
                            "User"}
                        </Typography>

                      </td>

                      <td className="p-4 text-sm">
                        {item.charity
                          ?.name ||
                          item.charity
                            ?.title ||
                          "-"}
                      </td>

                      <td className="p-4">

                        <Typography className="font-black text-green-600">
                          Rp{" "}
                          {Number(
                            item.amount ||
                              0
                          ).toLocaleString(
                            "id-ID"
                          )}
                        </Typography>

                      </td>

                      <td className="p-4 text-xs text-gray-500">
                        {item.message ||
                          "-"}
                      </td>

                      <td className="p-4 text-xs">
                        {item.createdAt
                          ? new Date(
                              item.createdAt
                            ).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </td>

                      <td className="p-4">

                        <Chip
                          value={
                            item.status ||
                            "SUCCESS"
                          }
                          color="green"
                          className="w-fit"
                        />

                      </td>

                    </tr>
                  )
                )}

                {!filtered.length && (
                  <tr>

                    <td
                      colSpan="6"
                      className="p-12 text-center text-gray-400"
                    >
                      <BanknotesIcon className="h-8 w-8 mx-auto mb-2" />

                      Belum ada Donation.
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </Card>

      </div>

    </MainLayout>
  );
};

export default DonationsIndex;