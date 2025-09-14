import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { useBreakpoint, useScrollDirection } from '../../hooks'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileNavigation from './MobileNavigation'
import NotificationToast from '../Notification/NotificationToast'
import LoadingBar from '../UI/LoadingBar'
import BackToTop from '../UI/BackToTop'

interface LayoutProps {
  children?: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isMobile, isTablet } = useBreakpoint()
  const scrollDirection = useScrollDirection()
  
  // Redux状态
  const { theme } = useAppSelector(state => state.ui)
  const { isLoading } = useAppSelector(state => state.ui)
  const { sidebarCollapsed, mobileMenuOpen } = useAppSelector(state => state.ui)
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  
  // 本地状态
  const [isInitialized, setIsInitialized] = useState(false)
  
  // 初始化应用
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 检查认证状态
        if (!isAuthenticated) {
          navigate('/auth/login')
          return
        }
        
        // 获取用户信息
        // dispatch(getCurrentUser())
        
        // 获取未读通知数量
        // dispatch(getUnreadNotificationCount())
        
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }
    
    initializeApp()
  }, [dispatch, isAuthenticated, navigate])
  
  // 主题切换
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])
  
  // 移动端菜单控制
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])
  
  // 路由变化时关闭移动端菜单
  useEffect(() => {
    if (mobileMenuOpen) {
      // dispatch(closeMobileMenu())
    }
  }, [location.pathname, mobileMenuOpen, dispatch])
  
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      {/* 加载进度条 */}
      {isLoading && <LoadingBar />}
      
      {/* 头部导航 */}
      <Header />
      
      <div className="flex">
        {/* 侧边栏 - 桌面端 */}
        {!isMobile && (
          <aside 
            className={`
              fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30
              transition-all duration-300 ease-in-out
              ${sidebarCollapsed ? 'w-16' : 'w-64'}
            `}
          >
            <Sidebar />
          </aside>
        )}
        
        {/* 主内容区域 */}
        <main 
          className={`
            flex-1 min-h-[calc(100vh-4rem)] mt-16
            transition-all duration-300 ease-in-out
            ${!isMobile ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'}
            ${isMobile ? 'pb-16' : 'pb-0'}
          `}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
      
      {/* 移动端底部导航 */}
      {isMobile && (
        <div 
          className={`
            fixed bottom-0 left-0 right-0 z-40
            transition-transform duration-300
            ${scrollDirection === 'down' ? 'translate-y-full' : 'translate-y-0'}
          `}
        >
          <MobileNavigation />
        </div>
      )}
      
      {/* 移动端侧边栏遮罩 */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            // dispatch(closeMobileMenu())
          }}
        />
      )}
      
      {/* 移动端侧边栏 */}
      {isMobile && (
        <aside 
          className={`
            fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 z-50
            transform transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">菜单</h2>
              <button
                onClick={() => {
                  // dispatch(closeMobileMenu())
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar isMobile={true} />
          </div>
        </aside>
      )}
      
      {/* 通知提示 */}
      <NotificationToast />
      
      {/* 回到顶部按钮 */}
      <BackToTop />
      
      {/* 键盘快捷键提示 */}
      <div className="hidden">
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">快捷键</h3>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>新建帖子</span>
              <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">C</kbd>
            </div>
            <div className="flex justify-between">
              <span>搜索</span>
              <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">/</kbd>
            </div>
            <div className="flex justify-between">
              <span>通知</span>
              <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">N</kbd>
            </div>
            <div className="flex justify-between">
              <span>消息</span>
              <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">M</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout