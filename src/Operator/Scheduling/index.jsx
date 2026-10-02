import React, { useState, useEffect } from "react";

import MainLayout from "../MainLayout";

import {
  Card,
  Typography,
  Button,
  Spinner,
  Chip,
} from "@material-tailwind/react";

import {
  CalendarDaysIcon,
  ArrowPathIcon,
  MapPinIcon,
  ClockIcon,
  TruckIcon,
  EyeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-hot-toast";



const dummySchedules = [
  {
    id: 1,
    machineCode: "EC-001",
    containerName: "Smart Container A",
    location: "Fakultas Teknik",
    pickupTime: "08:00 WIB",
    officer: "Ahmad Fauzi",
    date: "11 September 2026",
    status: "TERJADWAL",
    capacity: 75,
  },

  {
    id: 2,
    machineCode: "EC-002",
    containerName: "Smart Container B",
    location: "Gedung Rektorat",
    pickupTime: "10:30 WIB",
    officer: "Budi Santoso",
    date: "11 September 2026",
    status: "BERJALAN",
    capacity: 90,
  },

  {
    id: 3,
    machineCode: "EC-003",
    containerName: "Smart Container C",
    location: "Area Parkir Utama",
    pickupTime: "13:00 WIB",
    officer: "Rizki Ramadhan",
    date: "12 September 2026",
    status: "SELESAI",
    capacity: 40,
  },

  {
    id: 4,
    machineCode: "EC-004",
    containerName: "Smart Container D",
    location: "Kantin Kampus",
    pickupTime: "15:30 WIB",
    officer: "Deni Pratama",
    date: "12 September 2026",
    status: "TERJADWAL",
    capacity: 60,
  },
];




const Scheduling = () => {


  const [schedules,setSchedules] = useState([]);

  const [loading,setLoading] = useState(true);



  const fetchSchedules = (manual=false)=>{


    setLoading(true);


    const toastId = manual
      ? toast.loading("Sinkronisasi jadwal...")
      : null;



    setTimeout(()=>{


      setSchedules(dummySchedules);


      setLoading(false);



      if(manual){

        toast.success(
          "Jadwal berhasil diperbarui",
          {
            id:toastId
          }
        );

      }


    },800);



  };




  useEffect(()=>{

    fetchSchedules();

  },[]);





  const getStatusColor=(status)=>{


    switch(status){


      case "SELESAI":
        return "green";


      case "BERJALAN":
        return "blue";


      case "TERJADWAL":
        return "amber";


      default:
        return "blue-gray";


    }

  };





  return (

    <MainLayout>


      <div className="
      space-y-8
      pb-10
      ">



        {/* HEADER */}


        <div className="
        flex
        flex-col
        md:flex-row
        justify-between
        items-start
        md:items-center
        gap-5
        ">


          <div>


            <Typography
              variant="h3"
              className="
              flex
              items-center
              gap-3
              text-blue-900
              font-black
              text-2xl
              md:text-3xl
              uppercase
              italic
              "
            >

              <CalendarDaysIcon
                className="
                h-10
                w-10
                text-blue-600
                "
              />


              Penjadwalan


            </Typography>



            <Typography
              className="
              text-gray-500
              text-sm
              font-bold
              italic
              "
            >

              Monitoring jadwal pengangkutan Smart Container EcoCash

            </Typography>



          </div>





          <Button
            onClick={() => fetchSchedules(true)}
            className="
            flex
            items-center
            gap-3
            bg-blue-600
            rounded-2xl
            px-6
            py-3
            font-black
            "
          >

            <ArrowPathIcon
              className={`
              h-5
              w-5

              ${
                loading
                ?
                "animate-spin"
                :
                ""
              }

              `}
            />

            Sync Jadwal


          </Button>



        </div>







        {
          loading && schedules.length===0

          ?

          (

            <div className="
            p-20
            text-center
            ">

              <Spinner
                className="
                h-12
                w-12
                mx-auto
                text-blue-600
                "
              />

            </div>

          )


          :


          (

          <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
            "
          >


          {
            schedules.map((item)=>(


              <Card

                key={item.id}

                className="
                p-6
                rounded-[2.5rem]
                border
                border-gray-100
                bg-white
                shadow-xl
                hover:-translate-y-1
                transition-all
                "

              >



                {/* ICON STATUS */}

                <div
                  className="
                  flex
                  justify-between
                  items-start
                  mb-6
                  "
                >


                  <div
                    className="
                    h-14
                    w-14
                    rounded-2xl
                    bg-blue-600
                    flex
                    items-center
                    justify-center
                    text-white
                    shadow-lg
                    "
                  >

                    <TruckIcon
                      className="
                      h-8
                      w-8
                      "
                    />


                  </div>



                  <Chip
                    value={item.status}
                    color={getStatusColor(item.status)}
                    className="
                    rounded-full
                    font-bold
                    "
                  />



                </div>







                {/* DATA */}


                <Typography
                  className="
                  text-[11px]
                  font-black
                  text-blue-600
                  uppercase
                  "
                >

                  Container : {item.machineCode}

                </Typography>



                <Typography
                  variant="h5"
                  className="
                  mt-1
                  font-black
                  text-blue-900
                  "
                >

                  {item.containerName}

                </Typography>





                <div className="
                mt-5
                space-y-3
                ">



                  <div className="
                  flex
                  gap-2
                  items-center
                  text-gray-500
                  ">

                    <MapPinIcon
                      className="
                      h-4
                      w-4
                      text-blue-500
                      "
                    />

                    <Typography
                      className="
                      text-xs
                      font-bold
                      "
                    >

                      {item.location}

                    </Typography>


                  </div>





                  <div className="
                  flex
                  gap-2
                  items-center
                  text-gray-500
                  ">

                    <ClockIcon
                      className="
                      h-4
                      w-4
                      text-blue-500
                      "
                    />


                    <Typography
                      className="
                      text-xs
                      font-bold
                      "
                    >

                      {item.pickupTime}

                    </Typography>


                  </div>





                  <div className="
                  flex
                  gap-2
                  items-center
                  text-gray-500
                  ">


                    <UserIcon
                      className="
                      h-4
                      w-4
                      text-blue-500
                      "
                    />


                    <Typography
                      className="
                      text-xs
                      font-bold
                      "
                    >

                      {item.officer}

                    </Typography>



                  </div>


                </div>






                {/* CAPACITY */}

                <div
                  className="
                  mt-5
                  bg-blue-50
                  rounded-2xl
                  p-4
                  "
                >

                  <div
                    className="
                    flex
                    justify-between
                    "
                  >

                    <Typography
                      className="
                      text-[10px]
                      font-black
                      text-blue-800
                      "
                    >

                      KAPASITAS

                    </Typography>


                    <Typography
                      className="
                      font-black
                      text-blue-900
                      "
                    >

                      {item.capacity}%

                    </Typography>


                  </div>


                </div>







                <Button
                  variant="outlined"
                  className="
                  mt-6
                  w-full
                  rounded-xl
                  border-2
                  border-blue-600
                  text-blue-600
                  flex
                  justify-center
                  items-center
                  gap-2
                  font-black
                  "
                >

                  <EyeIcon
                    className="
                    h-4
                    w-4
                    "
                  />

                  Detail Jadwal


                </Button>




              </Card>


            ))
          }


          </div>


          )


        }




      </div>


    </MainLayout>


  );

};


export default Scheduling;