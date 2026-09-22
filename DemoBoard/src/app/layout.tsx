import type { Metadata } from "next"
import Link from "next/link"
import { PenLine } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "DemoBoard",
    template: "%s | DemoBoard",
  },
  description: "Next.js, shadcn/ui, TypeScript로 만든 게시판",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4">
            <Link href="/posts" className="text-lg font-bold tracking-tight">
              DemoBoard
            </Link>
            <Link href="/posts/new" className={buttonVariants()}>
              <PenLine />
              글쓰기
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          DemoBoard · Next.js + shadcn/ui + TypeScript
        </footer>
      </body>
    </html>
  )
}
