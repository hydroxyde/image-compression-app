import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

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
    const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true };
    try {
      const compressedFile = await imageCompression(imageFile, options);
      setCompressedSize(compressedFile.size);
      setCompressedImage(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error('Compression failed:', error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  const compressionRatio = originalSize
    ? ((1 - compressedSize / originalSize) * 100).toFixed(2)
    : '0';

  if (!mounted) return null;

  return (
    <div className="container mx-auto p-6 flex flex-col items-center text-gray-900 dark:text-gray-100">
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="absolute top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
      >
        {theme === 'light' ? (
          <MoonIcon className="h-6 w-6" />
        ) : (
          <SunIcon className="h-6 w-6 text-yellow-400" />
        )}
      </button>

      {/* Banner */}
      <div
        className={`w-full max-w-2xl p-4 text-center transform transition-all duration-[1000ms] ease-out ${originalImage ? 'translate-y-[-60px]' : 'translate-y-0'
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
        className={`group w-full max-w-lg p-12 min-h-[150px] flex flex-col justify-center rounded-lg text-center cursor-pointer transition transform hover:scale-105 hover:shadow-lg border-2 border-gray-300 dark:border-gray-600 hover:border-0 hover:p-[calc(0.75rem+2px)] ${originalImage ? 'mt-8' : 'mt-20'
          }`}
      >
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] opacity-0 group-hover:opacity-100 -z-10"></div>
        <div className="absolute inset-[2px] rounded-lg bg-transparent dark:bg-transparent -z-[5]"></div>
        <input {...getInputProps()} />
        <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition text-lg relative z-10">
          Drag & drop an image here, or click to select one
        </p>
      </div>

      {/* Images Display */}
      {originalImage && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full max-w-5xl">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">
              Original Image ({(originalSize / 1024).toFixed(2)} KB)
            </h3>
            <Image
              src={originalImage}
              alt="Original"
              width={400}
              height={400}
              className="rounded-lg mx-auto"
              style={{ objectFit: 'contain', maxHeight: '400px' }}
            />
          </div>
          {compressedImage && (
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">
                Compressed Image ({(compressedSize / 1024).toFixed(2)} KB)
              </h3>
              <Image
                src={compressedImage}
                alt="Compressed"
                width={400}
                height={400}
                className="rounded-lg mx-auto"
                style={{ objectFit: 'contain', maxHeight: '400px' }}
              />
              <p className="mt-4 text-green-500 font-bold text-lg">
                Compression: {compressionRatio}% saved
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}