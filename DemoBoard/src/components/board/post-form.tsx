"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORIES } from "@/lib/types"
import type { PostFormState } from "@/lib/actions"

interface PostFormProps {
  action: (prev: PostFormState, formData: FormData) => Promise<PostFormState>
  initial?: { category: string; title: string; content: string; author: string }
  cancelHref: string
  submitLabel: string
}

export function PostForm({
  action,
  initial,
  cancelHref,
  submitLabel,
}: PostFormProps) {
  const [state, formAction, pending] = useActionState<PostFormState, FormData>(
    action,
    { values: initial },
  )
  const v = state.values ?? initial

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">카테고리</Label>
          <select
            id="category"
            name="category"
            defaultValue={v?.category ?? "자유"}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="author">작성자</Label>
          <Input
            id="author"
            name="author"
            maxLength={20}
            defaultValue={v?.author ?? ""}
            placeholder="이름을 입력하세요"
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          name="title"
          maxLength={100}
          defaultValue={v?.title ?? ""}
          placeholder="제목을 입력하세요"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          name="content"
          maxLength={5000}
          rows={12}
          defaultValue={v?.content ?? ""}
          placeholder="내용을 입력하세요"
          required
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Link href={cancelHref} className={buttonVariants({ variant: "outline" })}>
          취소
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
