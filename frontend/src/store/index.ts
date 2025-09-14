import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

// 导入所有的 slice
import authSlice from './slices/authSlice'
import uiSlice from './slices/uiSlice'
import postsSlice from './slices/postsSlice'
import usersSlice from './slices/usersSlice'
import notificationsSlice from './slices/notificationsSlice'
import messagesSlice from './slices/messagesSlice'

// 持久化配置
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // 只持久化认证和UI状态
  blacklist: ['posts', 'users', 'notifications', 'messages'], // 不持久化这些状态
}

// 认证状态持久化配置
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'refreshToken', 'user'], // 只持久化必要的认证信息
}

// UI状态持久化配置
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['theme', 'sidebarCollapsed'], // 持久化主题和侧边栏状态
}

// 合并所有 reducer
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authSlice),
  ui: persistReducer(uiPersistConfig, uiSlice),
  posts: postsSlice,
  users: usersSlice,
  notifications: notificationsSlice,
  messages: messagesSlice,
})

// 创建持久化的 reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// 配置 store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
        ],
      },
    }),
  devTools: import.meta.env.DEV,
})

// 创建持久化器
export const persistor = persistStore(store)

// 导出类型
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// 导出 hooks
export { useAppDispatch, useAppSelector } from './hooks'