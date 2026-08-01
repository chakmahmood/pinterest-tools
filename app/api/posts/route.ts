import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import {
  createPost,
  getPosts,
  getPostByUrl,
} from "@/features/posts/repositories/post.repository";

import { postSchema } from "@/features/posts/schemas/post.schema";

export async function GET() {
  try {
    const posts = await getPosts();

    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load posts.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parsed.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    // Cek apakah URL sudah ada
    const existing = await getPostByUrl(parsed.data.url);

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "This article URL already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const annotationKeywords = parsed.data.annotationKeywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    const post = await createPost({
      url: parsed.data.url,
      title: parsed.data.title,
      mainKeyword: parsed.data.mainKeyword || undefined,
      annotationKeywords,
    });

    return NextResponse.json(
      {
        success: true,
        data: post,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    // Race condition / duplicate URL
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This article URL already exists.",
        },
        {
          status: 409,
        },
      );
    }

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
