"use client";

import { useState } from "react";

import {
  Copy,
  FileSpreadsheet,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

import type { PostWithPinCount } from "../types";

import EditPostDialog from "../dialogs/EditPostDialog";
import DeletePostDialog from "../dialogs/DeletePostDialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  post: PostWithPinCount;
}

export default function PostActions({ post }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleCopyPrompt() {
    try {
      const response = await fetch(`/api/posts/${post.id}/prompt`);

      const result = await response.json();

      if (!response.ok) {
        toast.error("Failed to generate prompt.", {
          description: result.message ?? "Please try again.",
        });

        return;
      }

      await navigator.clipboard.writeText(result.prompt);

      toast.success("AI Prompt copied!", {
        description: "Ready to paste into your AI generator.",
      });
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.", {
        description: "Failed to copy AI prompt.",
      });
    }
  }

  function handleDuplicate() {
    toast.info("Duplicate feature coming soon.", {
      description: `Post: ${post.title}`,
    });
  }

  function handleGeneratePins() {
    toast.info("Generate Pins feature coming soon.", {
      description: `Generating pins for: ${post.title}`,
    });
  }

  function handleExport() {
    toast.info("Export CSV feature coming soon.", {
      description: `Exporting: ${post.title}`,
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="
            inline-flex
            h-9
            w-9
            items-center
            justify-center
            rounded-md
            border
            border-transparent
            transition-colors
            hover:bg-accent
            hover:text-accent-foreground
            focus:outline-none
            focus:ring-2
            focus:ring-ring
          "
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleCopyPrompt}>
            <Copy className="mr-2 h-4 w-4" />
            Copy AI Prompt
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleGeneratePins}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Pins
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleExport}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export CSV
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditPostDialog post={post} open={editOpen} onOpenChange={setEditOpen} />

      <DeletePostDialog
        post={post}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
