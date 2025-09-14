import { api } from './api'
import type { 
  User, 
  Post, 
  Comment, 
  Notification, 
  LoginCredentials,
  RegisterData,
  CreatePostData,
  UpdatePostData,
  PaginatedResponse,
  SearchResult
} from '../types'

// 认证相关API
export const authAPI = {
  // 登录
  login: async (credentials: LoginCredentials) => {
    return api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', credentials)
  },

  // 注册
  register: async (userData: RegisterData) => {
    return api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', userData)
  },

  // 登出
  logout: async () => {
    return api.post('/auth/logout')
  },

  // 刷新token
  refreshToken: async (refreshToken: string) => {
    return api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken })
  },

  // 验证token
  verifyToken: async () => {
    return api.get<User>('/auth/me')
  },

  // 忘记密码
  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email })
  },

  // 重置密码
  resetPassword: async (token: string, password: string) => {
    return api.post('/auth/reset-password', { token, password })
  },

  // 验证邮箱
  verifyEmail: async (token: string) => {
    return api.post('/auth/verify-email', { token })
  },

  // 重发验证邮件
  resendVerification: async () => {
    return api.post('/auth/resend-verification')
  }
}

// 用户相关API
export const userAPI = {
  // 获取用户信息
  getUser: async (username: string) => {
    return api.get<User>(`/users/${username}`)
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    return api.get<User>('/users/me')
  },

  // 更新用户信息
  updateProfile: async (userData: Partial<User>) => {
    return api.put<User>('/users/me', userData)
  },

  // 上传头像
  uploadAvatar: async (file: File, onProgress?: (progress: number) => void) => {
    return api.upload<{ avatar: string }>('/users/me/avatar', file, onProgress)
  },

  // 关注用户
  followUser: async (userId: string) => {
    return api.post(`/users/${userId}/follow`)
  },

  // 取消关注
  unfollowUser: async (userId: string) => {
    return api.delete(`/users/${userId}/follow`)
  },

  // 检查是否关注
  checkFollowing: async (userId: string) => {
    return api.get<{ isFollowing: boolean }>(`/users/${userId}/following-status`)
  },

  // 获取关注者列表
  getFollowers: async (userId: string, page = 1, limit = 20) => {
    return api.get<PaginatedResponse<User>>(`/users/${userId}/followers`, {
      params: { page, limit }
    })
  },

  // 获取关注列表
  getFollowing: async (userId: string, page = 1, limit = 20) => {
    return api.get<PaginatedResponse<User>>(`/users/${userId}/following`, {
      params: { page, limit }
    })
  },

  // 搜索用户
  searchUsers: async (query: string, page = 1, limit = 20) => {
    return api.get<PaginatedResponse<User>>('/users/search', {
      params: { q: query, page, limit }
    })
  },

  // 获取推荐用户
  getRecommendedUsers: async (limit = 5) => {
    return api.get<User[]>('/users/recommended', {
      params: { limit }
    })
  },

  // 获取用户统计信息
  getUserStats: async (userId: string) => {
    return api.get<{
      postsCount: number
      followersCount: number
      followingCount: number
      likesCount: number
    }>(`/users/${userId}/stats`)
  },

  // 屏蔽用户
  blockUser: async (userId: string) => {
    return api.post(`/users/${userId}/block`)
  },

  // 取消屏蔽
  unblockUser: async (userId: string) => {
    return api.delete(`/users/${userId}/block`)
  },

  // 举报用户
  reportUser: async (userId: string, reason: string, description?: string) => {
    return api.post(`/users/${userId}/report`, { reason, description })
  }
}

