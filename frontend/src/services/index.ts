// API服务统一导出
export { api, ApiService } from './api'
export { authService } from './authService'
export { postService } from './postService'
export { notificationService } from './notificationService'
export { messageService } from './messageService'
export { userService } from './userService'

// 默认导出所有服务
export default {
  api,
  auth: authService,
  posts: postService,
  notifications: notificationService,
  messages: messageService,
  users: userService
}

// 服务类型导出
export type { ApiResponse, ApiError, RequestConfig } from './api'