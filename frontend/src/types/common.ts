// API 响应基础结构
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: ApiError[]
  meta?: ResponseMeta
}

// API 错误
export interface ApiError {
  code: string
  message: string
  field?: string
  details?: Record<string, any>
}

// 响应元数据
export interface ResponseMeta {
  timestamp: string
  request_id: string
  version: string
  rate_limit?: {
    limit: number
    remaining: number
    reset: number
  }
}

// 分页参数
export interface PaginationParams {
  page?: number
  page_size?: number
  limit?: number
  offset?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  results: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
  next_page?: number
  previous_page?: number
}

// 排序参数
export interface SortParams {
  sort_by?: string
  order?: 'asc' | 'desc'
}

// 搜索参数
export interface SearchParams {
  query?: string
  filters?: Record<string, any>
}

// 日期范围
export interface DateRange {
  start_date?: string
  end_date?: string
}

// 地理位置
export interface Location {
  latitude: number
  longitude: number
  address?: string
  city?: string
  country?: string
  postal_code?: string
}

// 文件信息
export interface FileInfo {
  id: string
  name: string
  size: number
  type: string
  url: string
  thumbnail_url?: string
  created_at: string
  updated_at: string
}

// 上传文件数据
export interface UploadFileData {
  file: File
  folder?: string
  public?: boolean
  metadata?: Record<string, any>
}

// 上传进度
export interface UploadProgress {
  file_id: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  error?: string
}

// 主题配置
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primary_color: string
  accent_color: string
  font_family: string
  font_size: 'small' | 'medium' | 'large'
  border_radius: 'none' | 'small' | 'medium' | 'large'
  animations_enabled: boolean
}

// 语言配置
export interface LanguageConfig {
  code: string
  name: string
  native_name: string
  direction: 'ltr' | 'rtl'
  is_default: boolean
}

// 应用设置
export interface AppSettings {
  theme: ThemeConfig
  language: string
  timezone: string
  date_format: string
  time_format: '12h' | '24h'
  number_format: string
  currency: string
  
  // 隐私设置
  analytics_enabled: boolean
  crash_reporting_enabled: boolean
  performance_monitoring_enabled: boolean
  
  // 可访问性设置
  high_contrast: boolean
  reduce_motion: boolean
  screen_reader_support: boolean
  keyboard_navigation: boolean
  
  // 开发者设置
  debug_mode: boolean
  api_logging: boolean
  performance_overlay: boolean
}

// 设备信息
export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile'
  os: string
  browser: string
  screen_width: number
  screen_height: number
  user_agent: string
  timezone: string
  language: string
}

// 网络状态
export interface NetworkStatus {
  is_online: boolean
  connection_type?: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
  effective_type?: 'slow-2g' | '2g' | '3g' | '4g'
  downlink?: number
  rtt?: number
}

// 性能指标
export interface PerformanceMetrics {
  page_load_time: number
  first_contentful_paint: number
  largest_contentful_paint: number
  first_input_delay: number
  cumulative_layout_shift: number
  memory_usage?: number
  bundle_size?: number
}

// 错误信息
export interface ErrorInfo {
  id: string
  type: 'network' | 'validation' | 'authentication' | 'authorization' | 'server' | 'client' | 'unknown'
  message: string
  code?: string
  status_code?: number
  stack_trace?: string
  user_agent?: string
  url?: string
  timestamp: string
  user_id?: string
  session_id?: string
  additional_data?: Record<string, any>
}

// 加载状态
export interface LoadingState {
  is_loading: boolean
  progress?: number
  message?: string
  cancellable?: boolean
}

// 操作结果
export interface OperationResult<T = any> {
  success: boolean
  data?: T
  error?: string
  warnings?: string[]
  metadata?: Record<string, any>
}

// 批量操作
export interface BatchOperation<T = any> {
  items: T[]
  action: string
  options?: Record<string, any>
}

