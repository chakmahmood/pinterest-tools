"use client";

import type { PostWithPinCount } from "../types";

interface Props {
  data: PostWithPinCount[];
}

export default function PostsTable({ data }: Props) {
  return (
    <div className="rounded-lg border bg-background">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Main Keyword</th>
            <th className="p-3 text-center">Pins</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-8 text-center text-muted-foreground">
                No posts found.
              </td>
            </tr>
          ) : (
            data.map((post) => (
              <tr key={post.id} className="border-b">
                <td className="p-3">{post.title}</td>

                <td className="p-3">{post.mainKeyword ?? "-"}</td>

                <td className="p-3 text-center">{post._count.pins}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
