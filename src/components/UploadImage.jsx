"use client"

import { useState } from "react"
import Swal from "sweetalert2"
import { uploadGitHubImage, getGitHubFile, updateGitHubFile, listGitHubDirectory, GITHUB_RAW_BASE } from "../lib/github"
import PropTypes from "prop-types"

function UploadImage({ onUploadSuccess }) {
  const [imageUpload, setImageUpload] = useState(null)
  const maxUploadSizeInBytes = 10 * 1024 * 1024 /** 10MB */
  const maxUploadsPerDay = 20

  const IMAGES_METADATA_FILE_PATH = "data/images.json"
  const CLOUD_FOLDER_PATH = "cloud/"

  const uploadImage = async () => {
    if (imageUpload == null) {
      Swal.fire({
        icon: "warning",
        title: "No Image Selected",
        text: "Please select an image to upload.",
        customClass: {
          container: "sweet-alert-container",
        },
      })
      return
    }

    const uploadedImagesCount = Number.parseInt(localStorage.getItem("uploadedImagesCount")) || 0
    const lastUploadDate = localStorage.getItem("lastUploadDate")

    /** Reset count if it's a new day */
    if (lastUploadDate && new Date(lastUploadDate).toDateString() !== new Date().toDateString()) {
      localStorage.setItem("uploadedImagesCount", 0)
      localStorage.setItem("lastUploadDate", new Date().toISOString())
      /** Re-fetch count after resetting */
      const newCount = Number.parseInt(localStorage.getItem("uploadedImagesCount")) || 0
      if (newCount >= maxUploadsPerDay) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "You have reached the maximum uploads for today.",
          customClass: {
            container: "sweet-alert-container",
          },
        })
        return
      }
    } else if (uploadedImagesCount >= maxUploadsPerDay) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You have reached the maximum uploads for today.",
        customClass: {
          container: "sweet-alert-container",
        },
      })
      return
    }

    if (imageUpload.size > maxUploadSizeInBytes) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "The maximum size for a photo is 10MB",
        customClass: {
          container: "sweet-alert-container",
        },
      })
      return
    }

    try {
      const reader = new FileReader()
      reader.readAsDataURL(imageUpload)
      reader.onloadend = async () => {
        const base64data = reader.result.split(",")[1] /** Get base64 string without data:image/jpeg;base64, */

        // Logika penamaan file berurutan
        let nextImageNumber = 1
        try {
          const filesInCloud = await listGitHubDirectory(CLOUD_FOLDER_PATH)
          const imageFiles = filesInCloud.filter(
            (file) => file.type === "file" && /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name),
          )

          if (imageFiles.length > 0) {
            const numbers = imageFiles
              .map((file) => {
                const match = file.name.match(/^(\d+)\./) // Match number at the beginning of the filename
                return match ? Number.parseInt(match[1], 10) : 0
              })
              .filter((num) => num > 0) // Filter out non-numeric or zero matches

            if (numbers.length > 0) {
              nextImageNumber = Math.max(...numbers) + 1
            }
          }
        } catch (error) {
          console.warn("Could not determine next image number, defaulting to 1:", error)
          // Lanjutkan dengan nextImageNumber = 1 jika gagal
        }

        const fileExtension = imageUpload.name.split(".").pop()
        const newFilename = `${nextImageNumber}.${fileExtension}`
        const imagePath = `${CLOUD_FOLDER_PATH}${newFilename}`

        await uploadGitHubImage(imagePath, base64data, `Upload image: ${newFilename}`)

        /** Update images.json with metadata */
        const { content: currentMetadataContent, sha: currentMetadataSha } =
          await getGitHubFile(IMAGES_METADATA_FILE_PATH)
        const currentImagesMetadata = JSON.parse(currentMetadataContent)

        const newImageMetadata = {
          url: `${GITHUB_RAW_BASE}${imagePath}`,
          timestamp: new Date().toISOString(),
          filename: newFilename,
          status: "pending", // Set status to pending
        }

        const updatedImagesMetadata = [...currentImagesMetadata, newImageMetadata]

        await updateGitHubFile(
          IMAGES_METADATA_FILE_PATH,
          JSON.stringify(updatedImagesMetadata, null, 2),
          currentMetadataSha,
          `Add metadata for ${newFilename} with status pending`,
        )

        localStorage.setItem("uploadedImagesCount", uploadedImagesCount + 1)
        localStorage.setItem("lastUploadDate", new Date().toISOString())

        setImageUpload(null) /** Clear selected image */

        Swal.fire({
          icon: "success",
          title: "Upload Successful!",
          text: "Your image has been uploaded and is awaiting admin approval. It will appear in the gallery once approved.",
          customClass: {
            container: "sweet-alert-container",
          },
        })

        /** Panggil callback untuk memberitahu komponen induk bahwa upload berhasil */
        if (onUploadSuccess) {
          onUploadSuccess()
        }
      }
      reader.onerror = (error) => {
        console.error("FileReader error:", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to read image file.",
          customClass: {
            container: "sweet-alert-container",
          },
        })
      }
    } catch (error) {
      console.error("Error uploading image to GitHub:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to upload image. Please try again. Details: ${error.message}`,
        customClass: {
          container: "sweet-alert-container",
        },
      })
    }
  }

  const handleImageChange = (event) => {
    setImageUpload(event.target.files[0])
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="text-center mb-4">
        <h1 className="text-1xl md:text-2xl md:px-10 font-bold mb-4 w-full text-white">
          Upload Your Classroom Memories
        </h1>
      </div>

      <div className="mx-auto p-4">
        <form>
          <div className="mb-4">
            <input type="file" id="imageUpload" className="hidden" onChange={handleImageChange} accept="image/*" />
            <label
              htmlFor="imageUpload"
              className="cursor-pointer border-dashed border-2 border-gray-400 rounded-lg p-4 w-56 h-auto flex items-center justify-center"
            >
              {imageUpload ? (
                <div className="w-full h-full overflow-hidden">
                  <img
                    src={URL.createObjectURL(imageUpload) || "/placeholder.svg"}
                    alt="Preview Gambar"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="text-center px-5 py-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-12 w-12 mx-auto text-gray-400"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-white opacity-60">Click to select an image</p>
                </div>
              )}
            </label>
          </div>
        </form>
      </div>

      <button
        type="button"
        className="py-2.5 w-[60%] mb-0 md:mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
        onClick={uploadImage}
      >
        UPLOAD
      </button>
    </div>
  )
}

UploadImage.propTypes = {
  onUploadSuccess: PropTypes.func,
}

export default UploadImage
