// 认证相关类型
export type {
  User,
  UserProfile,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  TokenRefreshResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  PasswordChange,
  UserSettingsUpdate,
  UserProfileUpdate,
  UserStats,
  UserSearchResult,
  FollowResponse,
  BlockResponse,
  MuteResponse,
  VerificationStatus,
  SecuritySettings,
  ActiveSession,
  AuthError
} from './auth'

// 帖子相关类型
export type {
  Post,
  Comment,
  MediaFile,
  Hashtag,
  PostStatus,
  PostVisibility,
  MediaType,
  CreatePostData,
  UpdatePostData,
  CreateCommentData,
  UpdateCommentData,
  PostsResponse,
  CommentsResponse,
  LikeResponse,
  RepostResponse,
  BookmarkResponse,
  PostStats,
  TrendingTopic,
  PostSearchParams,
  PostFilters,
  PostSortOption,
  MediaUploadResponse,
  PostDraft,
  ScheduledPost,
  PostAnalytics,
  ModerationResult
} from './post'

// 通知相关类型
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  BaseNotification,
  LikeNotification,
  CommentNotification,
  FollowNotification,
  MentionNotification,
  RepostNotification,
  BookmarkNotification,
  ReplyNotification,
  MessageNotification,
  SystemNotification,
  SecurityNotification,
  AchievementNotification,
  ReminderNotification,
  NotificationsResponse,
  NotificationStats,
  NotificationSettings,
  NotificationFilters,
  NotificationSortOption,
  NotificationBatchOperation,
  NotificationBatchResponse,
  NotificationTemplate,
  PushSubscription,
  NotificationChannel,
  NotificationQueueStatus,
  NotificationAnalytics
} from './notification'

// 消息相关类型
export type {
  Message,
  Conversation,
  ConversationParticipant,
  MessageType,
  MessageStatus,
  ConversationType,
  ConversationStatus,
  CreateMessageData,
  UpdateMessageData,
  CreateConversationData,
  UpdateConversationData,
  ConversationsResponse,
  MessagesResponse,
  MessageSearchParams,
  MessageFilters,
  MessageSortOption,
  ConversationFilters,
  ConversationSortOption,
  MessageStats,
  OnlineStatus,
  TypingStatus,
  MessageReaction,
  MessageReactionStats,
  StickerPack,
  Sticker,
  FileUploadProgress,
  MessageEncryption,
  MessageBackup,
  WebSocketEvent,
  MessageDeliveryStatus,
  ConversationInvite
} from './message'

// 通用类型
export type {
  ApiResponse,
  ApiError,
  ResponseMeta,
  PaginationParams,
  PaginatedResponse,
  SortParams,
  SearchParams,
  DateRange,
  Location,
  FileInfo,
  UploadFileData,
  UploadProgress,
  ThemeConfig,
  LanguageConfig,
  AppSettings,
  DeviceInfo,
  NetworkStatus,
  PerformanceMetrics,
  ErrorInfo,
  LoadingState,
  OperationResult,
  BatchOperation,
  BatchOperationResult,
  CacheConfig,
  CacheItem,
  ValidationRule,
  FormField,
  FormConfig,
  FormState,
  ToastConfig,
  ModalConfig,
  ConfirmConfig,
  KeyValuePair,
  Option,
  MenuItem,
  BreadcrumbItem,
  TabItem,
  TableColumn,
  TableConfig
} from './common'

// 常用类型别名
export type ID = string
export type Timestamp = string
export type URL = string
export type Email = string
export type PhoneNumber = string
export type Color = string
export type Percentage = number
export type Currency = number

// 常用联合类型
export type Status = 'idle' | 'loading' | 'success' | 'error'
export type Size = 'small' | 'medium' | 'large'
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
export type Position = 'top' | 'right' | 'bottom' | 'left'
export type Alignment = 'start' | 'center' | 'end'
export type Direction = 'horizontal' | 'vertical'
export type Orientation = 'portrait' | 'landscape'

// 事件处理器类型
export type EventHandler<T = Event> = (event: T) => void
export type ChangeHandler<T = any> = (value: T) => void
export type ClickHandler = (event: React.MouseEvent) => void
export type SubmitHandler = (event: React.FormEvent) => void
export type KeyboardHandler = (event: React.KeyboardEvent) => void

// React 相关类型
export type ReactNode = React.ReactNode
export type ReactElement = React.ReactElement
export type ReactComponent<P = {}> = React.ComponentType<P>
export type ReactFC<P = {}> = React.FC<P>

// 工具类型
export type Partial<T> = {
  [P in keyof T]?: T[P]
}

export type Required<T> = {
  [P in keyof T]-?: T[P]
}

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>

export type Record<K extends keyof any, T> = {
  [P in K]: T
}

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

// 深度类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

// 函数类型
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>
export type SyncFunction<T = any> = (...args: any[]) => T
export type VoidFunction = () => void
export type AsyncVoidFunction = () => Promise<void>

// 条件类型
export type NonNullable<T> = T extends null | undefined ? never : T
export type NonEmptyArray<T> = [T, ...T[]]

// 字符串模板类型
export type StringTemplate<T extends string> = `${T}`
export type EmailTemplate = `${string}@${string}.${string}`
export type URLTemplate = `http${'s' | ''}://${string}`

// 数组和对象工具类型
export type ArrayElement<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never
export type ObjectValues<T> = T[keyof T]
export type ObjectKeys<T> = keyof T

// 状态管理相关类型
export type ActionType = string
export type ActionPayload<T = any> = T
export type Action<T extends ActionType = ActionType, P = any> = {
  type: T
  payload?: P
  meta?: any
  error?: boolean
}

export type Reducer<S = any, A extends Action = Action> = (state: S, action: A) => S
export type Dispatch<A extends Action = Action> = (action: A) => A
export type GetState<S = any> = () => S

// 路由相关类型
export type RouteParams = Record<string, string>
export type QueryParams = Record<string, string | string[]>
export type RouteComponent = React.ComponentType<any>

// 主题相关类型
export type ColorScheme = 'light' | 'dark' | 'auto'
export type ColorPalette = {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
  background: string
  surface: string
  text: string
}

// 响应式设计类型
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

// 动画相关类型
export type AnimationDuration = 'fast' | 'normal' | 'slow'
export type AnimationEasing = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'
export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'

// 可访问性类型
export type AriaRole = string
export type AriaLabel = string
export type AriaDescribedBy = string

// 性能相关类型
export type LazyComponent<T extends React.ComponentType<any>> = React.LazyExoticComponent<T>
export type SuspenseProps = React.SuspenseProps

// 错误边界类型
export type ErrorBoundaryState = {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

// 国际化类型
export type LocaleCode = string
export type TranslationKey = string
export type TranslationValues = Record<string, string | number>

// 测试相关类型
export type MockFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>
export type TestProps<T = {}> = T & {
  'data-testid'?: string
}