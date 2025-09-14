import React from 'react'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { cn } from '../../utils'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className, 
  size = 'md', 
  showLabel = false 
}) => {
  const dispatch = useAppDispatch()
  const { theme } = useAppSelector(state => state.ui)
  
  const toggleTheme = () => {
    // dispatch(setTheme(theme === 'light' ? 'dark' : 'light'))
  }
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  }
  
  const SunIcon = () => (
    <svg 
      className={cn('transition-all duration-300', sizeClasses[size])} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
      />
    </svg>
  )
  
  const MoonIcon = () => (
    <svg 
      className={cn('transition-all duration-300', sizeClasses[size])} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
      />
    </svg>
  )
  
  const SystemIcon = () => (
    <svg 
      className={cn('transition-all duration-300', sizeClasses[size])} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
      />
    </svg>
  )
  
  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon />
      case 'dark':
        return <MoonIcon />
      case 'system':
      default:
        return <SystemIcon />
    }
  }
  
  const getLabel = () => {
    switch (theme) {
      case 'light':
        return '浅色模式'
      case 'dark':
        return '深色模式'
      case 'system':
      default:
        return '跟随系统'
    }
  }
  
  if (showLabel) {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
          className
        )}
        aria-label={`切换主题 - 当前: ${getLabel()}`}
      >
        {getIcon()}
        <span>{getLabel()}</span>
      </button>
    )
  }
  
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'rounded-lg transition-colors',
        'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
        'hover:bg-gray-100 dark:hover:bg-gray-700',
        buttonSizeClasses[size],
        className
      )}
      aria-label={`切换主题 - 当前: ${getLabel()}`}
      title={getLabel()}
    >
      {getIcon()}
    </button>
  )
}

export default ThemeToggle