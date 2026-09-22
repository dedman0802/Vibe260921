import Link from "next/link"
import { MessageSquare, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PaginationNav } from "@/components/board/pagination-nav"
import { listPosts } from "@/lib/db"
import { formatDateTime } from "@/lib/format"
import { CATEGORIES } from "@/lib/types"

const PAGE_SIZE = 10

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function PostsPage({ searchParams }: PageProps<"/posts">) {
  const sp = await searchParams
  const query = first(sp.q)?.trim() ?? ""
  const rawCategory = first(sp.category)
  const category = CATEGORIES.find((c) => c === rawCategory)
  const requestedPage = Number.parseInt(first(sp.page) ?? "1", 10)

  const { items, total, totalPages, page } = await listPosts({
    query,
    category,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
    pageSize: PAGE_SIZE,
  })

  const hrefFor = (p: number, cat: string | undefined = category) => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (cat) params.set("category", cat)
    if (p > 1) params.set("page", String(p))
    const qs = params.toString()
    return qs ? `/posts?${qs}` : "/posts"
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">게시판</h1>
          <p className="text-sm text-muted-foreground">
            총 {total}개의 게시글
          </p>
        </div>
        <form action="/posts" className="flex gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          <Input
            name="q"
            defaultValue={query}
            placeholder="제목, 내용, 작성자 검색"
            aria-label="검색어"
            className="sm:w-64"
          />
          <Button type="submit" variant="secondary">
            <Search />
            검색
          </Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {[undefined, ...CATEGORIES].map((c) => (
          <Link
            key={c ?? "all"}
            href={hrefFor(1, c)}
            aria-current={c === category ? "page" : undefined}
            className={buttonVariants({
              variant: c === category ? "default" : "outline",
              size: "sm",
            })}
          >
            {c ?? "전체"}
          </Link>
        ))}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">분류</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="hidden w-28 sm:table-cell">작성자</TableHead>
              <TableHead className="hidden w-40 text-right md:table-cell">
                작성일
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  {query || category
                    ? "조건에 맞는 게시글이 없습니다."
                    : "아직 게시글이 없습니다. 첫 글을 작성해 보세요!"}
                </TableCell>
              </TableRow>
            ) : (
              items.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Badge variant={post.category === "공지" ? "default" : "secondary"}>
                      {post.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-0 whitespace-normal">
                    <Link
                      href={`/posts/${post.id}`}
                      className="line-clamp-1 font-medium hover:underline"
                    >
                      {post.title}
                    </Link>
                    <span className="text-xs text-muted-foreground sm:hidden">
                      {post.author} · {formatDateTime(post.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="flex items-center justify-between gap-2">
                      {post.author}
                      {post.comments.length > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <MessageSquare className="size-3" />
                          {post.comments.length}
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                    {formatDateTime(post.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationNav page={page} totalPages={totalPages} hrefFor={hrefFor} />
    </div>
  )
}
