import { prisma } from "@/lib/prisma";

import type {
  CreatePostInput,
  GetPostsParams,
  UpdatePostInput,
} from "../types";

export async function getPosts(params?: GetPostsParams) {
  const search = params?.search?.trim();

  return prisma.post.findMany({
    where: search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              url: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              mainKeyword: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              annotationKeywords: {
                has: search,
              },
            },
          ],
        }
      : undefined,

    include: {
      _count: {
        select: {
          pins: true,
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },

    skip: params?.skip,
    take: params?.take,
  });
}

export async function getPostByUrl(url: string) {
  return prisma.post.findUnique({
    where: {
      url,
    },
  });
}

export async function countPosts(search?: string) {
  const keyword = search?.trim();

  return prisma.post.count({
    where: keyword
      ? {
          OR: [
            {
              title: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              url: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              mainKeyword: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              annotationKeywords: {
                has: keyword,
              },
            },
          ],
        }
      : undefined,
  });
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: {
      id,
    },

    include: {
      pins: {
        orderBy: {
          createdAt: "desc",
        },
      },

      _count: {
        select: {
          pins: true,
        },
      },
    },
  });
}

export async function createPost(data: CreatePostInput) {
  return prisma.post.create({
    data,
  });
}

export async function updatePost(id: string, data: UpdatePostInput) {
  return prisma.post.update({
    where: {
      id,
    },

    data,
  });
}

export async function deletePost(id: string) {
  return prisma.post.delete({
    where: {
      id,
    },
  });
}
