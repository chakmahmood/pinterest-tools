import { getPosts } from "@/features/posts";

import PostsToolbar from "@/features/posts/toolbar/PostsToolbar";
import PostsTable from "@/features/posts/tables/PostsTable";

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <PostsToolbar />

      <PostsTable data={posts} />
    </div>
  );
}
