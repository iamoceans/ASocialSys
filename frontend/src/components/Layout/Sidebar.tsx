import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { cn } from '../../utils'

interface SidebarProps {
  isMobile?: boolean
}

interface NavItem {
  name: string
  path: string
  icon: React.ReactNode
  badge?: number
  requireAuth?: boolean
  children?: NavItem[]
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile = false }) => {
  const location = useLocation()
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  const { sidebarCollapsed } = useAppSelector(state => state.ui)
  const { unreadCount } = useAppSelector(state => state.notifications)
  const { unreadMessageCount } = useAppSelector(state => state.messages)
  
  const isCollapsed = !isMobile && sidebarCollapsed
  
  // 导航菜单项
  const navItems: NavItem[] = [
    {
      name: '首页',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: '探索',
      path: '/explore',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      name: '通知',
      path: '/notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z" />
        </svg>
      ),
      badge: unreadCount,
      requireAuth: true
    },
    {
      name: '消息',
      path: '/messages',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      badge: unreadMessageCount,
      requireAuth: true
    },
    {
      name: '书签',
      path: '/bookmarks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
      requireAuth: true
    },
    {
      name: '个人资料',
      path: `/profile/${user?.username}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      requireAuth: true
    },
    {
      name: '设置',
      path: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      requireAuth: true
    }
  ]
  
  // 过滤需要认证的菜单项
  const filteredNavItems = navItems.filter(item => {
    if (item.requireAuth && !isAuthenticated) {
      return false
    }
    return true
  })
  
  // 检查是否为活跃路径
  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }
  
  return (
    <nav className="h-full flex flex-col">
      {/* 导航菜单 */}
      <div className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group',
                    isActive || isActivePath(item.path)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
                    isCollapsed ? 'justify-center' : 'justify-start'
                  )
                }
              >
                <span className="flex-shrink-0">
                  {item.icon}
                </span>
                
                {!isCollapsed && (
                  <>
                    <span className="ml-3 truncate">{item.name}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </>
                )}
                
                {isCollapsed && item.badge && item.badge > 0 && (
                  <span className="absolute left-8 top-1 bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      
      {/* 用户信息 */}
      {isAuthenticated && user && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <div className={cn(
            'flex items-center',
            isCollapsed ? 'justify-center' : 'space-x-3'
          )}>
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.displayName || user.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @{user.username}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 快捷操作 */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <div className="space-y-2">
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              分享应用
            </button>
            
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              帮助中心
            </button>
          </div>
        </div>
      )}
      
      {/* 版本信息 */}
      {!isCollapsed && (
        <div className="p-3 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            ASocialSys v1.0.0
          </p>
        </div>
      )}
    </nav>
  )
}

export default Sidebar