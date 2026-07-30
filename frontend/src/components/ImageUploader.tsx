import { useState, useRef } from "react";
import api from "../services/api";
import { getImageUrl } from "../utils/format"; // Ajuste o caminho do seu arquivo format/utils se necessário

export interface UploadedImage {
  id: string;
  url: string;
  isCover: boolean;
  order: number;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const filesToUpload = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (filesToUpload.length > remainingSlots) {
      alert(`Só pode adicionar ${remainingSlots} imagem(ns) mais`);
      return;
    }

    setIsUploading(true);
    let updatedImages = [...images];

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post("/uploads", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const newImage: UploadedImage = {
          id: response.data.data.id,
          url: response.data.data.url,
          isCover: updatedImages.length === 0, // Primeira imagem é capa por padrão
          order: updatedImages.length,
        };

        updatedImages = [...updatedImages, newImage];
        onImagesChange(updatedImages);
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload das imagens");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    const updated = images
      .filter((img) => img.id !== id)
      .map((img, idx) => ({ ...img, order: idx }));
    onImagesChange(updated);
  };

  const setCover = (id: string) => {
    const updated = images.map((img) => ({
      ...img,
      isCover: img.id === id,
    }));
    onImagesChange(updated);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOver(false);

    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    const reordered = newImages.map((img, idx) => ({
      ...img,
      order: idx,
    }));

    onImagesChange(reordered);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Fotos do Produto (máx. {maxImages})
        </label>

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            handleDragLeave();
            handleFileSelect(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary-600 bg-primary-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
          } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={isUploading || images.length >= maxImages}
            className="hidden"
          />

          <svg
            className="w-12 h-12 mx-auto mb-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>

          {isUploading ? (
            <p className="text-gray-600">A carregar...</p>
          ) : (
            <>
              <p className="text-gray-600 font-medium">
                Clique ou arraste imagens aqui
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF até 10MB
              </p>
              <p className="text-xs text-gray-500">
                {images.length}/{maxImages} imagens
              </p>
            </>
          )}
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-3">Imagens Adicionadas</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative group cursor-move border-2 rounded-lg overflow-hidden ${
                  draggedIndex === index
                    ? "border-primary-600 opacity-50"
                    : "border-gray-200"
                } ${dragOver && draggedIndex !== null ? "border-primary-600 border-dashed" : ""}`}
              >
                {/* AQUI FOI ALTERADO: uso do getImageUrl(...) */}
                <img
                  src={getImageUrl(image.url)}
                  alt={`Produto ${index + 1}`}
                  className="w-full h-28 object-cover"
                />

                {/* Overlay com ações */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex flex-col gap-2 items-center">
                    {!image.isCover && (
                      <button
                        type="button"
                        onClick={() => setCover(image.id)}
                        title="Marcar como capa"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium"
                      >
                        Capa
                      </button>
                    )}

                    {image.isCover && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        ✓ Capa
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      title="Remover imagem"
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium"
                    >
                      Remover
                    </button>
                  </div>
                </div>

                {/* Badge de ordem */}
                <div className="absolute top-1 left-1 bg-gray-800 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Arraste para reordenar as imagens
          </p>
        </div>
      )}
    </div>
  );
}