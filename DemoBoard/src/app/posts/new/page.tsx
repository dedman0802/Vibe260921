import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostForm } from "@/components/board/post-form"
import { createPostAction } from "@/lib/actions"

export const metadata: Metadata = { title: "글쓰기" }

export default function NewPostPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">글쓰기</CardTitle>
      </CardHeader>
      <CardContent>
        <PostForm
          action={createPostAction}
          cancelHref="/posts"
          submitLabel="등록"
        />
      </CardContent>
    </Card>
  )
}
