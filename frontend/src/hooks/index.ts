import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { debounce, throttle } from '../utils'

/**
 * 本地存储hook
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}

/**
 * 会话存储hook
 */
export const useSessionStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}

/**
 * 防抖hook
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 防抖回调hook
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  )

  return debouncedCallback as T
}

/**
 * 节流回调hook
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T => {
  const throttledCallback = useMemo(
    () => throttle(callback, limit),
    [callback, limit]
  )

  return throttledCallback as T
}

/**
 * 网络状态hook
 */
export const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * 窗口大小hook
 */
export const useWindowSize = (): { width: number; height: number } => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

/**
 * 媒体查询hook
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

/**
 * 响应式断点hook
 */
export const useBreakpoint = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1025px)')
  const isLargeDesktop = useMediaQuery('(min-width: 1440px)')

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    current: isMobile ? 'mobile' : isTablet ? 'tablet' : isDesktop ? 'desktop' : 'large'
  }
}

/**
 * 滚动位置hook
 */
export const useScrollPosition = (): { x: number; y: number } => {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition({ x: window.pageXOffset, y: window.pageYOffset })
    }

    window.addEventListener('scroll', updatePosition)
    updatePosition()

    return () => window.removeEventListener('scroll', updatePosition)
  }, [])

  return scrollPosition
}

/**
 * 滚动方向hook
 */
export const useScrollDirection = (): 'up' | 'down' | null => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset
      const direction = scrollY > lastScrollY ? 'down' : 'up'
      if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
        setScrollDirection(direction)
      }
      setLastScrollY(scrollY > 0 ? scrollY : 0)
    }

    window.addEventListener('scroll', updateScrollDirection)
    return () => window.removeEventListener('scroll', updateScrollDirection)
  }, [scrollDirection, lastScrollY])

  return scrollDirection
}

/**
 * 元素可见性hook
 */
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      options
    )

    observer.observe(element)
    return () => observer.unobserve(element)
  }, [elementRef, options])

  return isVisible
}

/**
 * 懒加载hook
 */
export const useLazyLoad = <T extends Element>(
  options?: IntersectionObserverInit
): [React.RefObject<T>, boolean] => {
  const elementRef = useRef<T>(null)
  const isVisible = useIntersectionObserver(elementRef, options)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (isVisible && !hasLoaded) {
      setHasLoaded(true)
    }
  }, [isVisible, hasLoaded])

  return [elementRef, hasLoaded]
}

/**
 * 点击外部hook
 */
export const useClickOutside = <T extends HTMLElement>(
  callback: () => void
): React.RefObject<T> => {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [callback])

  return ref
}

/**
 * 键盘事件hook
 */
export const useKeyPress = (targetKey: string): boolean => {
  const [keyPressed, setKeyPressed] = useState(false)

  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(true)
      }
    }

    const upHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(false)
      }
    }

    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)

    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [targetKey])

  return keyPressed
}

/**
 * 复制到剪贴板hook
 */
export const useCopyToClipboard = (): [boolean, (text: string) => Promise<void>] => {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy text: ', error)
      setIsCopied(false)
    }
  }, [])

  return [isCopied, copyToClipboard]
}

/**
 * 异步状态hook
 */
export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
): {
  execute: () => Promise<void>
  status: 'idle' | 'pending' | 'success' | 'error'
  value: T | null
  error: E | null
} => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [value, setValue] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)

  const execute = useCallback(async () => {
    setStatus('pending')
    setValue(null)
    setError(null)

    try {
      const response = await asyncFunction()
      setValue(response)
      setStatus('success')
    } catch (error) {
      setError(error as E)
      setStatus('error')
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, status, value, error }
}

/**
 * 计时器hook
 */
export const useTimer = (initialTime: number = 0): {
  time: number
  start: () => void
  stop: () => void
  reset: () => void
  isRunning: boolean
} => {
  const [time, setTime] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true)
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1)
      }, 1000)
    }
  }, [isRunning])

  const stop = useCallback(() => {
    if (isRunning && intervalRef.current) {
      setIsRunning(false)
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isRunning])

  const reset = useCallback(() => {
    setTime(initialTime)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [initialTime])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return { time, start, stop, reset, isRunning }
}

/**
 * 倒计时hook
 */
export const useCountdown = (initialTime: number): {
  time: number
  start: () => void
  stop: () => void
  reset: () => void
  isRunning: boolean
  isFinished: boolean
} => {
  const [time, setTime] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(() => {
    if (!isRunning && time > 0) {
      setIsRunning(true)
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            setIsRunning(false)
            setIsFinished(true)
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }
  }, [isRunning, time])

  const stop = useCallback(() => {
    if (isRunning && intervalRef.current) {
      setIsRunning(false)
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isRunning])

  const reset = useCallback(() => {
    setTime(initialTime)
    setIsFinished(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [initialTime])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return { time, start, stop, reset, isRunning, isFinished }
}

/**
 * 主题hook
 */
export const useTheme = () => {
  const theme = useAppSelector(state => state.ui.theme)
  const dispatch = useAppDispatch()

  const toggleTheme = useCallback(() => {
    // 这里需要导入对应的action
    // dispatch(toggleTheme())
  }, [dispatch])

  return { theme, toggleTheme }
}

/**
 * 认证状态hook
 */
export const useAuth = () => {
  const auth = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.loading,
    error: auth.error
  }
}

/**
 * 通知hook
 */
export const useNotifications = () => {
  const notifications = useAppSelector(state => state.notifications)
  const dispatch = useAppDispatch()

  return {
    notifications: notifications.notifications,
    unreadCount: notifications.unreadCount,
    isLoading: notifications.loading,
    error: notifications.error
  }
}

/**
 * 表单验证hook
 */
export const useFormValidation = <T extends Record<string, any>>(
  config: {
    initialValues: T
    validate?: (values: T) => Partial<Record<keyof T, string>>
    onSubmit?: (values: T) => void | Promise<void>
  }
) => {
  const { initialValues, validate, onSubmit } = config
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    
    setValues(prev => ({ ...prev, [name]: finalValue }))
    
    // 如果字段已经被触摸过，立即验证
    if (touched[name as keyof T] && validate) {
      const newErrors = validate({ ...values, [name]: finalValue })
      setErrors(prev => ({ ...prev, [name]: newErrors[name as keyof T] }))
    }
  }, [values, touched, validate])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // 验证当前字段
    if (validate) {
      const newErrors = validate(values)
      setErrors(prev => ({ ...prev, [name]: newErrors[name as keyof T] }))
    }
  }, [values, validate])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // 标记所有字段为已触摸
    const allTouched = Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = true
      return acc
    }, {} as Partial<Record<keyof T, boolean>>)
    setTouched(allTouched)
    
    // 验证所有字段
    if (validate) {
      const newErrors = validate(values)
      setErrors(newErrors)
      
      // 如果有错误，不提交
      if (Object.keys(newErrors).some(key => newErrors[key as keyof T])) {
        return
      }
    }
    
    // 提交表单
    if (onSubmit) {
      setIsSubmitting(true)
      Promise.resolve(onSubmit(values))
        .finally(() => setIsSubmitting(false))
    }
  }, [values, initialValues, validate, onSubmit])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const isValid = useMemo(() => {
    if (!validate) return true
    const currentErrors = validate(values)
    return !Object.keys(currentErrors).some(key => currentErrors[key as keyof T])
  }, [values, validate])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  }
}

/**
 * 无限滚动hook
 */
export const useInfiniteScroll = <T>(
  fetchMore: () => Promise<T[]>,
  hasMore: boolean
) => {
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching) {
        return
      }
      if (hasMore) {
        setIsFetching(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isFetching, hasMore])

  useEffect(() => {
    if (!isFetching) return

    const fetchData = async () => {
      try {
        await fetchMore()
      } catch (error) {
        console.error('Error fetching more data:', error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchData()
  }, [isFetching, fetchMore])

  return { isFetching }
}

// 别名导出
export const useForm = useFormValidation

/**
 * 键盘事件hook
 */
export const useKeyboard = (keyMap: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const handler = keyMap[key]
      if (handler) {
        event.preventDefault()
        handler()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keyMap])
}