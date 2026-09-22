import "server-only"
import { supabase } from "@/lib/supabase"
import type { Comment, Post, PostInput } from "@/lib/types"

async function getPostsWithComments(posts: any[]): Promise<Post[]> {
  const postsWithComments = await Promise.all(
    posts.map(async (post) => {
      const { data: comments } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true })
      return {
        id: post.id,
        category: post.category,
        title: post.title,
        content: post.content,
        author: post.author,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        comments: (comments || []).map((c) => ({
          id: c.id,
          author: c.author,
          content: c.content,
          createdAt: c.created_at,
        })),
      }
    }),
  )
  return postsWithComments
}

export interface ListOptions {
  query?: string
  category?: string
  page: number
  pageSize: number
}

export async function listPosts({
  query,
  category,
  page,
  pageSize,
}: ListOptions) {
  let queryBuilder = supabase.from("posts").select("*")

  if (category) {
    queryBuilder = queryBuilder.eq("category", category)
  }

  if (query) {
    const q = query.toLowerCase()
    queryBuilder = queryBuilder.or(
      `title.ilike.%${q}%,content.ilike.%${q}%,author.ilike.%${q}%`,
    )
  }

  const { data: allPosts, error } = await queryBuilder.order("created_at", {
    ascending: false,
  })

  if (error) throw error

  const posts = await getPostsWithComments(allPosts || [])
  const total = posts.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), totalPages)
  const items = posts.slice((current - 1) * pageSize, current * pageSize)
  return { items, total, totalPages, page: current }
}

export async function getPost(id: string): Promise<Post | null> {
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: true })

  return {
    id: post.id,
    category: post.category,
    title: post.title,
    content: post.content,
    author: post.author,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    comments: (comments || []).map((c) => ({
      id: c.id,
      author: c.author,
      content: c.content,
      createdAt: c.created_at,
    })),
  }
}

export async function createPost(input: PostInput): Promise<Post> {
  const now = new Date().toISOString()
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      category: input.category,
      title: input.title,
      content: input.content,
      author: input.author,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: post.id,
    category: post.category,
    title: post.title,
    content: post.content,
    author: post.author,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    comments: [],
  }
}

export async function updatePost(
  id: string,
  input: PostInput,
): Promise<Post | null> {
  const now = new Date().toISOString()
  const { data: post, error } = await supabase
    .from("posts")
    .update({
      category: input.category,
      title: input.title,
      content: input.content,
      author: input.author,
      updated_at: now,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return null

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: true })

  return {
    id: post.id,
    category: post.category,
    title: post.title,
    content: post.content,
    author: post.author,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    comments: (comments || []).map((c) => ({
      id: c.id,
      author: c.author,
      content: c.content,
      createdAt: c.created_at,
    })),
  }
}

export async function deletePost(id: string): Promise<boolean> {
  const { error } = await supabase.from("posts").delete().eq("id", id)
  return !error
}

export async function addComment(
  postId: string,
  input: Pick<Comment, "author" | "content">,
): Promise<Comment | null> {
  const now = new Date().toISOString()
  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author: input.author,
      content: input.content,
      created_at: now,
    })
    .select()
    .single()

  if (error) return null

  return {
    id: comment.id,
    author: comment.author,
    content: comment.content,
    createdAt: comment.created_at,
  }
}

export async function deleteComment(
  postId: string,
  commentId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("post_id", postId)

  return !error
}
