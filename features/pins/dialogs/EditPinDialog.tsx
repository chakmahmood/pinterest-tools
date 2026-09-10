"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import type { PinWithPost } from "../types";
import type { PinFormValues } from "../schemas/pin.schema";
import type { Post } from "@prisma/client";

import PinForm from "../forms/PinForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  pin: PinWithPost;
  posts: Post[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPinDialog({
  pin,
  posts,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(values: PinFormValues & { postId: string }) {
    try {
      setIsSaving(true);

      // Parse keywords
      const keywords = values.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const response = await fetch(`/api/pins/${pin.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        toast.error("Failed to update pin.", {
          description:
            result.message ?? "Please check your data and try again.",
        });

        return;
      }

      toast.success("Pin updated successfully.", {
        description: values.title,
      });

      onOpenChange(false);

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.", {
        description: "Unable to update pin.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Pin</DialogTitle>
        </DialogHeader>

        <PinForm
          posts={posts}
          submitLabel={isSaving ? "Saving..." : "Save Changes"}
          defaultValues={{
            postId: pin.postId,
            title: pin.title,
            description: pin.description,
            overlayText: pin.overlayText ?? "",
            imagePrompt: pin.imagePrompt,
            imageUrl: pin.imageUrl ?? "",
            board: pin.board ?? "",
            keywords: pin.keywords.join(", "),
          }}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
