import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { formatDistanceToNow } from '../../utils'
import { cn } from '../../utils'
import type { Post, User } from '../../types'

interface PostCardProps {
  post: Post
  showActions?: boolean
  compact?: boolean
  className?: string
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  showActions = true, 
  compact = false,
  className 
}) => {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(state => state.auth.user)
  
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [likeCount, setLikeCount] = useState(post.likeCount || 0)
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false)
  const [showFullContent, setShowFullContent] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!currentUser) {
      // 跳转到登录页面
      return
    }
    
    try {
      const newIsLiked = !isLiked
      setIsLiked(newIsLiked)
      setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1)
      
      // 调用API
      // await dispatch(togglePostLike({ postId: post.id, isLiked: newIsLiked }))
    } catch (error) {
      // 回滚状态
      setIsLiked(!isLiked)
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
      console.error('Failed to toggle like:', error)
    }
  }
  
  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!currentUser) {
      return
    }
    
    try {
      const newIsBookmarked = !isBookmarked
      setIsBookmarked(newIsBookmarked)
      
      // 调用API
      // await dispatch(togglePostBookmark({ postId: post.id, isBookmarked: newIsBookmarked }))
    } catch (error) {
      setIsBookmarked(!isBookmarked)
      console.error('Failed to toggle bookmark:', error)
    }
  }
  
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const shareData = {
      title: post.title,
      text: post.excerpt || post.content.substring(0, 100) + '...',
      url: `${window.location.origin}/posts/${post.id}`
    }
    
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // 复制链接到剪贴板
        await navigator.clipboard.writeText(shareData.url)
        // 显示提示
        console.log('链接已复制到剪贴板')
      }
    } catch (error) {
      console.error('Failed to share:', error)
    }
  }
  
  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }
  
  const renderContent = () => {
    if (compact) {
      return (
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
          {post.excerpt || truncateContent(post.content, 100)}
        </p>
      )
    }
    
    const shouldTruncate = post.content.length > 300
    const displayContent = showFullContent || !shouldTruncate 
      ? post.content 
      : truncateContent(post.content, 300)
    
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: displayContent }} />
        {shouldTruncate && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowFullContent(!showFullContent)
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium mt-2"
          >
            {showFullContent ? '收起' : '展开'}
          </button>
        )}
      </div>
    )
  }
  
  const renderImages = () => {
    if (!post.images || post.images.length === 0) return null
    
    const imageCount = post.images.length
    
    if (imageCount === 1) {
      return (
        <div className="mt-3">
          <img
            src={post.images[0]}
            alt="Post image"
            className="w-full max-h-96 object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        </div>
      )
    }
    
    if (imageCount === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {post.images.slice(0, 2).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ))}
        </div>
      )
    }
    
    if (imageCount === 3) {
      return (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <img
            src={post.images[0]}
            alt="Post image 1"
            className="w-full h-48 object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
          <div className="grid grid-rows-2 gap-2">
            {post.images.slice(1, 3).map((image, index) => (
              <img
                key={index + 1}
                src={image}
                alt={`Post image ${index + 2}`}
                className="w-full h-[5.75rem] object-cover rounded-lg"
                onError={() => setImageError(true)}
              />
            ))}
          </div>
        </div>
      )
    }
    
    // 4张或更多图片
    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {post.images.slice(0, 3).map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Post image ${index + 1}`}
            className="w-full h-32 object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        ))}
        <div className="relative">
          <img
            src={post.images[3]}
            alt="Post image 4"
            className="w-full h-32 object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
          {imageCount > 4 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                +{imageCount - 4}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <article className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md',
      compact ? 'p-4' : 'p-6',
      className
    )}>
      {/* 用户信息 */}
      <div className="flex items-center space-x-3 mb-4">
        <Link to={`/users/${post.author.username}`} className="flex-shrink-0">
          <img
            src={post.author.avatar || '/default-avatar.png'}
            alt={post.author.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Link 
              to={`/users/${post.author.username}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
            >
              {post.author.displayName}
            </Link>
            {post.author.verified && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>@{post.author.username}</span>
            <span>·</span>
            <time dateTime={post.createdAt}>
              {formatDistanceToNow(new Date(post.createdAt))}
            </time>
            {post.updatedAt !== post.createdAt && (
              <>
                <span>·</span>
                <span className="text-xs">已编辑</span>
              </>
            )}
          </div>
        </div>
        
        {/* 更多操作 */}
        <div className="relative">
          <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 帖子内容 */}
      <Link to={`/posts/${post.id}`} className="block">
        {post.title && !compact && (
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {post.title}
          </h2>
        )}
        
        {renderContent()}
        {renderImages()}
        
        {/* 标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/tags/${tag.name}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </Link>
      
      {/* 操作按钮 */}
      {showActions && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-6">
            {/* 点赞 */}
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center space-x-2 text-sm transition-colors',
                isLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
              )}
            >
              <svg 
                className={cn('w-5 h-5', isLiked && 'fill-current')} 
                fill={isLiked ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likeCount}</span>
            </button>
            
            {/* 评论 */}
            <Link
              to={`/posts/${post.id}#comments`}
              className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.commentCount || 0}</span>
            </Link>
            
            {/* 分享 */}
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
          
          {/* 收藏 */}
          <button
            onClick={handleBookmark}
            className={cn(
              'p-2 rounded-full transition-colors',
              isBookmarked
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-400 hover:text-yellow-500'
            )}
          >
            <svg 
              className={cn('w-5 h-5', isBookmarked && 'fill-current')} 
              fill={isBookmarked ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      )}
    </article>
  )
}

export default PostCard