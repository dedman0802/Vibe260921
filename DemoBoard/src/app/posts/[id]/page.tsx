import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { List, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CommentForm } from "@/components/board/comment-form"
import { DeleteCommentButton } from "@/components/board/delete-comment-button"
import { DeletePostButton } from "@/components/board/delete-post-button"
import { getPost } from "@/lib/db"
import { formatDateTime } from "@/lib/format"

export async function generateMetadata({
  params,
}: PageProps<"/posts/[id]">): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)
  return { title: post?.title ?? "게시글" }
}

export default async function PostDetailPage({
  params,
}: PageProps<"/posts/[id]">) {
  const { id } = await params
  const post = await getPost(id)
  if (!post) notFound()

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="gap-3">
          <div>
            <Badge variant={post.category === "공지" ? "default" : "secondary"}>
              {post.category}
            </Badge>
          </div>
          <CardTitle className="text-2xl leading-snug break-words">
            {post.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {post.author} · {formatDateTime(post.createdAt)}
            {post.updatedAt !== post.createdAt && " (수정됨)"}
          </p>
        </CardHeader>
        <Separator />
        <CardContent className="min-h-40 whitespace-pre-wrap break-words pt-2">
          {post.content}
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2">
        <Link href="/posts" className={buttonVariants({ variant: "outline" })}>
          <List />
          목록
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/posts/${post.id}/edit`}
            className={buttonVariants({ variant: "secondary" })}
          >
            <Pencil />
            수정
          </Link>
          <DeletePostButton id={post.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>댓글 {post.comments.length}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {post.comments.length > 0 && (
            <ul className="flex flex-col divide-y">
              {post.comments.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-2 py-3 first:pt-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {c.author}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {formatDateTime(c.createdAt)}
                      </span>
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                      {c.content}
                    </p>
                  </div>
                  <DeleteCommentButton postId={post.id} commentId={c.id} />
                </li>
              ))}
            </ul>
          )}
          <CommentForm postId={post.id} />
        </CardContent>
      </Card>
    </div>
  )
}
