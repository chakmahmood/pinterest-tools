"use client";

import { Search } from "lucide-react";

import CreatePostDialog from "../dialogs/CreatePostDialog";

import { Input } from "@/components/ui/input";

export default function PostsToolbar() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Posts</h1>

        <p className="text-muted-foreground">Manage your Pinterest articles.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input placeholder="Search posts..." className="pl-9" />
        </div>

        <CreatePostDialog />
      </div>
    </div>
  );
}
