"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function ImportExcel() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/posts/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        // Kalau ada detail error per row
        if (result.errors?.length) {
          toast.error(result.error || "Import failed.", {
            description: result.errors.slice(0, 5).join(" • "),
            duration: 7000,
          });
        } else {
          toast.error(result.error || "Import failed.");
        }

        return;
      }

      toast.success("Import berhasil!", {
        description: `${result.imported} imported • ${result.skipped} skipped • ${result.total} total`,
        duration: 5000,
      });

      // Refresh server data setelah toast tampil
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error("Excel import error:", error);

      toast.error("Import gagal", {
        description: "Something went wrong while importing the Excel file.",
      });
    } finally {
      setLoading(false);

      // Allow selecting the same file again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? "Importing..." : "Import Excel"}
      </Button>
    </>
  );
}
