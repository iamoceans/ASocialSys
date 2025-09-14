import { api } from './api'
import type {
  Post,
  Comment,
  CreatePostData,
  UpdatePostData,
  CreateCommentData,
  UpdateCommentData,
  PostsResponse,
  CommentsResponse,
  LikeResponse,
  RepostResponse,
  BookmarkResponse,
  PostStats,
  TrendingTopic,
  PostSearchParams,
  PostFilters,
  MediaUploadResponse,
  PostDraft,
  ScheduledPost,
  PostAnalytics,
  ModerationResult,
  Hashtag,
  PaginationParams
} from '../types'

/**
 * 帖子服务类
 * 处理帖子的创建、编辑、删除、点赞、评论等功能
 */
class PostService {
  // 获取帖子列表
  async getPosts(params?: PaginationParams & {
    feed_type?: 'timeline' | 'trending' | 'latest' | 'following'
    user_id?: string
    hashtag?: string
    sort_by?: 'latest' | 'popular' | 'trending'
    has_media?: boolean
  }): Promise<PostsResponse> {
    const response = await api.get<PostsResponse>('/posts/', { params })
    return response.data!
  }
  
  // 获取单个帖子
  async getPost(postId: string): Promise<Post> {
    const response = await api.get<Post>(`/posts/${postId}/`)
    return response.data!
  }
  
