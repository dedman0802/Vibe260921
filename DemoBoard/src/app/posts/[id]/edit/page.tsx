import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostForm } from "@/components/board/post-form"
import { updatePostAction } from "@/lib/actions"
import { getPost } from "@/lib/db"

export const metadata: Metadata = { title: "글 수정" }

export default async function EditPostPage({
  params,
}: PageProps<"/posts/[id]/edit">) {
  const { id } = await params
  const post = await getPost(id)
  if (!post) notFound()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">글 수정</CardTitle>
      </CardHeader>
      <CardContent>
        <PostForm
          action={updatePostAction.bind(null, post.id)}
          initial={{
            category: post.category,
            title: post.title,
            content: post.content,
            author: post.author,
          }}
          cancelHref={`/posts/${post.id}`}
          submitLabel="수정 완료"
        />
      </CardContent>
    </Card>
  )
}
