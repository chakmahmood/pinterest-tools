"use client";

import { formatDistanceToNow } from "date-fns";

import type { PinWithPost } from "../types";
import type { Post } from "@prisma/client";

import PinActions from "../components/PinActions";

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
  data: PinWithPost[];
  posts: Post[];
}

export default function PinsTable({ data, posts }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Title</TableHead>

            <TableHead className="w-[25%]">Post</TableHead>

            <TableHead>Status</TableHead>

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
                No pins found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((pin) => (
              <TableRow key={pin.id}>
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
  );
}
