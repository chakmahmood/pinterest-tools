import { prisma } from "@/lib/prisma";

import { getPins } from "@/features/pins";

import PinsToolbar from "@/features/pins/toolbar/PinsToolbar";
import PinsTable from "@/features/pins/tables/PinsTable";

export default async function PinsPage() {
  const pins = await getPins();
  const posts = await prisma.post.findMany({
    orderBy: {
      title: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <PinsToolbar posts={posts} />

      <PinsTable data={pins} posts={posts} />
    </div>
  );
}
