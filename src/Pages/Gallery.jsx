"use client"

import { useEffect, useState } from "react"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import ButtonSend from "../components/ButtonSend"
import ButtonRequest from "../components/ButtonRequest"
import Modal from "@mui/material/Modal"
import { IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { useSpring, animated } from "@react-spring/web"
import { getGitHubFile } from "../lib/github"

const Carousel = ({ galleryRefreshKey }) => {
  const [images, setImages] = useState([])
  const [open, setOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const modalFade = useSpring({
    opacity: open ? 1 : 0,
    config: { duration: 300 },
  })

  const fetchImagesFromGitHub = async () => {
    try {
      const { content } = await getGitHubFile("data/images.json")
      const imageData = JSON.parse(content)
      /** Filter for confirmed images and sort by timestamp in descending order (newest first) */
      const confirmedImages = imageData
        .filter((img) => img.status === "confirmed") // Filter only confirmed images
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setImages(confirmedImages.map((img) => img.url)) /** Extract only URLs for the carousel */
    } catch (error) {
      console.error("Error fetching images from GitHub:", error)
      setImages([]) /** Ensure images is an empty array on error */
    }
  }

  const handleGalleryRefresh = () => {
    // Implement gallery refresh logic here
  }

  useEffect(() => {
    fetchImagesFromGitHub()
  }, [galleryRefreshKey]) /** Tambahkan galleryRefreshKey sebagai dependency */

  const settings = {
    centerMode: true,
    centerPadding: "30px",
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    dots: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "50px",
          slidesToShow: 1,
          dots: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "70px",
          slidesToShow: 1,
          dots: false,
        },
      },
    ],
  }

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl)
    setOpen(true)
  }

  const handleCloseModal = () => {
    setOpen(false)
    setSelectedImage(null)
  }

  return (
    <>
      <div
        className="text-white opacity-60 text-base font-semibold mb-4 mx-[10%] mt-10 lg:text-center lg:text-3xl lg:mb-8"
        id="Gallery"
      >
        Class Gallery
      </div>
      <div id="Carousel">
        <Slider {...settings}>
          {images.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl || "/placeholder.svg"}
              alt={`Image ${index}`}
              onClick={() => handleImageClick(imageUrl)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </Slider>
      </div>

      <div className="flex justify-center items-center gap-6 text-base mt-5 lg:mt-8">
        {/* Meneruskan handleGalleryRefresh ke ButtonSend */}
        <ButtonSend onUploadSuccess={handleGalleryRefresh} />
        {/* Meneruskan galleryRefreshKey ke ButtonRequest */}
        <ButtonRequest galleryRefreshKey={galleryRefreshKey} />
      </div>

      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="image-modal"
        aria-describedby="image-modal-description"
        className="flex justify-center items-center"
      >
        <animated.div
          style={{
            ...modalFade,
            maxWidth: "90vw",
            maxHeight: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
          className="p-2 rounded-lg"
        >
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseModal}
            aria-label="close"
            sx={{
              position: "absolute",
              top: "12px",
              right: "23px",
              backgroundColor: "white",
              borderRadius: "50%",
            }}
          >
            <CloseIcon />
          </IconButton>
          <div className="w-full">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Selected Image"
              style={{ maxWidth: "100%", maxHeight: "100vh" }}
            />
          </div>
        </animated.div>
      </Modal>
    </>
  )
}

export default Carousel
