"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import type { PostWithPinCount } from "../types";
import type { PostFormValues } from "../schemas/post.schema";

import PostForm from "../forms/PostForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  post: PostWithPinCount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPostDialog({ post, open, onOpenChange }: Props) {
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(values: PostFormValues) {
    try {
      setIsSaving(true);

      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error("Failed to update post.", {
          description:
            result.message ?? "Please check your data and try again.",
        });

        return;
      }

      toast.success("Post updated successfully.", {
        description: values.title,
      });

      onOpenChange(false);

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.", {
        description: "Unable to update post.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <PostForm
          submitLabel={isSaving ? "Saving..." : "Save Changes"}
          defaultValues={{
            url: post.url,
            title: post.title,
            mainKeyword: post.mainKeyword ?? "",
            annotationKeywords: post.annotationKeywords.join(", "),
          }}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
