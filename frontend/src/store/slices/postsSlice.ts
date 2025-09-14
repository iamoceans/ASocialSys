import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { postAPI } from '../../services/endpoints'
import type { Post, CreatePostData, UpdatePostData } from '../../types/post'

interface PostsState {
  posts: Post[]
  currentPost: Post | null
  userPosts: Post[]
  likedPosts: Post[]
  bookmarkedPosts: Post[]
  trending: Post[]
  pagination: {
    page: number
    hasMore: boolean
    total: number
  }
  loading: {
    posts: boolean
    currentPost: boolean
    userPosts: boolean
    likedPosts: boolean
    bookmarkedPosts: boolean
    trending: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
    liking: boolean
    bookmarking: boolean
  }
  error: string | null
  filters: {
    sortBy: 'latest' | 'popular' | 'trending'
    timeRange: 'today' | 'week' | 'month' | 'all'
    hashtags: string[]
  }
}

const initialState: PostsState = {
  posts: [],
  currentPost: null,
  userPosts: [],
  likedPosts: [],
  bookmarkedPosts: [],
  trending: [],
  pagination: {
    page: 1,
    hasMore: true,
    total: 0,
  },
  loading: {
    posts: false,
    currentPost: false,
    userPosts: false,
    likedPosts: false,
    bookmarkedPosts: false,
    trending: false,
    creating: false,
    updating: false,
    deleting: false,
    liking: false,
    bookmarking: false,
  },
  error: null,
  filters: {
    sortBy: 'latest',
    timeRange: 'all',
    hashtags: [],
  },
}

// 异步 thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params: { page?: number; sortBy?: string; hashtags?: string[] } = {}, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getPosts(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取帖子失败')
    }
  }
)

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getPostById(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取帖子详情失败')
    }
  }
)

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (params: { userId: string; page?: number }, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getUserPosts(params.userId, { page: params.page })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用户帖子失败')
    }
  }
)

export const fetchLikedPosts = createAsyncThunk(
  'posts/fetchLikedPosts',
  async (params: { page?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getLikedPosts(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取点赞帖子失败')
    }
  }
)

export const fetchBookmarkedPosts = createAsyncThunk(
  'posts/fetchBookmarkedPosts',
  async (params: { page?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getBookmarkedPosts(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取收藏帖子失败')
    }
  }
)

export const fetchTrendingPosts = createAsyncThunk(
  'posts/fetchTrendingPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getTrendingPosts()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取热门帖子失败')
    }
  }
)

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: CreatePostData, { rejectWithValue }) => {
    try {
      const response = await postsAPI.createPost(postData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '创建帖子失败')
    }
  }
)

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, data }: { id: string; data: UpdatePostData }, { rejectWithValue }) => {
    try {
      const response = await postsAPI.updatePost(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新帖子失败')
    }
  }
)

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id: string, { rejectWithValue }) => {
    try {
      await postsAPI.deletePost(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除帖子失败')
    }
  }
)

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await postsAPI.likePost(id)
      return { id, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '点赞失败')
    }
  }
)

export const unlikePost = createAsyncThunk(
  'posts/unlikePost',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await postsAPI.unlikePost(id)
      return { id, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '取消点赞失败')
    }
  }
)

export const bookmarkPost = createAsyncThunk(
  'posts/bookmarkPost',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await postsAPI.bookmarkPost(id)
      return { id, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '收藏失败')
    }
  }
)

