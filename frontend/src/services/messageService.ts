import { api } from './api'
import type {
  Message,
  Conversation,
  ConversationParticipant,
  MessagesResponse,
  ConversationsResponse,
  CreateMessageData,
  UpdateMessageData,
  CreateConversationData,
  UpdateConversationData,
  MessageFilters,
  ConversationFilters,
  MessageStats,
  ConversationStats,
  OnlineStatus,
  TypingStatus,
  MessageReaction,
  Emoji,
  FileUploadProgress,
  MessageEncryption,
  MessageBackup,
  WebSocketEvent,
  MessageDeliveryStatus,
  ConversationInvite,
  PaginationParams
} from '../types'

/**
 * 消息服务类
 * 处理私信、群聊等消息功能
 */
class MessageService {
  // 获取会话列表
  async getConversations(params?: PaginationParams & ConversationFilters & {
    sort_by?: 'latest' | 'oldest' | 'unread' | 'name'
  }): Promise<ConversationsResponse> {
    const response = await api.get<ConversationsResponse>('/conversations/', { params })
    return response.data!
  }
  
  // 获取单个会话
  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await api.get<Conversation>(`/conversations/${conversationId}/`)
    return response.data!
  }
  
  // 创建会话
  async createConversation(data: CreateConversationData): Promise<Conversation> {
    const response = await api.post<Conversation>('/conversations/', data)
    return response.data!
  }
  
  // 更新会话
  async updateConversation(conversationId: string, data: UpdateConversationData): Promise<Conversation> {
    const response = await api.patch<Conversation>(`/conversations/${conversationId}/`, data)
    return response.data!
  }
  
  // 删除会话
  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/conversations/${conversationId}/`)
  }
  
  // 离开会话
  async leaveConversation(conversationId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/conversations/${conversationId}/leave/`)
    return response.data!
  }
  
  // 归档会话
  async archiveConversation(conversationId: string): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>(`/conversations/${conversationId}/`, {
      is_archived: true
    })
    return response.data!
  }
  
  // 取消归档会话
  async unarchiveConversation(conversationId: string): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>(`/conversations/${conversationId}/`, {
      is_archived: false
    })
    return response.data!
  }
  
  // 静音会话
  async muteConversation(conversationId: string, duration?: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/conversations/${conversationId}/mute/`, {
      duration // 静音时长（分钟），不传则永久静音
    })
    return response.data!
  }
  
  // 取消静音会话
  async unmuteConversation(conversationId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/conversations/${conversationId}/unmute/`)
    return response.data!
  }
  
  // 标记会话为已读
  async markConversationAsRead(conversationId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/conversations/${conversationId}/mark-read/`)
    return response.data!
  }
  
  // 获取会话参与者
  async getConversationParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    const response = await api.get<ConversationParticipant[]>(`/conversations/${conversationId}/participants/`)
    return response.data!
  }
  
  // 添加会话参与者
  async addConversationParticipants(conversationId: string, userIds: string[]): Promise<{ message: string; added_participants: ConversationParticipant[] }> {
    const response = await api.post<{ message: string; added_participants: ConversationParticipant[] }>(
      `/conversations/${conversationId}/participants/`,
      { user_ids: userIds }
    )
    return response.data!
  }
  
  // 移除会话参与者
  async removeConversationParticipant(conversationId: string, userId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/conversations/${conversationId}/participants/${userId}/`)
    return response.data!
  }
  
  // 更新参与者角色
  async updateParticipantRole(conversationId: string, userId: string, role: 'admin' | 'member'): Promise<ConversationParticipant> {
    const response = await api.patch<ConversationParticipant>(
      `/conversations/${conversationId}/participants/${userId}/`,
      { role }
    )
    return response.data!
  }
  
  // 获取消息列表
  async getMessages(conversationId: string, params?: PaginationParams & MessageFilters & {
    sort_by?: 'latest' | 'oldest'
    before_message_id?: string
    after_message_id?: string
  }): Promise<MessagesResponse> {
    const response = await api.get<MessagesResponse>(`/conversations/${conversationId}/messages/`, { params })
    return response.data!
  }
  
  // 获取单个消息
  async getMessage(conversationId: string, messageId: string): Promise<Message> {
    const response = await api.get<Message>(`/conversations/${conversationId}/messages/${messageId}/`)
    return response.data!
  }
  
  // 发送消息
  async sendMessage(conversationId: string, data: CreateMessageData): Promise<Message> {
    const response = await api.post<Message>(`/conversations/${conversationId}/messages/`, data)
    return response.data!
  }
  
  // 更新消息
  async updateMessage(conversationId: string, messageId: string, data: UpdateMessageData): Promise<Message> {
    const response = await api.patch<Message>(`/conversations/${conversationId}/messages/${messageId}/`, data)
    return response.data!
  }
  
  // 删除消息
  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await api.delete(`/conversations/${conversationId}/messages/${messageId}/`)
  }
  
  // 撤回消息
  async recallMessage(conversationId: string, messageId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/conversations/${conversationId}/messages/${messageId}/recall/`)
    return response.data!
  }
  
  // 转发消息
  async forwardMessage(messageId: string, conversationIds: string[]): Promise<{ message: string; forwarded_messages: Message[] }> {
    const response = await api.post<{ message: string; forwarded_messages: Message[] }>(
      `/messages/${messageId}/forward/`,
      { conversation_ids: conversationIds }
    )
    return response.data!
  }
  
  // 标记消息为已读
  async markMessageAsRead(conversationId: string, messageId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/conversations/${conversationId}/messages/${messageId}/read/`)
    return response.data!
  }
  
  // 批量标记消息为已读
  async markMessagesAsRead(conversationId: string, messageIds: string[]): Promise<{ message: string; marked_count: number }> {
    const response = await api.post<{ message: string; marked_count: number }>(
      `/conversations/${conversationId}/messages/mark-read/`,
      { message_ids: messageIds }
    )
    return response.data!
  }
  
  // 搜索消息
  async searchMessages(params: {
    query: string
    conversation_id?: string
    message_type?: string
    date_from?: string
    date_to?: string
    sender_id?: string
  } & PaginationParams): Promise<MessagesResponse> {
    const response = await api.get<MessagesResponse>('/messages/search/', { params })
    return response.data!
  }
  
  // 获取消息统计
  async getMessageStats(conversationId?: string): Promise<MessageStats> {
    const url = conversationId ? `/conversations/${conversationId}/stats/` : '/messages/stats/'
    const response = await api.get<MessageStats>(url)
    return response.data!
  }
  
  // 获取会话统计
  async getConversationStats(): Promise<ConversationStats> {
    const response = await api.get<ConversationStats>('/conversations/stats/')
    return response.data!
  }
  
  // 上传文件
  async uploadFile(file: File, onProgress?: (progress: FileUploadProgress) => void): Promise<{
    file_id: string
    file_url: string
    file_name: string
    file_size: number
    file_type: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/messages/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress: FileUploadProgress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            speed: 0, // 需要计算
            estimated_time: 0 // 需要计算
          }
          onProgress(progress)
        }
      }
    })
    
    return response.data!
  }
  
  // 下载文件
  async downloadFile(fileId: string): Promise<Blob> {
    const response = await api.get(`/messages/files/${fileId}/download/`, {
      responseType: 'blob'
    })
    return response.data!
  }
  
  // 获取文件信息
  async getFileInfo(fileId: string): Promise<{
    file_id: string
    file_name: string
    file_size: number
    file_type: string
    upload_date: string
    download_count: number
  }> {
    const response = await api.get(`/messages/files/${fileId}/`)
    return response.data!
  }
  
  // 删除文件
  async deleteFile(fileId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/messages/files/${fileId}/`)
    return response.data!
  }
  
  // 添加消息反应
  async addMessageReaction(conversationId: string, messageId: string, emoji: string): Promise<MessageReaction> {
    const response = await api.post<MessageReaction>(
      `/conversations/${conversationId}/messages/${messageId}/reactions/`,
      { emoji }
    )
    return response.data!
  }
  
  // 移除消息反应
  async removeMessageReaction(conversationId: string, messageId: string, reactionId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/conversations/${conversationId}/messages/${messageId}/reactions/${reactionId}/`
    )
    return response.data!
  }
  
  // 获取消息反应列表
  async getMessageReactions(conversationId: string, messageId: string): Promise<MessageReaction[]> {
    const response = await api.get<MessageReaction[]>(
      `/conversations/${conversationId}/messages/${messageId}/reactions/`
    )
    return response.data!
  }
  
  // 获取表情包列表
  async getEmojis(): Promise<Emoji[]> {
    const response = await api.get<Emoji[]>('/messages/emojis/')
    return response.data!
  }
  
  // 上传自定义表情包
  async uploadCustomEmoji(file: File, name: string): Promise<Emoji> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)
    
    const response = await api.post<Emoji>('/messages/emojis/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data!
  }
  
  // 删除自定义表情包
  async deleteCustomEmoji(emojiId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/messages/emojis/${emojiId}/`)
    return response.data!
  }
  
  // 发送输入状态
  async sendTypingStatus(conversationId: string, isTyping: boolean): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/conversations/${conversationId}/typing/`,
      { is_typing: isTyping }
    )
    return response.data!
  }
  
  // 获取在线状态
  async getOnlineStatus(userIds: string[]): Promise<OnlineStatus[]> {
    const response = await api.post<OnlineStatus[]>('/users/online-status/', { user_ids: userIds })
    return response.data!
  }
  
  // 更新在线状态
  async updateOnlineStatus(status: 'online' | 'away' | 'busy' | 'invisible'): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>('/users/online-status/', { status })
    return response.data!
  }
  
  // 获取消息传递状态
  async getMessageDeliveryStatus(messageId: string): Promise<MessageDeliveryStatus[]> {
    const response = await api.get<MessageDeliveryStatus[]>(`/messages/${messageId}/delivery-status/`)
    return response.data!
  }
  
  // 创建会话邀请
  async createConversationInvite(conversationId: string, data: {
    expires_at?: string
    max_uses?: number
    message?: string
  }): Promise<ConversationInvite> {
    const response = await api.post<ConversationInvite>(`/conversations/${conversationId}/invites/`, data)
    return response.data!
  }
  
  // 获取会话邀请列表
  async getConversationInvites(conversationId: string): Promise<ConversationInvite[]> {
    const response = await api.get<ConversationInvite[]>(`/conversations/${conversationId}/invites/`)
    return response.data!
  }
  
  // 使用邀请加入会话
  async joinConversationByInvite(inviteCode: string): Promise<{ message: string; conversation: Conversation }> {
    const response = await api.post<{ message: string; conversation: Conversation }>(
      '/conversations/join/',
      { invite_code: inviteCode }
    )
    return response.data!
  }
  
  // 撤销会话邀请
  async revokeConversationInvite(conversationId: string, inviteId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/conversations/${conversationId}/invites/${inviteId}/`)
    return response.data!
  }
  
  // 获取消息加密信息
  async getMessageEncryption(conversationId: string): Promise<MessageEncryption> {
    const response = await api.get<MessageEncryption>(`/conversations/${conversationId}/encryption/`)
    return response.data!
  }
  
  // 启用端到端加密
  async enableEndToEndEncryption(conversationId: string, publicKey: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/conversations/${conversationId}/encryption/enable/`,
      { public_key: publicKey }
    )
    return response.data!
  }
  
  // 禁用端到端加密
  async disableEndToEndEncryption(conversationId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/conversations/${conversationId}/encryption/disable/`)
    return response.data!
  }
  
  // 备份消息
  async backupMessages(conversationId?: string): Promise<MessageBackup> {
    const url = conversationId ? `/conversations/${conversationId}/backup/` : '/messages/backup/'
    const response = await api.post<MessageBackup>(url)
    return response.data!
  }
  
  // 获取备份列表
  async getMessageBackups(): Promise<MessageBackup[]> {
    const response = await api.get<MessageBackup[]>('/messages/backups/')
    return response.data!
  }
  
  // 恢复消息
  async restoreMessages(backupId: string): Promise<{ message: string; restored_count: number }> {
    const response = await api.post<{ message: string; restored_count: number }>(`/messages/backups/${backupId}/restore/`)
    return response.data!
  }
  
  // 下载备份
  async downloadBackup(backupId: string): Promise<Blob> {
    const response = await api.get(`/messages/backups/${backupId}/download/`, {
      responseType: 'blob'
    })
    return response.data!
  }
  
  // 删除备份
  async deleteBackup(backupId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/messages/backups/${backupId}/`)
    return response.data!
  }
  
  // 获取WebSocket连接信息
  async getWebSocketConnectionInfo(): Promise<{
    websocket_url: string
    auth_token: string
    channels: string[]
  }> {
    const response = await api.get('/messages/websocket/connection/')
    return response.data!
  }
  
  // 订阅WebSocket频道
  async subscribeWebSocketChannel(channel: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/messages/websocket/subscribe/', { channel })
    return response.data!
  }
  
  // 取消订阅WebSocket频道
  async unsubscribeWebSocketChannel(channel: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/messages/websocket/unsubscribe/', { channel })
    return response.data!
  }
  
  // 导出会话数据
  async exportConversation(conversationId: string, format: 'json' | 'csv' | 'txt' = 'json'): Promise<{
    download_url: string
    expires_at: string
  }> {
    const response = await api.post<{ download_url: string; expires_at: string }>(
      `/conversations/${conversationId}/export/`,
      { format }
    )
    return response.data!
  }
  
  // 导入会话数据
  async importConversation(file: File): Promise<{ message: string; conversation: Conversation }> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post<{ message: string; conversation: Conversation }>(
      '/conversations/import/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data!
  }
}

// 创建并导出服务实例
export const messageService = new MessageService()
export default messageService