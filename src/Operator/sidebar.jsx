import React from "react";

import logo2 from "../assets/logo2.png";
import sidebarIllustration from "../assets/banner2.jpeg";

import { Link } from "react-router-dom";

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
  CpuChipIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

import { useNavigate, useLocation } from "react-router-dom";


const SidebarOperator = ({ open, setOpen }) => {

  const navigate = useNavigate();
  const location = useLocation();


  const menuItems = [
    {
      name: "Dashboard",
      icon: (
        <PresentationChartBarIcon className="h-5 w-5" />
      ),
      path: "/operator/dashboard",
    },

    {
      name: "Smart Container",
      icon: (
        <CpuChipIcon className="h-5 w-5" />
      ),
      path: "/operator/smart-container",
    },

    {
      name: "Penjadwalan",
      icon: (
        <CalendarDaysIcon className="h-5 w-5" />
      ),
      path: "/operator/scheduling",
    },

    {
      name: "System Setting",
      icon: (
        <Cog6ToothIcon className="h-5 w-5" />
      ),
      path: "/operator/settings",
    },
  ];


  return (
    <>


      {/* Overlay Mobile */}
      {open && (
        <div
          className="
          fixed
          inset-0
          z-40
          bg-black/20
          backdrop-blur-sm
          md:hidden
          "
          onClick={() => setOpen(false)}
        />
      )}



      <Card
        className={`
        fixed
        md:static
        inset-y-0
        left-0
        z-50
        h-screen
        w-full
        max-w-[280px]
        rounded-none
        p-6
        shadow-xl
        transition-transform
        duration-300
        bg-white
        border-r
        border-gray-100

        ${
          open
          ? "translate-x-0"
          : "-translate-x-full md:translate-x-0"
        }
        `}
      >



        {/* HEADER LOGO */}
        <div
          className="
          mb-8
          p-4
          flex
          items-center
          justify-between
          border-b
          border-gray-50
          pb-6
          "
        >


          <Link
            to="/operator/dashboard"
            className="
            flex
            items-center
            gap-4
            hover:opacity-80
            transition-opacity
            "
          >

            <img
              src={logo2}
              alt="EcoCash"
              className="
              h-14
              w-14
              object-contain
              "
            />


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
                Operator
              </Typography>

            </div>

          </Link>



          <button
            onClick={() => setOpen(false)}
            className="
            md:hidden
            p-2
            hover:bg-gray-100
            rounded-lg
            "
          >

            <XMarkIcon
              className="
              h-6
              w-6
              text-gray-500
              "
            />

          </button>


        </div>





        {/* MENU */}
        <div
          className="
          flex
          flex-col
          h-[calc(100%-140px)]
          justify-between
          "
        >



          <List
            className="
            p-0
            space-y-2
            "
          >

            {
              menuItems.map((item)=>{


                const active =
                  location.pathname === item.path;


                return (

                  <ListItem

                    key={item.name}

                    onClick={()=>{

                      navigate(item.path);

                      setOpen(false);

                    }}


                    className={`rounded-2xl px-5 py-4 transition-all duration-300 group cursor-pointer ${active ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100" : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"}`}
                  >



                    <ListItemPrefix>

                      <div
                        className={`transition-colors ${active ? "text-blue-700" : "text-gray-400 group-hover:text-blue-500"}`}
                      >

                        {item.icon}

                      </div>


                    </ListItemPrefix>




                    <Typography
                      className={`mr-auto text-sm font-black tracking-tight ${active ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
                    >

                      {item.name}

                    </Typography>




                    {
                      active && (

                        <div
                          className="
                          h-2
                          w-2
                          rounded-full
                          bg-blue-600
                          shadow-lg
                          shadow-blue-200
                          "
                        />

                      )
                    }



                  </ListItem>

                );


              })
            }



          </List>





          {/* IMAGE BOTTOM */}
          <div
            className="
            mt-auto
            pt-6
            w-full
            "
          >

            <div
              className="
              overflow-hidden
              rounded-2xl
              w-full
              "
            >

              <img

                src={sidebarIllustration}

                alt="Sidebar Illustration"

                className="
                w-full
                h-[170px]
                object-cover
                opacity-90
                hover:opacity-100
                transition-opacity
                duration-300
                "

              />

            </div>

          </div>



        </div>



      </Card>


    </>
  );
};


export default SidebarOperator;