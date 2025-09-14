import React, { useEffect, useState } from 'react'
import { cn } from '../../utils'

interface LoadingBarProps {
  className?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  height?: 'thin' | 'normal' | 'thick'
  animated?: boolean
  progress?: number // 0-100, undefined for indeterminate
}

const LoadingBar: React.FC<LoadingBarProps> = ({
  className,
  color = 'primary',
  height = 'thin',
  animated = true,
  progress
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [currentProgress, setCurrentProgress] = useState(progress || 0)
  
  useEffect(() => {
    if (progress !== undefined) {
      setCurrentProgress(progress)
      if (progress >= 100) {
        const timer = setTimeout(() => setIsVisible(false), 300)
        return () => clearTimeout(timer)
      }
    }
  }, [progress])
  
  const colorClasses = {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  }
  
  const heightClasses = {
    thin: 'h-0.5',
    normal: 'h-1',
    thick: 'h-2'
  }
  
  if (!isVisible) return null
  
  return (
    <div className={cn(
      'fixed top-0 left-0 right-0 z-50 bg-gray-200 dark:bg-gray-700',
      heightClasses[height],
      className
    )}>
      <div
        className={cn(
          'h-full transition-all duration-300 ease-out',
          colorClasses[color],
          animated && progress === undefined && 'animate-pulse'
        )}
        style={{
          width: progress !== undefined ? `${currentProgress}%` : '100%',
          transform: progress === undefined && animated ? 'translateX(-100%)' : 'none',
          animation: progress === undefined && animated ? 'loading-bar 2s ease-in-out infinite' : 'none'
        }}
      />
      
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

export default LoadingBar