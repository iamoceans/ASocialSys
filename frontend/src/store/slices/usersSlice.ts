import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { userAPI } from '../../services/endpoints'
import type { User, UserProfile } from '../../types/auth'

interface UsersState {
  users: User[]
  currentUser: UserProfile | null
  followers: User[]
  following: User[]
  suggestedUsers: User[]
  searchResults: User[]
  pagination: {
    page: number
    hasMore: boolean
    total: number
  }
  loading: {
    users: boolean
    currentUser: boolean
    followers: boolean
    following: boolean
    suggested: boolean
    search: boolean
    followAction: boolean
  }
  error: string | null
  searchQuery: string
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  followers: [],
  following: [],
  suggestedUsers: [],
  searchResults: [],
  pagination: {
    page: 1,
    hasMore: true,
    total: 0,
  },
  loading: {
    users: false,
    currentUser: false,
    followers: false,
    following: false,
    suggested: false,
    search: false,
    followAction: false,
  },
  error: null,
  searchQuery: '',
}

// 异步 thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { page?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getUsers(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用户列表失败')
    }
  }
)

export const fetchUserProfile = createAsyncThunk(
  'users/fetchUserProfile',
  async (username: string, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getUserProfile(username)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用户资料失败')
    }
  }
)

export const fetchFollowers = createAsyncThunk(
  'users/fetchFollowers',
  async (params: { userId: string; page?: number }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getFollowers(params.userId, { page: params.page })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取关注者失败')
    }
  }
)

export const fetchFollowing = createAsyncThunk(
  'users/fetchFollowing',
  async (params: { userId: string; page?: number }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getFollowing(params.userId, { page: params.page })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取关注列表失败')
    }
  }
)

export const fetchSuggestedUsers = createAsyncThunk(
  'users/fetchSuggestedUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getSuggestedUsers()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取推荐用户失败')
    }
  }
)

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (params: { query: string; page?: number }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.searchUsers(params)
      return { ...response.data, query: params.query }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '搜索用户失败')
    }
  }
)

export const followUser = createAsyncThunk(
  'users/followUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await usersAPI.followUser(userId)
      return { userId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '关注失败')
    }
  }
)

export const unfollowUser = createAsyncThunk(
  'users/unfollowUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await usersAPI.unfollowUser(userId)
      return { userId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '取消关注失败')
    }
  }
)

export const blockUser = createAsyncThunk(
  'users/blockUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await usersAPI.blockUser(userId)
      return { userId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '屏蔽失败')
    }
  }
)

