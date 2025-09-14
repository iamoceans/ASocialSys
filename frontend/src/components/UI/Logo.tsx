import React from 'react'
import { cn } from '../../utils'

interface LogoProps {
  className?: string
  variant?: 'icon' | 'text' | 'full'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'dark' | 'auto'
}

const Logo: React.FC<LogoProps> = ({ 
  className, 
  variant = 'icon', 
  size = 'md',
  color = 'auto'
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  
  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }
  
  const colorClasses = {
    primary: 'text-blue-600',
    white: 'text-white',
    dark: 'text-gray-900',
    auto: 'text-gray-900 dark:text-white'
  }
  
  const LogoIcon = () => (
    <svg 
      className={cn(sizeClasses[size], colorClasses[color])} 
      viewBox="0 0 32 32" 
      fill="currentColor"
    >
      {/* 主要图标 - 社交网络节点 */}
      <circle cx="16" cy="8" r="3" />
      <circle cx="8" cy="20" r="3" />
      <circle cx="24" cy="20" r="3" />
      <circle cx="16" cy="26" r="2" />
      
      {/* 连接线 */}
      <path d="M13.5 10.5L10.5 17.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M18.5 10.5L21.5 17.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M11 22L14 25" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M21 22L18 25" stroke="currentColor" strokeWidth="1.5" fill="none" />
      
      {/* 装饰性元素 */}
      <circle cx="6" cy="12" r="1" opacity="0.6" />
      <circle cx="26" cy="12" r="1" opacity="0.6" />
      <circle cx="12" cy="6" r="1" opacity="0.4" />
      <circle cx="20" cy="6" r="1" opacity="0.4" />
    </svg>
  )
  
  const LogoText = () => (
    <span className={cn(
      'font-bold tracking-tight',
      textSizeClasses[size],
      colorClasses[color]
    )}>
      ASocialSys
    </span>
  )
  
  const renderLogo = () => {
    switch (variant) {
      case 'icon':
        return <LogoIcon />
      case 'text':
        return <LogoText />
      case 'full':
        return (
          <div className="flex items-center space-x-2">
            <LogoIcon />
            <LogoText />
          </div>
        )
      default:
        return <LogoIcon />
    }
  }
  
  return (
    <div className={cn('flex items-center', className)}>
      {renderLogo()}
    </div>
  )
}

export default Logo