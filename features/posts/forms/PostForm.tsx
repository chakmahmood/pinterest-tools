"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { postSchema, type PostFormValues } from "../schemas/post.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PostFormProps {
  defaultValues?: Partial<PostFormValues>;
  submitLabel?: string;
  onSubmit: (values: PostFormValues) => Promise<void>;
  onSuccess?: () => void;
}

export default function PostForm({
  defaultValues,
  submitLabel = "Save Post",
  onSubmit,
  onSuccess,
}: PostFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      url: "",
      title: "",
      mainKeyword: "",
      annotationKeywords: "",
      ...defaultValues,
    },
  });

  function handleFormSubmit(values: PostFormValues) {
    setServerError("");

    startTransition(async () => {
      try {
        await onSubmit(values);

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
      {serverError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="url">Article URL</Label>

        <Input
          id="url"
          placeholder="https://example.com/article"
          {...register("url")}
        />

        {errors.url && (
          <p className="text-sm text-destructive">{errors.url.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>

        <Input
          id="title"
          placeholder="25 Easy Sewing Projects"
          {...register("title")}
        />

        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mainKeyword">Main Keyword</Label>

        <Input
          id="mainKeyword"
          placeholder="easy sewing projects"
          {...register("mainKeyword")}
        />

        {errors.mainKeyword && (
          <p className="text-sm text-destructive">
            {errors.mainKeyword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="annotationKeywords">Annotation Keywords</Label>

        <Input
          id="annotationKeywords"
          placeholder="easy sewing, diy bag, pdf pattern"
          {...register("annotationKeywords")}
        />

        <p className="text-xs text-muted-foreground">
          Separate multiple keywords with commas.
        </p>

        {errors.annotationKeywords && (
          <p className="text-sm text-destructive">
            {errors.annotationKeywords.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending || !isDirty}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
