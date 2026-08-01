import { Prisma } from "@prisma/client";

export type PostWithPinCount = Prisma.PostGetPayload<{
  include: {
    _count: {
      select: {
        pins: true;
      };
    };
  };
}>;