export const unbookmarkPost = createAsyncThunk(
  'posts/unbookmarkPost',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await postsAPI.unbookmarkPost(id)
      return { id, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '取消收藏失败')
    }
  }
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action: PayloadAction<Partial<PostsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetPosts: (state) => {
      state.posts = []
      state.pagination = initialState.pagination
    },
    resetCurrentPost: (state) => {
      state.currentPost = null
    },
    updatePostInList: (state, action: PayloadAction<Post>) => {
      const updatedPost = action.payload
      
      // 更新主帖子列表
      const postIndex = state.posts.findIndex(post => post.id === updatedPost.id)
      if (postIndex !== -1) {
        state.posts[postIndex] = updatedPost
      }
      
      // 更新用户帖子列表
      const userPostIndex = state.userPosts.findIndex(post => post.id === updatedPost.id)
      if (userPostIndex !== -1) {
        state.userPosts[userPostIndex] = updatedPost
      }
      
      // 更新当前帖子
      if (state.currentPost?.id === updatedPost.id) {
        state.currentPost = updatedPost
      }
    },
    removePostFromList: (state, action: PayloadAction<string>) => {
      const postId = action.payload
      
      state.posts = state.posts.filter(post => post.id !== postId)
      state.userPosts = state.userPosts.filter(post => post.id !== postId)
      state.likedPosts = state.likedPosts.filter(post => post.id !== postId)
      state.bookmarkedPosts = state.bookmarkedPosts.filter(post => post.id !== postId)
      state.trending = state.trending.filter(post => post.id !== postId)
      
      if (state.currentPost?.id === postId) {
        state.currentPost = null
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading.posts = true
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading.posts = false
        const { results, page, has_more, total } = action.payload
        
        if (page === 1) {
          state.posts = results
        } else {
          state.posts = [...state.posts, ...results]
        }
        
        state.pagination = {
          page,
          hasMore: has_more,
          total,
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading.posts = false
        state.error = action.payload as string
      })
      
      // Fetch Post By ID
      .addCase(fetchPostById.pending, (state) => {
        state.loading.currentPost = true
        state.error = null
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading.currentPost = false
        state.currentPost = action.payload
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading.currentPost = false
        state.error = action.payload as string
      })
      
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading.creating = true
        state.error = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading.creating = false
        state.posts.unshift(action.payload)
        state.userPosts.unshift(action.payload)
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading.creating = false
        state.error = action.payload as string
      })
      
      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.loading.updating = true
        state.error = null
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading.updating = false
        postsSlice.caseReducers.updatePostInList(state, action)
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading.updating = false
        state.error = action.payload as string
      })
      
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.loading.deleting = true
        state.error = null
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading.deleting = false
        postsSlice.caseReducers.removePostFromList(state, action)
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading.deleting = false
        state.error = action.payload as string
      })
      
      // Like/Unlike Post
      .addCase(likePost.fulfilled, (state, action) => {
        const { id, is_liked, likes_count } = action.payload
        const updatePost = (post: Post) => {
          if (post.id === id) {
            post.is_liked = is_liked
            post.likes_count = likes_count
          }
        }
        
        state.posts.forEach(updatePost)
        state.userPosts.forEach(updatePost)
        state.trending.forEach(updatePost)
        if (state.currentPost?.id === id) {
          state.currentPost.is_liked = is_liked
          state.currentPost.likes_count = likes_count
        }
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        const { id, is_liked, likes_count } = action.payload
        const updatePost = (post: Post) => {
          if (post.id === id) {
            post.is_liked = is_liked
            post.likes_count = likes_count
          }
        }
        
        state.posts.forEach(updatePost)
        state.userPosts.forEach(updatePost)
        state.trending.forEach(updatePost)
        state.likedPosts = state.likedPosts.filter(post => post.id !== id)
        if (state.currentPost?.id === id) {
          state.currentPost.is_liked = is_liked
          state.currentPost.likes_count = likes_count
        }
      })
      
      // Bookmark/Unbookmark Post
      .addCase(bookmarkPost.fulfilled, (state, action) => {
        const { id, is_bookmarked } = action.payload
        const updatePost = (post: Post) => {
          if (post.id === id) {
            post.is_bookmarked = is_bookmarked
          }
        }
        
        state.posts.forEach(updatePost)
        state.userPosts.forEach(updatePost)
        state.trending.forEach(updatePost)
        if (state.currentPost?.id === id) {
          state.currentPost.is_bookmarked = is_bookmarked
        }
      })
      .addCase(unbookmarkPost.fulfilled, (state, action) => {
        const { id, is_bookmarked } = action.payload
        const updatePost = (post: Post) => {
          if (post.id === id) {
            post.is_bookmarked = is_bookmarked
          }
        }
        
        state.posts.forEach(updatePost)
        state.userPosts.forEach(updatePost)
        state.trending.forEach(updatePost)
        state.bookmarkedPosts = state.bookmarkedPosts.filter(post => post.id !== id)
        if (state.currentPost?.id === id) {
          state.currentPost.is_bookmarked = is_bookmarked
        }
      })
      
      // Fetch User Posts
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading.userPosts = false
        state.userPosts = action.payload.results
      })
      
      // Fetch Liked Posts
      .addCase(fetchLikedPosts.fulfilled, (state, action) => {
        state.loading.likedPosts = false
        state.likedPosts = action.payload.results
      })
      
      // Fetch Bookmarked Posts
      .addCase(fetchBookmarkedPosts.fulfilled, (state, action) => {
        state.loading.bookmarkedPosts = false
        state.bookmarkedPosts = action.payload.results
      })
      
      // Fetch Trending Posts
      .addCase(fetchTrendingPosts.fulfilled, (state, action) => {
        state.loading.trending = false
        state.trending = action.payload.results
      })
  },
})

export const {
  clearError,
  setFilters,
  resetPosts,
  resetCurrentPost,
  updatePostInList,
  removePostFromList,
} = postsSlice.actions

export default postsSlice.reducer