export const unblockUser = createAsyncThunk(
  'users/unblockUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await usersAPI.unblockUser(userId)
      return { userId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '取消屏蔽失败')
    }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchQuery = ''
    },
    resetUsers: (state) => {
      state.users = []
      state.pagination = initialState.pagination
    },
    resetCurrentUser: (state) => {
      state.currentUser = null
    },
    updateUserInList: (state, action: PayloadAction<User>) => {
      const updatedUser = action.payload
      
      // 更新用户列表
      const userIndex = state.users.findIndex(user => user.id === updatedUser.id)
      if (userIndex !== -1) {
        state.users[userIndex] = updatedUser
      }
      
      // 更新关注者列表
      const followerIndex = state.followers.findIndex(user => user.id === updatedUser.id)
      if (followerIndex !== -1) {
        state.followers[followerIndex] = updatedUser
      }
      
      // 更新关注列表
      const followingIndex = state.following.findIndex(user => user.id === updatedUser.id)
      if (followingIndex !== -1) {
        state.following[followingIndex] = updatedUser
      }
      
      // 更新推荐用户列表
      const suggestedIndex = state.suggestedUsers.findIndex(user => user.id === updatedUser.id)
      if (suggestedIndex !== -1) {
        state.suggestedUsers[suggestedIndex] = updatedUser
      }
      
      // 更新搜索结果
      const searchIndex = state.searchResults.findIndex(user => user.id === updatedUser.id)
      if (searchIndex !== -1) {
        state.searchResults[searchIndex] = updatedUser
      }
    },
    removeUserFromList: (state, action: PayloadAction<string>) => {
      const userId = action.payload
      
      state.users = state.users.filter(user => user.id !== userId)
      state.followers = state.followers.filter(user => user.id !== userId)
      state.following = state.following.filter(user => user.id !== userId)
      state.suggestedUsers = state.suggestedUsers.filter(user => user.id !== userId)
      state.searchResults = state.searchResults.filter(user => user.id !== userId)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading.users = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading.users = false
        const { results, page, has_more, total } = action.payload
        
        if (page === 1) {
          state.users = results
        } else {
          state.users = [...state.users, ...results]
        }
        
        state.pagination = {
          page,
          hasMore: has_more,
          total,
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading.users = false
        state.error = action.payload as string
      })
      
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading.currentUser = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading.currentUser = false
        state.currentUser = action.payload
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading.currentUser = false
        state.error = action.payload as string
      })
      
      // Fetch Followers
      .addCase(fetchFollowers.pending, (state) => {
        state.loading.followers = true
        state.error = null
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.loading.followers = false
        state.followers = action.payload.results
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.loading.followers = false
        state.error = action.payload as string
      })
      
      // Fetch Following
      .addCase(fetchFollowing.pending, (state) => {
        state.loading.following = true
        state.error = null
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.loading.following = false
        state.following = action.payload.results
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.loading.following = false
        state.error = action.payload as string
      })
      
      // Fetch Suggested Users
      .addCase(fetchSuggestedUsers.pending, (state) => {
        state.loading.suggested = true
        state.error = null
      })
      .addCase(fetchSuggestedUsers.fulfilled, (state, action) => {
        state.loading.suggested = false
        state.suggestedUsers = action.payload.results
      })
      .addCase(fetchSuggestedUsers.rejected, (state, action) => {
        state.loading.suggested = false
        state.error = action.payload as string
      })
      
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.loading.search = true
        state.error = null
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading.search = false
        const { results, query } = action.payload
        state.searchResults = results
        state.searchQuery = query
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading.search = false
        state.error = action.payload as string
      })
      
      // Follow User
      .addCase(followUser.pending, (state) => {
        state.loading.followAction = true
        state.error = null
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.loading.followAction = false
        const { userId, is_following, followers_count } = action.payload
        
        // 更新用户关注状态
        const updateUserFollowStatus = (user: User) => {
          if (user.id === userId) {
            user.is_following = is_following
            user.followers_count = followers_count
          }
        }
        
        state.users.forEach(updateUserFollowStatus)
        state.suggestedUsers.forEach(updateUserFollowStatus)
        state.searchResults.forEach(updateUserFollowStatus)
        
        if (state.currentUser?.id === userId) {
          state.currentUser.is_following = is_following
          state.currentUser.followers_count = followers_count
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.loading.followAction = false
        state.error = action.payload as string
      })
      
      // Unfollow User
      .addCase(unfollowUser.pending, (state) => {
        state.loading.followAction = true
        state.error = null
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.loading.followAction = false
        const { userId, is_following, followers_count } = action.payload
        
        // 更新用户关注状态
        const updateUserFollowStatus = (user: User) => {
          if (user.id === userId) {
            user.is_following = is_following
            user.followers_count = followers_count
          }
        }
        
        state.users.forEach(updateUserFollowStatus)
        state.suggestedUsers.forEach(updateUserFollowStatus)
        state.searchResults.forEach(updateUserFollowStatus)
        state.following = state.following.filter(user => user.id !== userId)
        
        if (state.currentUser?.id === userId) {
          state.currentUser.is_following = is_following
          state.currentUser.followers_count = followers_count
        }
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.loading.followAction = false
        state.error = action.payload as string
      })
      
      // Block User
      .addCase(blockUser.fulfilled, (state, action) => {
        const { userId } = action.payload
        usersSlice.caseReducers.removeUserFromList(state, { payload: userId, type: 'users/removeUserFromList' })
      })
      
      // Unblock User
      .addCase(unblockUser.fulfilled, (state, action) => {
        const { userId, is_blocked } = action.payload
        
        // 更新用户屏蔽状态
        const updateUserBlockStatus = (user: User) => {
          if (user.id === userId) {
            user.is_blocked = is_blocked
          }
        }
        
        state.users.forEach(updateUserBlockStatus)
        state.searchResults.forEach(updateUserBlockStatus)
        
        if (state.currentUser?.id === userId) {
          state.currentUser.is_blocked = is_blocked
        }
      })
  },
})

export const {
  clearError,
  setSearchQuery,
  clearSearchResults,
  resetUsers,
  resetCurrentUser,
  updateUserInList,
  removeUserFromList,
} = usersSlice.actions

export default usersSlice.reducer