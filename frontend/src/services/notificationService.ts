import { api } from './api'
import type {
  Notification,
  NotificationsResponse,
  NotificationStats,
  NotificationSettings,
  NotificationFilters,
  NotificationBatchOperation,
  NotificationBatchResponse,
  NotificationTemplate,
  PushSubscription,
  NotificationChannel,
  NotificationQueueStatus,
  NotificationAnalytics,
  PaginationParams
} from '../types'

/**
 * 通知服务类
 * 处理通知的获取、标记、设置等功能
 */
class NotificationService {
  // 获取通知列表
  async getNotifications(params?: PaginationParams & NotificationFilters & {
    sort_by?: 'latest' | 'oldest' | 'priority' | 'type'
  }): Promise<NotificationsResponse> {
    const response = await api.get<NotificationsResponse>('/notifications/', { params })
    return response.data!
  }
  
  // 获取单个通知
  async getNotification(notificationId: string): Promise<Notification> {
    const response = await api.get<Notification>(`/notifications/${notificationId}/`)
    return response.data!
  }
  
  // 获取未读通知数量
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get<{ count: number }>('/notifications/unread-count/')
    return response.data!
  }
  
  // 获取通知统计信息
  async getNotificationStats(): Promise<NotificationStats> {
    const response = await api.get<NotificationStats>('/notifications/stats/')
    return response.data!
  }
  
  // 标记通知为已读
  async markAsRead(notificationId: string): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>(`/notifications/${notificationId}/`, {
      status: 'read'
    })
    return response.data!
  }
  
  // 标记通知为未读
  async markAsUnread(notificationId: string): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>(`/notifications/${notificationId}/`, {
      status: 'unread'
    })
    return response.data!
  }
  
  // 标记所有通知为已读
  async markAllAsRead(): Promise<{ message: string; count: number }> {
    const response = await api.post<{ message: string; count: number }>('/notifications/mark-all-read/')
    return response.data!
  }
  
  // 归档通知
  async archiveNotification(notificationId: string): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>(`/notifications/${notificationId}/`, {
      status: 'archived'
    })
    return response.data!
  }
  
  // 删除通知
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}/`)
  }
  
  // 批量操作通知
  async batchOperation(operation: NotificationBatchOperation): Promise<NotificationBatchResponse> {
    const response = await api.post<NotificationBatchResponse>('/notifications/batch/', operation)
    return response.data!
  }
  
  // 清空所有通知
  async clearAllNotifications(): Promise<{ message: string; count: number }> {
    const response = await api.delete<{ message: string; count: number }>('/notifications/clear-all/')
    return response.data!
  }
  
  // 获取通知设置
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await api.get<NotificationSettings>('/notifications/settings/')
    return response.data!
  }
  
  // 更新通知设置
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await api.patch<NotificationSettings>('/notifications/settings/', settings)
    return response.data!
  }
  
  // 测试通知设置
  async testNotificationSettings(type: 'email' | 'push' | 'sms'): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/notifications/test/', { type })
    return response.data!
  }
  
  // 订阅推送通知
  async subscribePush(subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }): Promise<PushSubscription> {
    const response = await api.post<PushSubscription>('/notifications/push/subscribe/', subscription)
    return response.data!
  }
  
  // 取消推送通知订阅
  async unsubscribePush(subscriptionId?: string): Promise<{ message: string }> {
    const url = subscriptionId 
      ? `/notifications/push/unsubscribe/${subscriptionId}/`
      : '/notifications/push/unsubscribe/'
    const response = await api.delete<{ message: string }>(url)
    return response.data!
  }
  
  // 获取推送订阅列表
  async getPushSubscriptions(): Promise<PushSubscription[]> {
    const response = await api.get<PushSubscription[]>('/notifications/push/subscriptions/')
    return response.data!
  }
  
  // 更新推送订阅
  async updatePushSubscription(subscriptionId: string, data: Partial<PushSubscription>): Promise<PushSubscription> {
    const response = await api.patch<PushSubscription>(`/notifications/push/subscriptions/${subscriptionId}/`, data)
    return response.data!
  }
  
  // 发送测试推送
  async sendTestPush(subscriptionId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/notifications/push/test/${subscriptionId}/`)
    return response.data!
  }
  
  // 获取通知模板列表
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    const response = await api.get<NotificationTemplate[]>('/notifications/templates/')
    return response.data!
  }
  
  // 获取单个通知模板
  async getNotificationTemplate(templateId: string): Promise<NotificationTemplate> {
    const response = await api.get<NotificationTemplate>(`/notifications/templates/${templateId}/`)
    return response.data!
  }
  
  // 创建通知模板（管理员功能）
  async createNotificationTemplate(template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<NotificationTemplate> {
    const response = await api.post<NotificationTemplate>('/notifications/templates/', template)
    return response.data!
  }
  
  // 更新通知模板（管理员功能）
  async updateNotificationTemplate(templateId: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const response = await api.patch<NotificationTemplate>(`/notifications/templates/${templateId}/`, template)
    return response.data!
  }
  
  // 删除通知模板（管理员功能）
  async deleteNotificationTemplate(templateId: string): Promise<void> {
    await api.delete(`/notifications/templates/${templateId}/`)
  }
  
  // 获取通知渠道列表（管理员功能）
  async getNotificationChannels(): Promise<NotificationChannel[]> {
    const response = await api.get<NotificationChannel[]>('/notifications/channels/')
    return response.data!
  }
  
  // 创建通知渠道（管理员功能）
  async createNotificationChannel(channel: Omit<NotificationChannel, 'id' | 'created_at' | 'updated_at'>): Promise<NotificationChannel> {
    const response = await api.post<NotificationChannel>('/notifications/channels/', channel)
    return response.data!
  }
  
  // 更新通知渠道（管理员功能）
  async updateNotificationChannel(channelId: string, channel: Partial<NotificationChannel>): Promise<NotificationChannel> {
    const response = await api.patch<NotificationChannel>(`/notifications/channels/${channelId}/`, channel)
    return response.data!
  }
  
  // 删除通知渠道（管理员功能）
  async deleteNotificationChannel(channelId: string): Promise<void> {
    await api.delete(`/notifications/channels/${channelId}/`)
  }
  
  // 测试通知渠道（管理员功能）
  async testNotificationChannel(channelId: string): Promise<{ message: string; success: boolean }> {
    const response = await api.post<{ message: string; success: boolean }>(`/notifications/channels/${channelId}/test/`)
    return response.data!
  }
  
  // 获取通知队列状态（管理员功能）
  async getNotificationQueueStatus(): Promise<NotificationQueueStatus> {
    const response = await api.get<NotificationQueueStatus>('/notifications/queue/status/')
    return response.data!
  }
  
  // 重试失败的通知（管理员功能）
  async retryFailedNotifications(): Promise<{ message: string; retry_count: number }> {
    const response = await api.post<{ message: string; retry_count: number }>('/notifications/queue/retry/')
    return response.data!
  }
  
  // 清空通知队列（管理员功能）
  async clearNotificationQueue(): Promise<{ message: string; cleared_count: number }> {
    const response = await api.delete<{ message: string; cleared_count: number }>('/notifications/queue/clear/')
    return response.data!
  }
  
  // 获取通知分析数据（管理员功能）
  async getNotificationAnalytics(params?: {
    date_from?: string
    date_to?: string
    type?: string
    channel?: string
  }): Promise<NotificationAnalytics> {
    const response = await api.get<NotificationAnalytics>('/notifications/analytics/', { params })
    return response.data!
  }
  
  // 导出通知数据
  async exportNotifications(params?: {
    format?: 'csv' | 'json' | 'xlsx'
    date_from?: string
    date_to?: string
    types?: string[]
    status?: string[]
  }): Promise<{ download_url: string; expires_at: string }> {
    const response = await api.post<{ download_url: string; expires_at: string }>('/notifications/export/', params)
    return response.data!
  }
  
  // 获取通知偏好设置
  async getNotificationPreferences(): Promise<{
    email_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never'
    push_frequency: 'immediate' | 'hourly' | 'daily' | 'never'
    digest_enabled: boolean
    digest_frequency: 'daily' | 'weekly'
    digest_time: string // HH:MM format
    quiet_hours: {
      enabled: boolean
      start_time: string
      end_time: string
      timezone: string
    }
    keywords_filter: {
      enabled: boolean
      keywords: string[]
      action: 'block' | 'highlight'
    }
  }> {
    const response = await api.get('/notifications/preferences/')
    return response.data!
  }
  
  // 更新通知偏好设置
  async updateNotificationPreferences(preferences: any): Promise<any> {
    const response = await api.patch('/notifications/preferences/', preferences)
    return response.data!
  }
  
  // 获取通知摘要
  async getNotificationDigest(type: 'daily' | 'weekly'): Promise<{
    period: string
    summary: {
      total_notifications: number
      unread_notifications: number
      top_interactions: Array<{
        type: string
        count: number
        users: any[]
      }>
      trending_content: any[]
      missed_opportunities: any[]
    }
    notifications: Notification[]
  }> {
    const response = await api.get(`/notifications/digest/${type}/`)
    return response.data!
  }
  
  // 手动触发通知摘要
  async triggerNotificationDigest(type: 'daily' | 'weekly'): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/notifications/digest/${type}/trigger/`)
    return response.data!
  }
  
  // 获取实时通知（WebSocket连接信息）
  async getRealtimeConnectionInfo(): Promise<{
    websocket_url: string
    auth_token: string
    channels: string[]
  }> {
    const response = await api.get('/notifications/realtime/connection/')
    return response.data!
  }
  
  // 订阅实时通知频道
  async subscribeRealtimeChannel(channel: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/notifications/realtime/subscribe/', { channel })
    return response.data!
  }
  
  // 取消订阅实时通知频道
  async unsubscribeRealtimeChannel(channel: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/notifications/realtime/unsubscribe/', { channel })
    return response.data!
  }
  
  // 获取通知历史记录
  async getNotificationHistory(params?: PaginationParams & {
    action_type?: 'sent' | 'delivered' | 'read' | 'clicked' | 'failed'
    date_from?: string
    date_to?: string
  }): Promise<{
    results: Array<{
      id: string
      notification_id: string
      action_type: string
      timestamp: string
      metadata?: Record<string, any>
    }>
    total: number
    page: number
    page_size: number
    has_more: boolean
  }> {
    const response = await api.get('/notifications/history/', { params })
    return response.data!
  }
}

// 创建并导出服务实例
export const notificationService = new NotificationService()
export default notificationService