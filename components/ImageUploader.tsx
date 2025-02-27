import { useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import Image from "next/image";

interface FileWithSize extends File {
  size: number;
}

export default function ImageUploader() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const onDrop = (acceptedFiles: FileWithSize[]) => {
    const file = acceptedFiles[0];
    setOriginalSize(file.size);
    setOriginalImage(URL.createObjectURL(file));
    compressImage(file);
  };

  const compressImage = async (imageFile: FileWithSize) => {
    const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true };
    try {
      const compressedFile = await imageCompression(imageFile, options);
      setCompressedSize(compressedFile.size);
      setCompressedImage(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error("Compression failed:", error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  return (
    <div className="container mx-auto p-6 flex flex-col items-center">
      <div {...getRootProps()} className="group w-full max-w-lg p-6 border-2 border-gray-300 rounded-lg text-center cursor-pointer transition transform hover:scale-105 hover:shadow-lg hover:bg-gradient-to-r hover:from-[#8E2DE2] hover:to-[#4A00E0] hover:bg-opacity-80">
        <input {...getInputProps()} />
        <p className="text-gray-500 group-hover:text-white transition">Drag & drop an image here, or click to select one</p>
      </div>
      {originalImage && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full max-w-4xl">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Original Image ({(originalSize / 1024).toFixed(2)} KB)</h3>
            <Image src={originalImage} alt="Original" width={300} height={300} className="rounded-lg shadow-md mx-auto" />
          </div>
          {compressedImage && (
            <div className="text-center">
              <h3 className="text-lg font-semibold">Compressed Image ({(compressedSize / 1024).toFixed(2)} KB)</h3>
              <Image src={compressedImage} alt="Compressed" width={300} height={300} className="rounded-lg shadow-md mx-auto" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}