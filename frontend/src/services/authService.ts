import { api } from './api'
import type {
  User,
  UserProfile,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  TokenRefreshResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  PasswordChange,
  UserProfileUpdate,
  UserSettingsUpdate,
  UserStats,
  UserSearchResult,
  FollowResponse,
  BlockResponse,
  MuteResponse,
  VerificationStatus,
  SecuritySettings,
  ActiveSession,
  PaginationParams,
  SearchParams
} from '../types'

/**
 * 认证服务类
 * 处理用户认证、注册、密码管理等功能
 */
class AuthService {
  // 用户登录
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login/', credentials)
    return response.data!
  }
  
  // 用户注册
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register/', data)
    return response.data!
  }
  
  // 用户登出
  async logout(): Promise<void> {
    await api.post('/auth/logout/')
  }
  
  // 刷新访问令牌
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const response = await api.post<TokenRefreshResponse>('/auth/refresh/', {
      refresh_token: refreshToken
    })
    return response.data!
  }
  
  // 验证令牌
  async verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
    const response = await api.post<{ valid: boolean; user?: User }>('/auth/verify/', {
      token
    })
    return response.data!
  }
  
  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me/')
    return response.data!
  }
  
  // 获取用户详细资料
  async getUserProfile(userId?: string): Promise<UserProfile> {
    const url = userId ? `/users/${userId}/profile/` : '/auth/profile/'
    const response = await api.get<UserProfile>(url)
    return response.data!
  }
  
  // 更新用户资料
  async updateProfile(data: UserProfileUpdate): Promise<UserProfile> {
    const response = await api.patch<UserProfile>('/auth/profile/', data)
    return response.data!
  }
  
  // 更新用户设置
  async updateSettings(data: UserSettingsUpdate): Promise<UserProfile> {
    const response = await api.patch<UserProfile>('/auth/settings/', data)
    return response.data!
  }
  
  // 上传头像
  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const response = await api.upload<{ avatar_url: string }>('/auth/avatar/', file)
    return response.data!
  }
  
  // 删除头像
  async deleteAvatar(): Promise<void> {
    await api.delete('/auth/avatar/')
  }
  
  // 密码重置请求
  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/password-reset/', data)
    return response.data!
  }
  
  // 密码重置确认
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/password-reset/confirm/', data)
    return response.data!
  }
  
  // 修改密码
  async changePassword(data: PasswordChange): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/password-change/', data)
    return response.data!
  }
  
  // 邮箱验证
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/verify-email/', { token })
    return response.data!
  }
  
  // 重新发送邮箱验证
  async resendEmailVerification(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/resend-verification/')
    return response.data!
  }
  
  // 手机号验证
  async verifyPhone(code: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/verify-phone/', { code })
    return response.data!
  }
  
  // 发送手机验证码
  async sendPhoneVerification(phoneNumber: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/send-phone-verification/', {
      phone_number: phoneNumber
    })
    return response.data!
  }
  
  // 获取验证状态
  async getVerificationStatus(): Promise<VerificationStatus> {
    const response = await api.get<VerificationStatus>('/auth/verification-status/')
    return response.data!
  }
  
  // 启用两步验证
  async enableTwoFactor(): Promise<{ qr_code: string; backup_codes: string[] }> {
    const response = await api.post<{ qr_code: string; backup_codes: string[] }>('/auth/2fa/enable/')
    return response.data!
  }
  
  // 确认两步验证
  async confirmTwoFactor(code: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/2fa/confirm/', { code })
    return response.data!
  }
  
  // 禁用两步验证
  async disableTwoFactor(password: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/2fa/disable/', { password })
    return response.data!
  }
  
  // 生成新的备份码
  async generateBackupCodes(): Promise<{ backup_codes: string[] }> {
    const response = await api.post<{ backup_codes: string[] }>('/auth/2fa/backup-codes/')
    return response.data!
  }
  
  // 获取安全设置
  async getSecuritySettings(): Promise<SecuritySettings> {
    const response = await api.get<SecuritySettings>('/auth/security/')
    return response.data!
  }
  
  // 获取活跃会话
  async getActiveSessions(): Promise<ActiveSession[]> {
    const response = await api.get<ActiveSession[]>('/auth/sessions/')
    return response.data!
  }
  
  // 终止会话
  async terminateSession(sessionId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/auth/sessions/${sessionId}/`)
    return response.data!
  }
  
  // 终止所有其他会话
  async terminateAllOtherSessions(): Promise<{ message: string; terminated_count: number }> {
    const response = await api.post<{ message: string; terminated_count: number }>('/auth/sessions/terminate-others/')
    return response.data!
  }
  
  // 获取用户统计信息
  async getUserStats(userId?: string): Promise<UserStats> {
    const url = userId ? `/users/${userId}/stats/` : '/auth/stats/'
    const response = await api.get<UserStats>(url)
    return response.data!
  }
  
  // 搜索用户
  async searchUsers(params: SearchParams & PaginationParams): Promise<UserSearchResult> {
    const response = await api.get<UserSearchResult>('/users/search/', { params })
    return response.data!
  }
  
  // 获取用户列表
  async getUsers(params?: PaginationParams & {
    verified?: boolean
    active?: boolean
    sort_by?: 'username' | 'date_joined' | 'last_login' | 'followers_count'
    order?: 'asc' | 'desc'
  }): Promise<UserSearchResult> {
    const response = await api.get<UserSearchResult>('/users/', { params })
    return response.data!
  }
  
  // 获取推荐用户
  async getRecommendedUsers(params?: PaginationParams): Promise<UserSearchResult> {
    const response = await api.get<UserSearchResult>('/users/recommended/', { params })
    return response.data!
  }
  
  // 关注用户
  async followUser(userId: string): Promise<FollowResponse> {
    const response = await api.post<FollowResponse>(`/users/${userId}/follow/`)
    return response.data!
  }
  
  // 取消关注用户
  async unfollowUser(userId: string): Promise<FollowResponse> {
    const response = await api.delete<FollowResponse>(`/users/${userId}/follow/`)
    return response.data!
  }
  
  // 获取关注者列表
  async getFollowers(userId: string, params?: PaginationParams): Promise<UserSearchResult> {
    const response = await api.get<UserSearchResult>(`/users/${userId}/followers/`, { params })
    return response.data!
  }
  
  // 获取关注列表
  async getFollowing(userId: string, params?: PaginationParams): Promise<UserSearchResult> {
    const response = await api.get<UserSearchResult>(`/users/${userId}/following/`, { params })
    return response.data!
  }
  
  // 屏蔽用户
  async blockUser(userId: string): Promise<BlockResponse> {
    const response = await api.post<BlockResponse>(`/users/${userId}/block/`)
    return response.data!
  }
  
  // 取消屏蔽用户
  async unblockUser(userId: string): Promise<BlockResponse> {
    const response = await api.delete<BlockResponse>(`/users/${userId}/block/`)
    return response.data!
  }
  
  // 获取屏蔽列表
  async getBlockedUsers(params?: PaginationParams): Promise<UserSearchResult> {
    const response = await api.get<UserSearchResult>('/auth/blocked/', { params })
    return response.data!
  }
  
  // 静音用户
  async muteUser(userId: string): Promise<MuteResponse> {
    const response = await api.post<MuteResponse>(`/users/${userId}/mute/`)
    return response.data!
  }
  
  // 取消静音用户
  async unmuteUser(userId: string): Promise<MuteResponse> {
    const response = await api.delete<MuteResponse>(`/users/${userId}/mute/`)
    return response.data!
  }
  
  // 获取静音列表
  async getMutedUsers(params?: PaginationParams): Promise<UserSearchResult> {
    const response = await api.get<UserSearchResult>('/auth/muted/', { params })
    return response.data!
  }
  
  // 举报用户
  async reportUser(userId: string, reason: string, description?: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/users/${userId}/report/`, {
      reason,
      description
    })
    return response.data!
  }
  
  // 删除账户
  async deleteAccount(password: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/delete-account/', { password })
    return response.data!
  }
  
  // 导出用户数据
  async exportUserData(): Promise<{ download_url: string; expires_at: string }> {
    const response = await api.post<{ download_url: string; expires_at: string }>('/auth/export-data/')
    return response.data!
  }
  
  // 检查用户名可用性
  async checkUsernameAvailability(username: string): Promise<{ available: boolean; suggestions?: string[] }> {
    const response = await api.get<{ available: boolean; suggestions?: string[] }>('/auth/check-username/', {
      params: { username }
    })
    return response.data!
  }
  
  // 检查邮箱可用性
  async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    const response = await api.get<{ available: boolean }>('/auth/check-email/', {
      params: { email }
    })
    return response.data!
  }
  
  // 获取用户活动日志
  async getUserActivityLog(params?: PaginationParams & {
    action_type?: string
    date_from?: string
    date_to?: string
  }): Promise<{
    results: Array<{
      id: string
      action_type: string
      description: string
      ip_address: string
      user_agent: string
      created_at: string
      metadata?: Record<string, any>
    }>
    total: number
    page: number
    page_size: number
    has_more: boolean
  }> {
    const response = await api.get('/auth/activity-log/', { params })
    return response.data!
  }
  
  // 获取登录历史
  async getLoginHistory(params?: PaginationParams): Promise<{
    results: Array<{
      id: string
      ip_address: string
      user_agent: string
      location?: string
      success: boolean
      failure_reason?: string
      created_at: string
    }>
    total: number
    page: number
    page_size: number
    has_more: boolean
  }> {
    const response = await api.get('/auth/login-history/', { params })
    return response.data!
  }
}

// 创建并导出服务实例
export const authService = new AuthService()
export default authService