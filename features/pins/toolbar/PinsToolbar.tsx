"use client";

import { Search } from "lucide-react";

import type { Post } from "../types";

import CreatePinDialog from "../dialogs/CreatePinDialog";
import ImportPins from "../components/ImportPins";

import { Input } from "@/components/ui/input";

interface Props {
  posts: Post[];
}

export default function PinsToolbar({ posts }: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Pins</h1>

        <p className="text-muted-foreground">Manage your Pinterest pins.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input placeholder="Search pins..." className="pl-9" />
        </div>

        <ImportPins />

        <CreatePinDialog posts={posts} />
      </div>
    </div>
  );
}
