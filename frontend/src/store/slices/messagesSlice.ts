import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { realtimeAPI } from '../../services/endpoints'
import type { Conversation, Message } from '../../types/message'

interface MessagesState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  unreadCount: number
  pagination: {
    page: number
    hasMore: boolean
    total: number
  }
  loading: {
    conversations: boolean
    messages: boolean
    sending: boolean
    creating: boolean
    markingRead: boolean
  }
  error: string | null
  typing: {
    conversationId: string | null
    users: string[]
  }
}

const initialState: MessagesState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  unreadCount: 0,
  pagination: {
    page: 1,
    hasMore: true,
    total: 0,
  },
  loading: {
    conversations: false,
    messages: false,
    sending: false,
    creating: false,
    markingRead: false,
  },
  error: null,
  typing: {
    conversationId: null,
    users: [],
  },
}

// 异步 thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (params: { page?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.getConversations(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取会话列表失败')
    }
  }
)

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (params: { conversationId: string; page?: number }, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.getMessages(params.conversationId, { page: params.page })
      return { conversationId: params.conversationId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取消息失败')
    }
  }
)

export const createConversation = createAsyncThunk(
  'messages/createConversation',
  async (params: { participantIds: string[]; message?: string }, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.createConversation(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '创建会话失败')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (params: { conversationId: string; content: string; attachments?: File[] }, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.sendMessage(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '发送消息失败')
    }
  }
)

export const markConversationAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.markAsRead(conversationId)
      return { conversationId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '标记已读失败')
    }
  }
)

export const deleteConversation = createAsyncThunk(
  'messages/deleteConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      await messagesAPI.deleteConversation(conversationId)
      return conversationId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除会话失败')
    }
  }
)

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId: string, { rejectWithValue }) => {
    try {
      await messagesAPI.deleteMessage(messageId)
      return messageId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除消息失败')
    }
  }
)

