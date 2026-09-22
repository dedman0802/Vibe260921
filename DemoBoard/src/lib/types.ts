export const CATEGORIES = ["공지", "자유", "질문", "정보"] as const
export type Category = (typeof CATEGORIES)[number]

export interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
}

export interface Post {
  id: string
  category: Category
  title: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
  comments: Comment[]
}

export interface PostInput {
  category: Category
  title: string
  content: string
  author: string
}
