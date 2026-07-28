import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import logo2 from "../assets/logo2.png";
import sidebarIllustration from "../assets/banner2.jpeg";

import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
} from "@material-tailwind/react";

import {
  PresentationChartBarIcon,
  XMarkIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BuildingOffice2Icon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const SidebarOrganization = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      icon: (
        <PresentationChartBarIcon className="h-5 w-5" />
      ),
      path: "/OrganizationAdmin/dashboard",
    },
    {
      name: "User Management",
      icon: <UserGroupIcon className="h-5 w-5" />,
      path: "/OrganizationAdmin/users",
    },
    {
      name: "Transaction",
      icon: (
        <ClipboardDocumentListIcon className="h-5 w-5" />
      ),
      path: "/OrganizationAdmin/transactions",
    },
    {
      name: "Organization Profile",
      icon: (
        <BuildingOffice2Icon className="h-5 w-5" />
      ),
      path: "/OrganizationAdmin/profile",
    },
    {
      name: "System Setting",
      icon: <Cog6ToothIcon className="h-5 w-5" />,
      path: "/OrganizationAdmin/settings",
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  const isMenuActive = (path) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <>
      {/* Overlay untuk tampilan mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <Card
        className={`
          fixed inset-y-0 left-0 z-30
          flex h-screen w-full max-w-[280px]
          flex-col justify-between
          overflow-hidden rounded-none
          border-r border-gray-100
          bg-white p-5 shadow-xl
          transition-transform duration-300
          md:static
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Bagian atas */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="mb-2 flex shrink-0 items-center justify-between border-b border-gray-50 p-2 pb-4">
            <Link
              to="/OrganizationAdmin/dashboard"
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
              onClick={() => setOpen(false)}
            >
              <img
                src={logo2}
                alt="EcoCash"
                className="h-12 w-12 object-contain"
              />

              <div>
                <Typography
                  variant="h5"
                  className="text-lg font-black leading-tight text-[#2b6cb0]"
                >
                  EcoCash
                </Typography>

                <Typography
                  variant="small"
                  className="text-[10px] font-bold uppercase tracking-widest text-green-500"
                >
                  Organization Admin
                </Typography>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 transition-colors hover:bg-gray-100 md:hidden"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Menu */}
          <div className="flex-1 select-none overflow-y-auto py-2 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <List className="space-y-1 p-0">
              {menuItems.map((item) => {
                const isActive = isMenuActive(
                  item.path
                );

                return (
                  <ListItem
                    key={item.name}
                    onClick={() =>
                      handleNavigate(item.path)
                    }
                    className={`
                      group rounded-xl px-3 py-2.5
                      transition-all duration-300
                      ${
                        isActive
                          ? "bg-blue-50 text-[#2b6cb0] shadow-sm"
                          : "text-gray-500 hover:bg-gray-50"
                      }
                    `}
                  >
                    <ListItemPrefix className="mr-3">
                      <div
                        className={
                          isActive
                            ? "text-[#2b6cb0]"
                            : "text-gray-400 group-hover:text-gray-600"
                        }
                      >
                        {item.icon}
                      </div>
                    </ListItemPrefix>

                    <Typography
                      className={`
                        mr-auto text-sm font-semibold
                        ${
                          isActive
                            ? "opacity-100"
                            : "opacity-70 group-hover:opacity-100"
                        }
                      `}
                    >
                      {item.name}
                    </Typography>
                  </ListItem>
                );
              })}
            </List>
          </div>
        </div>

        {/* Bagian bawah */}
        <div className="mt-2 flex w-full shrink-0 flex-col items-center justify-center border-t border-gray-100 pt-3">
          <img
            src={sidebarIllustration}
            alt="Organization Admin Illustration"
            className="h-[110px] w-full rounded-xl object-cover opacity-90 shadow-sm transition-opacity duration-300 hover:opacity-100"
          />
        </div>
      </Card>
    </>
  );
};

export default SidebarOrganization;