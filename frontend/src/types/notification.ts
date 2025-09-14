import type { User } from './auth'
import type { Post, Comment } from './post'

// 通知类型
export type NotificationType = 
  | 'like'
  | 'comment'
  | 'follow'
  | 'mention'
  | 'repost'
  | 'bookmark'
  | 'reply'
  | 'message'
  | 'system'
  | 'security'
  | 'achievement'
  | 'reminder'

// 通知优先级
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

// 通知状态
export type NotificationStatus = 'unread' | 'read' | 'archived'

// 基础通知接口
export interface BaseNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  status: NotificationStatus
  created_at: string
  read_at?: string
  archived_at?: string
  
  // 相关数据
  actor?: User // 触发通知的用户
  target_user: string // 接收通知的用户ID
  
  // 操作链接
  action_url?: string
  action_text?: string
  
  // 元数据
  metadata?: Record<string, any>
}

// 点赞通知
export interface LikeNotification extends BaseNotification {
  type: 'like'
  post: Post
  actor: User
}

// 评论通知
export interface CommentNotification extends BaseNotification {
  type: 'comment'
  post: Post
  comment: Comment
  actor: User
}

// 关注通知
export interface FollowNotification extends BaseNotification {
  type: 'follow'
  actor: User
}

// 提及通知
export interface MentionNotification extends BaseNotification {
  type: 'mention'
  post?: Post
  comment?: Comment
  actor: User
}

// 转发通知
export interface RepostNotification extends BaseNotification {
  type: 'repost'
  post: Post
  repost: Post
  actor: User
}

// 收藏通知
export interface BookmarkNotification extends BaseNotification {
  type: 'bookmark'
  post: Post
  actor: User
}

// 回复通知
export interface ReplyNotification extends BaseNotification {
  type: 'reply'
  post: Post
  comment: Comment
  parent_comment?: Comment
  actor: User
}

// 消息通知
export interface MessageNotification extends BaseNotification {
  type: 'message'
  conversation_id: string
  message_preview: string
  actor: User
}

// 系统通知
export interface SystemNotification extends BaseNotification {
  type: 'system'
  category: 'maintenance' | 'feature' | 'policy' | 'announcement'
  icon?: string
}

// 安全通知
export interface SecurityNotification extends BaseNotification {
  type: 'security'
  category: 'login' | 'password_change' | 'suspicious_activity' | 'device_added'
  ip_address?: string
  device?: string
  location?: string
}

// 成就通知
export interface AchievementNotification extends BaseNotification {
  type: 'achievement'
  achievement: {
    id: string
    name: string
    description: string
    icon: string
    badge_url?: string
  }
}

// 提醒通知
export interface ReminderNotification extends BaseNotification {
  type: 'reminder'
  reminder_type: 'post_draft' | 'scheduled_post' | 'birthday' | 'anniversary'
  due_date?: string
}

// 联合通知类型
export type Notification = 
  | LikeNotification
  | CommentNotification
  | FollowNotification
  | MentionNotification
  | RepostNotification
  | BookmarkNotification
  | ReplyNotification
  | MessageNotification
  | SystemNotification
  | SecurityNotification
  | AchievementNotification
  | ReminderNotification

// 通知列表响应
export interface NotificationsResponse {
  results: Notification[]
  total: number
  unread_count: number
  page: number
  page_size: number
  has_more: boolean
}

// 通知统计
export interface NotificationStats {
  total: number
  unread: number
  by_type: Record<NotificationType, number>
  by_priority: Record<NotificationPriority, number>
  today: number
  this_week: number
  this_month: number
}

// 通知设置
export interface NotificationSettings {
  // 全局设置
  enabled: boolean
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  
  // 免打扰时间
  quiet_hours_enabled: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string
  
  // 按类型设置
  types: Record<NotificationType, {
    enabled: boolean
    email: boolean
    push: boolean
    sms: boolean
    priority: NotificationPriority
  }>
  
  // 频率限制
  frequency_limits: {
    max_per_hour: number
    max_per_day: number
    batch_similar: boolean
    batch_delay_minutes: number
  }
  
  // 过滤设置
  filters: {
    only_from_following: boolean
    block_spam: boolean
    minimum_follower_count: number
    keywords_blacklist: string[]
  }
}

// 通知过滤器
export interface NotificationFilters {
  types?: NotificationType[]
  status?: NotificationStatus[]
  priority?: NotificationPriority[]
  date_from?: string
  date_to?: string
  actor_id?: string
  unread_only?: boolean
}

// 通知排序选项
export type NotificationSortOption = 
  | 'latest'
  | 'oldest'
  | 'priority'
  | 'type'
  | 'unread_first'

// 批量操作
export interface NotificationBatchOperation {
  notification_ids: string[]
  action: 'mark_read' | 'mark_unread' | 'archive' | 'delete'
}

// 批量操作响应
export interface NotificationBatchResponse {
  success_count: number
  failed_count: number
  errors?: string[]
}

// 通知模板
export interface NotificationTemplate {
  id: string
  type: NotificationType
  title_template: string
  message_template: string
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// 推送订阅
export interface PushSubscription {
  id: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  user_agent: string
  is_active: boolean
  created_at: string
  last_used: string
}

// 通知渠道
export interface NotificationChannel {
  id: string
  name: string
  type: 'email' | 'push' | 'sms' | 'webhook'
  config: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

// 通知队列状态
export interface NotificationQueueStatus {
  pending: number
  processing: number
  failed: number
  completed: number
  retry_count: number
  next_retry?: string
}

// 通知分析数据
export interface NotificationAnalytics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  delivery_rate: number
  open_rate: number
  click_rate: number
  by_type: Record<NotificationType, {
    sent: number
    delivered: number
    opened: number
    clicked: number
  }>
  by_channel: Record<string, {
    sent: number
    delivered: number
    opened: number
    clicked: number
  }>
  time_series: {
    timestamp: string
    sent: number
    delivered: number
    opened: number
    clicked: number
  }[]
}