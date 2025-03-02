"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  MoonIcon,
  SunIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

interface FileWithSize extends File {
  size: number;
}

export default function ImageUploader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onDrop = (acceptedFiles: FileWithSize[]) => {
    const file = acceptedFiles[0];
    setOriginalSize(file.size);
    setOriginalImage(URL.createObjectURL(file));
    compressImage(file);
  };

  const compressImage = async (imageFile: FileWithSize) => {
    const options = {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      initialQuality: 0.8,
      alwaysKeepResolution: true
    };

    try {
      const compressedFile = await imageCompression(imageFile, options);
      setCompressedSize(compressedFile.size);
      setCompressedImage(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error("Compression failed:", error);
    }
  };

  const handleDownload = () => {
    if (compressedImage) {
      const link = document.createElement("a");
      link.href = compressedImage;
      link.download = "compressed-image.jpg";
      link.click();
    }
  };

  const handleDelete = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setOriginalSize(0);
    setCompressedSize(0);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const compressionRatio = originalSize
    ? ((1 - compressedSize / originalSize) * 100).toFixed(2)
    : "0";

  if (!mounted) return null;

  return (
    <div className="container mx-auto p-6 flex flex-col items-center">
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="absolute top-4 right-4 p-2 rounded-lg bg-gray-300 dark:bg-gray-700 shadow-md transition"
      >
        {theme === "light" ? (
          <MoonIcon className="h-6 w-6" />
        ) : (
          <SunIcon className="h-6 w-6 text-yellow-400" />
        )}
      </button>

      {/* Banner */}
      <div
        className={`w-full max-w-2xl p-4 text-center transform transition-all duration-[1000ms] ease-out ${originalImage ? "translate-y-[-40px]" : "translate-y-0"
          }`}
      >
        <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
          Image Compression Tool
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload an image, and we will compress it for you!
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`group w-full max-w-lg p-12 min-h-[150px] flex flex-col justify-center items-center rounded-lg text-center cursor-pointer transition transform hover:scale-105 ${originalImage ? "mt-8" : "mt-20"
          }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600 dark:text-gray-400 transition text-lg">
          Drag & drop an image here, or click to select one
        </p>
      </div>

      {/* Images Display */}
      {originalImage && (
        <div className="mt-8 flex flex-col items-center w-full max-w-5xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Original Image */}
            <div className="text-center flex flex-col items-center min-h-[420px]">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Original ({(originalSize / 1024).toFixed(2)} KB)
              </h3>
              <Image
                src={originalImage}
                alt="Original"
                width={450}
                height={450}
                className="rounded-lg"
                style={{ objectFit: "contain", maxHeight: "400px" }}
              />
            </div>

            {/* Compressed Image */}
            {compressedImage && (
              <div className="text-center flex flex-col items-center min-h-[420px]">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Compressed ({(compressedSize / 1024).toFixed(2)} KB){" "}
                  <span className="text-green-500 font-bold">
                    -{compressionRatio}%
                  </span>
                </h3>
                <Image
                  src={compressedImage}
                  alt="Compressed"
                  width={450}
                  height={450}
                  className="rounded-lg"
                  style={{ objectFit: "contain", maxHeight: "400px" }}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-10 flex gap-6">
            {compressedImage && (
              <button
                onClick={handleDownload}
                className="flex items-center justify-center w-44 px-6 py-3 text-blue-600 dark:text-blue-400 font-bold rounded-lg shadow-md transition text-lg hover:bg-blue-600 hover:text-white border-2 border-blue-500 dark:border-blue-400"
              >
                <ArrowDownTrayIcon className="h-6 w-6 mr-2" />
                Download
              </button>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center justify-center w-44 px-6 py-3 text-red-600 dark:text-red-400 font-bold rounded-lg shadow-md transition text-lg hover:bg-red-600 hover:text-white border-2 border-red-500 dark:border-red-400"
            >
              <TrashIcon className="h-6 w-6 mr-2" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}