"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import * as db from "@/lib/db"
import { CATEGORIES, type Category } from "@/lib/types"

export interface PostFormState {
  error?: string
  values?: { category: string; title: string; content: string; author: string }
}

export interface CommentFormState {
  error?: string
  ok?: number
}

function str(formData: FormData, key: string) {
  const v = formData.get(key)
  return typeof v === "string" ? v.trim() : ""
}

function parsePost(formData: FormData) {
  const values = {
    category: str(formData, "category"),
    title: str(formData, "title"),
    content: str(formData, "content"),
    author: str(formData, "author"),
  }
  let error: string | undefined
  if (!(CATEGORIES as readonly string[]).includes(values.category))
    error = "카테고리를 선택해 주세요."
  else if (!values.title) error = "제목을 입력해 주세요."
  else if (values.title.length > 100) error = "제목은 100자 이내로 입력해 주세요."
  else if (!values.author) error = "작성자를 입력해 주세요."
  else if (values.author.length > 20) error = "작성자는 20자 이내로 입력해 주세요."
  else if (!values.content) error = "내용을 입력해 주세요."
  else if (values.content.length > 5000)
    error = "내용은 5000자 이내로 입력해 주세요."
  return { values, error }
}

export async function createPostAction(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const { values, error } = parsePost(formData)
  if (error) return { error, values }
  const post = await db.createPost({
    ...values,
    category: values.category as Category,
  })
  revalidatePath("/posts")
  redirect(`/posts/${post.id}`)
}

export async function updatePostAction(
  id: string,
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const { values, error } = parsePost(formData)
  if (error) return { error, values }
  const post = await db.updatePost(id, {
    ...values,
    category: values.category as Category,
  })
  if (!post) return { error: "게시글을 찾을 수 없습니다.", values }
  revalidatePath("/posts")
  revalidatePath(`/posts/${id}`)
  redirect(`/posts/${id}`)
}

export async function deletePostAction(id: string) {
  await db.deletePost(id)
  revalidatePath("/posts")
  redirect("/posts")
}

export async function addCommentAction(
  postId: string,
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const author = str(formData, "author")
  const content = str(formData, "content")
  if (!author) return { error: "작성자를 입력해 주세요." }
  if (author.length > 20) return { error: "작성자는 20자 이내로 입력해 주세요." }
  if (!content) return { error: "댓글 내용을 입력해 주세요." }
  if (content.length > 500) return { error: "댓글은 500자 이내로 입력해 주세요." }
  const comment = await db.addComment(postId, { author, content })
  if (!comment) return { error: "게시글을 찾을 수 없습니다." }
  revalidatePath(`/posts/${postId}`)
  revalidatePath("/posts")
  return { ok: Date.now() }
}

export async function deleteCommentAction(postId: string, commentId: string) {
  await db.deleteComment(postId, commentId)
  revalidatePath(`/posts/${postId}`)
  revalidatePath("/posts")
}
