import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { store } from '../store'
import { logout, refreshToken } from '../store/slices/authSlice'
import { showToast } from '../store/slices/uiSlice'
import type { ApiResponse, ApiError } from '../types'

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
const API_TIMEOUT = 30000 // 30秒超时

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证令牌
    const state = store.getState()
    const token = state.auth.accessToken
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求ID用于追踪
    config.headers['X-Request-ID'] = generateRequestId()
    
    // 添加时间戳
    config.headers['X-Timestamp'] = new Date().toISOString()
    
    // 开发环境下记录请求
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      })
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 开发环境下记录响应
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }
    
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    
    // 开发环境下记录错误
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      })
    }
    
    // 处理 401 未授权错误
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // 尝试刷新令牌
        const state = store.getState()
        const refreshTokenValue = state.auth.refreshToken
        
        if (refreshTokenValue) {
          await store.dispatch(refreshToken()).unwrap()
          
          // 重新发送原始请求
          const newToken = store.getState().auth.accessToken
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return apiClient(originalRequest)
          }
        }
      } catch (refreshError) {
        // 刷新令牌失败，登出用户
        store.dispatch(logout())
        store.dispatch(showToast({
          type: 'error',
          message: '登录已过期，请重新登录',
          duration: 5000,
        }))
      }
    }
    
    // 处理网络错误
    if (!error.response) {
      store.dispatch(showToast({
        type: 'error',
        message: '网络连接失败，请检查网络设置',
        duration: 5000,
      }))
    }
    
    // 处理服务器错误
    if (error.response?.status >= 500) {
      store.dispatch(showToast({
        type: 'error',
        message: '服务器错误，请稍后重试',
        duration: 5000,
      }))
    }
    
    return Promise.reject(error)
  }
)

// 生成请求ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// API 响应包装器
class ApiService {
  private client: AxiosInstance
  
  constructor(client: AxiosInstance) {
    this.client = client
  }
  
  // GET 请求
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }
  
  // POST 请求
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }
  
  // PUT 请求
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }
  
  // PATCH 请求
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }
  
  // DELETE 请求
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }
  
  // 文件上传
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await this.client.post<ApiResponse<T>>(url, formData, {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(progress)
          }
        },
      })
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }
  
  // 批量上传
  async uploadMultiple<T = any>(
    url: string,
    files: File[],
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })
    
    try {
      const response = await this.client.post<ApiResponse<T>>(url, formData, {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(progress)
          }
        },
      })
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }
  
  // 下载文件
  async download(
    url: string,
    filename?: string,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<void> {
    try {
      const response = await this.client.get(url, {
        ...config,
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(progress)
          }
        },
      })
      
      // 创建下载链接
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }
  
  // 错误处理
  private handleError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const responseData = error.response.data as any
      return {
        code: responseData.code || `HTTP_${error.response.status}`,
        message: responseData.message || error.message,
        details: responseData.errors || responseData.details,
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      return {
        code: 'TIMEOUT',
        message: '请求超时，请稍后重试',
      }
    }
    
    if (error.code === 'ERR_NETWORK') {
      return {
        code: 'NETWORK_ERROR',
        message: '网络连接失败，请检查网络设置',
      }
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || '未知错误',
    }
  }
}

// 创建 API 服务实例
export const api = new ApiService(apiClient)

// 导出 axios 实例（用于特殊情况）
export { apiClient }

// 工具函数
export const buildUrl = (path: string, params?: Record<string, any>): string => {
  const url = new URL(path, API_BASE_URL)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, String(v)))
        } else {
          url.searchParams.append(key, String(value))
        }
      }
    })
  }
  
  return url.toString()
}

// 取消请求的工具
export const createCancelToken = () => {
  return axios.CancelToken.source()
}

// 检查是否为取消的请求
export const isCancelledRequest = (error: any): boolean => {
  return axios.isCancel(error)
}

// 重试请求的工具
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      
      if (i === maxRetries) {
        break
      }
      
      // 指数退避延迟
      const retryDelay = delay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }
  
  throw lastError
}

// 并发请求限制
export const createConcurrencyLimiter = (limit: number) => {
  let running = 0
  const queue: Array<() => void> = []
  
  return async <T>(requestFn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        running++
        try {
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          running--
          if (queue.length > 0) {
            const next = queue.shift()
            next?.()
          }
        }
      }
      
      if (running < limit) {
        execute()
      } else {
        queue.push(execute)
      }
    })
  }
}

// 请求缓存
const requestCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

export const getCachedRequest = <T>(
  key: string,
  requestFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5分钟默认缓存
): Promise<T> => {
  const cached = requestCache.get(key)
  const now = Date.now()
  
  if (cached && (now - cached.timestamp) < cached.ttl) {
    return Promise.resolve(cached.data)
  }
  
  return requestFn().then(data => {
    requestCache.set(key, {
      data,
      timestamp: now,
      ttl,
    })
    return data
  })
}

// 清除缓存
export const clearCache = (pattern?: string) => {
  if (pattern) {
    const regex = new RegExp(pattern)
    for (const key of requestCache.keys()) {
      if (regex.test(key)) {
        requestCache.delete(key)
      }
    }
  } else {
    requestCache.clear()
  }
}