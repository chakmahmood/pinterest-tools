"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

import type { PinWithPost } from "../types";
import type { Post } from "@prisma/client";

import PinActions from "../components/PinActions";
import PinImageTableCell from "../components/PinImageTableCell";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  data: PinWithPost[];
  posts: Post[];
}

export default function PinsTable({ data, posts }: Props) {
  const [selectedPostId, setSelectedPostId] = useState<string>("");

  // Filter pins by selected post
  const filteredData =
    selectedPostId === ""
      ? data
      : data.filter((pin) => pin.postId === selectedPostId);

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="flex items-center gap-2">
        <label htmlFor="post-filter" className="text-sm font-medium">
          Filter by Post:
        </label>
        <Select value={selectedPostId} onValueChange={setSelectedPostId}>
          <SelectTrigger className="w-72">
            <SelectValue placeholder="All posts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All posts</SelectItem>
            {posts.map((post) => (
              <SelectItem key={post.id} value={post.id}>
                {post.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Image</TableHead>

              <TableHead className="w-[30%]">Title</TableHead>

              <TableHead className="w-[25%]">Post</TableHead>

              <TableHead>Status</TableHead>

              <TableHead>Updated</TableHead>

              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  {selectedPostId === ""
                    ? "No pins found."
                    : "No pins found for this post."}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((pin) => (
                <TableRow key={pin.id}>
                  <TableCell>
                    <PinImageTableCell pin={pin} />
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{pin.title}</p>

                      <p className="truncate text-xs text-muted-foreground max-w-xs">
                        {pin.description}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{pin.post.title}</p>

                      <p className="truncate text-xs text-muted-foreground max-w-xs">
                        {pin.post.url}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        pin.status === "EXPORTED"
                          ? "default"
                          : pin.status === "READY"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {pin.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDistanceToNow(new Date(pin.updatedAt), {
                      addSuffix: true,
                    })}
                  </TableCell>

                  <TableCell className="text-right">
                    <PinActions pin={pin} posts={posts} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
