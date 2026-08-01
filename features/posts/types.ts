import { Prisma } from "@prisma/client";

/* =========================
   Prisma Payloads
========================= */

export type PostWithPinCount = Prisma.PostGetPayload<{
  include: {
    _count: {
      select: {
        pins: true;
      };
    };
  };
}>;

export type PostWithPins = Prisma.PostGetPayload<{
  include: {
    pins: true;
    _count: {
      select: {
        pins: true;
      };
    };
  };
}>;

/* =========================
   Repository Params
========================= */

export interface GetPostsParams {
  search?: string;
  skip?: number;
  take?: number;
}

/* =========================
   Create / Update
========================= */

export interface CreatePostInput {
  url: string;
  title: string;
  mainKeyword?: string;
  annotationKeywords: string[];
}

export interface UpdatePostInput {
  url?: string;
  title?: string;
  mainKeyword?: string;
  annotationKeywords?: string[];
}

/* =========================
   API Response
========================= */

export interface PostsResponse {
  items: PostWithPinCount[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
