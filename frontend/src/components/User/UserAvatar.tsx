import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils'
import type { User } from '../../types'

interface UserAvatarProps {
  user: User
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showOnlineStatus?: boolean
  showVerified?: boolean
  showHoverCard?: boolean
  clickable?: boolean
  className?: string
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showOnlineStatus = false,
  showVerified = true,
  showHoverCard = false,
  clickable = true,
  className
}) => {
  const [imageError, setImageError] = useState(false)
  const [showCard, setShowCard] = useState(false)
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  }
  
  const verifiedIconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
    '2xl': 'w-6 h-6'
  }
  
  const onlineStatusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-4 h-4'
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  const getAvatarColors = (userId: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ]
    const index = parseInt(userId, 36) % colors.length
    return colors[index]
  }
  
  const renderAvatar = () => {
    if (user.avatar && !imageError) {
      return (
        <img
          src={user.avatar}
          alt={user.displayName}
          className={cn(
            sizeClasses[size],
            'rounded-full object-cover',
            className
          )}
          onError={() => setImageError(true)}
        />
      )
    }
    
    // 显示首字母头像
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-full flex items-center justify-center text-white font-semibold',
          getAvatarColors(user.id),
          className
        )}
      >
        <span className={cn(
          size === 'xs' || size === 'sm' ? 'text-xs' :
          size === 'md' || size === 'lg' ? 'text-sm' :
          'text-base'
        )}>
          {getInitials(user.displayName)}
        </span>
      </div>
    )
  }
  
  const renderHoverCard = () => {
    if (!showHoverCard || !showCard) return null
    
    return (
      <div className="absolute z-50 w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bottom-full left-0 mb-2">
        <div className="flex items-start space-x-3">
          <UserAvatar
            user={user}
            size="lg"
            showOnlineStatus={showOnlineStatus}
            showVerified={showVerified}
            showHoverCard={false}
            clickable={false}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {user.displayName}
              </h3>
              {user.verified && showVerified && (
                <svg className={cn(verifiedIconSizes[size], 'text-blue-500 flex-shrink-0')} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{user.username}
            </p>
            
            {user.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                {user.bio}
              </p>
            )}
            
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.followingCount || 0}
                </span> 关注
              </span>
              <span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.followersCount || 0}
                </span> 粉丝
              </span>
            </div>
            
            <div className="flex items-center space-x-2 mt-3">
              <button className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                关注
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors">
                消息
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const avatarElement = (
    <div 
      className="relative inline-block"
      onMouseEnter={() => showHoverCard && setShowCard(true)}
      onMouseLeave={() => showHoverCard && setShowCard(false)}
    >
      {renderAvatar()}
      
      {/* 认证标识 */}
      {user.verified && showVerified && (
        <div className="absolute -top-1 -right-1">
          <svg className={cn(verifiedIconSizes[size], 'text-blue-500')} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {/* 在线状态 */}
      {showOnlineStatus && user.isOnline && (
        <div className="absolute bottom-0 right-0">
          <div className={cn(
            onlineStatusSizes[size],
            'bg-green-500 border-2 border-white dark:border-gray-800 rounded-full'
          )}></div>
        </div>
      )}
      
      {renderHoverCard()}
    </div>
  )
  
  if (clickable) {
    return (
      <Link 
        to={`/users/${user.username}`}
        className="inline-block hover:opacity-80 transition-opacity"
      >
        {avatarElement}
      </Link>
    )
  }
  
  return avatarElement
}

export default UserAvatar