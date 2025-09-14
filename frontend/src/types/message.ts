import type { User } from './auth'
import type { MediaFile } from './post'

// 消息类型
export type MessageType = 
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'location'
  | 'contact'
  | 'sticker'
  | 'gif'
  | 'system'

// 消息状态
export type MessageStatus = 
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'

// 会话类型
export type ConversationType = 'direct' | 'group'

// 会话状态
export type ConversationStatus = 'active' | 'archived' | 'muted' | 'blocked'

// 消息
export interface Message {
  id: string
  conversation_id: string
  sender: User
  type: MessageType
  content: string
  media_files?: MediaFile[]
  
  // 回复消息
  reply_to?: Message
  
  // 转发消息
  forwarded_from?: {
    original_sender: User
    original_conversation_id: string
  }
  
  // 消息状态
  status: MessageStatus
  is_edited: boolean
  is_deleted: boolean
  
  // 特殊消息内容
  location?: {
    latitude: number
    longitude: number
    address?: string
    name?: string
  }
  
  contact?: {
    name: string
    phone?: string
    email?: string
  }
  
  sticker?: {
    id: string
    pack_id: string
    url: string
    alt_text?: string
  }
  
  // 系统消息
  system_message?: {
    type: 'user_joined' | 'user_left' | 'name_changed' | 'avatar_changed' | 'admin_added' | 'admin_removed'
    data?: Record<string, any>
  }
  
  // 时间戳
  created_at: string
  updated_at: string
  delivered_at?: string
  read_at?: string
  
  // 元数据
  metadata?: Record<string, any>
}

// 会话参与者
export interface ConversationParticipant {
  user: User
  role: 'member' | 'admin' | 'owner'
  joined_at: string
  last_read_message_id?: string
  last_read_at?: string
  is_muted: boolean
  notification_settings: {
    mentions_only: boolean
    muted_until?: string
  }
}

// 会话
export interface Conversation {
  id: string
  type: ConversationType
  name?: string // 群聊名称
  description?: string // 群聊描述
  avatar?: string // 群聊头像
  
  // 参与者
  participants: ConversationParticipant[]
  participants_count: number
  
  // 最后一条消息
  last_message?: Message
  last_activity: string
  
  // 未读消息
  unread_count: number
  unread_mentions_count: number
  
  // 会话状态
  status: ConversationStatus
  is_pinned: boolean
  
  // 群聊设置
  settings?: {
    allow_members_to_add_others: boolean
    allow_members_to_change_info: boolean
    message_history_visible_to_new_members: boolean
    auto_delete_messages_after?: number // 天数
  }
  
  // 时间戳
  created_at: string
  updated_at: string
  
  // 创建者（群聊）
  created_by?: User
}

// 创建消息数据
export interface CreateMessageData {
  content: string
  type?: MessageType
  media_files?: File[]
  reply_to_id?: string
  
  // 特殊消息内容
  location?: {
    latitude: number
    longitude: number
    address?: string
    name?: string
  }
  
  contact?: {
    name: string
    phone?: string
    email?: string
  }
  
  sticker_id?: string
}

// 更新消息数据
export interface UpdateMessageData {
  content?: string
}

// 创建会话数据
export interface CreateConversationData {
  type: ConversationType
  participant_ids: string[]
  name?: string
  description?: string
  avatar?: File
}

// 更新会话数据
export interface UpdateConversationData {
  name?: string
  description?: string
  avatar?: File | null
  settings?: Partial<Conversation['settings']>
}

// 会话列表响应
export interface ConversationsResponse {
  results: Conversation[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

// 消息列表响应
export interface MessagesResponse {
  results: Message[]
  total: number
  page: number
  page_size: number
  has_more: boolean
  conversation: Conversation
}

// 消息搜索参数
export interface MessageSearchParams {
  query?: string
  conversation_id?: string
  sender_id?: string
  type?: MessageType
  date_from?: string
  date_to?: string
  has_media?: boolean
  page?: number
  page_size?: number
}

// 消息过滤器
export interface MessageFilters {
  types?: MessageType[]
  status?: MessageStatus[]
  has_media?: boolean
  is_reply?: boolean
  is_forwarded?: boolean
  is_edited?: boolean
  sender_verified?: boolean
}

// 消息排序选项
export type MessageSortOption = 'latest' | 'oldest' | 'relevance'

// 会话过滤器
export interface ConversationFilters {
  type?: ConversationType
  status?: ConversationStatus[]
  has_unread?: boolean
  is_pinned?: boolean
  participant_count_min?: number
  participant_count_max?: number
}

// 会话排序选项
export type ConversationSortOption = 
  | 'last_activity'
  | 'created_at'
  | 'name'
  | 'unread_count'
  | 'participants_count'

// 消息统计
export interface MessageStats {
  total_messages: number
  total_conversations: number
  unread_messages: number
  unread_conversations: number
  today_messages: number
  this_week_messages: number
  this_month_messages: number
  by_type: Record<MessageType, number>
  media_files_count: number
  media_files_size: number
}

// 在线状态
export interface OnlineStatus {
  user_id: string
  is_online: boolean
  last_seen?: string
  status?: 'online' | 'away' | 'busy' | 'invisible'
}

// 输入状态
export interface TypingStatus {
  conversation_id: string
  user: User
  is_typing: boolean
  started_at: string
}

// 消息反应
export interface MessageReaction {
  id: string
  message_id: string
  user: User
  emoji: string
  created_at: string
}

// 消息反应统计
export interface MessageReactionStats {
  message_id: string
  reactions: {
    emoji: string
    count: number
    users: User[]
    user_reacted: boolean
  }[]
  total_reactions: number
}

// 表情包
export interface StickerPack {
  id: string
  name: string
  description?: string
  thumbnail: string
  author: User
  stickers: Sticker[]
  is_premium: boolean
  price?: number
  downloads_count: number
  created_at: string
  updated_at: string
}

// 表情贴纸
export interface Sticker {
  id: string
  pack_id: string
  name: string
  url: string
  thumbnail?: string
  alt_text?: string
  tags: string[]
  order: number
}

// 文件上传进度
export interface FileUploadProgress {
  file_id: string
  file_name: string
  file_size: number
  uploaded_bytes: number
  progress_percentage: number
  status: 'uploading' | 'completed' | 'failed' | 'cancelled'
  error_message?: string
}

// 消息加密信息
export interface MessageEncryption {
  is_encrypted: boolean
  encryption_key_id?: string
  algorithm?: string
}

// 消息备份
export interface MessageBackup {
  id: string
  conversation_id: string
  backup_type: 'manual' | 'automatic'
  file_url: string
  file_size: number
  messages_count: number
  date_from: string
  date_to: string
  created_at: string
  expires_at?: string
}

// WebSocket 消息事件
export interface WebSocketEvent {
  type: 'message' | 'typing' | 'online_status' | 'conversation_update' | 'message_reaction'
  data: any
  timestamp: string
}

// 消息传递状态
export interface MessageDeliveryStatus {
  message_id: string
  recipient_statuses: {
    user_id: string
    status: MessageStatus
    timestamp: string
  }[]
}

// 会话邀请
export interface ConversationInvite {
  id: string
  conversation: Conversation
  inviter: User
  invitee: User
  message?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  created_at: string
  expires_at: string
  responded_at?: string
}