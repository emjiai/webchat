'use client'

import * as React from 'react'

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  required?: boolean
  name?: string
  value?: string
  id?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ 
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    required = false,
    name,
    value = 'on',
    id,
    className = '',
    size = 'md',
    ...props
  }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
    
    // Determine if component is controlled or uncontrolled
    const isControlled = checked !== undefined
    const isChecked = isControlled ? checked : internalChecked

    const handleClick = () => {
      if (disabled) return
      
      const newChecked = !isChecked
      
      if (!isControlled) {
        setInternalChecked(newChecked)
      }
      
      onCheckedChange?.(newChecked)
    }

    // Handle keyboard accessibility
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        handleClick()
      }
    }

    // Size variants
    const sizeStyles = {
      sm: {
        switch: 'h-5 w-9',
        thumb: 'h-3 w-3',
        translate: 'translate-x-4'
      },
      md: {
        switch: 'h-6 w-11',
        thumb: 'h-4 w-4',
        translate: 'translate-x-5'
      },
      lg: {
        switch: 'h-7 w-14',
        thumb: 'h-5 w-5',
        translate: 'translate-x-7'
      }
    }

    const currentSize = sizeStyles[size]

    return (
      <>
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={isChecked}
          aria-required={required}
          aria-label={props['aria-label']}
          data-state={isChecked ? 'checked' : 'unchecked'}
          disabled={disabled}
          id={id}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={`
            peer inline-flex ${currentSize.switch} shrink-0 cursor-pointer 
            items-center rounded-full border-2 border-transparent 
            transition-colors focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-ring focus-visible:ring-offset-2 
            focus-visible:ring-offset-background 
            disabled:cursor-not-allowed disabled:opacity-50
            ${isChecked 
              ? 'bg-primary' 
              : 'bg-input'
            }
            ${className}
          `}
          {...props}
        >
          <span
            className={`
              pointer-events-none block ${currentSize.thumb} rounded-full 
              bg-background shadow-lg ring-0 transition-transform 
              ${isChecked 
                ? currentSize.translate 
                : 'translate-x-0'
              }
            `}
          />
        </button>
        {/* Hidden input for form submissions */}
        {name && (
          <input
            type="checkbox"
            name={name}
            value={value}
            checked={isChecked}
            onChange={() => {}}
            disabled={disabled}
            required={required}
            aria-hidden="true"
            tabIndex={-1}
            style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
          />
        )}
      </>
    )
  }
)

Switch.displayName = 'Switch'

// Compound component for switch with label
export interface SwitchWithLabelProps extends SwitchProps {
  label: string
  description?: string
  labelPosition?: 'left' | 'right'
}

const SwitchWithLabel = React.forwardRef<HTMLButtonElement, SwitchWithLabelProps>(
  ({ label, description, labelPosition = 'left', className = '', ...props }, ref) => {
    const id = props.id || React.useId()
    
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {labelPosition === 'left' && (
          <label htmlFor={id} className="flex-1 cursor-pointer">
            <div className="font-medium text-sm">{label}</div>
            {description && (
              <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
            )}
          </label>
        )}
        
        <Switch ref={ref} id={id} {...props} />
        
        {labelPosition === 'right' && (
          <label htmlFor={id} className="flex-1 cursor-pointer">
            <div className="font-medium text-sm">{label}</div>
            {description && (
              <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
            )}
          </label>
        )}
      </div>
    )
  }
)

SwitchWithLabel.displayName = 'SwitchWithLabel'

export { Switch, SwitchWithLabel }