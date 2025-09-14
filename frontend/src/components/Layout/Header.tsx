import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { useClickOutside, useKeyboard } from '../../hooks'
import SearchBox from '../Search/SearchBox'
import NotificationDropdown from '../Notification/NotificationDropdown'
import UserDropdown from '../User/UserDropdown'
import ThemeToggle from '../UI/ThemeToggle'
import Logo from '../UI/Logo'

const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  
  // Redux状态
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  const { theme, sidebarCollapsed } = useAppSelector(state => state.ui)
  const { unreadCount } = useAppSelector(state => state.notifications)
  
  // 本地状态
  const [searchFocused, setSearchFocused] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  
  // Refs
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  
  // 点击外部关闭下拉菜单
  useClickOutside(userMenuRef, () => setShowUserMenu(false))
  useClickOutside(notificationRef, () => setShowNotifications(false))
  useClickOutside(searchRef, () => setShowMobileSearch(false))
  
  // 键盘快捷键
  useKeyboard({
    '/': (e) => {
      e.preventDefault()
      setSearchFocused(true)
    },
    'Escape': () => {
      setSearchFocused(false)
      setShowMobileSearch(false)
    },
    'c': (e) => {
      if (e.metaKey || e.ctrlKey) return
      e.preventDefault()
      navigate('/compose')
    },
    'n': (e) => {
      if (e.metaKey || e.ctrlKey) return
      e.preventDefault()
      setShowNotifications(!showNotifications)
    }
  })
  
  // 处理搜索
  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setShowMobileSearch(false)
    }
  }
  
  // 切换侧边栏
  const toggleSidebar = () => {
    // dispatch(toggleSidebarCollapsed())
  }
  
  // 切换移动端菜单
  const toggleMobileMenu = () => {
    // dispatch(toggleMobileMenu())
  }
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* 左侧 */}
        <div className="flex items-center space-x-4">
          {/* 移动端菜单按钮 */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="打开菜单"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* 桌面端侧边栏切换按钮 */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Logo size="md" variant="icon" />
            <span className="hidden sm:block text-xl font-bold text-gray-900 dark:text-white">
              ASocialSys
            </span>
          </Link>
        </div>
        
        {/* 中间 - 搜索框 */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <SearchBox
            onSearch={handleSearch}
            focused={searchFocused}
            onFocusChange={setSearchFocused}
            placeholder="搜索用户、帖子、话题..."
            className="w-full"
          />
        </div>
        
        {/* 右侧 */}
        <div className="flex items-center space-x-2">
          {/* 移动端搜索按钮 */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="搜索"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          {/* 新建帖子按钮 */}
          <Link
            to="/compose"
            className="hidden sm:flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            发布
          </Link>
          
          {/* 移动端新建按钮 */}
          <Link
            to="/compose"
            className="sm:hidden p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            aria-label="发布新帖子"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
          
          {/* 主题切换 */}
          <ThemeToggle />
          
          {isAuthenticated ? (
            <>
              {/* 通知按钮 */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="通知"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                  </div>
                )}
              </div>
              
              {/* 用户菜单 */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="用户菜单"
                >
                  <img
                    src={user?.avatar || '/default-avatar.png'}
                    alt={user?.username || '用户头像'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <svg className="hidden sm:block w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <UserDropdown onClose={() => setShowUserMenu(false)} />
                  </div>
                )}
              </div>
            </>
          ) : (
            /* 未登录状态 */
            <div className="flex items-center space-x-2">
              <Link
                to="/auth/login"
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                登录
              </Link>
              <Link
                to="/auth/register"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* 移动端搜索覆盖层 */}
      {showMobileSearch && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-40">
          <div ref={searchRef}>
            <SearchBox
              onSearch={handleSearch}
              focused={true}
              onFocusChange={() => {}}
              placeholder="搜索用户、帖子、话题..."
              className="w-full"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}

export default Header