"use client";

import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PinImageDropzoneProps {
  imageUrl?: string | null;
  onImageSelect?: (file: File) => Promise<void>;
  onImageRemove?: () => Promise<void>;
  isLoading?: boolean;
}

export default function PinImageDropzone({
  imageUrl,
  onImageSelect,
  onImageRemove,
  isLoading = false,
}: PinImageDropzoneProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0 && onImageSelect) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        await onImageSelect(file);
      }
    }
  };

  if (imageUrl) {
    return (
      <div className="relative group rounded-lg overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Pin image"
          className="w-full h-48 object-cover"
          onError={(e) => {
            // Hide broken images
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />

        {onImageRemove && (
          <button
            type="button"
            onClick={() => onImageRemove()}
            disabled={isLoading}
            className="
              absolute
              top-2
              right-2
              p-1
              rounded-md
              bg-destructive
              text-white
              opacity-0
              group-hover:opacity-100
              transition-opacity
            "
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="
        rounded-lg
        border-2
        border-dashed
        border-muted-foreground
        p-8
        text-center
        transition-colors
        hover:border-primary
        hover:bg-muted/50
      "
    >
      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />

      <p className="font-medium text-sm mb-1">Drop image here</p>

      <p className="text-xs text-muted-foreground mb-4">or click to browse</p>

      {onImageSelect && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                await onImageSelect(file);
              }
            };
            input.click();
          }}
          disabled={isLoading}
        >
          {isLoading ? "Uploading..." : "Browse"}
        </Button>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        Ready for future image upload feature
      </p>
    </div>
  );
}
