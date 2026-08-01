import { NextRequest, NextResponse } from "next/server";

import { deletePost, getPostById, updatePost } from "@/features/posts";

import { postSchema } from "@/features/posts";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/posts/:id
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(post);
  } catch (error) {
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

/**
 * PUT /api/posts/:id
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const body = await request.json();

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

    const annotationKeywords = parsed.data.annotationKeywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    const updated = await updatePost(id, {
      url: parsed.data.url,
      title: parsed.data.title,
      mainKeyword: parsed.data.mainKeyword || undefined,
      annotationKeywords,
    });

    return NextResponse.json(updated);
  } catch (error) {
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

/**
 * DELETE /api/posts/:id
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    await deletePost(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
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
