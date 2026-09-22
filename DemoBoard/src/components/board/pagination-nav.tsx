import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

interface PaginationNavProps {
  page: number
  totalPages: number
  hrefFor: (page: number) => string
}

export function PaginationNav({ page, totalPages, hrefFor }: PaginationNavProps) {
  if (totalPages <= 1) return null
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const end = Math.min(totalPages, start + 4)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <nav aria-label="페이지 이동" className="flex items-center justify-center gap-1">
      {page > 1 && (
        <Link
          href={hrefFor(page - 1)}
          aria-label="이전 페이지"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ChevronLeft />
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? "page" : undefined}
          className={buttonVariants({
            variant: p === page ? "outline" : "ghost",
            size: "icon",
          })}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link
          href={hrefFor(page + 1)}
          aria-label="다음 페이지"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ChevronRight />
        </Link>
      )}
    </nav>
  )
}
