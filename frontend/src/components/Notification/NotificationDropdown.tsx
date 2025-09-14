import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { formatDistanceToNow } from '../../utils'
import { cn } from '../../utils'
import type { Notification } from '../../types'

interface NotificationDropdownProps {
  onClose: () => void
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const dispatch = useAppDispatch()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  
  // 模拟从Redux获取通知
  // const { notifications, loading } = useAppSelector(state => state.notifications)
  
  useEffect(() => {
    fetchNotifications()
  }, [filter])
  
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'like',
          title: '张三点赞了你的帖子',
          message: '"React 18 新特性详解"',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          user: {
            id: '1',
            username: 'zhangsan',
            displayName: '张三',
            avatar: '/avatars/user1.jpg'
          },
          relatedPost: {
            id: '1',
            title: 'React 18 新特性详解'
          }
        },
        {
          id: '2',
          type: 'comment',
          title: '李四评论了你的帖子',
          message: '很棒的分享！学到了很多',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          user: {
            id: '2',
            username: 'lisi',
            displayName: '李四',
            avatar: '/avatars/user2.jpg'
          },
          relatedPost: {
            id: '1',
            title: 'React 18 新特性详解'
          }
        },
        {
          id: '3',
          type: 'follow',
          title: '王五关注了你',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          user: {
            id: '3',
            username: 'wangwu',
            displayName: '王五',
            avatar: '/avatars/user3.jpg'
          }
        },
        {
          id: '4',
          type: 'system',
          title: '系统通知',
          message: '您的账户安全设置已更新',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        }
      ]
      
      const filteredNotifications = filter === 'unread' 
        ? mockNotifications.filter(n => !n.read)
        : mockNotifications
      
      setNotifications(filteredNotifications)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
    // dispatch(markNotificationAsRead(id))
  }
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    // dispatch(markAllNotificationsAsRead())
  }
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return (
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'comment':
        return (
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        )
      case 'follow':
        return (
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )
      case 'system':
        return (
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z" />
            </svg>
          </div>
        )
    }
  }
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            通知
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 过滤器 */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                filter === 'all'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                filter === 'unread'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              未读 {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
            >
              全部标记为已读
            </button>
          )}
        </div>
      </div>
      
      {/* 通知列表 */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {filter === 'unread' ? '没有未读通知' : '暂无通知'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer',
                  !notification.read && 'bg-blue-50 dark:bg-blue-900/10'
                )}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id)
                  }
                  onClose()
                }}
              >
                <div className="flex items-start space-x-3">
                  {notification.user?.avatar ? (
                    <img
                      src={notification.user.avatar}
                      alt={notification.user.displayName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    getNotificationIcon(notification.type)
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt))}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 底部 */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/notifications"
            onClick={onClose}
            className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            查看所有通知
          </Link>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown