"use client"

import { useActionState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { addCommentAction, type CommentFormState } from "@/lib/actions"

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState<
    CommentFormState,
    FormData
  >(addCommentAction.bind(null, postId), {})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state.ok])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <Input
        name="author"
        maxLength={20}
        placeholder="작성자"
        aria-label="작성자"
        className="sm:w-48"
        required
      />
      <Textarea
        name="content"
        maxLength={500}
        rows={3}
        placeholder="댓글을 입력하세요"
        aria-label="댓글 내용"
        required
      />
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "등록 중..." : "댓글 등록"}
        </Button>
      </div>
    </form>
  )
}
