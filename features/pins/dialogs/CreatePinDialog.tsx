"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import type { PinFormValues } from "../schemas/pin.schema";
import type { Post } from "@prisma/client";

import PinForm from "../forms/PinForm";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  posts: Post[];
}

export default function CreatePinDialog({ posts }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  async function handleCreate(values: PinFormValues & { postId: string }) {
    try {
      // Parse keywords from comma-separated string
      const keywords = values.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const response = await fetch("/api/pins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: values.postId,
          title: values.title,
          description: values.description,
          overlayText: values.overlayText || null,
          imagePrompt: values.imagePrompt,
          imageUrl: values.imageUrl || null,
          board: values.board || null,
          keywords,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error("Failed to create pin.", {
          description:
            result.message ?? "Please check your data and try again.",
        });

        return;
      }

      toast.success("Pin created successfully.", {
        description: values.title,
      });

      setOpen(false);

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.", {
        description: "Unable to create pin.",
      });
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Add Pin</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Pin</DialogTitle>
          </DialogHeader>

          <PinForm
            posts={posts}
            submitLabel="Create Pin"
            onSubmit={handleCreate}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
