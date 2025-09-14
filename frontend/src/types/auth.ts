// 用户基础信息
export interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  avatar?: string
  is_verified: boolean
  is_active: boolean
  date_joined: string
  last_login?: string
  
  // 社交相关字段
  followers_count: number
  following_count: number
  posts_count: number
  is_following?: boolean
  is_followed_by?: boolean
  is_blocked?: boolean
  is_muted?: boolean
}

// 用户详细资料
export interface UserProfile extends User {
  bio?: string
  location?: string
  website?: string
  birth_date?: string
  phone_number?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  privacy_settings: {
    profile_visibility: 'public' | 'followers' | 'private'
    email_visibility: 'public' | 'followers' | 'private'
    phone_visibility: 'public' | 'followers' | 'private'
    birth_date_visibility: 'public' | 'followers' | 'private'
    allow_messages_from: 'everyone' | 'followers' | 'none'
    allow_mentions: boolean
    allow_tags: boolean
  }
  notification_settings: {
    email_notifications: boolean
    push_notifications: boolean
    sms_notifications: boolean
    marketing_emails: boolean
    security_alerts: boolean
    
    // 具体通知类型
    likes: boolean
    comments: boolean
    follows: boolean
    mentions: boolean
    messages: boolean
    posts_from_following: boolean
    
    // 免打扰时间
    quiet_hours_enabled: boolean
    quiet_hours_start?: string // HH:MM 格式
    quiet_hours_end?: string   // HH:MM 格式
  }
  created_at: string
  updated_at: string
}

// 登录凭据
export interface LoginCredentials {
  username: string
  password: string
  remember_me?: boolean
}

// 注册数据
export interface RegisterData {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  terms_accepted: boolean
  privacy_accepted: boolean
}

// 认证响应
export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

// 令牌刷新响应
export interface TokenRefreshResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

// 密码重置请求
export interface PasswordResetRequest {
  email: string
}

// 密码重置确认
export interface PasswordResetConfirm {
  token: string
  new_password: string
  new_password_confirm: string
}

// 密码修改
export interface PasswordChange {
  old_password: string
  new_password: string
  new_password_confirm: string
}

// 用户设置更新
export interface UserSettingsUpdate {
  privacy_settings?: Partial<UserProfile['privacy_settings']>
  notification_settings?: Partial<UserProfile['notification_settings']>
}

// 用户资料更新
export interface UserProfileUpdate {
  first_name?: string
  last_name?: string
  bio?: string
  location?: string
  website?: string
  birth_date?: string
  phone_number?: string
  gender?: UserProfile['gender']
}

// 用户统计信息
export interface UserStats {
  posts_count: number
  followers_count: number
  following_count: number
  likes_received: number
  comments_received: number
  profile_views: number
  join_date: string
  last_active: string
}

// 用户搜索结果
export interface UserSearchResult {
  users: User[]
  total: number
  page: number
  has_more: boolean
}

// 关注/取消关注响应
export interface FollowResponse {
  is_following: boolean
  followers_count: number
  following_count: number
}

// 屏蔽/取消屏蔽响应
export interface BlockResponse {
  is_blocked: boolean
}

// 静音/取消静音响应
export interface MuteResponse {
  is_muted: boolean
}

// 用户验证状态
export interface VerificationStatus {
  email_verified: boolean
  phone_verified: boolean
  identity_verified: boolean
}

// 账户安全设置
export interface SecuritySettings {
  two_factor_enabled: boolean
  login_alerts: boolean
  suspicious_activity_alerts: boolean
  active_sessions: ActiveSession[]
}

// 活跃会话
export interface ActiveSession {
  id: string
  device: string
  browser: string
  ip_address: string
  location: string
  last_activity: string
  is_current: boolean
}

// API 错误响应
export interface AuthError {
  message: string
  code: string
  field?: string
  details?: Record<string, string[]>
}