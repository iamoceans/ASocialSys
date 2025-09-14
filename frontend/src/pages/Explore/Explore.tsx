import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchBox } from '../../components/Search'
import { PostCard } from '../../components/Post'
import { UserCard } from '../../components/User'
import { Button, LoadingBar } from '../../components/UI'
import { cn } from '../../utils'
import { Post, User } from '../../types'

interface TrendingTopic {
  id: string
  name: string
  postsCount: number
  trend: 'up' | 'down' | 'stable'
}

const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'trending' | 'posts' | 'users' | 'topics'>('trending')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [topics, setTopics] = useState<TrendingTopic[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  
  // 获取趋势数据
  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setLoading(true)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 模拟趋势帖子
        const mockPosts: Post[] = Array.from({ length: 10 }, (_, i) => {
          const authors = [
            {
              id: '1',
              username: 'tech_guru',
              displayName: '科技达人',
              avatar: '/avatars/tech_guru.jpg',
              verified: true
            },
            {
              id: '2',
              username: 'design_master',
              displayName: '设计大师',
              avatar: '/avatars/design_master.jpg',
              verified: false
            },
            {
              id: '3',
              username: 'startup_founder',
              displayName: '创业者',
              avatar: '/avatars/startup_founder.jpg',
              verified: true
            }
          ]
          
          const author = authors[i % authors.length]
          
          return {
            id: `trending-post-${i + 1}`,
            content: [
              '刚刚发布了一个开源项目，使用 React + TypeScript 构建的现代化社交平台！🚀',
              '分享一些关于 UI/UX 设计的最新趋势，简约风格正在回归 ✨',
              '创业路上的一些思考：技术选型的重要性不容忽视 💡',
              '今天学习了 Next.js 13 的新特性，App Router 真的很强大！',
              '推荐一个很棒的设计工具，大大提升了我的工作效率 🎨',
              '关于远程工作的一些心得体会，平衡工作与生活很重要',
              '最近在研究 AI 技术在前端开发中的应用，未来可期！',
              '分享一个代码优化的小技巧，让你的应用性能提升 50% ⚡',
              '参加了一个技术会议，收获满满，认识了很多优秀的开发者',
              '开源社区的力量真的很强大，感谢所有贡献者们！ 🙏'
            ][i],
            author: {
              ...author,
              email: `${author.username}@example.com`,
              bio: '',
              followersCount: Math.floor(Math.random() * 10000),
              followingCount: Math.floor(Math.random() * 1000),
              postsCount: Math.floor(Math.random() * 500),
              joinedAt: '2023-01-01T00:00:00Z'
            },
            createdAt: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
            likesCount: Math.floor(Math.random() * 500) + 50,
            commentsCount: Math.floor(Math.random() * 100) + 10,
            sharesCount: Math.floor(Math.random() * 50) + 5,
            isLiked: Math.random() > 0.7,
            isBookmarked: Math.random() > 0.8,
            images: i % 4 === 0 ? [`/images/trending-${i + 1}.jpg`] : [],
            tags: [
              ['技术', '开源', 'React'],
              ['设计', 'UI', 'UX'],
              ['创业', '思考', '分享'],
              ['前端', 'Next.js', '学习'],
              ['工具', '效率', '设计'],
              ['生活', '工作', '平衡'],
              ['AI', '前端', '未来'],
              ['优化', '性能', '技巧'],
              ['会议', '技术', '交流'],
              ['开源', '社区', '感谢']
            ][i] || []
          }
        })
        
        // 模拟推荐用户
        const mockUsers: User[] = [
          {
            id: '1',
            username: 'alice_dev',
            email: 'alice@example.com',
            displayName: 'Alice Johnson',
            avatar: '/avatars/alice.jpg',
            verified: true,
            bio: '全栈开发工程师 | React & Node.js 专家 | 开源爱好者',
            followersCount: 5420,
            followingCount: 892,
            postsCount: 234,
            joinedAt: '2022-03-15T00:00:00Z'
          },
          {
            id: '2',
            username: 'bob_designer',
            email: 'bob@example.com',
            displayName: 'Bob Smith',
            avatar: '/avatars/bob.jpg',
            verified: false,
            bio: 'UI/UX 设计师 | 品牌设计 | 用户体验专家',
            followersCount: 3210,
            followingCount: 567,
            postsCount: 156,
            joinedAt: '2022-07-20T00:00:00Z'
          },
          {
            id: '3',
            username: 'carol_pm',
            email: 'carol@example.com',
            displayName: 'Carol Wilson',
            avatar: '/avatars/carol.jpg',
            verified: true,
            bio: '产品经理 | 敏捷开发 | 数据驱动决策',
            followersCount: 2890,
            followingCount: 445,
            postsCount: 89,
            joinedAt: '2022-11-10T00:00:00Z'
          },
          {
            id: '4',
            username: 'david_startup',
            email: 'david@example.com',
            displayName: 'David Chen',
            avatar: '/avatars/david.jpg',
            verified: false,
            bio: '创业者 | SaaS 产品 | 技术创新',
            followersCount: 1567,
            followingCount: 234,
            postsCount: 67,
            joinedAt: '2023-02-05T00:00:00Z'
          },
          {
            id: '5',
            username: 'emma_writer',
            email: 'emma@example.com',
            displayName: 'Emma Davis',
            avatar: '/avatars/emma.jpg',
            verified: true,
            bio: '技术写作者 | 内容创作 | 知识分享',
            followersCount: 4321,
            followingCount: 678,
            postsCount: 345,
            joinedAt: '2021-12-01T00:00:00Z'
          }
        ]
        
        // 模拟热门话题
        const mockTopics: TrendingTopic[] = [
          { id: '1', name: 'React18', postsCount: 1234, trend: 'up' },
          { id: '2', name: 'TypeScript', postsCount: 987, trend: 'up' },
          { id: '3', name: 'Next.js', postsCount: 756, trend: 'stable' },
          { id: '4', name: 'TailwindCSS', postsCount: 654, trend: 'up' },
          { id: '5', name: 'Vue3', postsCount: 543, trend: 'down' },
          { id: '6', name: 'Node.js', postsCount: 432, trend: 'stable' },
          { id: '7', name: 'GraphQL', postsCount: 321, trend: 'up' },
          { id: '8', name: 'Docker', postsCount: 298, trend: 'stable' },
          { id: '9', name: 'Kubernetes', postsCount: 234, trend: 'up' },
          { id: '10', name: 'AWS', postsCount: 198, trend: 'down' }
        ]
        
        setPosts(mockPosts)
        setUsers(mockUsers)
        setTopics(mockTopics)
        
      } catch (error) {
        console.error('Failed to fetch trending data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTrendingData()
  }, [])
  
  // 搜索功能
  useEffect(() => {
    if (searchQuery) {
      setSearchParams({ q: searchQuery })
      performSearch(searchQuery)
    } else {
      setSearchParams({})
    }
  }, [searchQuery, setSearchParams])
  
  const performSearch = async (query: string) => {
    if (!query.trim()) return
    
    try {
      setLoading(true)
      
      // 模拟搜索API调用
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // 模拟搜索结果
      const searchResults = posts.filter(post => 
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.author.displayName.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      
      const userResults = users.filter(user =>
        user.displayName.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes(query.toLowerCase()))
      )
      
      setPosts(searchResults)
      setUsers(userResults)
      
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    setPage(1)
  }
  
  const loadMore = async () => {
    if (loading || !hasMore) return
    
    try {
      setLoading(true)
      
      // 模拟加载更多数据
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 模拟没有更多数据
      if (page >= 3) {
        setHasMore(false)
        return
      }
      
      setPage(prev => prev + 1)
      
    } catch (error) {
      console.error('Failed to load more:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const getTrendIcon = (trend: TrendingTopic['trend']) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        )
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        )
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {loading && <LoadingBar progress={60} />}
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 搜索栏 */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="搜索帖子、用户、话题..."
              autoFocus
            />
          </div>
        </div>
        
        {/* 标签页导航 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'trending', label: '趋势', icon: '🔥' },
                { key: 'posts', label: '帖子', icon: '📝' },
                { key: 'users', label: '用户', icon: '👥' },
                { key: 'topics', label: '话题', icon: '🏷️' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key as any)}
                  className={cn(
                    'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主内容 */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'trending' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  🔥 热门内容
                </h2>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.slice(0, 5).map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'posts' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  📝 {searchQuery ? `搜索结果: "${searchQuery}"` : '所有帖子'}
                </h2>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                    
                    {hasMore && (
                      <div className="text-center">
                        <Button
                          variant="outline"
                          onClick={loadMore}
                          loading={loading}
                        >
                          加载更多
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchQuery ? '没有找到相关帖子' : '暂无帖子'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery ? '尝试使用其他关键词搜索' : '还没有人发布帖子'}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  👥 {searchQuery ? `用户搜索结果: "${searchQuery}"` : '推荐用户'}
                </h2>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : users.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.map((user) => (
                      <UserCard key={user.id} user={user} compact />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchQuery ? '没有找到相关用户' : '暂无用户'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery ? '尝试使用其他关键词搜索' : '还没有用户加入'}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'topics' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  🏷️ 热门话题
                </h2>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topics.map((topic, index) => (
                      <div
                        key={topic.id}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSearchQuery(topic.name)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              #{index + 1}
                            </span>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              #{topic.name}
                            </h3>
                          </div>
                          {getTrendIcon(topic.trend)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {topic.postsCount.toLocaleString()} 条帖子
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 热门话题 */}
            {activeTab !== 'topics' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🔥 热门话题
                </h3>
                <div className="space-y-3">
                  {topics.slice(0, 5).map((topic, index) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => setSearchQuery(topic.name)}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            #{index + 1}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            #{topic.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {topic.postsCount.toLocaleString()} 条帖子
                        </p>
                      </div>
                      {getTrendIcon(topic.trend)}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => setActiveTab('topics')}
                >
                  查看更多话题
                </Button>
              </div>
            )}
            
            {/* 推荐用户 */}
            {activeTab !== 'users' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  👥 推荐关注
                </h3>
                <div className="space-y-4">
                  {users.slice(0, 3).map((user) => (
                    <UserCard key={user.id} user={user} compact />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => setActiveTab('users')}
                >
                  查看更多用户
                </Button>
              </div>
            )}
            
            {/* 搜索提示 */}
            {!searchQuery && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      搜索技巧
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                      <li>• 使用 # 搜索话题</li>
                      <li>• 使用 @ 搜索用户</li>
                      <li>• 使用引号搜索精确短语</li>
                      <li>• 使用空格分隔多个关键词</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Explore