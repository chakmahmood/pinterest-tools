import CreatePostDialog from "@/features/posts/components/CreatePostDialog";
import PostsTable from "@/features/posts/components/PostsTable";
import { getPosts } from "@/features/posts";

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>

          <p className="text-muted-foreground">
            Manage your Pinterest article list.
          </p>
        </div>

        <CreatePostDialog />
      </div>

      <PostsTable data={posts} />
    </div>
  );
}
