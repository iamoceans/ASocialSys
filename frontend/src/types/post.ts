import type { User } from './auth'

// 帖子状态
export type PostStatus = 'draft' | 'published' | 'archived' | 'deleted'

// 帖子可见性
export type PostVisibility = 'public' | 'followers' | 'private'

// 媒体文件类型
export type MediaType = 'image' | 'video' | 'gif'

// 媒体文件
export interface MediaFile {
  id: string
  url: string
  thumbnail_url?: string
  type: MediaType
  width?: number
  height?: number
  size: number
  alt_text?: string
  created_at: string
}

// 话题标签
export interface Hashtag {
  id: string
  name: string
  posts_count: number
  trending_score?: number
  created_at: string
}

// 帖子基础信息
export interface Post {
  id: string
  author: User
  content: string
  media_files: MediaFile[]
  hashtags: Hashtag[]
  mentions: User[]
  
  // 统计数据
  likes_count: number
  comments_count: number
  reposts_count: number
  bookmarks_count: number
  views_count: number
  
  // 用户交互状态
  is_liked: boolean
  is_reposted: boolean
  is_bookmarked: boolean
  
  // 帖子属性
  status: PostStatus
  visibility: PostVisibility
  is_pinned: boolean
  is_edited: boolean
  
  // 回复和转发
  parent_post?: Post
  original_post?: Post
  reply_to?: Post
  
  // 时间戳
  created_at: string
  updated_at: string
  published_at?: string
  
  // 地理位置
  location?: {
    name: string
    latitude?: number
    longitude?: number
  }
}

// 评论
export interface Comment {
  id: string
  post: string
  author: User
  content: string
  media_files: MediaFile[]
  mentions: User[]
  
  // 统计数据
  likes_count: number
  replies_count: number
  
  // 用户交互状态
  is_liked: boolean
  
  // 回复关系
  parent_comment?: Comment
  replies?: Comment[]
  
  // 时间戳
  created_at: string
  updated_at: string
  
  // 状态
  is_edited: boolean
  is_deleted: boolean
}

// 创建帖子数据
export interface CreatePostData {
  content: string
  media_files?: File[]
  hashtags?: string[]
  mentions?: string[]
  visibility?: PostVisibility
  parent_post_id?: string
  reply_to_id?: string
  location?: {
    name: string
    latitude?: number
    longitude?: number
  }
  scheduled_at?: string
}

// 更新帖子数据
export interface UpdatePostData {
  content?: string
  hashtags?: string[]
  mentions?: string[]
  visibility?: PostVisibility
  location?: {
    name: string
    latitude?: number
    longitude?: number
  } | null
}

// 创建评论数据
export interface CreateCommentData {
  content: string
  media_files?: File[]
  mentions?: string[]
  parent_comment_id?: string
}

// 更新评论数据
export interface UpdateCommentData {
  content?: string
  mentions?: string[]
}

// 帖子列表响应
export interface PostsResponse {
  results: Post[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

// 评论列表响应
export interface CommentsResponse {
  results: Comment[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

// 点赞响应
export interface LikeResponse {
  is_liked: boolean
  likes_count: number
}

// 转发响应
export interface RepostResponse {
  is_reposted: boolean
  reposts_count: number
  repost?: Post
}

// 收藏响应
export interface BookmarkResponse {
  is_bookmarked: boolean
  bookmarks_count: number
}

// 帖子统计信息
export interface PostStats {
  likes_count: number
  comments_count: number
  reposts_count: number
  bookmarks_count: number
  views_count: number
  engagement_rate: number
  reach: number
  impressions: number
}

// 热门话题
export interface TrendingTopic {
  hashtag: Hashtag
  posts_count: number
  growth_rate: number
  category?: string
}

// 帖子搜索参数
export interface PostSearchParams {
  query?: string
  hashtags?: string[]
  author?: string
  date_from?: string
  date_to?: string
  media_type?: MediaType
  sort_by?: 'latest' | 'popular' | 'trending'
  page?: number
  page_size?: number
}

// 帖子过滤器
export interface PostFilters {
  status?: PostStatus[]
  visibility?: PostVisibility[]
  has_media?: boolean
  has_hashtags?: boolean
  has_mentions?: boolean
  is_reply?: boolean
  is_repost?: boolean
  author_verified?: boolean
}

// 帖子排序选项
export type PostSortOption = 
  | 'latest'
  | 'oldest'
  | 'popular'
  | 'trending'
  | 'most_liked'
  | 'most_commented'
  | 'most_reposted'

// 媒体上传响应
export interface MediaUploadResponse {
  id: string
  url: string
  thumbnail_url?: string
  type: MediaType
  width?: number
  height?: number
  size: number
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
}

// 帖子草稿
export interface PostDraft {
  id: string
  content: string
  media_files: MediaFile[]
  hashtags: string[]
  mentions: string[]
  visibility: PostVisibility
  scheduled_at?: string
  created_at: string
  updated_at: string
}

// 定时发布帖子
export interface ScheduledPost {
  id: string
  content: string
  media_files: MediaFile[]
  hashtags: string[]
  mentions: string[]
  visibility: PostVisibility
  scheduled_at: string
  status: 'pending' | 'published' | 'failed' | 'cancelled'
  created_at: string
  updated_at: string
}

// 帖子分析数据
export interface PostAnalytics {
  post_id: string
  views: number
  likes: number
  comments: number
  reposts: number
  bookmarks: number
  clicks: number
  engagement_rate: number
  reach: number
  impressions: number
  demographics: {
    age_groups: Record<string, number>
    genders: Record<string, number>
    locations: Record<string, number>
  }
  time_series: {
    timestamp: string
    views: number
    likes: number
    comments: number
    reposts: number
  }[]
}

// 内容审核结果
export interface ModerationResult {
  is_approved: boolean
  confidence: number
  flags: string[]
  reason?: string
  reviewed_at: string
  reviewer?: User
}