export const fetchUnreadCount = createAsyncThunk(
  'messages/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.getUnreadCount()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取未读数量失败')
    }
  }
)

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload
      if (!action.payload) {
        state.messages = []
        state.pagination = initialState.pagination
      }
    },
    resetMessages: (state) => {
      state.messages = []
      state.pagination = initialState.pagination
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload
      
      // 添加消息到列表
      state.messages.push(message)
      
      // 更新会话的最后一条消息
      const conversation = state.conversations.find(c => c.id === message.conversation)
      if (conversation) {
        conversation.last_message = message
        conversation.updated_at = message.created_at
        
        // 如果不是当前用户发送的消息，增加未读数量
        if (!message.is_own && state.currentConversation?.id !== message.conversation) {
          conversation.unread_count = (conversation.unread_count || 0) + 1
          state.unreadCount += 1
        }
        
        // 将会话移到顶部
        state.conversations = [
          conversation,
          ...state.conversations.filter(c => c.id !== conversation.id)
        ]
      }
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const updatedMessage = action.payload
      const index = state.messages.findIndex(m => m.id === updatedMessage.id)
      
      if (index !== -1) {
        state.messages[index] = updatedMessage
      }
      
      // 更新会话中的最后一条消息
      const conversation = state.conversations.find(c => c.last_message?.id === updatedMessage.id)
      if (conversation) {
        conversation.last_message = updatedMessage
      }
    },
    removeMessage: (state, action: PayloadAction<string>) => {
      const messageId = action.payload
      state.messages = state.messages.filter(m => m.id !== messageId)
      
      // 如果删除的是会话的最后一条消息，需要更新会话
      const conversation = state.conversations.find(c => c.last_message?.id === messageId)
      if (conversation) {
        // 找到倒数第二条消息作为新的最后一条消息
        const remainingMessages = state.messages.filter(m => m.conversation === conversation.id)
        conversation.last_message = remainingMessages[remainingMessages.length - 1] || null
      }
    },
    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const updatedConversation = action.payload
      const index = state.conversations.findIndex(c => c.id === updatedConversation.id)
      
      if (index !== -1) {
        state.conversations[index] = updatedConversation
      }
      
      if (state.currentConversation?.id === updatedConversation.id) {
        state.currentConversation = updatedConversation
      }
    },
    removeConversation: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload
      
      // 从未读数量中减去该会话的未读数量
      const conversation = state.conversations.find(c => c.id === conversationId)
      if (conversation && conversation.unread_count) {
        state.unreadCount = Math.max(0, state.unreadCount - conversation.unread_count)
      }
      
      state.conversations = state.conversations.filter(c => c.id !== conversationId)
      
      if (state.currentConversation?.id === conversationId) {
        state.currentConversation = null
        state.messages = []
      }
    },
    setTyping: (state, action: PayloadAction<{ conversationId: string; users: string[] }>) => {
      const { conversationId, users } = action.payload
      state.typing = { conversationId, users }
    },
    clearTyping: (state) => {
      state.typing = { conversationId: null, users: [] }
    },
    decrementUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = Math.max(0, state.unreadCount - action.payload)
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = Math.max(0, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading.conversations = true
        state.error = null
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading.conversations = false
        const { results, page, has_more, total, unread_count } = action.payload
        
        if (page === 1) {
          state.conversations = results
        } else {
          state.conversations = [...state.conversations, ...results]
        }
        
        if (typeof unread_count === 'number') {
          state.unreadCount = unread_count
        }
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading.conversations = false
        state.error = action.payload as string
      })
      
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading.messages = true
        state.error = null
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading.messages = false
        const { results, page, has_more, total } = action.payload
        
        if (page === 1) {
          state.messages = results
        } else {
          // 新消息添加到顶部（因为是按时间倒序）
          state.messages = [...results, ...state.messages]
        }
        
        state.pagination = {
          page,
          hasMore: has_more,
          total,
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading.messages = false
        state.error = action.payload as string
      })
      
      // Create Conversation
      .addCase(createConversation.pending, (state) => {
        state.loading.creating = true
        state.error = null
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading.creating = false
        const newConversation = action.payload
        
        // 添加新会话到顶部
        state.conversations.unshift(newConversation)
        state.currentConversation = newConversation
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading.creating = false
        state.error = action.payload as string
      })
      
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading.sending = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.sending = false
        messagesSlice.caseReducers.addMessage(state, action)
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sending = false
        state.error = action.payload as string
      })
      
      // Mark Conversation as Read
      .addCase(markConversationAsRead.pending, (state) => {
        state.loading.markingRead = true
        state.error = null
      })
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        state.loading.markingRead = false
        const { conversationId } = action.payload
        
        const conversation = state.conversations.find(c => c.id === conversationId)
        if (conversation && conversation.unread_count) {
          state.unreadCount = Math.max(0, state.unreadCount - conversation.unread_count)
          conversation.unread_count = 0
        }
        
        // 标记当前会话的所有消息为已读
        if (state.currentConversation?.id === conversationId) {
          state.messages.forEach(message => {
            if (!message.is_read && !message.is_own) {
              message.is_read = true
            }
          })
        }
      })
      .addCase(markConversationAsRead.rejected, (state, action) => {
        state.loading.markingRead = false
        state.error = action.payload as string
      })
      
      // Delete Conversation
      .addCase(deleteConversation.fulfilled, (state, action) => {
        const conversationId = action.payload
        messagesSlice.caseReducers.removeConversation(state, { payload: conversationId, type: 'messages/removeConversation' })
      })
      .addCase(deleteConversation.rejected, (state, action) => {
        state.error = action.payload as string
      })
      
      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const messageId = action.payload
        messagesSlice.caseReducers.removeMessage(state, { payload: messageId, type: 'messages/removeMessage' })
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.error = action.payload as string
      })
      
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count
      })
  },
})

export const {
  clearError,
  setCurrentConversation,
  resetMessages,
  addMessage,
  updateMessage,
  removeMessage,
  updateConversation,
  removeConversation,
  setTyping,
  clearTyping,
  decrementUnreadCount,
  setUnreadCount,
} = messagesSlice.actions

export default messagesSlice.reducer