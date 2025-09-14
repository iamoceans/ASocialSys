import React, { forwardRef, useState } from 'react'
import { cn } from '../../utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
  variant?: 'default' | 'filled' | 'outline'
  inputSize?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    onRightIconClick,
    variant = 'default',
    inputSize = 'md',
    fullWidth = false,
    loading = false,
    type = 'text',
    disabled,
    id,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    const baseClasses = 'block transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantClasses = {
      default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500',
      filled: 'border-0 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800',
      outline: 'border-2 border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
    }
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-4 py-3 text-base rounded-lg'
    }
    
    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }
    
    const paddingWithIcon = {
      sm: {
        left: leftIcon ? 'pl-9' : '',
        right: rightIcon || type === 'password' ? 'pr-9' : ''
      },
      md: {
        left: leftIcon ? 'pl-10' : '',
        right: rightIcon || type === 'password' ? 'pr-10' : ''
      },
      lg: {
        left: leftIcon ? 'pl-12' : '',
        right: rightIcon || type === 'password' ? 'pr-12' : ''
      }
    }
    
    const iconPositionClasses = {
      sm: {
        left: 'left-3',
        right: 'right-3'
      },
      md: {
        left: 'left-3',
        right: 'right-3'
      },
      lg: {
        left: 'left-4',
        right: 'right-4'
      }
    }
    
    const LoadingSpinner = () => (
      <svg 
        className={cn('animate-spin text-gray-400', iconSizeClasses[inputSize])} 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )
    
    const PasswordToggle = () => (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        tabIndex={-1}
      >
        {showPassword ? (
          <svg className={iconSizeClasses[inputSize]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
        ) : (
          <svg className={iconSizeClasses[inputSize]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    )
    
    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={cn(
              'absolute inset-y-0 flex items-center pointer-events-none text-gray-400',
              iconPositionClasses[inputSize].left
            )}>
              <span className={iconSizeClasses[inputSize]}>
                {leftIcon}
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              baseClasses,
              variantClasses[variant],
              sizeClasses[inputSize],
              paddingWithIcon[inputSize].left,
              paddingWithIcon[inputSize].right,
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              fullWidth && 'w-full',
              className
            )}
            disabled={disabled || loading}
            {...props}
          />
          
          {(rightIcon || type === 'password' || loading) && (
            <div className={cn(
              'absolute inset-y-0 flex items-center',
              iconPositionClasses[inputSize].right
            )}>
              {loading ? (
                <LoadingSpinner />
              ) : type === 'password' ? (
                <PasswordToggle />
              ) : rightIcon ? (
                <button
                  type="button"
                  onClick={onRightIconClick}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  <span className={iconSizeClasses[inputSize]}>
                    {rightIcon}
                  </span>
                </button>
              ) : null}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={cn(
            'text-xs',
            error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input