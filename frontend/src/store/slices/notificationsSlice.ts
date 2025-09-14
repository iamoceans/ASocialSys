import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { notificationAPI } from '../../services/endpoints'
import type { Notification } from '../../types/notification'

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  pagination: {
    page: number
    hasMore: boolean
    total: number
  }
  loading: {
    notifications: boolean
    markingRead: boolean
    markingAllRead: boolean
  }
  error: string | null
  filters: {
    type: 'all' | 'like' | 'comment' | 'follow' | 'mention' | 'system'
    read: 'all' | 'read' | 'unread'
  }
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    page: 1,
    hasMore: true,
    total: 0,
  },
  loading: {
    notifications: false,
    markingRead: false,
    markingAllRead: false,
  },
  error: null,
  filters: {
    type: 'all',
    read: 'all',
  },
}

// 异步 thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: { page?: number; type?: string; read?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getNotifications(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取通知失败')
    }
  }
)

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getUnreadCount()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取未读数量失败')
    }
  }
)

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.markAsRead(id)
      return { id, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '标记已读失败')
    }
  }
)

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.markAllAsRead()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '标记全部已读失败')
    }
  }
)

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationsAPI.deleteNotification(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除通知失败')
    }
  }
)

export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.clearAll()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '清空通知失败')
    }
  }
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action: PayloadAction<Partial<NotificationsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetNotifications: (state) => {
      state.notifications = []
      state.pagination = initialState.pagination
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // 添加新通知到列表顶部
      state.notifications.unshift(action.payload)
      
      // 如果是未读通知，增加未读数量
      if (!action.payload.is_read) {
        state.unreadCount += 1
      }
    },
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const updatedNotification = action.payload
      const index = state.notifications.findIndex(n => n.id === updatedNotification.id)
      
      if (index !== -1) {
        const oldNotification = state.notifications[index]
        state.notifications[index] = updatedNotification
        
        // 更新未读数量
        if (oldNotification.is_read !== updatedNotification.is_read) {
          if (updatedNotification.is_read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          } else {
            state.unreadCount += 1
          }
        }
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload
      const notification = state.notifications.find(n => n.id === notificationId)
      
      if (notification && !notification.is_read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      
      state.notifications = state.notifications.filter(n => n.id !== notificationId)
    },
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1)
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = Math.max(0, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading.notifications = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading.notifications = false
        const { results, page, has_more, total, unread_count } = action.payload
        
        if (page === 1) {
          state.notifications = results
        } else {
          state.notifications = [...state.notifications, ...results]
        }
        
        state.pagination = {
          page,
          hasMore: has_more,
          total,
        }
        
        if (typeof unread_count === 'number') {
          state.unreadCount = unread_count
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading.notifications = false
        state.error = action.payload as string
      })
      
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count
      })
      
      // Mark Notification as Read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading.markingRead = true
        state.error = null
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading.markingRead = false
        const { id } = action.payload
        
        const notification = state.notifications.find(n => n.id === id)
        if (notification && !notification.is_read) {
          notification.is_read = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading.markingRead = false
        state.error = action.payload as string
      })
      
      // Mark All Notifications as Read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.loading.markingAllRead = true
        state.error = null
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.loading.markingAllRead = false
        
        // 标记所有通知为已读
        state.notifications.forEach(notification => {
          notification.is_read = true
        })
        
        state.unreadCount = 0
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.loading.markingAllRead = false
        state.error = action.payload as string
      })
      
      // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload
        notificationsSlice.caseReducers.removeNotification(state, { payload: notificationId, type: 'notifications/removeNotification' })
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload as string
      })
      
      // Clear All Notifications
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = []
        state.unreadCount = 0
        state.pagination = initialState.pagination
      })
      .addCase(clearAllNotifications.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  setFilters,
  resetNotifications,
  addNotification,
  updateNotification,
  removeNotification,
  decrementUnreadCount,
  setUnreadCount,
} = notificationsSlice.actions

export default notificationsSlice.reducer