// 帖子相关API
export const postAPI = {
  // 获取帖子列表
  getPosts: async (page = 1, limit = 10, filter?: 'latest' | 'popular' | 'following') => {
    return api.get<PaginatedResponse<Post>>('/posts', {
      params: { page, limit, filter }
    })
  },

  // 获取单个帖子
  getPost: async (postId: string) => {
    return api.get<Post>(`/posts/${postId}`)
  },

  // 创建帖子
  createPost: async (postData: CreatePostData) => {
    return api.post<Post>('/posts', postData)
  },

  // 更新帖子
  updatePost: async (postId: string, postData: UpdatePostData) => {
    return api.put<Post>(`/posts/${postId}`, postData)
  },

  // 删除帖子
  deletePost: async (postId: string) => {
    return api.delete(`/posts/${postId}`)
  },

  // 点赞帖子
  likePost: async (postId: string) => {
    return api.post<{ liked: boolean; likesCount: number }>(`/posts/${postId}/like`)
  },

  // 取消点赞
  unlikePost: async (postId: string) => {
    return api.delete<{ liked: boolean; likesCount: number }>(`/posts/${postId}/like`)
  },

  // 收藏帖子
  bookmarkPost: async (postId: string) => {
    return api.post<{ bookmarked: boolean }>(`/posts/${postId}/bookmark`)
  },

  // 取消收藏
  unbookmarkPost: async (postId: string) => {
    return api.delete<{ bookmarked: boolean }>(`/posts/${postId}/bookmark`)
  },

  // 分享帖子
  sharePost: async (postId: string) => {
    return api.post<{ sharesCount: number }>(`/posts/${postId}/share`)
  },

  // 获取用户帖子
  getUserPosts: async (userId: string, page = 1, limit = 10) => {
    return api.get<PaginatedResponse<Post>>(`/users/${userId}/posts`, {
      params: { page, limit }
    })
  },

  // 获取用户点赞的帖子
  getUserLikedPosts: async (userId: string, page = 1, limit = 10) => {
    return api.get<PaginatedResponse<Post>>(`/users/${userId}/liked-posts`, {
      params: { page, limit }
    })
  },

  // 获取用户收藏的帖子
  getUserBookmarkedPosts: async (page = 1, limit = 10) => {
    return api.get<PaginatedResponse<Post>>('/posts/bookmarked', {
      params: { page, limit }
    })
  },

  // 上传图片
  uploadImages: async (files: File[], onProgress?: (progress: number) => void) => {
    return api.uploadMultiple<{ urls: string[] }>('/posts/upload-images', files, onProgress)
  },

  // 获取热门帖子
  getTrendingPosts: async (timeframe: 'day' | 'week' | 'month' = 'day', limit = 10) => {
    return api.get<Post[]>('/posts/trending', {
      params: { timeframe, limit }
    })
  },

  // 举报帖子
  reportPost: async (postId: string, reason: string, description?: string) => {
    return api.post(`/posts/${postId}/report`, { reason, description })
  },

  // 获取帖子统计
  getPostStats: async (postId: string) => {
    return api.get<{
      likesCount: number
      commentsCount: number
      sharesCount: number
      viewsCount: number
    }>(`/posts/${postId}/stats`)
  }
}

// 评论相关API
export const commentAPI = {
  // 获取评论列表
  getComments: async (postId: string, page = 1, limit = 20, sort: 'latest' | 'oldest' | 'popular' = 'latest') => {
    return api.get<PaginatedResponse<Comment>>(`/posts/${postId}/comments`, {
      params: { page, limit, sort }
    })
  },

  // 获取评论回复
  getCommentReplies: async (commentId: string, page = 1, limit = 10) => {
    return api.get<PaginatedResponse<Comment>>(`/comments/${commentId}/replies`, {
      params: { page, limit }
    })
  },

  // 创建评论
  createComment: async (postId: string, content: string, parentId?: string) => {
    return api.post<Comment>(`/posts/${postId}/comments`, {
      content,
      parentId
    })
  },

  // 更新评论
  updateComment: async (commentId: string, content: string) => {
    return api.put<Comment>(`/comments/${commentId}`, { content })
  },

  // 删除评论
  deleteComment: async (commentId: string) => {
    return api.delete(`/comments/${commentId}`)
  },

  // 点赞评论
  likeComment: async (commentId: string) => {
    return api.post<{ liked: boolean; likesCount: number }>(`/comments/${commentId}/like`)
  },

  // 取消点赞评论
  unlikeComment: async (commentId: string) => {
    return api.delete<{ liked: boolean; likesCount: number }>(`/comments/${commentId}/like`)
  },

  // 举报评论
  reportComment: async (commentId: string, reason: string, description?: string) => {
    return api.post(`/comments/${commentId}/report`, { reason, description })
  }
}

// 通知相关API
export const notificationAPI = {
  // 获取通知列表
  getNotifications: async (page = 1, limit = 20, type?: string, unreadOnly = false) => {
    return api.get<PaginatedResponse<Notification>>('/notifications', {
      params: { page, limit, type, unreadOnly }
    })
  },

  // 标记通知为已读
  markAsRead: async (notificationId: string) => {
    return api.put(`/notifications/${notificationId}/read`)
  },

  // 标记所有通知为已读
  markAllAsRead: async () => {
    return api.put('/notifications/read-all')
  },

  // 删除通知
  deleteNotification: async (notificationId: string) => {
    return api.delete(`/notifications/${notificationId}`)
  },

  // 清空所有通知
  clearAllNotifications: async () => {
    return api.delete('/notifications/clear-all')
  },

  // 获取未读通知数量
  getUnreadCount: async () => {
    return api.get<{ count: number }>('/notifications/unread-count')
  },

  // 更新通知设置
  updateNotificationSettings: async (settings: Record<string, boolean>) => {
    return api.put('/notifications/settings', settings)
  },

  // 获取通知设置
  getNotificationSettings: async () => {
    return api.get<Record<string, boolean>>('/notifications/settings')
  }
}

// 搜索相关API
export const searchAPI = {
  // 全局搜索
  search: async (query: string, type?: 'posts' | 'users' | 'tags', page = 1, limit = 20) => {
    return api.get<SearchResult>('/search', {
      params: { q: query, type, page, limit }
    })
  },

  // 搜索建议
  getSuggestions: async (query: string) => {
    return api.get<{
      users: User[]
      tags: string[]
      recent: string[]
    }>('/search/suggestions', {
      params: { q: query }
    })
  },

  // 热门标签
  getTrendingTags: async (limit = 10) => {
    return api.get<Array<{ tag: string; count: number }>>('/search/trending-tags', {
      params: { limit }
    })
  },

  // 搜索历史
  getSearchHistory: async (limit = 10) => {
    return api.get<string[]>('/search/history', {
      params: { limit }
    })
  },

  // 添加搜索历史
  addSearchHistory: async (query: string) => {
    return api.post('/search/history', { query })
  },

  // 清空搜索历史
  clearSearchHistory: async () => {
    return api.delete('/search/history')
  },

  // 删除搜索历史项
  deleteSearchHistoryItem: async (query: string) => {
    return api.delete('/search/history/item', { data: { query } })
  }
}