// 批量操作结果
export interface BatchOperationResult<T = any> {
  success_count: number
  failed_count: number
  total_count: number
  successful_items: T[]
  failed_items: {
    item: T
    error: string
  }[]
  warnings?: string[]
}

// 缓存配置
export interface CacheConfig {
  ttl: number // 生存时间（秒）
  max_size: number // 最大缓存大小
  strategy: 'lru' | 'fifo' | 'lfu'
  persist: boolean // 是否持久化
}

// 缓存项
export interface CacheItem<T = any> {
  key: string
  value: T
  created_at: number
  expires_at: number
  access_count: number
  last_accessed: number
}

// 验证规则
export interface ValidationRule {
  type: 'required' | 'email' | 'url' | 'min_length' | 'max_length' | 'pattern' | 'custom'
  value?: any
  message: string
  validator?: (value: any) => boolean
}

// 表单字段
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'time' | 'datetime'
  placeholder?: string
  default_value?: any
  required: boolean
  disabled?: boolean
  readonly?: boolean
  validation_rules: ValidationRule[]
  options?: { label: string; value: any }[] // for select, radio
  multiple?: boolean // for select, file
  accept?: string // for file
  min?: number | string // for number, date
  max?: number | string // for number, date
  step?: number // for number
  rows?: number // for textarea
  cols?: number // for textarea
}

// 表单配置
export interface FormConfig {
  fields: FormField[]
  submit_url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  validation_mode: 'onSubmit' | 'onChange' | 'onBlur'
  auto_save?: boolean
  auto_save_interval?: number // 秒
}

// 表单状态
export interface FormState {
  values: Record<string, any>
  errors: Record<string, string[]>
  touched: Record<string, boolean>
  is_submitting: boolean
  is_valid: boolean
  is_dirty: boolean
  submit_count: number
}

// 通知配置
export interface ToastConfig {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number // 毫秒，0 表示不自动关闭
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  closable?: boolean
  action?: {
    label: string
    handler: () => void
  }
}

// 模态框配置
export interface ModalConfig {
  title?: string
  content: string | React.ReactNode
  width?: string | number
  height?: string | number
  closable?: boolean
  mask_closable?: boolean
  keyboard_closable?: boolean
  footer?: React.ReactNode
  on_ok?: () => void | Promise<void>
  on_cancel?: () => void
  ok_text?: string
  cancel_text?: string
  ok_type?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
}

// 确认对话框配置
export interface ConfirmConfig {
  title: string
  content: string
  type?: 'info' | 'warning' | 'error' | 'success'
  ok_text?: string
  cancel_text?: string
  on_ok: () => void | Promise<void>
  on_cancel?: () => void
  danger?: boolean
}

// 键值对
export interface KeyValuePair<T = string> {
  key: string
  value: T
}

// 选项
export interface Option<T = any> {
  label: string
  value: T
  disabled?: boolean
  description?: string
  icon?: string
}

// 菜单项
export interface MenuItem {
  key: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
  disabled?: boolean
  hidden?: boolean
  badge?: string | number
  permissions?: string[]
}

// 面包屑项
export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: string
}

// 标签页
export interface TabItem {
  key: string
  label: string
  content: React.ReactNode
  icon?: string
  closable?: boolean
  disabled?: boolean
}

// 表格列
export interface TableColumn<T = any> {
  key: string
  title: string
  dataIndex?: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, record: T, index: number) => React.ReactNode
  fixed?: 'left' | 'right'
  ellipsis?: boolean
}

// 表格配置
export interface TableConfig<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    current: number
    page_size: number
    total: number
    show_size_changer?: boolean
    show_quick_jumper?: boolean
  }
  selection?: {
    type: 'checkbox' | 'radio'
    selected_keys: string[]
    on_change: (keys: string[]) => void
  }
  expandable?: {
    expanded_keys: string[]
    on_expand: (expanded: boolean, record: T) => void
    render: (record: T) => React.ReactNode
  }
}