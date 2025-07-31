"use client"

import React, { useEffect } from "react"
import AOS from "aos"
import "aos/dist/aos.css"

const Senin = React.lazy(() => import("../components/Mapel/Senin"))
const Selasa = React.lazy(() => import("../components/Mapel/Selasa"))
const Rabu = React.lazy(() => import("../components/Mapel/Rabu"))
const Kamis = React.lazy(() => import("../components/Mapel/Kamis"))
const Jumat = React.lazy(() => import("../components/Mapel/Jumat"))

const Schedule = () => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const currentDayIndex = new Date().getDay()
  const currentDay = daysOfWeek[currentDayIndex]

  useEffect(() => {
    AOS.init()
    AOS.refresh()
  }, [])

  const piketGroup = [
    [],
    [
      "Aida Nur Fadhillah",
      "NOR AJKIA",
      "MUHAMMAD ALVIE",
      "Ferdy Samantha Situmorang",
      "Hafizi",
      "Muhammad Rendy Saputra",
      "Hanifah Sekar Kinarsih Imandariani",
    ],
    ["Apriani", "FAHRENDY RIFQI PRATAMA", "GISELA NETANYA", "Naila Amuna", "Raol Mukarrozi", "Rafa Akbar"],
    ["Dewi Nasya Ramadhani", "Nabila Assyifa", "NUR ANITA", "Rizwan Chandra Ramadhani", "Ropikoh", "Muhammad Zidan"],
    [
      "AYDIN JAVAS NARARYA",
      "NUR SALSABILLA",
      "Muhammad Dhafin Razata",
      "Ikhlas Cassanova Darmawan",
      "Jesica Adelia Agustin",
      "Gusti Selvia Yulinda",
      "Wulandari",
    ],
    [
      "Amirotul Muslimah Putriani",
      "SRI RAHAYU",
      "Kafian Rizki Sahputra",
      "NAZARENA JASMINE QORI",
      "MUHAMMAD RAFFA ARSYAFANI",
      "Sonya Jun Maxima Lau",
    ],
    [],
  ]

  const currentPiketNames = piketGroup[currentDayIndex]

  const dayComponents = [null, Senin, Selasa, Rabu, Kamis, Jumat]
  const TodaySubjectComponent = dayComponents[currentDayIndex]

  console.log("Current Day:", currentDay)
  console.log("Current Piket Names:", currentPiketNames)

  return (
    <>
      <div className="lg:flex lg:justify-center lg:gap-32 lg:mb-10 lg:mt-16 ">
        <div className="text-white flex flex-col justify-center items-center mt-8 md:mt-3 overflow-y-hidden">
          <div className="text-2xl font-medium mb-5" data-aos="fade-up" data-aos-duration="500">
            {currentDay}
          </div>
          <div data-aos="fade-up" data-aos-duration="400">
            {TodaySubjectComponent ? (
              <React.Suspense fallback={<p className="opacity-50">Loading Jadwal...</p>}>
                <TodaySubjectComponent />
              </React.Suspense>
            ) : (
              <p className="opacity-50">Tidak Ada Jadwal Mata Pelajaran Hari Ini</p>
            )}
          </div>
        </div>
      </div>

      <div className="text-white flex flex-col justify-center items-center mt-8 lg:mt-0 lg:mb-[10rem] mb-10 overflow-y-hidden">
        <div className="text-2xl font-medium mb-5 text-center" data-aos="fade-up" data-aos-duration="500">
          Piket
        </div>
        {currentPiketNames && currentPiketNames.length > 0 ? (
          currentPiketNames.map((piketName, index) => (
            <div
              key={index}
              className={` border-t-2 border-white flex justify-center py-[0.50rem] w-72 px-3 ${
                index === currentPiketNames.length - 1 ? "border-b-2" : ""
              }`}
              data-aos="fade-up"
              data-aos-duration={600 + index * 100}
            >
              <div className="text-base font-medium">{piketName}</div>
            </div>
          ))
        ) : (
          <p className="opacity-50">Tidak Ada Jadwal Piket Hari Ini</p>
        )}
      </div>
    </>
  )
}

export default Schedule
