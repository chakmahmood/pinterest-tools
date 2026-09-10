"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";

import type { PinWithPost } from "../types";

interface PinImageTableCellProps {
  pin: PinWithPost;
}

export default function PinImageTableCell({ pin }: PinImageTableCellProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        await handleImageUpload(file);
      } else {
        toast.error("Invalid file type. Please drop an image.");
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/pins/${pin.id}/image`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error("Failed to upload image.", {
          description: result.message || "Please try again.",
        });
        return;
      }

      toast.success("Image uploaded successfully!");
      router.refresh();
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Image upload failed", {
        description: "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/pins/${pin.id}/image`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error("Failed to remove image.", {
          description: result.message || "Please try again.",
        });
        return;
      }

      toast.success("Image removed successfully!");
      router.refresh();
    } catch (error) {
      console.error("Image removal error:", error);
      toast.error("Image removal failed", {
        description: "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (pin.imageUrl) {
    return (
      <div className="relative group rounded-lg overflow-hidden bg-muted w-24 h-24 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pin.imageUrl}
          alt={pin.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />

        <div
          className="
            absolute
            inset-0
            bg-black/0
            group-hover:bg-black/50
            transition-colors
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <button
            type="button"
            onClick={() => handleRemoveImage()}
            disabled={isLoading}
            className="
              p-1.5
              rounded-md
              bg-destructive
              text-white
              opacity-0
              group-hover:opacity-100
              transition-opacity
              disabled:opacity-50
            "
            title="Remove image"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        rounded-lg
        border-2
        border-dashed
        w-24
        h-24
        flex
        flex-col
        items-center
        justify-center
        transition-all
        shrink-0
        cursor-pointer
        ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-muted-foreground hover:border-primary hover:bg-muted/50"
        }
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <>
          <Upload className="h-4 w-4 text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground text-center px-1">
            Drop image
          </p>
        </>
      )}
    </div>
  );
}
