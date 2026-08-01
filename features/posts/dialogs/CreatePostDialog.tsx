"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import type { PostFormValues } from "../schemas/post.schema";
import PostForm from "../forms/PostForm";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CreatePostDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  async function handleCreate(values: PostFormValues) {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error("Failed to create post.", {
          description:
            result.message ?? "Please check your data and try again.",
        });

        return;
      }

      toast.success("Post created successfully.", {
        description: values.title,
      });

      setOpen(false);

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.", {
        description: "Unable to create post.",
      });
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Add Post</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Post</DialogTitle>
          </DialogHeader>

          <PostForm submitLabel="Create Post" onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>
    </>
  );
}
