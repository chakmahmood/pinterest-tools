"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function ImportPins() {
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

      const response = await fetch("/api/pins/import", {
        method: "POST",
        body: formData,
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        toast.error("Import failed", {
          description: "Server returned an invalid response. Please check the console for details.",
        });
        return;
      }

      if (!response.ok) {
        // If there are detail errors per row
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

      toast.success("Import successful!", {
        description: `${result.imported} imported • ${result.skipped} skipped • ${result.total} total`,
        duration: 5000,
      });

      // Refresh server data after toast is shown
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error("Excel import error:", error);

      toast.error("Import failed", {
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