// 设置相关API
export const settingsAPI = {
  // 获取用户设置
  getSettings: async () => {
    return api.get<{
      notifications: Record<string, boolean>
      privacy: Record<string, any>
      preferences: Record<string, any>
    }>('/settings')
  },

  // 更新设置
  updateSettings: async (settings: Record<string, any>) => {
    return api.put('/settings', settings)
  },

  // 更改密码
  changePassword: async (currentPassword: string, newPassword: string) => {
    return api.put('/settings/password', {
      currentPassword,
      newPassword
    })
  },

  // 启用两步验证
  enableTwoFactor: async () => {
    return api.post<{ qrCode: string; secret: string }>('/settings/two-factor/enable')
  },

  // 确认两步验证
  confirmTwoFactor: async (code: string) => {
    return api.post('/settings/two-factor/confirm', { code })
  },

  // 禁用两步验证
  disableTwoFactor: async (code: string) => {
    return api.post('/settings/two-factor/disable', { code })
  },

  // 获取登录设备
  getLoginDevices: async () => {
    return api.get<Array<{
      id: string
      deviceName: string
      browser: string
      os: string
      location: string
      lastActive: string
      isCurrent: boolean
    }>>('/settings/devices')
  },

  // 注销设备
  logoutDevice: async (deviceId: string) => {
    return api.delete(`/settings/devices/${deviceId}`)
  },

  // 注销所有设备
  logoutAllDevices: async () => {
    return api.delete('/settings/devices/all')
  },

  // 导出数据
  exportData: async () => {
    return api.get('/settings/export-data')
  },

  // 删除账户
  deleteAccount: async (password: string, reason?: string) => {
    return api.delete('/settings/account', {
      data: { password, reason }
    })
  },

  // 停用账户
  deactivateAccount: async (password: string) => {
    return api.post('/settings/deactivate', { password })
  },

  // 重新激活账户
  reactivateAccount: async () => {
    return api.post('/settings/reactivate')
  }
}

// 管理员相关API（如果用户有管理权限）
export const adminAPI = {
  // 获取用户列表
  getUsers: async (page = 1, limit = 20, search?: string, status?: string) => {
    return api.get<PaginatedResponse<User>>('/admin/users', {
      params: { page, limit, search, status }
    })
  },

  // 获取帖子列表
  getPosts: async (page = 1, limit = 20, search?: string, status?: string) => {
    return api.get<PaginatedResponse<Post>>('/admin/posts', {
      params: { page, limit, search, status }
    })
  },

  // 获取举报列表
  getReports: async (page = 1, limit = 20, type?: string, status?: string) => {
    return api.get<PaginatedResponse<any>>('/admin/reports', {
      params: { page, limit, type, status }
    })
  },

  // 处理举报
  handleReport: async (reportId: string, action: 'approve' | 'reject', reason?: string) => {
    return api.post(`/admin/reports/${reportId}/handle`, { action, reason })
  },

  // 封禁用户
  banUser: async (userId: string, reason: string, duration?: number) => {
    return api.post(`/admin/users/${userId}/ban`, { reason, duration })
  },

  // 解封用户
  unbanUser: async (userId: string) => {
    return api.delete(`/admin/users/${userId}/ban`)
  },

  // 删除帖子
  deletePost: async (postId: string, reason: string) => {
    return api.delete(`/admin/posts/${postId}`, { data: { reason } })
  },

  // 获取系统统计
  getSystemStats: async () => {
    return api.get<{
      usersCount: number
      postsCount: number
      commentsCount: number
      reportsCount: number
      activeUsers: number
    }>('/admin/stats')
  }
}

// 实时通信相关API
export const realtimeAPI = {
  // 获取在线用户
  getOnlineUsers: async () => {
    return api.get<User[]>('/realtime/online-users')
  },

  // 发送私信
  sendMessage: async (recipientId: string, content: string, type: 'text' | 'image' = 'text') => {
    return api.post('/messages', {
      recipientId,
      content,
      type
    })
  },

  // 获取对话列表
  getConversations: async (page = 1, limit = 20) => {
    return api.get<PaginatedResponse<any>>('/messages/conversations', {
      params: { page, limit }
    })
  },

  // 获取对话消息
  getMessages: async (conversationId: string, page = 1, limit = 50) => {
    return api.get<PaginatedResponse<any>>(`/messages/conversations/${conversationId}`, {
      params: { page, limit }
    })
  },

  // 标记消息为已读
  markMessagesAsRead: async (conversationId: string) => {
    return api.put(`/messages/conversations/${conversationId}/read`)
  }
}