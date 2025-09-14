import React, { useState, useEffect } from 'react'
import { useAppSelector } from '../../store/hooks'
import { Button, LoadingBar } from '../../components/UI'
import { UserAvatar } from '../../components/User'
import { cn } from '../../utils'
import { Notification } from '../../types'

const Notifications: React.FC = () => {
  const { user } = useAppSelector(state => state.auth)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'mentions' | 'likes' | 'follows'>('all')
  const [markingAsRead, setMarkingAsRead] = useState<string[]>([])
  
  // 获取通知列表
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 模拟通知数据
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'like',
            title: '新的点赞',
            message: 'Alice Johnson 点赞了你的帖子',
            data: {
              userId: 'alice_dev',
              postId: 'post-123',
              userName: 'Alice Johnson',
              userAvatar: '/avatars/alice.jpg'
            },
            isRead: false,
            createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5分钟前
          },
          {
            id: '2',
            type: 'comment',
            title: '新的评论',
            message: 'Bob Smith 评论了你的帖子: "很棒的分享！"',
            data: {
              userId: 'bob_designer',
              postId: 'post-123',
              userName: 'Bob Smith',
              userAvatar: '/avatars/bob.jpg',
              commentContent: '很棒的分享！'
            },
            isRead: false,
            createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15分钟前
          },
          {
            id: '3',
            type: 'follow',
            title: '新的关注者',
            message: 'Carol Wilson 开始关注你',
            data: {
              userId: 'carol_pm',
              userName: 'Carol Wilson',
              userAvatar: '/avatars/carol.jpg'
            },
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2小时前
          },
          {
            id: '4',
            type: 'mention',
            title: '提到了你',
            message: 'David Chen 在帖子中提到了你',
            data: {
              userId: 'david_startup',
              postId: 'post-456',
              userName: 'David Chen',
              userAvatar: '/avatars/david.jpg'
            },
            isRead: true,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4小时前
          },
          {
            id: '5',
            type: 'like',
            title: '新的点赞',
            message: 'Emma Davis 点赞了你的帖子',
            data: {
              userId: 'emma_writer',
              postId: 'post-789',
              userName: 'Emma Davis',
              userAvatar: '/avatars/emma.jpg'
            },
            isRead: true,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6小时前
          },
          {
            id: '6',
            type: 'system',
            title: '系统通知',
            message: '欢迎加入 ASocialSys！开始探索和分享你的想法吧。',
            data: {},
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1天前
          }
        ]
        
        setNotifications(mockNotifications)
        
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchNotifications()
  }, [])
  
  // 过滤通知
  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'mentions':
        return notification.type === 'mention'
      case 'likes':
        return notification.type === 'like'
      case 'follows':
        return notification.type === 'follow'
      default:
        return true
    }
  })
  
  // 标记为已读
  const markAsRead = async (notificationId: string) => {
    if (markingAsRead.includes(notificationId)) return
    
    try {
      setMarkingAsRead(prev => [...prev, notificationId])
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      )
      
    } catch (error) {
      console.error('Failed to mark as read:', error)
    } finally {
      setMarkingAsRead(prev => prev.filter(id => id !== notificationId))
    }
  }
  
  // 标记全部为已读
  const markAllAsRead = async () => {
    try {
      setLoading(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      )
      
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 获取通知图标
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
      case 'mention':
        return (
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a12 12 0 0124 0v10z" />
            </svg>
          </div>
        )
    }
  }
  
  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return '刚刚'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}小时前`
    } else if (diffInMinutes < 7 * 24 * 60) {
      const days = Math.floor(diffInMinutes / (24 * 60))
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }
  
  const unreadCount = notifications.filter(n => !n.isRead).length
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {loading && <LoadingBar progress={60} />}
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              通知
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                你有 {unreadCount} 条未读通知
              </p>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              loading={loading}
            >
              全部标记为已读
            </Button>
          )}
        </div>
        
        {/* 标签页 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'all', label: '全部', count: notifications.length },
                { key: 'mentions', label: '提及', count: notifications.filter(n => n.type === 'mention').length },
                { key: 'likes', label: '点赞', count: notifications.filter(n => n.type === 'like').length },
                { key: 'follows', label: '关注', count: notifications.filter(n => n.type === 'follow').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* 通知列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer',
                    !notification.isRead && 'bg-blue-50 dark:bg-blue-900/10'
                  )}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    {/* 通知图标或用户头像 */}
                    <div className="flex-shrink-0">
                      {notification.data.userAvatar ? (
                        <div className="relative">
                          <UserAvatar
                            user={{
                              id: notification.data.userId || '',
                              username: notification.data.userId || '',
                              displayName: notification.data.userName || '',
                              avatar: notification.data.userAvatar,
                              email: '',
                              verified: false,
                              bio: '',
                              followersCount: 0,
                              followingCount: 0,
                              postsCount: 0,
                              joinedAt: ''
                            }}
                            size="md"
                          />
                          <div className="absolute -bottom-1 -right-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                      ) : (
                        getNotificationIcon(notification.type)
                      )}
                    </div>
                    
                    {/* 通知内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={cn(
                            'text-sm',
                            notification.isRead 
                              ? 'text-gray-600 dark:text-gray-400' 
                              : 'text-gray-900 dark:text-white font-medium'
                          )}>
                            {notification.message}
                          </p>
                          
                          {/* 评论内容预览 */}
                          {notification.type === 'comment' && notification.data.commentContent && (
                            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                "{notification.data.commentContent}"
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* 未读指示器 */}
                        {!notification.isRead && (
                          <div className="flex-shrink-0 ml-4">
                            {markingAsRead.includes(notification.id) ? (
                              <div className="w-2 h-2 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a12 12 0 0124 0v10z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {activeTab === 'all' ? '暂无通知' : `暂无${{
                  mentions: '提及',
                  likes: '点赞',
                  follows: '关注'
                }[activeTab]}通知`}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {activeTab === 'all' 
                  ? '当有新的活动时，你会在这里看到通知'
                  : '当有相关活动时，你会在这里看到通知'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications