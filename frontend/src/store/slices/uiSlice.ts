import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  loading: {
    global: boolean
    posts: boolean
    users: boolean
    notifications: boolean
    messages: boolean
  }
  modals: {
    createPost: boolean
    editPost: boolean
    deletePost: boolean
    editProfile: boolean
    imageViewer: boolean
    confirmDialog: boolean
  }
  notifications: {
    show: boolean
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration: number
  }
  imageViewer: {
    images: string[]
    currentIndex: number
  }
  confirmDialog: {
    title: string
    message: string
    onConfirm: (() => void) | null
    confirmText: string
    cancelText: string
    type: 'danger' | 'warning' | 'info'
  }
}

const initialState: UIState = {
  theme: 'light',
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  loading: {
    global: false,
    posts: false,
    users: false,
    notifications: false,
    messages: false,
  },
  modals: {
    createPost: false,
    editPost: false,
    deletePost: false,
    editProfile: false,
    imageViewer: false,
    confirmDialog: false,
  },
  notifications: {
    show: false,
    message: '',
    type: 'info',
    duration: 4000,
  },
  imageViewer: {
    images: [],
    currentIndex: 0,
  },
  confirmDialog: {
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '确认',
    cancelText: '取消',
    type: 'info',
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 主题切换
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    
    // 侧边栏控制
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    
    // 移动端菜单控制
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    
    // 加载状态控制
    setLoading: (state, action: PayloadAction<{ key: keyof UIState['loading']; value: boolean }>) => {
      const { key, value } = action.payload
      state.loading[key] = value
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload
    },
    
    // 模态框控制
    setModal: (state, action: PayloadAction<{ key: keyof UIState['modals']; value: boolean }>) => {
      const { key, value } = action.payload
      state.modals[key] = value
      
      // 关闭模态框时重置相关状态
      if (!value) {
        if (key === 'imageViewer') {
          state.imageViewer = initialState.imageViewer
        }
        if (key === 'confirmDialog') {
          state.confirmDialog = initialState.confirmDialog
        }
      }
    },
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false
      
      // 重置相关状态
      if (action.payload === 'imageViewer') {
        state.imageViewer = initialState.imageViewer
      }
      if (action.payload === 'confirmDialog') {
        state.confirmDialog = initialState.confirmDialog
      }
    },
    closeAllModals: (state) => {
      state.modals = initialState.modals
      state.imageViewer = initialState.imageViewer
      state.confirmDialog = initialState.confirmDialog
    },
    
    // 通知控制
    showNotification: (state, action: PayloadAction<{
      message: string
      type?: 'success' | 'error' | 'warning' | 'info'
      duration?: number
    }>) => {
      const { message, type = 'info', duration = 4000 } = action.payload
      state.notifications = {
        show: true,
        message,
        type,
        duration,
      }
    },
    hideNotification: (state) => {
      state.notifications.show = false
    },
    
    // 图片查看器控制
    openImageViewer: (state, action: PayloadAction<{ images: string[]; currentIndex?: number }>) => {
      const { images, currentIndex = 0 } = action.payload
      state.imageViewer = {
        images,
        currentIndex,
      }
      state.modals.imageViewer = true
    },
    setImageViewerIndex: (state, action: PayloadAction<number>) => {
      state.imageViewer.currentIndex = action.payload
    },
    nextImage: (state) => {
      const { images, currentIndex } = state.imageViewer
      if (currentIndex < images.length - 1) {
        state.imageViewer.currentIndex = currentIndex + 1
      }
    },
    prevImage: (state) => {
      const { currentIndex } = state.imageViewer
      if (currentIndex > 0) {
        state.imageViewer.currentIndex = currentIndex - 1
      }
    },
    
    // 确认对话框控制
    openConfirmDialog: (state, action: PayloadAction<{
      title: string
      message: string
      onConfirm: () => void
      confirmText?: string
      cancelText?: string
      type?: 'danger' | 'warning' | 'info'
    }>) => {
      const {
        title,
        message,
        onConfirm,
        confirmText = '确认',
        cancelText = '取消',
        type = 'info',
      } = action.payload
      
      state.confirmDialog = {
        title,
        message,
        onConfirm,
        confirmText,
        cancelText,
        type,
      }
      state.modals.confirmDialog = true
    },
    
    // 重置UI状态
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme, // 保持主题设置
        sidebarCollapsed: state.sidebarCollapsed, // 保持侧边栏状态
      }
    },
  },
})

export const {
  setTheme,
  toggleTheme,
  setSidebarCollapsed,
  toggleSidebar,
  setMobileMenuOpen,
  toggleMobileMenu,
  setLoading,
  setGlobalLoading,
  setModal,
  openModal,
  closeModal,
  closeAllModals,
  showNotification,
  hideNotification,
  openImageViewer,
  setImageViewerIndex,
  nextImage,
  prevImage,
  openConfirmDialog,
  resetUI,
} = uiSlice.actions

// 别名导出
export const showToast = showNotification

export default uiSlice.reducer