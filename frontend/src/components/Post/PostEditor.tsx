import React, { useState, useRef, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { cn } from '../../utils'
import type { Tag } from '../../types'

interface PostEditorProps {
  initialTitle?: string
  initialContent?: string
  initialTags?: Tag[]
  initialImages?: string[]
  onSubmit: (data: {
    title: string
    content: string
    tags: Tag[]
    images: File[]
  }) => Promise<void>
  onCancel?: () => void
  submitText?: string
  placeholder?: string
  showTitle?: boolean
  maxLength?: number
  className?: string
}

const PostEditor: React.FC<PostEditorProps> = ({
  initialTitle = '',
  initialContent = '',
  initialTags = [],
  initialImages = [],
  onSubmit,
  onCancel,
  submitText = '发布',
  placeholder = '分享你的想法...',
  showTitle = true,
  maxLength = 2000,
  className
}) => {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(state => state.auth.user)
  
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [tagInput, setTagInput] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(initialImages)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  
  // 自动调整文本域高度
  const adjustTextareaHeight = useCallback((textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`
  }, [])
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= maxLength) {
      setContent(value)
      adjustTextareaHeight(e.target)
    }
  }
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      return isValidType && isValidSize
    })
    
    if (validFiles.length + images.length > 9) {
      alert('最多只能上传9张图片')
      return
    }
    
    setImages(prev => [...prev, ...validFiles])
    
    // 生成预览URL
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviewUrls(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }
  
  const handleTagInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTagInput(value)
    
    if (value.trim()) {
      setShowTagSuggestions(true)
      // 模拟搜索标签
      try {
        // const suggestions = await searchTags(value)
        const mockSuggestions: Tag[] = [
          { id: '1', name: 'react', color: '#61dafb' },
          { id: '2', name: 'javascript', color: '#f7df1e' },
          { id: '3', name: 'typescript', color: '#3178c6' },
          { id: '4', name: 'frontend', color: '#ff6b6b' },
          { id: '5', name: 'webdev', color: '#4ecdc4' }
        ].filter(tag => 
          tag.name.toLowerCase().includes(value.toLowerCase()) &&
          !tags.some(existingTag => existingTag.id === tag.id)
        )
        setTagSuggestions(mockSuggestions)
      } catch (error) {
        console.error('Failed to search tags:', error)
      }
    } else {
      setShowTagSuggestions(false)
      setTagSuggestions([])
    }
  }
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1].id)
    }
  }
  
  const addTag = (tag?: Tag) => {
    const tagToAdd = tag || {
      id: Date.now().toString(),
      name: tagInput.trim().toLowerCase(),
      color: '#6b7280'
    }
    
    if (tagToAdd.name && !tags.some(t => t.name === tagToAdd.name) && tags.length < 10) {
      setTags(prev => [...prev, tagToAdd])
      setTagInput('')
      setShowTagSuggestions(false)
    }
  }
  
  const removeTag = (tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId))
  }
  
  const insertEmoji = (emoji: string) => {
    if (contentTextareaRef.current) {
      const textarea = contentTextareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.slice(0, start) + emoji + content.slice(end)
      
      if (newContent.length <= maxLength) {
        setContent(newContent)
        // 设置光标位置
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(start + emoji.length, start + emoji.length)
        }, 0)
      }
    }
    setShowEmojiPicker(false)
  }
  
  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        tags,
        images
      })
      
      // 重置表单
      setTitle('')
      setContent('')
      setTags([])
      setImages([])
      setImagePreviewUrls([])
    } catch (error) {
      console.error('Failed to submit post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const commonEmojis = ['😀', '😂', '🥰', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏']
  
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
      className
    )}>
      {/* 用户头像 */}
      <div className="flex items-start space-x-3">
        <img
          src={currentUser?.avatar || '/default-avatar.png'}
          alt={currentUser?.displayName}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          {/* 标题输入 */}
          {showTitle && (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="标题（可选）"
              className="w-full px-0 py-2 text-lg font-semibold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white resize-none"
              maxLength={100}
            />
          )}
          
          {/* 内容输入 */}
          <textarea
            ref={contentTextareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            className="w-full px-0 py-2 bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white resize-none min-h-[80px]"
            rows={3}
          />
          
          {/* 字数统计 */}
          <div className="text-right text-xs text-gray-400 mb-2">
            {content.length}/{maxLength}
          </div>
          
          {/* 图片预览 */}
          {imagePreviewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* 标签 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                >
                  #{tag.name}
                  <button
                    onClick={() => removeTag(tag.id)}
                    className="ml-1 text-blue-400 hover:text-blue-600"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* 标签输入 */}
          <div className="relative mb-3">
            <input
              ref={tagInputRef}
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              placeholder="添加标签..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
            />
            
            {/* 标签建议 */}
            {showTagSuggestions && tagSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                {tagSuggestions.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => addTag(tag)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-blue-600 dark:text-blue-400">#{tag.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* 表情选择器 */}
          {showEmojiPicker && (
            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-6 gap-2">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="p-2 text-lg hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 工具栏 */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {/* 图片上传 */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={imagePreviewUrls.length >= 9}
                className="p-2 text-gray-400 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="上传图片"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              
              {/* 表情 */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                title="添加表情"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            {/* 操作按钮 */}
            <div className="flex items-center space-x-3">
              {onCancel && (
                <button
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 transition-colors"
                >
                  取消
                </button>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>发布中...</span>
                  </div>
                ) : (
                  submitText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostEditor