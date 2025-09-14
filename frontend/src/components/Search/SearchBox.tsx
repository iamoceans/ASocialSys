import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce, useClickOutside } from '../../hooks'
import { cn } from '../../utils'

interface SearchSuggestion {
  id: string
  type: 'user' | 'hashtag' | 'post' | 'recent'
  title: string
  subtitle?: string
  avatar?: string
  verified?: boolean
}

interface SearchBoxProps {
  className?: string
  placeholder?: string
  onSearch: (query: string) => void
  focused?: boolean
  onFocusChange?: (focused: boolean) => void
  autoFocus?: boolean
  size?: 'sm' | 'md' | 'lg'
  showSuggestions?: boolean
}

const SearchBox: React.FC<SearchBoxProps> = ({
  className,
  placeholder = '搜索...',
  onSearch,
  focused = false,
  onFocusChange,
  autoFocus = false,
  size = 'md',
  showSuggestions = true
}) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(focused)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const debouncedQuery = useDebounce(query, 300)
  
  // 点击外部关闭建议
  useClickOutside(containerRef, () => {
    setIsFocused(false)
    onFocusChange?.(false)
  })
  
  // 自动聚焦
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])
  
  // 外部控制焦点
  useEffect(() => {
    if (focused && inputRef.current) {
      inputRef.current.focus()
      setIsFocused(true)
    }
  }, [focused])
  
  // 搜索建议
  useEffect(() => {
    if (debouncedQuery.trim() && showSuggestions) {
      fetchSuggestions(debouncedQuery)
    } else {
      setSuggestions([])
    }
  }, [debouncedQuery, showSuggestions])
  
  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const mockSuggestions: SearchSuggestion[] = [
        {
          id: '1',
          type: 'user',
          title: '@张三',
          subtitle: '软件工程师',
          avatar: '/avatars/user1.jpg',
          verified: true
        },
        {
          id: '2',
          type: 'hashtag',
          title: '#前端开发',
          subtitle: '1.2k 帖子'
        },
        {
          id: '3',
          type: 'post',
          title: 'React 18 新特性详解',
          subtitle: '来自 @李四'
        },
        {
          id: '4',
          type: 'recent',
          title: searchQuery,
          subtitle: '最近搜索'
        }
      ]
      
      setSuggestions(mockSuggestions.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
  }
  
  const handleInputFocus = () => {
    setIsFocused(true)
    onFocusChange?.(true)
  }
  
  const handleInputBlur = () => {
    // 延迟关闭以允许点击建议
    setTimeout(() => {
      setIsFocused(false)
      onFocusChange?.(false)
    }, 200)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }
  
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'user':
        navigate(`/profile/${suggestion.title.replace('@', '')}`)
        break
      case 'hashtag':
        navigate(`/search?q=${encodeURIComponent(suggestion.title)}`)
        break
      case 'post':
        onSearch(suggestion.title)
        break
      case 'recent':
        setQuery(suggestion.title)
        onSearch(suggestion.title)
        break
    }
    setIsFocused(false)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setIsFocused(false)
        inputRef.current?.blur()
        break
    }
  }
  
  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    inputRef.current?.focus()
  }
  
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  }
  
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'user':
        return (
          <svg className={iconSizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      case 'hashtag':
        return (
          <svg className={iconSizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        )
      case 'post':
        return (
          <svg className={iconSizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'recent':
        return (
          <svg className={iconSizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }
  
  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        {/* 搜索图标 */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className={cn('text-gray-400', iconSizeClasses[size])} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* 输入框 */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'block w-full pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg',
            'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
            'placeholder-gray-500 dark:placeholder-gray-400',
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'transition-all duration-200',
            sizeClasses[size],
            isFocused && 'ring-2 ring-blue-500 border-blue-500'
          )}
        />
        
        {/* 清除按钮 */}
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className={iconSizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* 加载指示器 */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className={cn('animate-spin text-gray-400', iconSizeClasses[size])} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </form>
      
      {/* 搜索建议 */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                index === selectedIndex && 'bg-gray-50 dark:bg-gray-700',
                index === 0 && 'rounded-t-lg',
                index === suggestions.length - 1 && 'rounded-b-lg'
              )}
            >
              {suggestion.avatar ? (
                <img
                  src={suggestion.avatar}
                  alt={suggestion.title}
                  className="w-8 h-8 rounded-full object-cover mr-3"
                />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center text-gray-400 mr-3">
                  {getSuggestionIcon(suggestion.type)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {suggestion.title}
                  </p>
                  {suggestion.verified && (
                    <svg className="w-4 h-4 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {suggestion.subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {suggestion.subtitle}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBox