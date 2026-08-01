import { prisma } from "@/lib/prisma";

export interface GetPostsParams {
  search?: string;
}

export interface CreatePostInput {
  url: string;
  title: string;
  mainKeyword?: string;
  annotationKeywords: string[];
}

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
      createdAt: "desc",
    },
  });
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: {
      id,
    },

    include: {
      pins: true,
    },
  });
}

export async function createPost(data: CreatePostInput) {
  return prisma.post.create({
    data,
  });
}

export async function updatePost(
  id: string,
  data: {
    url: string;
    title: string;
    mainKeyword?: string;
    annotationKeywords?: string[];
  },
) {
  return prisma.post.update({
    where: { id },
    data: {
      ...data,
      annotationKeywords: data.annotationKeywords ?? [],
    },
  });
}

export async function deletePost(id: string) {
  return prisma.post.delete({
    where: {
      id,
    },
  });
}
