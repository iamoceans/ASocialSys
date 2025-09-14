import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { Button, Input, LoadingBar } from '../../components/UI'
import { UserAvatar, UserCard } from '../../components/User'
import { PostCard, PostEditor } from '../../components/Post'
import { NotificationToast } from '../../components/Notification'
import { cn } from '../../utils'
import { User, Post } from '../../types'

interface ProfileStats {
  postsCount: number
  followersCount: number
  followingCount: number
  likesCount: number
}

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAppSelector(state => state.auth)
  
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<ProfileStats>({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    likesCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'followers' | 'following'>('posts')
  const [isEditing, setIsEditing] = useState(false)
  const [showPostEditor, setShowPostEditor] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  
  // 编辑表单状态
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    avatar: null as File | null
  })
  
  const isOwnProfile = currentUser?.username === username
  
  // 获取用户信息
  useEffect(() => {
    const fetchUser = async () => {
      if (!username) return
      
      try {
        setLoading(true)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 模拟用户数据
        const mockUser: User = {
          id: '1',
          username: username,
          email: `${username}@example.com`,
          displayName: username === 'john_doe' ? 'John Doe' : 'Jane Smith',
          avatar: `/avatars/${username}.jpg`,
          verified: username === 'john_doe',
          bio: username === 'john_doe' 
            ? '全栈开发工程师 | React & Node.js 爱好者 | 开源贡献者'
            : 'UI/UX 设计师 | 热爱创造美好的用户体验',
          location: username === 'john_doe' ? '北京, 中国' : '上海, 中国',
          website: username === 'john_doe' ? 'https://johndoe.dev' : 'https://janesmith.design',
          followersCount: username === 'john_doe' ? 1234 : 567,
          followingCount: username === 'john_doe' ? 456 : 234,
          postsCount: username === 'john_doe' ? 89 : 45,
          joinedAt: '2023-01-15T00:00:00Z'
        }
        
        setUser(mockUser)
        setStats({
          postsCount: mockUser.postsCount,
          followersCount: mockUser.followersCount,
          followingCount: mockUser.followingCount,
          likesCount: username === 'john_doe' ? 2345 : 1234
        })
        
        // 设置编辑表单初始值
        setEditForm({
          displayName: mockUser.displayName,
          bio: mockUser.bio || '',
          location: mockUser.location || '',
          website: mockUser.website || '',
          avatar: null
        })
        
        // 检查是否已关注
        setIsFollowing(!isOwnProfile && Math.random() > 0.5)
        
      } catch (error) {
        console.error('Failed to fetch user:', error)
        navigate('/404')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUser()
  }, [username, navigate, isOwnProfile])
  
  // 获取帖子列表
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user || activeTab !== 'posts') return
      
      try {
        setPostsLoading(true)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 600))
        
        // 模拟帖子数据
        const mockPosts: Post[] = Array.from({ length: 10 }, (_, i) => ({
          id: `post-${i + 1}`,
          content: `这是 ${user.displayName} 的第 ${i + 1} 条帖子。分享一些有趣的想法和见解。`,
          author: user,
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          likesCount: Math.floor(Math.random() * 100),
          commentsCount: Math.floor(Math.random() * 20),
          sharesCount: Math.floor(Math.random() * 10),
          isLiked: Math.random() > 0.7,
          isBookmarked: Math.random() > 0.8,
          images: i % 3 === 0 ? [`/images/post-${i + 1}.jpg`] : [],
          tags: i % 2 === 0 ? ['技术', '分享'] : ['生活', '感悟']
        }))
        
        setPosts(mockPosts)
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setPostsLoading(false)
      }
    }
    
    fetchPosts()
  }, [user, activeTab])
  
  const handleFollow = async () => {
    if (!user || isOwnProfile) return
    
    try {
      setFollowLoading(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setIsFollowing(!isFollowing)
      setStats(prev => ({
        ...prev,
        followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
      }))
      
    } catch (error) {
      console.error('Failed to follow/unfollow:', error)
    } finally {
      setFollowLoading(false)
    }
  }
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 更新用户信息
      if (user) {
        const updatedUser = {
          ...user,
          displayName: editForm.displayName,
          bio: editForm.bio,
          location: editForm.location,
          website: editForm.website
        }
        setUser(updatedUser)
      }
      
      setIsEditing(false)
      
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setEditForm(prev => ({ ...prev, avatar: file }))
    }
  }
  
  const handleCreatePost = async (postData: any) => {
    try {
      // 模拟创建帖子
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newPost: Post = {
        id: `post-${Date.now()}`,
        content: postData.content,
        author: user!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        isBookmarked: false,
        images: postData.images || [],
        tags: postData.tags || []
      }
      
      setPosts(prev => [newPost, ...prev])
      setStats(prev => ({ ...prev, postsCount: prev.postsCount + 1 }))
      setShowPostEditor(false)
      
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingBar progress={60} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            用户不存在
          </h1>
          <Button onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 用户信息卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          {/* 封面图片 */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative">
            {isOwnProfile && (
              <button className="absolute top-4 right-4 bg-black/20 hover:bg-black/30 text-white p-2 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="px-6 pb-6">
            <div className="flex items-start justify-between -mt-12">
              <div className="flex items-end space-x-4">
                {/* 头像 */}
                <div className="relative">
                  <UserAvatar
                    user={user}
                    size="xl"
                    className="border-4 border-white dark:border-gray-800"
                  />
                  {isOwnProfile && isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                {/* 用户信息 */}
                <div className="mt-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={editForm.displayName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="显示名称"
                        className="text-lg font-bold"
                      />
                      <Input
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="个人简介"
                        multiline
                        rows={2}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          value={editForm.location}
                          onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="所在地"
                          leftIcon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          }
                        />
                        <Input
                          value={editForm.website}
                          onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="个人网站"
                          leftIcon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.displayName}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
                      {user.bio && (
                        <p className="mt-2 text-gray-700 dark:text-gray-300">{user.bio}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {user.location && (
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{user.location}</span>
                          </div>
                        )}
                        {user.website && (
                          <a
                            href={user.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span>{user.website.replace(/^https?:\/\//, '')}</span>
                          </a>
                        )}
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0a4 4 0 00-4 4v4a4 4 0 004 4h8a4 4 0 004-4v-4a4 4 0 00-4-4" />
                          </svg>
                          <span>加入于 {new Date(user.joinedAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex items-center space-x-3 mt-4">
                {isOwnProfile ? (
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          取消
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          loading={loading}
                        >
                          保存
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          leftIcon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          }
                        >
                          编辑资料
                        </Button>
                        <Button
                          onClick={() => setShowPostEditor(true)}
                          leftIcon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          }
                        >
                          发布帖子
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant={isFollowing ? 'outline' : 'primary'}
                      onClick={handleFollow}
                      loading={followLoading}
                    >
                      {isFollowing ? '已关注' : '关注'}
                    </Button>
                    <Button variant="outline">
                      私信
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* 统计信息 */}
            <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.postsCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">帖子</div>
              </div>
              <div className="text-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.followersCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">关注者</div>
              </div>
              <div className="text-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.followingCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">关注中</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.likesCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">获赞</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 标签页 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'posts', label: '帖子', count: stats.postsCount },
                { key: 'likes', label: '点赞', count: stats.likesCount },
                { key: 'followers', label: '关注者', count: stats.followersCount },
                { key: 'following', label: '关注中', count: stats.followingCount }
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
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* 标签页内容 */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {postsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
                      </div>
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {isOwnProfile ? '还没有发布帖子' : '暂无帖子'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile ? '分享你的第一个想法吧！' : '这个用户还没有发布任何帖子'}
                    </p>
                    {isOwnProfile && (
                      <Button
                        className="mt-4"
                        onClick={() => setShowPostEditor(true)}
                      >
                        发布帖子
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'likes' && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无点赞记录
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {isOwnProfile ? '你还没有点赞任何帖子' : '这个用户还没有点赞任何帖子'}
                </p>
              </div>
            )}
            
            {activeTab === 'followers' && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无关注者
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {isOwnProfile ? '还没有人关注你' : '这个用户还没有关注者'}
                </p>
              </div>
            )}
            
            {activeTab === 'following' && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无关注
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {isOwnProfile ? '你还没有关注任何人' : '这个用户还没有关注任何人'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 发帖编辑器模态框 */}
      {showPostEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  发布新帖子
                </h2>
                <button
                  onClick={() => setShowPostEditor(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <PostEditor
                onSubmit={handleCreatePost}
                onCancel={() => setShowPostEditor(false)}
              />
            </div>
          </div>
        </div>
      )}
      
      <NotificationToast />
    </div>
  )
}

export default Profile