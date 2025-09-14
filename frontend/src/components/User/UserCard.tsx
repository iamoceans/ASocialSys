import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { formatDistanceToNow } from '../../utils'
import { cn } from '../../utils'
import { UserAvatar } from './'
import type { User } from '../../types'

interface UserCardProps {
  user: User
  showFollowButton?: boolean
  showStats?: boolean
  compact?: boolean
  className?: string
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  showFollowButton = true,
  showStats = true,
  compact = false,
  className
}) => {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(state => state.auth.user)
  
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false)
  const [isLoading, setIsLoading] = useState(false)
  const [followersCount, setFollowersCount] = useState(user.followersCount || 0)
  
  const isCurrentUser = currentUser?.id === user.id
  
  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!currentUser || isCurrentUser || isLoading) {
      return
    }
    
    setIsLoading(true)
    try {
      const newIsFollowing = !isFollowing
      setIsFollowing(newIsFollowing)
      setFollowersCount(prev => newIsFollowing ? prev + 1 : prev - 1)
      
      // 调用API
      // await dispatch(toggleUserFollow({ userId: user.id, isFollowing: newIsFollowing }))
    } catch (error) {
      // 回滚状态
      setIsFollowing(!isFollowing)
      setFollowersCount(prev => isFollowing ? prev + 1 : prev - 1)
      console.error('Failed to toggle follow:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // 跳转到私信页面
    // navigate(`/messages/${user.username}`)
  }
  
  if (compact) {
    return (
      <Link
        to={`/users/${user.username}`}
        className={cn(
          'flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
          className
        )}
      >
        <UserAvatar
          user={user}
          size="md"
          showOnlineStatus
          showVerified
          clickable={false}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {user.displayName}
            </h3>
            {user.verified && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            @{user.username}
          </p>
          
          {user.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
              {user.bio}
            </p>
          )}
        </div>
        
        {showFollowButton && !isCurrentUser && (
          <button
            onClick={handleFollow}
            disabled={isLoading}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50',
              isFollowing
                ? 'text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-300'
                : 'text-white bg-blue-600 hover:bg-blue-700'
            )}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isFollowing ? '取消关注' : '关注'
            )}
          </button>
        )}
      </Link>
    )
  }
  
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md',
      className
    )}>
      {/* 用户信息 */}
      <div className="flex items-start space-x-4">
        <UserAvatar
          user={user}
          size="xl"
          showOnlineStatus
          showVerified={false}
          clickable
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`/users/${user.username}`}
                  className="font-bold text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {user.displayName}
                </Link>
                {user.verified && (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <p className="text-gray-500 dark:text-gray-400">
                @{user.username}
              </p>
              
              {user.location && (
                <div className="flex items-center space-x-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{user.location}</span>
                </div>
              )}
              
              {user.website && (
                <div className="flex items-center space-x-1 mt-1 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 truncate"
                  >
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              
              {user.joinedAt && (
                <div className="flex items-center space-x-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>加入于 {new Date(user.joinedAt).toLocaleDateString('zh-CN')}</span>
                </div>
              )}
            </div>
            
            {/* 操作按钮 */}
            {!isCurrentUser && (
              <div className="flex items-center space-x-2">
                {showFollowButton && (
                  <button
                    onClick={handleFollow}
                    disabled={isLoading}
                    className={cn(
                      'px-6 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50',
                      isFollowing
                        ? 'text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-300'
                        : 'text-white bg-blue-600 hover:bg-blue-700'
                    )}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      isFollowing ? '取消关注' : '关注'
                    )}
                  </button>
                )}
                
                <button
                  onClick={handleMessage}
                  className="p-2 text-gray-400 hover:text-blue-500 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                  title="发送消息"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* 个人简介 */}
          {user.bio && (
            <p className="text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
              {user.bio}
            </p>
          )}
          
          {/* 统计信息 */}
          {showStats && (
            <div className="flex items-center space-x-6 mt-4 text-sm">
              <Link
                to={`/users/${user.username}/following`}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.followingCount || 0}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  关注
                </span>
              </Link>
              
              <Link
                to={`/users/${user.username}/followers`}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {followersCount}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  粉丝
                </span>
              </Link>
              
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.postsCount || 0}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  帖子
                </span>
              </div>
              
              {user.lastActiveAt && (
                <div className="text-gray-500 dark:text-gray-400">
                  最后活跃: {formatDistanceToNow(new Date(user.lastActiveAt))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserCard