"use client";
/*-----------------------------------------------------------------------------------------------------
| @component CreateProjectView
| @brief    Enhanced form component for creating and editing NGO projects with media upload and editor
| @param    projectId - optional project ID for editing mode
| @return   JSX element of project creation/editing form
-----------------------------------------------------------------------------------------------------*/

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  FiUpload,
  FiCheck,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMove,
  FiRotateCw,
  FiZoomIn,
  FiZoomOut,
  FiAlertCircle,
  FiLoader,
  FiArrowLeft,
} from "react-icons/fi";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import MenuBar from "./MenuBar";
import axios from "axios";
import API_BASE_URL from "../../lib/api";
import CreateProjectSuccessPopUp from "../CreateProjectSuccessPopUp";
import axiosInstance from "../../lib/axiosInstance";
import { useParams, useNavigate } from "react-router";

/*-----------------------------------------------------------------------------------------------------
| @interface FileWithPreview
| @brief    Extended File interface with preview URL and selection state
| @param    file - original file object
| @param    preview - object URL for preview
| @param    selected - whether file is selected in popup
| @param    id - unique identifier
-----------------------------------------------------------------------------------------------------*/
interface FileWithPreview {
  file: File;
  preview: string;
  selected: boolean;
  id: string;
}

/*-----------------------------------------------------------------------------------------------------
| @interface CropArea
| @brief    Interface for crop area coordinates and dimensions
| @param    x, y - position relative to image
| @param    width, height - crop dimensions
-----------------------------------------------------------------------------------------------------*/
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/*-----------------------------------------------------------------------------------------------------
| @interface MediaItem
| @brief    Interface for existing media items from backend
| @param    _id - media item identifier
| @param    url - media URL
| @param    type - media type (image/video)
| @param    publicId - cloud storage public ID
-----------------------------------------------------------------------------------------------------*/
interface MediaItem {
  _id: string;
  url: string;
  type: string;
  publicId: string;
}

/*-----------------------------------------------------------------------------------------------------
| @interface ProjectData
| @brief    Interface for project data from backend
| @param    _id - project identifier
| @param    title - project title
| @param    category - project category/cause
| @param    location - project location
| @param    status - project status
| @param    beneficiaries - number of beneficiaries
| @param    startDate - project start date
| @param    description - project description
| @param    media - array of media items
-----------------------------------------------------------------------------------------------------*/
interface ProjectData {
  _id: string;
  title: string;
  category: string;
  location: string;
  status: "ongoing" | "completed";
  beneficiaries: string;
  startDate: string;
  description: string;
  media: MediaItem[];
}

const CreateProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(projectId);

  // Form states
  const [title, setTitle] = useState("");
  const [cause, setCause] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [markAs, setMarkAs] = useState("ongoing");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Popup and file management states
  const [showPopup, setShowPopup] = useState(false);
  const [popupFiles, setPopupFiles] = useState<FileWithPreview[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Cropping states
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 50,
    y: 50,
    width: 200,
    height: 200,
  });
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [cropFileId, setCropFileId] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  // Drag and drop for reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Success message states
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  /*-----------------------------------------------------------------------------------------------------
  | @blocktype editor
  | @brief    Initializes Tiptap editor for project description
  | @param    --
  | @return   Editor instance
  -----------------------------------------------------------------------------------------------------*/
  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Enter project description...",
      }),
    ],
    editorProps: {
      attributes: {
        class: "my-custom-editor focus:outline-none",
        style: "outline: none; box-shadow: none; min-height: 150px;",
      },
    },
    content: "",
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML());
    },
  });

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchProjectData
  | @brief    Fetches project data for editing mode
  | @param    projectId - ID of project to fetch
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  // Add this useEffect to monitor existingMedia changes
  useEffect(() => {
    console.log("existingMedia state updated:", existingMedia);
  }, [existingMedia]);

  const fetchProjectData = async (projectId: string) => {
    try {
      setFetchLoading(true);
      setErrorMsg("");

      const response = await axiosInstance.get(`/api/projects/${projectId}`);
      console.log(response);
      const project: ProjectData = response.data.project;

      // Populate form fields
      setTitle(project.title);
      setCause(project.category);
      setLocation(project.location);
      setMarkAs(project.status);
      setStartDate(project.startDate.split("T")[0]);
      setBeneficiaries(project.beneficiaries);
      setDescription(project.description);

      console.log("Setting existing media:", project.media);
      setExistingMedia(project.media || []);
      console.log(existingMedia);
      // Set editor content
      editor?.commands.setContent(project.description);
    } catch (err: any) {
      console.error("Failed to fetch project data:", err);
      setErrorMsg(
        err.response?.data?.message || "Failed to load project data."
      );
    } finally {
      setFetchLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function generateId
  | @brief    Generates unique identifier for files
  | @param    --
  | @return   unique string ID
  -----------------------------------------------------------------------------------------------------*/
  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleFileChange
  | @brief    Handles selection of media files and opens popup
  | @param    e - file input change event
  | @param    openPopup - whether to open popup after selection
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    openPopup: boolean = true
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const filesWithPreview: FileWithPreview[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      selected: true,
      id: generateId(),
    }));

    if (openPopup) {
      setPopupFiles(filesWithPreview);
      setCurrentFileIndex(0);
      setShowPopup(true);
    } else {
      const selectedFiles = filesWithPreview.map((f) => f.file);
      setMediaFiles((prev) => [...prev, ...selectedFiles]);

      if (showPopup) {
        setPopupFiles((prev) => [...prev, ...filesWithPreview]);
      }
    }

    setErrorMsg("");
    e.target.value = "";
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleFileToggle
  | @brief    Toggles selection state of file in popup
  | @param    id - file identifier
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleFileToggle = (id: string) => {
    setPopupFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, selected: !file.selected } : file
      )
    );
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleDeleteCurrentFile
  | @brief    Removes currently displayed file from popup
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleDeleteCurrentFile = () => {
    if (popupFiles.length === 0) return;

    const currentFile = popupFiles[currentFileIndex];
    URL.revokeObjectURL(currentFile.preview);

    setPopupFiles((prev) => prev.filter((_, idx) => idx !== currentFileIndex));

    if (currentFileIndex >= popupFiles.length - 1) {
      setCurrentFileIndex(Math.max(0, popupFiles.length - 2));
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleAddMoreFiles
  | @brief    Triggers file input for adding more files
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleAddMoreFiles = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,video/*";
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;

      const newFilesWithPreview: FileWithPreview[] = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        selected: true,
        id: generateId(),
      }));

      setPopupFiles((prev) => [...prev, ...newFilesWithPreview]);
    };
    input.click();
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function openEditPopup
  | @brief    Opens popup editor with current media files and existing media
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const openEditPopup = () => {
    const newFilesWithPreview: FileWithPreview[] = mediaFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      selected: true,
      id: generateId(),
    }));

    setPopupFiles(newFilesWithPreview);
    setCurrentFileIndex(currentCarouselIndex);
    setShowPopup(true);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleCropStart
  | @brief    Initiates crop mode for current image
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleCropStart = () => {
    if (popupFiles.length === 0) return;

    const currentFile = popupFiles[currentFileIndex];
    if (!currentFile.file.type.startsWith("image/")) return;

    setCropImageSrc(currentFile.preview);
    setCropFileId(currentFile.id);
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
    setCropArea({ x: 50, y: 50, width: 200, height: 200 });
    setShowCropModal(true);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleCropDragStart
  | @brief    Handles start of crop area dragging
  | @param    e - mouse event
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleCropDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropArea.x,
      y: e.clientY - cropArea.y,
    });
    e.preventDefault();
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleCropDrag
  | @brief    Handles crop area dragging
  | @param    e - mouse event
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleCropDrag = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !cropContainerRef.current) return;

      const rect = cropContainerRef.current.getBoundingClientRect();
      const newX = Math.max(
        0,
        Math.min(
          e.clientX - rect.left - dragStart.x,
          rect.width - cropArea.width
        )
      );
      const newY = Math.max(
        0,
        Math.min(
          e.clientY - rect.top - dragStart.y,
          rect.height - cropArea.height
        )
      );

      setCropArea((prev) => ({
        ...prev,
        x: newX,
        y: newY,
      }));
    },
    [isDragging, dragStart, cropArea.width, cropArea.height]
  );

  /*-----------------------------------------------------------------------------------------------------
  | @function handleCropDragEnd
  | @brief    Handles end of crop area dragging
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleCropDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for crop dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleCropDrag);
      document.addEventListener("mouseup", handleCropDragEnd);
      return () => {
        document.removeEventListener("mousemove", handleCropDrag);
        document.removeEventListener("mouseup", handleCropDragEnd);
      };
    }
  }, [isDragging, handleCropDrag, handleCropDragEnd]);

  /*-----------------------------------------------------------------------------------------------------
  | @function applyCrop
  | @brief    Applies crop to image and updates file
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const applyCrop = async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !cropImageSrc) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const displayRect = image.getBoundingClientRect();
    const scaleX = image.naturalWidth / displayRect.width;
    const scaleY = image.naturalHeight / displayRect.height;

    const actualCropX = cropArea.x * scaleX * imageScale;
    const actualCropY = cropArea.y * scaleY * imageScale;
    const actualCropWidth = cropArea.width * scaleX * imageScale;
    const actualCropHeight = cropArea.height * scaleY * imageScale;

    canvas.width = actualCropWidth;
    canvas.height = actualCropHeight;

    ctx.drawImage(
      image,
      actualCropX,
      actualCropY,
      actualCropWidth,
      actualCropHeight,
      0,
      0,
      actualCropWidth,
      actualCropHeight
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], "cropped.jpg", {
          type: "image/jpeg",
        });
        const newPreview = URL.createObjectURL(croppedFile);

        setPopupFiles((prev) =>
          prev.map((file) =>
            file.id === cropFileId
              ? { ...file, file: croppedFile, preview: newPreview }
              : file
          )
        );

        setMediaFiles((prev) =>
          prev.map((file, idx) => {
            const popupFile = popupFiles.find((pf) => pf.id === cropFileId);
            if (popupFile && idx === currentFileIndex) {
              return croppedFile;
            }
            return file;
          })
        );
      }
    });

    setShowCropModal(false);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleDragStart
  | @brief    Handles start of drag operation for file reordering
  | @param    index - index of dragged file
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleDragOver
  | @brief    Handles drag over event
  | @param    e - drag event
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleDrop
  | @brief    Handles drop event for file reordering
  | @param    dropIndex - target index for drop
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newFiles = [...popupFiles];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(dropIndex, 0, draggedFile);

    setPopupFiles(newFiles);
    setDraggedIndex(null);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handlePopupNext
  | @brief    Processes selected files and closes popup
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handlePopupNext = () => {
    const allFiles = popupFiles.map((f) => f.file);
    setMediaFiles(allFiles);

    popupFiles.forEach((file) => {
      URL.revokeObjectURL(file.preview);
    });

    setPopupFiles([]);
    setShowPopup(false);
    setCurrentCarouselIndex(0);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handlePopupClose
  | @brief    Closes popup and cleans up file URLs
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handlePopupClose = () => {
    popupFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    setPopupFiles([]);
    setShowPopup(false);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function navigateCarousel
  | @brief    Navigates through uploaded files and existing media in carousel
  | @param    direction - 'prev' or 'next'
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const navigateCarousel = (direction: "prev" | "next") => {
    const totalMedia = mediaFiles.length + existingMedia.length;

    if (direction === "prev") {
      setCurrentCarouselIndex((prev) =>
        prev === 0 ? totalMedia - 1 : prev - 1
      );
    } else {
      setCurrentCarouselIndex((prev) =>
        prev === totalMedia - 1 ? 0 : prev + 1
      );
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function getCurrentMediaItem
  | @brief    Gets current media item for carousel display
  | @param    --
  | @return   media item object with url and type
  -----------------------------------------------------------------------------------------------------*/
  const getCurrentMediaItem = () => {
    const totalNewFiles = mediaFiles.length;

    if (currentCarouselIndex < totalNewFiles) {
      // Show new file
      return {
        url: URL.createObjectURL(mediaFiles[currentCarouselIndex]),
        type: mediaFiles[currentCarouselIndex].type,
        isNew: true,
      };
    } else {
      // Show existing media
      const existingIndex = currentCarouselIndex - totalNewFiles;
      const existingItem = existingMedia[existingIndex];
      return {
        url: existingItem.url,
        type: existingItem.type,
        isNew: false,
      };
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleSubmit
  | @brief    Submits project form data for creation or update using axios instance
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", cause);
      formData.append("location", location);
      formData.append("startDate", startDate);
      formData.append("status", markAs);
      formData.append("beneficiaries", beneficiaries);
      formData.append("description", description);

      // Append new media files
      mediaFiles.forEach((file) => {
        formData.append("media", file);
      });

      // For edit mode, include existing media IDs to keep
      if (isEditMode) {
        existingMedia.forEach((media) => {
          formData.append("existingMedia", media._id);
        });
      }

      let response;
      if (isEditMode) {
        response = await axiosInstance.put(
          `/api/projects/${projectId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axiosInstance.post("/api/projects/create", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setShowSuccessPopup(true);

      // Reset form for create mode, keep data for edit mode
      if (!isEditMode) {
        setTitle("");
        setCause("");
        setLocation("");
        setStartDate("");
        setMarkAs("ongoing");
        setBeneficiaries("");
        setDescription("");
        setMediaFiles([]);
        setExistingMedia([]);
        setCurrentCarouselIndex(0);
        editor?.commands.setContent("");
      }
    } catch (err: any) {
      console.error(
        `Project ${isEditMode ? "update" : "creation"} failed`,
        err
      );
      setErrorMsg(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleRemoveExistingMedia
  | @brief    Removes existing media item from edit mode
  | @param    mediaId - ID of media to remove
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleRemoveExistingMedia = (mediaId: string) => {
    setExistingMedia((prev) => prev.filter((media) => media._id !== mediaId));

    // Adjust carousel index if needed
    const newTotalMedia = mediaFiles.length + existingMedia.length - 1;
    if (currentCarouselIndex >= newTotalMedia && newTotalMedia > 0) {
      setCurrentCarouselIndex(newTotalMedia - 1);
    } else if (newTotalMedia === 0) {
      setCurrentCarouselIndex(0);
    }
  };

  // Fetch project data for edit mode
  useEffect(() => {
    if (isEditMode && projectId) {
      fetchProjectData(projectId);
    }
  }, [isEditMode, projectId]);

  // Update editor content when description changes
  useEffect(() => {
    if (editor && description && editor.getHTML() !== description) {
      editor.commands.setContent(description);
    }
  }, [editor, description]);

  const currentPopupFile = popupFiles[currentFileIndex];
  const totalMedia = mediaFiles.length + existingMedia.length;
  const hasMedia = totalMedia > 0;

  return (
    <>
      <div className="mx-8 mb-8 p-6 bg-white shadow-sm rounded-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md transition-colors"
              title="Go back"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {isEditMode ? "EDIT PROJECT" : "NGO PROJECTS/CREATE PROJECT"}
            </h1>
          </div>
          {fetchLoading && (
            <FiLoader className="animate-spin text-cyan-500 text-xl" />
          )}
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <FiAlertCircle className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700">{errorMsg}</p>
            </div>
            <button
              onClick={handleSubmit}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {fetchLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <FiLoader className="animate-spin text-cyan-500 text-3xl mx-auto mb-4" />
              <p className="text-gray-600">Loading project data...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed flex flex-col items-center justify-center bg-blue-50 h-[296px] border-gray-300 rounded-lg p-8 text-center relative overflow-hidden">
                {!hasMedia ? (
                  <>
                    <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Browse to upload images and videos
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => handleFileChange(e, true)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-sm text-cyan-500 hover:text-cyan-600"
                    >
                      Select Files
                    </label>
                  </>
                ) : (
                  <>
                    {/* Carousel Display */}
                    <div className="w-full h-full relative">
                      {(() => {
                        const currentMedia = getCurrentMediaItem();
                        return currentMedia.type.startsWith("image/") ? (
                          <img
                            src={currentMedia.url}
                            alt={`Media ${currentCarouselIndex + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <video
                            src={currentMedia.url}
                            controls
                            className="w-full h-full rounded-md"
                          />
                        );
                      })()}

                      {/* Navigation Arrows */}
                      {totalMedia > 1 && (
                        <>
                          <button
                            onClick={() => navigateCarousel("prev")}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                          >
                            <FiChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigateCarousel("next")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                          >
                            <FiChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Media Counter */}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {currentCarouselIndex + 1} / {totalMedia}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute bottom-2 left-2 flex space-x-2">
                        <button
                          onClick={openEditPopup}
                          className="bg-white bg-opacity-90 p-2 rounded-full shadow-md hover:bg-opacity-100"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={(e) => handleFileChange(e, false)}
                          className="hidden"
                          id="add-carousel-files"
                        />
                        <label
                          htmlFor="add-carousel-files"
                          className="cursor-pointer bg-white bg-opacity-90 p-2 rounded-full shadow-md hover:bg-opacity-100"
                        >
                          <FiPlus className="w-4 h-4" />
                        </label>
                      </div>

                      {/* Remove button for existing media in edit mode */}
                      {isEditMode &&
                        currentCarouselIndex >= mediaFiles.length && (
                          <div className="absolute bottom-2 right-2">
                            <button
                              onClick={() => {
                                const existingIndex =
                                  currentCarouselIndex - mediaFiles.length;
                                const mediaToRemove =
                                  existingMedia[existingIndex];
                                handleRemoveExistingMedia(mediaToRemove._id);
                              }}
                              className="bg-red-500 bg-opacity-90 p-2 rounded-full shadow-md hover:bg-opacity-100 text-white"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                    </div>
                  </>
                )}
              </div>

              {/* Media Library Section */}
              <div className="flex items-center mb-4 rounded-[6px] bg-gray-800 py-3 px-4 w-fit hover:cursor-pointer">
                <span className="text-white bg-cyan-500 font-bold rounded-[6px] py-1 px-2 mr-2">
                  +
                </span>
                <span className="text-sm font-semibold text-white">
                  Choose images and videos from Media Library
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="px-4 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cause
                  </label>
                  <input
                    value={cause}
                    onChange={(e) => setCause(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Cause"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Details
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mb-3"
                  />
                  <input
                    type="text"
                    value={beneficiaries}
                    onChange={(e) => setBeneficiaries(e.target.value)}
                    placeholder="beneficiaries"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mb-3"
                  />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mb-3"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mark as
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="markAs"
                        value="ongoing"
                        checked={markAs === "ongoing"}
                        onChange={(e) => setMarkAs(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-sm border-2 mr-2 flex items-center justify-center ${
                          markAs === "ongoing"
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {markAs === "ongoing" && (
                          <FiCheck className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700">Ongoing</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="markAs"
                        value="completed"
                        checked={markAs === "completed"}
                        onChange={(e) => setMarkAs(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-sm border-2 mr-2 flex items-center justify-center ${
                          markAs === "completed"
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {markAs === "completed" && (
                          <FiCheck className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700">Completed</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="flex-col items-center justify-between mt-2 pt-6 space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <div className="border rounded-md p-3 focus-within:ring-0 focus-within:outline-none">
            <MenuBar editor={editor} />
            <EditorContent
              editor={editor}
              className="prose max-w-none focus:outline-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || fetchLoading}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Publishing..."
              : isEditMode
              ? "UPDATE"
              : "PUBLISH"}
          </button>
        </div>
      </div>

      {/* Processing Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600">
              {isEditMode ? "Updating project..." : "Publishing project..."}
            </p>
          </div>
        </div>
      )}

      {/* Crop Modal - Same as before */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Edit photo</h2>
              <button
                onClick={() => setShowCropModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() =>
                      setImageScale((prev) => Math.max(0.5, prev - 0.1))
                    }
                    className="flex items-center space-x-1 px-3 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <FiZoomOut className="w-4 h-4" />
                    <span className="text-sm">Zoom out</span>
                  </button>
                  <button
                    onClick={() =>
                      setImageScale((prev) => Math.min(3, prev + 0.1))
                    }
                    className="flex items-center space-x-1 px-3 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <FiZoomIn className="w-4 h-4" />
                    <span className="text-sm">Zoom in</span>
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Drag the crop area to adjust
                </div>
              </div>

              <div
                ref={cropContainerRef}
                className="relative mx-auto bg-gray-100 rounded-lg overflow-hidden"
                style={{ width: "500px", height: "400px" }}
              >
                <img
                  ref={imageRef}
                  src={cropImageSrc}
                  alt="Crop preview"
                  className="w-full h-full object-contain select-none"
                  style={{
                    transform: `scale(${imageScale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                    transformOrigin: "center center",
                  }}
                  draggable={false}
                />

                <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none">
                  <div
                    className="absolute border-2 border-white shadow-lg cursor-move bg-transparent"
                    style={{
                      left: `${cropArea.x}px`,
                      top: `${cropArea.y}px`,
                      width: `${cropArea.width}px`,
                      height: `${cropArea.height}px`,
                    }}
                    onMouseDown={handleCropDragStart}
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${cropImageSrc})`,
                        backgroundSize: `${500 * imageScale}px ${
                          400 * imageScale
                        }px`,
                        backgroundPosition: `-${cropArea.x}px -${cropArea.y}px`,
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-nw-resize"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-ne-resize"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-sw-resize"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-se-resize"></div>
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/3 left-0 right-0 border-t border-white opacity-50"></div>
                      <div className="absolute top-2/3 left-0 right-0 border-t border-white opacity-50"></div>
                      <div className="absolute left-1/3 top-0 bottom-0 border-l border-white opacity-50"></div>
                      <div className="absolute left-2/3 top-0 bottom-0 border-l border-white opacity-50"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center mt-4 space-x-6">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">
                    Width:
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="400"
                    value={cropArea.width}
                    onChange={(e) =>
                      setCropArea((prev) => ({
                        ...prev,
                        width: parseInt(e.target.value),
                      }))
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600 w-8">
                    {cropArea.width}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">
                    Height:
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="300"
                    value={cropArea.height}
                    onChange={(e) =>
                      setCropArea((prev) => ({
                        ...prev,
                        height: parseInt(e.target.value),
                      }))
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600 w-8">
                    {cropArea.height}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowCropModal(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={applyCrop}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Apply
              </button>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      {/* File Editor Popup - Same as before */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Editor</h2>
              <button
                onClick={handlePopupClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="flex h-[70vh]">
              <div className="flex-1 bg-gray-100 relative">
                {popupFiles.length > 0 && currentPopupFile && (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    {currentPopupFile.file.type.startsWith("image/") ? (
                      <img
                        src={currentPopupFile.preview}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    ) : (
                      <video
                        src={currentPopupFile.preview}
                        controls
                        className="max-w-full max-h-full rounded-lg"
                      />
                    )}
                  </div>
                )}

                {popupFiles.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentFileIndex((prev) =>
                          prev === 0 ? popupFiles.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentFileIndex((prev) =>
                          prev === popupFiles.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-4 flex space-x-2">
                  {currentPopupFile &&
                    currentPopupFile.file.type.startsWith("image/") && (
                      <button
                        onClick={handleCropStart}
                        className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    )}
                </div>

                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <button
                    onClick={handleDeleteCurrentFile}
                    className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors text-red-500"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleAddMoreFiles}
                    className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded-full">
                  {currentFileIndex + 1} of {popupFiles.length}
                </div>
              </div>

              <div className="w-80 border-l bg-white flex flex-col">
                <div className="p-4 border-b">
                  <div className="text-sm text-gray-600">
                    {popupFiles.filter((f) => f.selected).length} of{" "}
                    {popupFiles.length} selected
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2 p-4">
                    {popupFiles.map((fileItem, idx) => (
                      <div
                        key={fileItem.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(idx)}
                        className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                          fileItem.selected
                            ? "border-blue-500"
                            : "border-gray-200"
                        } ${
                          idx === currentFileIndex
                            ? "ring-2 ring-cyan-300 shadow-lg"
                            : ""
                        } hover:shadow-md`}
                        onClick={() => {
                          setCurrentFileIndex(idx);
                          handleFileToggle(fileItem.id);
                        }}
                      >
                        {fileItem.file.type.startsWith("image/") ? (
                          <img
                            src={fileItem.preview}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-24 object-cover"
                          />
                        ) : (
                          <div className="relative w-full h-24 bg-gray-800 flex items-center justify-center">
                            <video
                              src={fileItem.preview}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}

                        {fileItem.selected && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <FiCheck className="w-3 h-3" />
                          </div>
                        )}

                        <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white rounded p-1 cursor-move">
                          <FiMove className="w-3 h-3" />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs p-2 text-center">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <button
                onClick={handlePopupClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={handlePopupNext}
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  disabled={popupFiles.length === 0}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <CreateProjectSuccessPopUp
          show={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
        />
      )}
    </>
  );
};

export default CreateProjectView;
