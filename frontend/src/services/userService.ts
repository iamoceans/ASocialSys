import { api } from './api'
import type {
  User,
  UserProfile,
  UsersResponse,
  UserFilters,
  UserStats,
  FollowersResponse,
  FollowingResponse,
  RecommendedUsersResponse,
  UserSearchParams,
  PaginationParams
} from '../types'

/**
 * 用户服务类
 * 处理用户相关的API请求
 */
class UserService {
  // 获取用户列表
  async getUsers(params?: PaginationParams & UserFilters & {
    sort_by?: 'latest' | 'oldest' | 'popular' | 'active'
  }): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>('/users/', { params })
    return response.data!
  }
  
  // 获取单个用户信息
  async getUser(userId: string): Promise<User> {
    const response = await api.get<User>(`/users/${userId}/`)
    return response.data!
  }
  
  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me/')
    return response.data!
  }
  
  // 更新当前用户信息
  async updateCurrentUser(data: Partial<UserProfile>): Promise<User> {
    const response = await api.patch<User>('/users/me/', data)
    return response.data!
  }
  
  // 更新用户头像
  async updateAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await api.patch<{ avatar_url: string }>('/users/me/avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data!
  }
  
  // 更新用户封面图
  async updateCoverImage(file: File): Promise<{ cover_image_url: string }> {
    const formData = new FormData()
    formData.append('cover_image', file)
    
    const response = await api.patch<{ cover_image_url: string }>('/users/me/cover/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data!
  }
  
  // 删除用户头像
  async deleteAvatar(): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>('/users/me/avatar/')
    return response.data!
  }
  
  // 删除用户封面图
  async deleteCoverImage(): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>('/users/me/cover/')
    return response.data!
  }
  
  // 获取用户统计信息
  async getUserStats(userId?: string): Promise<UserStats> {
    const url = userId ? `/users/${userId}/stats/` : '/users/me/stats/'
    const response = await api.get<UserStats>(url)
    return response.data!
  }
  
  // 获取用户关注者列表
  async getFollowers(userId: string, params?: PaginationParams): Promise<FollowersResponse> {
    const response = await api.get<FollowersResponse>(`/users/${userId}/followers/`, { params })
    return response.data!
  }
  
  // 获取用户关注列表
  async getFollowing(userId: string, params?: PaginationParams): Promise<FollowingResponse> {
    const response = await api.get<FollowingResponse>(`/users/${userId}/following/`, { params })
    return response.data!
  }
  
  // 关注用户
  async followUser(userId: string): Promise<{ message: string; is_following: boolean }> {
    const response = await api.post<{ message: string; is_following: boolean }>(`/users/${userId}/follow/`)
    return response.data!
  }
  
  // 取消关注用户
  async unfollowUser(userId: string): Promise<{ message: string; is_following: boolean }> {
    const response = await api.delete<{ message: string; is_following: boolean }>(`/users/${userId}/follow/`)
    return response.data!
  }
  
  // 检查是否关注用户
  async checkFollowStatus(userId: string): Promise<{ is_following: boolean; is_followed_by: boolean }> {
    const response = await api.get<{ is_following: boolean; is_followed_by: boolean }>(`/users/${userId}/follow-status/`)
    return response.data!
  }
  
  // 批量检查关注状态
  async checkMultipleFollowStatus(userIds: string[]): Promise<Record<string, { is_following: boolean; is_followed_by: boolean }>> {
    const response = await api.post<Record<string, { is_following: boolean; is_followed_by: boolean }>>(
      '/users/follow-status/',
      { user_ids: userIds }
    )
    return response.data!
  }
  
  // 屏蔽用户
  async blockUser(userId: string): Promise<{ message: string; is_blocked: boolean }> {
    const response = await api.post<{ message: string; is_blocked: boolean }>(`/users/${userId}/block/`)
    return response.data!
  }
  
  // 取消屏蔽用户
  async unblockUser(userId: string): Promise<{ message: string; is_blocked: boolean }> {
    const response = await api.delete<{ message: string; is_blocked: boolean }>(`/users/${userId}/block/`)
    return response.data!
  }
  
  // 获取屏蔽用户列表
  async getBlockedUsers(params?: PaginationParams): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>('/users/blocked/', { params })
    return response.data!
  }
  
  // 检查用户是否被屏蔽
  async checkBlockStatus(userId: string): Promise<{ is_blocked: boolean; is_blocked_by: boolean }> {
    const response = await api.get<{ is_blocked: boolean; is_blocked_by: boolean }>(`/users/${userId}/block-status/`)
    return response.data!
  }
  
  // 举报用户
  async reportUser(userId: string, data: {
    reason: 'spam' | 'harassment' | 'inappropriate_content' | 'fake_account' | 'other'
    description?: string
    evidence_urls?: string[]
  }): Promise<{ message: string; report_id: string }> {
    const response = await api.post<{ message: string; report_id: string }>(`/users/${userId}/report/`, data)
    return response.data!
  }
  
  // 搜索用户
  async searchUsers(params: UserSearchParams & PaginationParams): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>('/users/search/', { params })
    return response.data!
  }
  
  // 获取推荐用户
  async getRecommendedUsers(params?: {
    limit?: number
    reason?: 'mutual_friends' | 'similar_interests' | 'popular' | 'new_users'
  }): Promise<RecommendedUsersResponse> {
    const response = await api.get<RecommendedUsersResponse>('/users/recommended/', { params })
    return response.data!
  }
  
  // 获取相似用户
  async getSimilarUsers(userId: string, params?: PaginationParams): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>(`/users/${userId}/similar/`, { params })
    return response.data!
  }
  
  // 获取共同关注
  async getMutualFollowing(userId: string, params?: PaginationParams): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>(`/users/${userId}/mutual-following/`, { params })
    return response.data!
  }
  
  // 获取用户活动时间线
  async getUserTimeline(userId: string, params?: PaginationParams & {
    activity_type?: 'posts' | 'likes' | 'comments' | 'follows' | 'all'
  }): Promise<{
    results: Array<{
      id: string
      activity_type: string
      timestamp: string
      data: any
    }>
    total: number
    page: number
    page_size: number
    has_more: boolean
  }> {
    const response = await api.get(`/users/${userId}/timeline/`, { params })
    return response.data!
  }
  
  // 获取用户偏好设置
  async getUserPreferences(): Promise<{
    privacy: {
      profile_visibility: 'public' | 'followers' | 'private'
      show_online_status: boolean
      show_last_seen: boolean
      allow_messages_from: 'everyone' | 'followers' | 'none'
      allow_tags: boolean
      show_activity: boolean
    }
    notifications: {
      email_notifications: boolean
      push_notifications: boolean
      sms_notifications: boolean
      marketing_emails: boolean
    }
    content: {
      language: string
      timezone: string
      date_format: string
      time_format: '12h' | '24h'
      theme: 'light' | 'dark' | 'auto'
    }
    feed: {
      show_reposts: boolean
      show_likes: boolean
      content_filter: 'all' | 'following' | 'curated'
      sensitive_content: boolean
    }
  }> {
    const response = await api.get('/users/me/preferences/')
    return response.data!
  }
  
  // 更新用户偏好设置
  async updateUserPreferences(preferences: any): Promise<any> {
    const response = await api.patch('/users/me/preferences/', preferences)
    return response.data!
  }
  
  // 获取用户安全设置
  async getSecuritySettings(): Promise<{
    two_factor_enabled: boolean
    backup_codes_count: number
    active_sessions: Array<{
      id: string
      device: string
      location: string
      ip_address: string
      last_activity: string
      is_current: boolean
    }>
    login_history: Array<{
      timestamp: string
      device: string
      location: string
      ip_address: string
      success: boolean
    }>
  }> {
    const response = await api.get('/users/me/security/')
    return response.data!
  }
  
  // 启用两步验证
  async enableTwoFactor(): Promise<{
    qr_code: string
    backup_codes: string[]
    secret: string
  }> {
    const response = await api.post('/users/me/security/2fa/enable/')
    return response.data!
  }
  
  // 确认启用两步验证
  async confirmTwoFactor(code: string): Promise<{ message: string; backup_codes: string[] }> {
    const response = await api.post<{ message: string; backup_codes: string[] }>(
      '/users/me/security/2fa/confirm/',
      { code }
    )
    return response.data!
  }
  
  // 禁用两步验证
  async disableTwoFactor(password: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/me/security/2fa/disable/', { password })
    return response.data!
  }
  
  // 生成新的备份码
  async generateBackupCodes(): Promise<{ backup_codes: string[] }> {
    const response = await api.post<{ backup_codes: string[] }>('/users/me/security/backup-codes/')
    return response.data!
  }
  
  // 终止会话
  async terminateSession(sessionId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/users/me/security/sessions/${sessionId}/`)
    return response.data!
  }
  
  // 终止所有其他会话
  async terminateAllOtherSessions(): Promise<{ message: string; terminated_count: number }> {
    const response = await api.post<{ message: string; terminated_count: number }>('/users/me/security/sessions/terminate-others/')
    return response.data!
  }
  
  // 更改密码
  async changePassword(data: {
    current_password: string
    new_password: string
    confirm_password: string
  }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/me/change-password/', data)
    return response.data!
  }
  
  // 更改邮箱
  async changeEmail(data: {
    new_email: string
    password: string
  }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/me/change-email/', data)
    return response.data!
  }
  
  // 确认邮箱更改
  async confirmEmailChange(token: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/me/confirm-email-change/', { token })
    return response.data!
  }
  
  // 删除账户
  async deleteAccount(password: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/me/delete-account/', { password })
    return response.data!
  }
  
  // 导出用户数据
  async exportUserData(): Promise<{ download_url: string; expires_at: string }> {
    const response = await api.post<{ download_url: string; expires_at: string }>('/users/me/export-data/')
    return response.data!
  }
  
  // 获取数据导出状态
  async getExportStatus(exportId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    download_url?: string
    expires_at?: string
    error_message?: string
  }> {
    const response = await api.get(`/users/me/export-data/${exportId}/`)
    return response.data!
  }
  
  // 获取用户徽章
  async getUserBadges(userId?: string): Promise<Array<{
    id: string
    name: string
    description: string
    icon_url: string
    earned_at: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }>> {
    const url = userId ? `/users/${userId}/badges/` : '/users/me/badges/'
    const response = await api.get(url)
    return response.data!
  }
  
  // 获取用户成就
  async getUserAchievements(userId?: string): Promise<Array<{
    id: string
    name: string
    description: string
    icon_url: string
    progress: number
    max_progress: number
    completed: boolean
    completed_at?: string
    reward?: {
      type: 'badge' | 'points' | 'feature'
      value: any
    }
  }>> {
    const url = userId ? `/users/${userId}/achievements/` : '/users/me/achievements/'
    const response = await api.get(url)
    return response.data!
  }
  
  // 验证用户名可用性
  async checkUsernameAvailability(username: string): Promise<{ available: boolean; suggestions?: string[] }> {
    const response = await api.get<{ available: boolean; suggestions?: string[] }>(
      '/users/check-username/',
      { params: { username } }
    )
    return response.data!
  }
  
  // 验证邮箱可用性
  async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    const response = await api.get<{ available: boolean }>(
      '/users/check-email/',
      { params: { email } }
    )
    return response.data!
  }
  
  // 获取用户提及建议
  async getUserMentionSuggestions(query: string, limit: number = 10): Promise<Array<{
    id: string
    username: string
    display_name: string
    avatar_url?: string
    verified: boolean
  }>> {
    const response = await api.get('/users/mention-suggestions/', {
      params: { q: query, limit }
    })
    return response.data!
  }
  
  // 获取用户标签建议
  async getUserTagSuggestions(query: string, limit: number = 10): Promise<Array<{
    id: string
    name: string
    usage_count: number
  }>> {
    const response = await api.get('/users/tag-suggestions/', {
      params: { q: query, limit }
    })
    return response.data!
  }
}

// 创建并导出服务实例
export const userService = new UserService()
export default userService