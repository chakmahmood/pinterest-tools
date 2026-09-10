"use client";

import { useState } from "react";

import { MoreHorizontal, Pencil, Trash2, Download } from "lucide-react";

import { toast } from "sonner";

import type { PinWithPost } from "../types";
import type { Post } from "@prisma/client";

import EditPinDialog from "../dialogs/EditPinDialog";
import DeletePinDialog from "../dialogs/DeletePinDialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  pin: PinWithPost;
  posts: Post[];
}

export default function PinActions({ pin, posts }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleExport() {
    toast.info("Export feature coming soon.", {
      description: `Pin: ${pin.title}`,
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

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
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

      <EditPinDialog
        pin={pin}
        posts={posts}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeletePinDialog
        pin={pin}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
