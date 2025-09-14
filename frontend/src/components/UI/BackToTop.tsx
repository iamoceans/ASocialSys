import React, { useState, useEffect } from 'react'
import { cn } from '../../utils'

interface BackToTopProps {
  className?: string
  threshold?: number
  smooth?: boolean
  size?: 'sm' | 'md' | 'lg'
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
}

const BackToTop: React.FC<BackToTopProps> = ({
  className,
  threshold = 300,
  smooth = true,
  size = 'md',
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  
  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = document.documentElement.scrollTop
      const maxHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const progress = (scrolled / maxHeight) * 100
      
      setScrollProgress(progress)
      setIsVisible(scrolled > threshold)
    }
    
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [threshold])
  
  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } else {
      window.scrollTo(0, 0)
    }
  }
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14'
  }
  
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  }
  
  if (!isVisible) return null
  
  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300',
        'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400',
        'hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
        'hover:shadow-xl hover:scale-110 active:scale-95',
        'border border-gray-200 dark:border-gray-700',
        sizeClasses[size],
        positionClasses[position],
        className
      )}
      aria-label="回到顶部"
      title="回到顶部"
    >
      {/* 进度环 */}
      <svg 
        className={cn('absolute inset-0', sizeClasses[size])} 
        viewBox="0 0 36 36"
      >
        <path
          className="text-gray-200 dark:text-gray-700"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="text-blue-500"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={`${scrollProgress}, 100`}
          strokeLinecap="round"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dasharray 0.3s ease'
          }}
        />
      </svg>
      
      {/* 箭头图标 */}
      <svg 
        className={cn('relative z-10', iconSizeClasses[size])} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  )
}

export default BackToTop