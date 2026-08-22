import React from "react";
import { NavLink, Link } from "react-router-dom";

import {
  List,
  ListItem,
  ListItemPrefix,
  Typography,
} from "@material-tailwind/react";

import {
  Square2StackIcon,
  UserGroupIcon,
  HeartIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  GiftIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

import logo2 from "../assets/logo2.png";
import sidebarIllustration from "../assets/banner2.jpeg";

const SidebarFoundation = ({ open, setOpen }) => {
  // ============================================================
  // MENU FOUNDATION ADMIN
  // ============================================================

  const menu = [
    {
      name: "Dashboard",
      icon: (
        <Square2StackIcon className="h-5 w-5" />
      ),
      path: "/FoundationAdmin/dashboard",
    },

    {
      name: "Program Foundation",
      icon: (
        <HeartIcon className="h-5 w-5" />
      ),
      path: "/FoundationAdmin/charities",
    },

    {
      name: "Donasi",
      icon: (
        <GiftIcon className="h-5 w-5" />
      ),
      path: "/FoundationAdmin/donations",
    },

    {
      name: "Donatur",
      icon: (
        <UserGroupIcon className="h-5 w-5" />
      ),
      path: "/FoundationAdmin/donors",
    },

    {
      name: "Penyaluran Dana",
      icon: (
        <BanknotesIcon className="h-5 w-5" />
      ),
      path: "/FoundationAdmin/distributions",
    },

    {
      name: "Laporan",
      icon: (
        <ChartBarIcon className="h-5 w-5" />
      ),
      path: "/FoundationAdmin/reports",
    },

    {
      name: "System Setting",
      icon: (
        <Cog6ToothIcon className="h-5 w-5" />
      ),
      path: "/FoundationAdmin/settings",
    },
  ];

  return (
    <>
      {/* ======================================================
          OVERLAY MOBILE
      ====================================================== */}

      {open && (
        <div
          className="
            fixed
            inset-0
            z-20
            bg-black/20
            backdrop-blur-sm
            md:hidden
          "
          onClick={() => setOpen(false)}
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <div
        className={`
          fixed
          md:static
          inset-y-0
          left-0
          z-30

          h-screen
          w-full
          max-w-[18rem]

          p-4

          shadow-xl
          shadow-blue-gray-900/5

          bg-white

          border-r
          border-gray-100

          transition-transform
          duration-300
          ease-in-out

          flex
          flex-col
          justify-between

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* ====================================================
            BAGIAN ATAS
        ==================================================== */}

        <div className="flex flex-col h-[calc(100%-130px)]">
          {/* ==================================================
              LOGO
          ================================================== */}

          <div
            className="
              mb-4
              p-4

              flex
              items-center
              justify-between

              border-b
              border-gray-50

              pb-6
              shrink-0
            "
          >
            <Link
              to="/FoundationAdmin/dashboard"
              className="
                flex
                items-center
                gap-4

                hover:opacity-80
                transition-opacity
              "
            >
              {/* LOGO */}

              <img
                src={logo2}
                alt="EcoCash"
                className="
                  h-14
                  w-14
                  object-contain
                "
              />

              {/* BRAND */}

              <div>
                <Typography
                  variant="h5"
                  className="
                    text-[#2b6cb0]
                    font-black
                    leading-tight
                  "
                >
                  EcoCash
                </Typography>

                <Typography
                  variant="small"
                  className="
                    text-green-500
                    font-bold
                    text-[10px]
                    uppercase
                    tracking-widest
                  "
                >
                  Foundation Admin
                </Typography>
              </div>
            </Link>

            {/* =================================================
                CLOSE MOBILE
            ================================================= */}

            <button
              onClick={() =>
                setOpen(false)
              }
              className="
                md:hidden
                p-2
                hover:bg-gray-100
                rounded-lg
                transition-colors
              "
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* ==================================================
              MENU
          ================================================== */}

          <div
            className="
              flex-1
              overflow-y-auto
              pr-1
              custom-scrollbar
            "
          >
            <List className="gap-1 p-0">
              {menu.map(
                (item, idx) => (
                  <NavLink
                    to={item.path}
                    key={idx}
                    onClick={() =>
                      setOpen(false)
                    }
                  >
                    {({
                      isActive,
                    }) => (
                      <ListItem
                        className={`
                          ${
                            isActive
                              ? "bg-blue-50 text-[#2b6cb0]"
                              : "text-gray-600 hover:text-[#2b6cb0] hover:bg-blue-50/50"
                          }

                          font-semibold
                          text-sm
                          py-3

                          transition-all
                          duration-200

                          rounded-xl
                        `}
                      >
                        {/* ICON */}

                        <ListItemPrefix>
                          <div
                            className={`
                              ${
                                isActive
                                  ? "text-[#2b6cb0]"
                                  : "text-gray-400"
                              }
                            `}
                          >
                            {
                              item.icon
                            }
                          </div>
                        </ListItemPrefix>

                        {/* NAME */}

                        <span className="flex-1">
                          {
                            item.name
                          }
                        </span>

                        {/* ACTIVE INDICATOR */}

                        {isActive && (
                          <div
                            className="
                              h-2
                              w-2
                              rounded-full
                              bg-[#2b6cb0]
                            "
                          />
                        )}
                      </ListItem>
                    )}
                  </NavLink>
                )
              )}
            </List>
          </div>
        </div>

        {/* ====================================================
            BAGIAN BAWAH
        ==================================================== */}

        <div
          className="
            pt-4
            border-t
            border-gray-50

            flex
            flex-col
            items-center
            justify-center

            shrink-0
            w-full
          "
        >
          <img
            src={
              sidebarIllustration
            }
            alt="Foundation Admin Illustration"
            className="
              w-full
              h-[140px]

              object-cover

              opacity-90
              hover:opacity-100

              transition-opacity
              duration-300

              rounded-xl
            "
          />

          {/* FOUNDATION LABEL */}

          <div
            className="
              mt-3
              w-full

              bg-blue-50
              border
              border-blue-100

              rounded-xl
              px-4
              py-3

              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                h-9
                w-9

                rounded-xl
                bg-[#2b6cb0]

                flex
                items-center
                justify-center
              "
            >
              <BuildingLibraryIcon className="h-5 w-5 text-white" />
            </div>

            <div>
              <Typography
                className="
                  text-[10px]
                  font-black
                  text-blue-900
                  uppercase
                "
              >
                EcoCash Foundation
              </Typography>

              <Typography
                className="
                  text-[9px]
                  font-medium
                  text-gray-500
                "
              >
                Social Impact Management
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarFoundation;