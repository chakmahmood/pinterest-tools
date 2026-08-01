import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const totalPosts = await prisma.post.count();

  return NextResponse.json({
    success: true,
    totalPosts,
  });
}
