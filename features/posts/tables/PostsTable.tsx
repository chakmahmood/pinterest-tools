"use client";

import { formatDistanceToNow } from "date-fns";

import type { PostWithPinCount } from "../types";

import PostActions from "../components/PostActions";

import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  data: PostWithPinCount[];
}

export default function PostsTable({ data }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[45%]">Title</TableHead>

            <TableHead>Main Keyword</TableHead>

            <TableHead className="text-center">Pins</TableHead>

            <TableHead>Updated</TableHead>

            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-10 text-center text-muted-foreground"
              >
                No posts found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium leading-none">{post.title}</p>

                    <p className="truncate text-xs text-muted-foreground">
                      {post.url}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  {post.mainKeyword ? (
                    <Badge variant="secondary">{post.mainKeyword}</Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <Badge variant="outline">{post._count.pins}</Badge>
                </TableCell>

                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(post.updatedAt), {
                    addSuffix: true,
                  })}
                </TableCell>

                <TableCell className="text-right">
                  <PostActions post={post} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
