import React, { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { updateProfile } from '../../store/slices/authSlice'
import { Button, Input, LoadingBar } from '../../components/UI'
import { UserAvatar } from '../../components/User'
import { cn } from '../../utils'

interface SettingsForm {
  displayName: string
  bio: string
  email: string
  avatar: string
  website: string
  location: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  likeNotifications: boolean
  commentNotifications: boolean
  followNotifications: boolean
  mentionNotifications: boolean
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private'
  showEmail: boolean
  showLocation: boolean
  allowDirectMessages: boolean
  allowTagging: boolean
}

const Settings: React.FC = () => {
  const { user } = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'account'>('profile')
  const [saving, setSaving] = useState(false)
  
  // 表单状态
  const [profileForm, setProfileForm] = useState<SettingsForm>({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    website: '',
    location: ''
  })
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    likeNotifications: true,
    commentNotifications: true,
    followNotifications: true,
    mentionNotifications: true
  })
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    allowDirectMessages: true,
    allowTagging: true
  })
  
  const [errors, setErrors] = useState<Partial<SettingsForm>>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  
  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 这里会从API加载用户设置
        
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadSettings()
  }, [])
  
  // 处理头像上传
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB限制
        setErrors(prev => ({ ...prev, avatar: '头像文件大小不能超过5MB' }))
        return
      }
      
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
        setProfileForm(prev => ({ ...prev, avatar: result }))
      }
      reader.readAsDataURL(file)
      setErrors(prev => ({ ...prev, avatar: undefined }))
    }
  }
  
  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Partial<SettingsForm> = {}
    
    if (!profileForm.displayName.trim()) {
      newErrors.displayName = '显示名称不能为空'
    } else if (profileForm.displayName.length > 50) {
      newErrors.displayName = '显示名称不能超过50个字符'
    }
    
    if (!profileForm.email.trim()) {
      newErrors.email = '邮箱不能为空'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }
    
    if (profileForm.bio.length > 160) {
      newErrors.bio = '个人简介不能超过160个字符'
    }
    
    if (profileForm.website && !/^https?:\/\/.+/.test(profileForm.website)) {
      newErrors.website = '请输入有效的网站地址（以http://或https://开头）'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // 保存个人资料
  const handleSaveProfile = async () => {
    if (!validateForm()) return
    
    try {
      setSaving(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 更新Redux状态
      dispatch(updateProfile({
        displayName: profileForm.displayName,
        bio: profileForm.bio,
        avatar: profileForm.avatar
      }))
      
      // 这里会调用实际的API
      
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }
  
  // 保存通知设置
  const handleSaveNotifications = async () => {
    try {
      setSaving(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 这里会调用实际的API
      
    } catch (error) {
      console.error('Failed to save notification settings:', error)
    } finally {
      setSaving(false)
    }
  }
  
  // 保存隐私设置
  const handleSavePrivacy = async () => {
    try {
      setSaving(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 这里会调用实际的API
      
    } catch (error) {
      console.error('Failed to save privacy settings:', error)
    } finally {
      setSaving(false)
    }
  }
  
  // 删除账户
  const handleDeleteAccount = async () => {
    if (!window.confirm('确定要删除账户吗？此操作不可撤销。')) {
      return
    }
    
    const confirmation = window.prompt('请输入 "DELETE" 确认删除账户：')
    if (confirmation !== 'DELETE') {
      return
    }
    
    try {
      setSaving(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 这里会调用实际的API删除账户
      alert('账户删除成功')
      
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('删除账户失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }
  
  const renderProfileSettings = () => (
    <div className="space-y-6">
      {/* 头像设置 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          头像
        </label>
        <div className="flex items-center space-x-4">
          <UserAvatar
            user={{
              ...user!,
              avatar: avatarPreview || profileForm.avatar
            }}
            size="lg"
          />
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              更换头像
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              支持 JPG、PNG 格式，最大 5MB
            </p>
          </div>
        </div>
        {errors.avatar && (
          <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>
        )}
      </div>
      
      {/* 基本信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="显示名称"
          value={profileForm.displayName}
          onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
          error={errors.displayName}
          maxLength={50}
          required
        />
        
        <Input
          label="邮箱地址"
          type="email"
          value={profileForm.email}
          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
          error={errors.email}
          required
        />
        
        <Input
          label="个人网站"
          type="url"
          value={profileForm.website}
          onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
          error={errors.website}
          placeholder="https://example.com"
        />
        
        <Input
          label="所在地"
          value={profileForm.location}
          onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
          placeholder="城市, 国家"
        />
      </div>
      
      {/* 个人简介 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          个人简介
        </label>
        <textarea
          value={profileForm.bio}
          onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
          className={cn(
            'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none',
            errors.bio
              ? 'border-red-300 dark:border-red-600'
              : 'border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
          )}
          rows={4}
          maxLength={160}
          placeholder="介绍一下你自己..."
        />
        <div className="flex justify-between items-center mt-1">
          {errors.bio && (
            <p className="text-red-500 text-sm">{errors.bio}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {profileForm.bio.length}/160
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleSaveProfile}
          loading={saving}
          disabled={Object.keys(errors).length > 0}
        >
          保存更改
        </Button>
      </div>
    </div>
  )
  
  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          通知偏好
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: '邮件通知', description: '接收重要活动的邮件通知' },
            { key: 'pushNotifications', label: '推送通知', description: '接收浏览器推送通知' },
            { key: 'likeNotifications', label: '点赞通知', description: '当有人点赞你的帖子时通知你' },
            { key: 'commentNotifications', label: '评论通知', description: '当有人评论你的帖子时通知你' },
            { key: 'followNotifications', label: '关注通知', description: '当有人关注你时通知你' },
            { key: 'mentionNotifications', label: '提及通知', description: '当有人在帖子中提及你时通知你' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between py-3">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {setting.label}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {setting.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings[setting.key as keyof NotificationSettings]}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    [setting.key]: e.target.checked
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleSaveNotifications}
          loading={saving}
        >
          保存更改
        </Button>
      </div>
    </div>
  )
  
  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          隐私设置
        </h3>
        
        {/* 个人资料可见性 */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            个人资料可见性
          </h4>
          <div className="space-y-2">
            {[
              { value: 'public', label: '公开', description: '任何人都可以查看你的个人资料' },
              { value: 'private', label: '私密', description: '只有关注者可以查看你的个人资料' }
            ].map((option) => (
              <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="profileVisibility"
                  value={option.value}
                  checked={privacySettings.profileVisibility === option.value}
                  onChange={(e) => setPrivacySettings(prev => ({
                    ...prev,
                    profileVisibility: e.target.value as 'public' | 'private'
                  }))}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        {/* 其他隐私选项 */}
        <div className="space-y-4">
          {[
            { key: 'showEmail', label: '显示邮箱地址', description: '在个人资料中显示邮箱地址' },
            { key: 'showLocation', label: '显示所在地', description: '在个人资料中显示所在地信息' },
            { key: 'allowDirectMessages', label: '允许私信', description: '允许其他用户给你发送私信' },
            { key: 'allowTagging', label: '允许标记', description: '允许其他用户在帖子中标记你' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between py-3">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {setting.label}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {setting.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings[setting.key as keyof PrivacySettings] as boolean}
                  onChange={(e) => setPrivacySettings(prev => ({
                    ...prev,
                    [setting.key]: e.target.checked
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleSavePrivacy}
          loading={saving}
        >
          保存更改
        </Button>
      </div>
    </div>
  )
  
  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          账户管理
        </h3>
        
        {/* 更改密码 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            更改密码
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            定期更改密码有助于保护你的账户安全
          </p>
          <Button variant="outline" size="sm">
            更改密码
          </Button>
        </div>
        
        {/* 两步验证 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            两步验证
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            为你的账户添加额外的安全保护
          </p>
          <Button variant="outline" size="sm">
            启用两步验证
          </Button>
        </div>
        
        {/* 登录设备 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            登录设备
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            查看和管理已登录的设备
          </p>
          <Button variant="outline" size="sm">
            管理设备
          </Button>
        </div>
        
        {/* 数据导出 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            数据导出
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            下载你的账户数据副本
          </p>
          <Button variant="outline" size="sm">
            导出数据
          </Button>
        </div>
        
        {/* 危险区域 */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
          <h4 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
            危险区域
          </h4>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h5 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              删除账户
            </h5>
            <p className="text-sm text-red-600 dark:text-red-300 mb-4">
              一旦删除账户，所有数据将被永久删除且无法恢复。请谨慎操作。
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAccount}
              loading={saving}
              className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              删除账户
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {loading && <LoadingBar progress={40} />}
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            设置
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理你的账户设置和偏好
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边栏导航 */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2">
              {[
                { key: 'profile', label: '个人资料', icon: 'user' },
                { key: 'notifications', label: '通知设置', icon: 'bell' },
                { key: 'privacy', label: '隐私设置', icon: 'shield' },
                { key: 'account', label: '账户管理', icon: 'cog' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activeTab === tab.key
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {tab.icon === 'user' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    )}
                    {tab.icon === 'bell' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a12 12 0 0124 0v10z" />
                    )}
                    {tab.icon === 'shield' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    )}
                    {tab.icon === 'cog' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    )}
                  </svg>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* 主内容区域 */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {activeTab === 'profile' && renderProfileSettings()}
              {activeTab === 'notifications' && renderNotificationSettings()}
              {activeTab === 'privacy' && renderPrivacySettings()}
              {activeTab === 'account' && renderAccountSettings()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings