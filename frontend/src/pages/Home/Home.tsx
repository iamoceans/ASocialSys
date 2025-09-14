import React, { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { PostCard, PostEditor } from '../../components/Post'
import { UserCard } from '../../components/User'
import { LoadingBar } from '../../components/UI'
import { useInfiniteScroll } from '../../hooks'
import type { Post, User } from '../../types'

const Home: React.FC = () => {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(state => state.auth.user)
  
  const [posts, setPosts] = useState<Post[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState<'all' | 'following'>('all')
  const [showPostEditor, setShowPostEditor] = useState(false)
  
  // 无限滚动
  const { isIntersecting } = useInfiniteScroll({
    threshold: 0.1,
    rootMargin: '100px'
  })
  
  useEffect(() => {
    fetchPosts(true)
    fetchSuggestedUsers()
  }, [filter])
  
  useEffect(() => {
    if (isIntersecting && hasMore && !loadingMore) {
      fetchPosts(false)
    }
  }, [isIntersecting, hasMore, loadingMore])
  
  const fetchPosts = async (reset = false) => {
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockPosts: Post[] = [
        {
          id: '1',
          title: 'React 18 新特性详解',
          content: '在React 18中，引入了许多令人兴奋的新特性，包括并发渲染、自动批处理、Suspense改进等。这些特性将大大提升React应用的性能和用户体验。',
          excerpt: 'React 18带来了并发渲染等重要特性...',
          author: {
            id: '1',
            username: 'zhangsan',
            displayName: '张三',
            avatar: '/avatars/user1.jpg',
            verified: true
          },
          images: ['/images/react18-1.jpg', '/images/react18-2.jpg'],
          tags: [
            { id: '1', name: 'react', color: '#61dafb' },
            { id: '2', name: 'javascript', color: '#f7df1e' }
          ],
          likeCount: 42,
          commentCount: 8,
          isLiked: false,
          isBookmarked: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: '2',
          content: '今天学习了TypeScript的高级类型，感觉打开了新世界的大门！条件类型、映射类型、模板字面量类型等等，这些特性让类型系统变得如此强大和灵活。',
          author: {
            id: '2',
            username: 'lisi',
            displayName: '李四',
            avatar: '/avatars/user2.jpg',
            verified: false
          },
          tags: [
            { id: '3', name: 'typescript', color: '#3178c6' },
            { id: '4', name: 'learning', color: '#10b981' }
          ],
          likeCount: 28,
          commentCount: 5,
          isLiked: true,
          isBookmarked: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: '3',
          title: '前端性能优化实践分享',
          content: '最近在项目中实践了一些前端性能优化技巧，包括代码分割、懒加载、图片优化、缓存策略等。通过这些优化，页面加载速度提升了50%以上！',
          author: {
            id: '3',
            username: 'wangwu',
            displayName: '王五',
            avatar: '/avatars/user3.jpg',
            verified: true
          },
          images: ['/images/performance-1.jpg'],
          tags: [
            { id: '5', name: 'performance', color: '#f59e0b' },
            { id: '6', name: 'optimization', color: '#ef4444' }
          ],
          likeCount: 67,
          commentCount: 12,
          isLiked: false,
          isBookmarked: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
        }
      ]
      
      if (reset) {
        setPosts(mockPosts)
      } else {
        setPosts(prev => [...prev, ...mockPosts])
      }
      
      // 模拟没有更多数据
      if (posts.length >= 20) {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }
  
  const fetchSuggestedUsers = async () => {
    try {
      // 模拟API调用
      const mockUsers: User[] = [
        {
          id: '4',
          username: 'frontend_master',
          displayName: '前端大师',
          avatar: '/avatars/user4.jpg',
          bio: '专注前端技术分享，React/Vue/Angular全栈开发者',
          verified: true,
          followersCount: 1250,
          followingCount: 180,
          postsCount: 89
        },
        {
          id: '5',
          username: 'design_guru',
          displayName: '设计师小王',
          avatar: '/avatars/user5.jpg',
          bio: 'UI/UX设计师，热爱创造美好的用户体验',
          verified: false,
          followersCount: 890,
          followingCount: 320,
          postsCount: 156
        },
        {
          id: '6',
          username: 'tech_blogger',
          displayName: '技术博主',
          avatar: '/avatars/user6.jpg',
          bio: '分享最新技术趋势和开发经验',
          verified: true,
          followersCount: 2100,
          followingCount: 95,
          postsCount: 234
        }
      ]
      
      setSuggestedUsers(mockUsers)
    } catch (error) {
      console.error('Failed to fetch suggested users:', error)
    }
  }
  
  const handleCreatePost = async (data: {
    title: string
    content: string
    tags: any[]
    images: File[]
  }) => {
    try {
      // 调用API创建帖子
      console.log('Creating post:', data)
      
      // 模拟创建成功，刷新帖子列表
      await fetchPosts(true)
      setShowPostEditor(false)
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingBar />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主内容区 */}
          <div className="lg:col-span-3">
            {/* 过滤器 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setFilter('following')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === 'following'
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  关注
                </button>
              </div>
            </div>
            
            {/* 发帖编辑器 */}
            {currentUser && (
              <div className="mb-6">
                {showPostEditor ? (
                  <PostEditor
                    onSubmit={handleCreatePost}
                    onCancel={() => setShowPostEditor(false)}
                    placeholder="分享你的想法..."
                  />
                ) : (
                  <div 
                    onClick={() => setShowPostEditor(true)}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={currentUser.avatar || '/default-avatar.png'}
                        alt={currentUser.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 text-gray-500 dark:text-gray-400">
                        分享你的想法...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 帖子列表 */}
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              
              {loadingMore && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  没有更多内容了
                </div>
              )}
              
              {posts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    暂无内容
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {filter === 'following' ? '关注一些用户来查看他们的动态' : '还没有人发布内容'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* 推荐用户 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  推荐关注
                </h3>
                
                <div className="space-y-4">
                  {suggestedUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      compact
                      showStats={false}
                    />
                  ))}
                </div>
                
                <button className="w-full mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium">
                  查看更多
                </button>
              </div>
              
              {/* 热门标签 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  热门标签
                </h3>
                
                <div className="space-y-3">
                  {[
                    { name: 'react', count: 1234 },
                    { name: 'javascript', count: 987 },
                    { name: 'typescript', count: 756 },
                    { name: 'frontend', count: 543 },
                    { name: 'webdev', count: 432 }
                  ].map((tag) => (
                    <div key={tag.name} className="flex items-center justify-between">
                      <span className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 cursor-pointer">
                        #{tag.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {tag.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 应用信息 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  关于 ASocialSys
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  一个现代化的社交平台，专注于技术分享和知识交流。
                </p>
                
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <a href="/about" className="block hover:text-blue-600 dark:hover:text-blue-400">
                    关于我们
                  </a>
                  <a href="/privacy" className="block hover:text-blue-600 dark:hover:text-blue-400">
                    隐私政策
                  </a>
                  <a href="/terms" className="block hover:text-blue-600 dark:hover:text-blue-400">
                    服务条款
                  </a>
                  <a href="/help" className="block hover:text-blue-600 dark:hover:text-blue-400">
                    帮助中心
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home