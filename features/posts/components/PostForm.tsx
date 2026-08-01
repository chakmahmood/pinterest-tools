"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { postSchema, type PostFormValues } from "../schemas/post.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PostFormProps {
  onSuccess?: () => void;
}

export default function PostForm({ onSuccess }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      url: "",
      title: "",
      mainKeyword: "",
      annotationKeywords: "",
    },
  });

  function onSubmit(values: PostFormValues) {
    startTransition(async () => {
      try {
        const response = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error(result);
          alert(result.message ?? "Failed to create post.");
          return;
        }

        reset();
        onSuccess?.();

        // Refresh Server Component
        router.refresh();
      } catch (error) {
        console.error(error);
        alert("Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* URL */}
      <div className="space-y-2">
        <Label htmlFor="url">Article URL</Label>

        <Input
          id="url"
          placeholder="https://example.com/article"
          {...register("url")}
        />

        {errors.url && (
          <p className="text-sm text-red-500">{errors.url.message}</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>

        <Input
          id="title"
          placeholder="25 Easy Sewing Projects"
          {...register("title")}
        />

        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Main Keyword */}
      <div className="space-y-2">
        <Label htmlFor="mainKeyword">Main Keyword</Label>

        <Input
          id="mainKeyword"
          placeholder="easy sewing projects"
          {...register("mainKeyword")}
        />

        {errors.mainKeyword && (
          <p className="text-sm text-red-500">{errors.mainKeyword.message}</p>
        )}
      </div>

      {/* Annotation Keywords */}
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
          <p className="text-sm text-red-500">
            {errors.annotationKeywords.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Save Post"}
      </Button>
    </form>
  );
}
