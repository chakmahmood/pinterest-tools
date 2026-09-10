"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { pinSchema, type PinFormValues } from "../schemas/pin.schema";
import type { Post } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PinFormInput = z.input<typeof pinSchema>;

interface PinFormProps {
  posts: Post[];
  defaultValues?: Partial<PinFormValues> & {
    postId?: string;
  };
  submitLabel?: string;
  onSubmit: (
    values: PinFormValues & {
      postId: string;
    },
  ) => Promise<void>;
  onSuccess?: () => void;
}

export default function PinForm({
  posts,
  defaultValues,
  submitLabel = "Save Pin",
  onSubmit,
  onSuccess,
}: PinFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");

  const [selectedPostId, setSelectedPostId] = useState<string>(
    defaultValues?.postId ?? "",
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PinFormInput, unknown, PinFormValues>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      title: "",
      description: "",
      overlayText: "",
      imagePrompt: "",
      imageUrl: "",
      board: "",
      keywords: "",
      ...defaultValues,
    },
  });

  function handleFormSubmit(values: PinFormValues) {
    if (!selectedPostId) {
      setServerError("Please select a post.");
      return;
    }

    setServerError("");

    startTransition(async () => {
      try {
        await onSubmit({
          ...values,
          postId: selectedPostId,
        });

        reset(values);

        onSuccess?.();
      } catch (error) {
        if (error instanceof Error) {
          setServerError(error.message);
        } else {
          setServerError("Something went wrong.");
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Server Error */}
      {serverError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Post */}
      <div className="space-y-2">
        <Label htmlFor="postId">Post *</Label>

        <Select
          value={selectedPostId || null}
          onValueChange={(value) => {
            setSelectedPostId(value ?? "");
            setServerError("");
          }}
        >
          <SelectTrigger id="postId">
            <SelectValue placeholder="Select a post" />
          </SelectTrigger>

          <SelectContent>
            {posts.map((post: Post) => (
              <SelectItem key={post.id} value={post.id}>
                {post.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!selectedPostId && (
          <p className="text-sm text-destructive">Post is required</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>

        <Input
          id="title"
          placeholder="10 Easy Sewing Patterns"
          {...register("title")}
        />

        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>

        <Textarea
          id="description"
          placeholder="Describe your pin content..."
          {...register("description")}
          className="resize-none"
          rows={3}
        />

        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Overlay Text */}
      <div className="space-y-2">
        <Label htmlFor="overlayText">Overlay Text</Label>

        <Input
          id="overlayText"
          placeholder="e.g., Easy Ideas, Beginner Guide"
          {...register("overlayText")}
        />

        {errors.overlayText && (
          <p className="text-sm text-destructive">
            {errors.overlayText.message}
          </p>
        )}
      </div>

      {/* Image Prompt */}
      <div className="space-y-2">
        <Label htmlFor="imagePrompt">Image Prompt *</Label>

        <Textarea
          id="imagePrompt"
          placeholder="Describe the image you want to generate..."
          {...register("imagePrompt")}
          className="resize-none"
          rows={3}
        />

        {errors.imagePrompt && (
          <p className="text-sm text-destructive">
            {errors.imagePrompt.message}
          </p>
        )}
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>

        <Input
          id="imageUrl"
          placeholder="https://example.com/image.jpg (optional)"
          {...register("imageUrl")}
        />

        <p className="text-xs text-muted-foreground">
          Optional. Can be added later via drag & drop.
        </p>

        {errors.imageUrl && (
          <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Board */}
      <div className="space-y-2">
        <Label htmlFor="board">Pinterest Board</Label>

        <Input
          id="board"
          placeholder="e.g., Sewing Ideas"
          {...register("board")}
        />

        {errors.board && (
          <p className="text-sm text-destructive">{errors.board.message}</p>
        )}
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <Label htmlFor="keywords">Keywords</Label>

        <Input
          id="keywords"
          placeholder="sewing, diy, beginner"
          {...register("keywords")}
        />

        <p className="text-xs text-muted-foreground">
          Separate multiple keywords with commas.
        </p>

        {errors.keywords && (
          <p className="text-sm text-destructive">{errors.keywords.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending || !isDirty || !selectedPostId}
      >
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
