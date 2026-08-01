"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { PostWithPinCount } from "../types";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  post: PostWithPinCount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeletePostDialog({ post, open, onOpenChange }: Props) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message ?? "Failed to delete post.");
        return;
      }

      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Post</DialogTitle>

          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="font-medium">{post.title}</p>

          <p className="mt-1 text-sm text-muted-foreground truncate">
            {post.url}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
