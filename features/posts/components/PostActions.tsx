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

  function handleDuplicate() {
    console.log("Duplicate", post.id);
  }

  function handleGeneratePins() {
    console.log("Generate Pins", post.id);
  }

  function handleExport() {
    console.log("Export CSV", post.id);
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

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>

          <DropdownMenuSeparator />

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
