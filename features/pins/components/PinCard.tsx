"use client";

import type { PinWithPost } from "../types";

import { Badge } from "@/components/ui/badge";

interface Props {
  pin: PinWithPost;
}

export default function PinCard({ pin }: Props) {
  return (
    <div className="rounded-xl border p-4 space-y-3">
      <h3 className="font-semibold">{pin.title}</h3>

      <p className="text-sm text-muted-foreground">{pin.description}</p>

      <div className="flex flex-wrap gap-2">
        {pin.keywords.map((keyword) => (
          <Badge key={keyword} variant="secondary">
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  );
}