  // 创建帖子
  async createPost(data: CreatePostData): Promise<Post> {
    const formData = new FormData()
    
    // 添加文本内容
    formData.append('content', data.content)
    
    // 添加媒体文件
    if (data.media_files) {
      data.media_files.forEach((file, index) => {
        formData.append(`media_files[${index}]`, file)
      })
    }
    
    // 添加其他字段
    if (data.hashtags) {
      data.hashtags.forEach((tag, index) => {
        formData.append(`hashtags[${index}]`, tag)
      })
    }
    
    if (data.mentions) {
      data.mentions.forEach((mention, index) => {
        formData.append(`mentions[${index}]`, mention)
      })
    }
    
    if (data.visibility) {
      formData.append('visibility', data.visibility)
    }
    
    if (data.parent_post_id) {
      formData.append('parent_post_id', data.parent_post_id)
    }
    
    if (data.reply_to_id) {
      formData.append('reply_to_id', data.reply_to_id)
    }
    
    if (data.location) {
      formData.append('location', JSON.stringify(data.location))
    }
    
    if (data.scheduled_at) {
      formData.append('scheduled_at', data.scheduled_at)
    }
    
    const response = await api.post<Post>('/posts/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data!
  }
  
  // 更新帖子
  async updatePost(postId: string, data: UpdatePostData): Promise<Post> {
    const response = await api.patch<Post>(`/posts/${postId}/`, data)
    return response.data!
  }
  
  // 删除帖子
  async deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}/`)
  }
  
  // 点赞帖子
  async likePost(postId: string): Promise<LikeResponse> {
    const response = await api.post<LikeResponse>(`/posts/${postId}/like/`)
    return response.data!
  }
  
  // 取消点赞帖子
  async unlikePost(postId: string): Promise<LikeResponse> {
    const response = await api.delete<LikeResponse>(`/posts/${postId}/like/`)
    return response.data!
  }
  
  // 转发帖子
  async repostPost(postId: string, content?: string): Promise<RepostResponse> {
    const response = await api.post<RepostResponse>(`/posts/${postId}/repost/`, {
      content
    })
    return response.data!
  }
  
  // 取消转发帖子
  async unrepostPost(postId: string): Promise<RepostResponse> {
    const response = await api.delete<RepostResponse>(`/posts/${postId}/repost/`)
    return response.data!
  }
  
  // 收藏帖子
  async bookmarkPost(postId: string): Promise<BookmarkResponse> {
    const response = await api.post<BookmarkResponse>(`/posts/${postId}/bookmark/`)
    return response.data!
  }
  
  // 取消收藏帖子
  async unbookmarkPost(postId: string): Promise<BookmarkResponse> {
    const response = await api.delete<BookmarkResponse>(`/posts/${postId}/bookmark/`)
    return response.data!
  }
  
  // 获取收藏的帖子
  async getBookmarkedPosts(params?: PaginationParams): Promise<PostsResponse> {
    const response = await api.get<PostsResponse>('/posts/bookmarks/', { params })
    return response.data!
  }
  
  // 固定帖子
  async pinPost(postId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/posts/${postId}/pin/`)
    return response.data!
  }
  
  // 取消固定帖子
  async unpinPost(postId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/posts/${postId}/pin/`)
    return response.data!
  }
  
  // 举报帖子
  async reportPost(postId: string, reason: string, description?: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/posts/${postId}/report/`, {
      reason,
      description
    })
    return response.data!
  }
  
  // 获取帖子统计信息
  async getPostStats(postId: string): Promise<PostStats> {
    const response = await api.get<PostStats>(`/posts/${postId}/stats/`)
    return response.data!
  }
  
  // 获取帖子分析数据
  async getPostAnalytics(postId: string, dateRange?: {
    start_date: string
    end_date: string
  }): Promise<PostAnalytics> {
    const response = await api.get<PostAnalytics>(`/posts/${postId}/analytics/`, {
      params: dateRange
    })
    return response.data!
  }
  
  // 搜索帖子
  async searchPosts(params: PostSearchParams): Promise<PostsResponse> {
    const response = await api.get<PostsResponse>('/posts/search/', { params })
    return response.data!
  }
  
  // 获取热门话题
  async getTrendingTopics(params?: {
    limit?: number
    category?: string
    time_range?: '1h' | '6h' | '24h' | '7d' | '30d'
  }): Promise<TrendingTopic[]> {
    const response = await api.get<TrendingTopic[]>('/posts/trending-topics/', { params })
    return response.data!
  }
  
  // 获取话题详情
  async getHashtag(hashtag: string): Promise<Hashtag> {
    const response = await api.get<Hashtag>(`/hashtags/${encodeURIComponent(hashtag)}/`)
    return response.data!
  }
  
  // 关注话题
  async followHashtag(hashtag: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/hashtags/${encodeURIComponent(hashtag)}/follow/`)
    return response.data!
  }
  
  // 取消关注话题
  async unfollowHashtag(hashtag: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/hashtags/${encodeURIComponent(hashtag)}/follow/`)
    return response.data!
  }
  
  // 获取关注的话题
  async getFollowedHashtags(params?: PaginationParams): Promise<{
    results: Hashtag[]
    total: number
    page: number
    page_size: number
    has_more: boolean
  }> {
    const response = await api.get('/hashtags/following/', { params })
    return response.data!
  }
  
  // 上传媒体文件
  async uploadMedia(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<MediaUploadResponse> {
    const response = await api.upload<MediaUploadResponse>('/media/upload/', file, onProgress)
    return response.data!
  }
  
  // 批量上传媒体文件
  async uploadMultipleMedia(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<MediaUploadResponse[]> {
    const response = await api.uploadMultiple<MediaUploadResponse[]>('/media/upload/batch/', files, onProgress)
    return response.data!
  }
  
  // 删除媒体文件
  async deleteMedia(mediaId: string): Promise<void> {
    await api.delete(`/media/${mediaId}/`)
  }
  
  // 获取评论列表
  async getComments(postId: string, params?: PaginationParams & {
    sort_by?: 'latest' | 'oldest' | 'popular'
    parent_id?: string
  }): Promise<CommentsResponse> {
    const response = await api.get<CommentsResponse>(`/posts/${postId}/comments/`, { params })
    return response.data!
  }
  
  // 获取单个评论
  async getComment(commentId: string): Promise<Comment> {
    const response = await api.get<Comment>(`/comments/${commentId}/`)
    return response.data!
  }
  
  // 创建评论
  async createComment(postId: string, data: CreateCommentData): Promise<Comment> {
    const formData = new FormData()
    
    formData.append('content', data.content)
    
    if (data.media_files) {
      data.media_files.forEach((file, index) => {
        formData.append(`media_files[${index}]`, file)
      })
    }
    
    if (data.mentions) {
      data.mentions.forEach((mention, index) => {
        formData.append(`mentions[${index}]`, mention)
      })
    }
    
    if (data.parent_comment_id) {
      formData.append('parent_comment_id', data.parent_comment_id)
    }
    
    const response = await api.post<Comment>(`/posts/${postId}/comments/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data!
  }
  
  // 更新评论
  async updateComment(commentId: string, data: UpdateCommentData): Promise<Comment> {
    const response = await api.patch<Comment>(`/comments/${commentId}/`, data)
    return response.data!
  }
  
  // 删除评论
  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}/`)
  }
  
  // 点赞评论
  async likeComment(commentId: string): Promise<LikeResponse> {
    const response = await api.post<LikeResponse>(`/comments/${commentId}/like/`)
    return response.data!
  }
  
  // 取消点赞评论
  async unlikeComment(commentId: string): Promise<LikeResponse> {
    const response = await api.delete<LikeResponse>(`/comments/${commentId}/like/`)
    return response.data!
  }
  
  // 举报评论
  async reportComment(commentId: string, reason: string, description?: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/comments/${commentId}/report/`, {
      reason,
      description
    })
    return response.data!
  }
  
  // 获取草稿列表
  async getDrafts(params?: PaginationParams): Promise<{
    results: PostDraft[]
    total: number
    page: number
    page_size: number
    has_more: boolean
  }> {
    const response = await api.get('/posts/drafts/', { params })
    return response.data!
  }
  
  // 保存草稿
  async saveDraft(data: Partial<CreatePostData>): Promise<PostDraft> {
    const response = await api.post<PostDraft>('/posts/drafts/', data)
    return response.data!
  }
  
  // 更新草稿
  async updateDraft(draftId: string, data: Partial<CreatePostData>): Promise<PostDraft> {
    const response = await api.patch<PostDraft>(`/posts/drafts/${draftId}/`, data)
    return response.data!
  }
  
  // 删除草稿
  async deleteDraft(draftId: string): Promise<void> {
    await api.delete(`/posts/drafts/${draftId}/`)
  }
  
  // 从草稿发布帖子
  async publishDraft(draftId: string): Promise<Post> {
    const response = await api.post<Post>(`/posts/drafts/${draftId}/publish/`)
    return response.data!
  }
  
  // 获取定时发布的帖子
  async getScheduledPosts(params?: PaginationParams): Promise<{
    results: ScheduledPost[]
    total: number
    page: number
    page_size: number
    has_more: boolean
  }> {
    const response = await api.get('/posts/scheduled/', { params })
    return response.data!
  }
  
  // 取消定时发布
  async cancelScheduledPost(postId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/posts/scheduled/${postId}/`)
    return response.data!
  }
  
  // 获取帖子的点赞用户列表
  async getPostLikes(postId: string, params?: PaginationParams): Promise<{
    results: Array<{
      user: any
      created_at: string
    }>
    total: number
    page: number
    page_size: number
    has_more: boolean
  }> {
    const response = await api.get(`/posts/${postId}/likes/`, { params })
    return response.data!
  }
  
  // 获取帖子的转发列表
  async getPostReposts(postId: string, params?: PaginationParams): Promise<PostsResponse> {
    const response = await api.get<PostsResponse>(`/posts/${postId}/reposts/`, { params })
    return response.data!
  }
  
  // 获取用户的帖子
  async getUserPosts(userId: string, params?: PaginationParams & {
    include_replies?: boolean
    include_reposts?: boolean
    media_only?: boolean
  }): Promise<PostsResponse> {
    const response = await api.get<PostsResponse>(`/users/${userId}/posts/`, { params })
    return response.data!
  }
  
  // 获取用户的点赞帖子
  async getUserLikedPosts(userId: string, params?: PaginationParams): Promise<PostsResponse> {
    const response = await api.get<PostsResponse>(`/users/${userId}/liked-posts/`, { params })
    return response.data!
  }
  
  // 获取内容审核结果
  async getModerationResult(postId: string): Promise<ModerationResult> {
    const response = await api.get<ModerationResult>(`/posts/${postId}/moderation/`)
    return response.data!
  }
  
  // 申请内容审核复议
  async appealModeration(postId: string, reason: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/posts/${postId}/moderation/appeal/`, {
      reason
    })
    return response.data!
  }
}

// 创建并导出服务实例
export const postService = new PostService()
export default postService