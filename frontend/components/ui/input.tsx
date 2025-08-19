'use client'

import * as React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type, error, icon, iconPosition = 'left', ...props }, ref) => {
    const baseStyles = `
      flex h-10 w-full rounded-md border bg-background text-sm 
      ring-offset-background file:border-0 file:bg-transparent 
      file:text-sm file:font-medium placeholder:text-muted-foreground 
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
      disabled:cursor-not-allowed disabled:opacity-50
    `
    
    const borderStyles = error 
      ? 'border-red-500 focus-visible:ring-red-500' 
      : 'border-input focus-visible:ring-ring'
    
    const paddingStyles = icon 
      ? iconPosition === 'left' 
        ? 'pl-10 pr-3' 
        : 'pl-3 pr-10'
      : 'px-3 py-2'

    if (icon) {
      return (
        <div className="relative w-full">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={`${baseStyles} ${borderStyles} ${paddingStyles} ${className}`}
            ref={ref}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={`${baseStyles} ${borderStyles} ${paddingStyles} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }