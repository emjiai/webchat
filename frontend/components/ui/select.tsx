'use client'

import * as React from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
  defaultValue?: string
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onValueChange = () => {}, children, disabled = false, defaultValue = '' }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    
    const actualValue = value !== undefined ? value : internalValue
    
    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange(newValue)
    }

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        if (!target.closest('[data-select-container]')) {
          setOpen(false)
        }
      }

      if (open) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [open])

    return (
      <SelectContext.Provider value={{ 
        value: actualValue, 
        onValueChange: handleValueChange, 
        open, 
        setOpen,
        disabled 
      }}>
        <div ref={ref} className="relative" data-select-container>
          {children}
        </div>
      </SelectContext.Provider>
    )
  }
)

Select.displayName = 'Select'

export interface SelectTriggerProps {
  children?: React.ReactNode
  className?: string
  placeholder?: string
  id?: string
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className = '', placeholder = 'Select an option', id }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error('SelectTrigger must be used within Select')

    return (
      <button
        ref={ref}
        id={id}
        type="button"
        onClick={() => !context.disabled && context.setOpen(!context.open)}
        disabled={context.disabled}
        aria-expanded={context.open}
        aria-haspopup="listbox"
        className={`
          flex h-10 w-full items-center justify-between rounded-md border 
          border-input bg-background px-3 py-2 text-sm ring-offset-background 
          placeholder:text-muted-foreground focus:outline-none focus:ring-2 
          focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed 
          disabled:opacity-50 ${className}
        `}
      >
        {children || <span className="text-muted-foreground">{placeholder}</span>}
        <ChevronDown 
          className={`h-4 w-4 opacity-50 transition-transform duration-200 ${
            context.open ? 'rotate-180' : ''
          }`} 
        />
      </button>
    )
  }
)

SelectTrigger.displayName = 'SelectTrigger'

export interface SelectValueProps {
  placeholder?: string
  className?: string
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder = 'Select an option', className = '' }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error('SelectValue must be used within Select')
    
    return (
      <span ref={ref} className={className}>
        {context.value || <span className="text-muted-foreground">{placeholder}</span>}
      </span>
    )
  }
)

SelectValue.displayName = 'SelectValue'

export interface SelectContentProps {
  children: React.ReactNode
  className?: string
  position?: 'top' | 'bottom'
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className = '', position = 'bottom' }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error('SelectContent must be used within Select')

    if (!context.open) return null

    const positionStyles = position === 'top' 
      ? 'bottom-full mb-1' 
      : 'top-full mt-1'

    return (
      <div 
        ref={ref}
        className={`
          absolute ${positionStyles} z-50 w-full rounded-md border 
          bg-white shadow-lg animate-in fade-in-0 zoom-in-95 
          ${className}
        `}
        role="listbox"
      >
        <div className="py-1 max-h-60 overflow-auto">
          {children}
        </div>
      </div>
    )
  }
)

SelectContent.displayName = 'SelectContent'

export interface SelectItemProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ value, children, disabled = false, className = '' }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error('SelectItem must be used within Select')

    const isSelected = context.value === value

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={isSelected}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            context.onValueChange(value)
            context.setOpen(false)
          }
        }}
        className={`
          relative flex w-full cursor-default select-none items-center 
          px-3 py-2 text-sm outline-none transition-colors
          ${isSelected ? 'bg-accent text-accent-foreground' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent hover:text-accent-foreground'}
          ${className}
        `}
      >
        <span className="flex-1 text-left">{children}</span>
        {isSelected && (
          <Check className="h-4 w-4 ml-2" />
        )}
      </button>
    )
  }
)

SelectItem.displayName = 'SelectItem'

export interface SelectSeparatorProps {
  className?: string
}

const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className = '' }, ref) => {
    return (
      <div 
        ref={ref}
        className={`-mx-1 my-1 h-px bg-muted ${className}`} 
      />
    )
  }
)

SelectSeparator.displayName = 'SelectSeparator'

export interface SelectGroupProps {
  children: React.ReactNode
  label?: string
  className?: string
}

const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ children, label, className = '' }, ref) => {
    return (
      <div ref={ref} className={className}>
        {label && (
          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            {label}
          </div>
        )}
        {children}
      </div>
    )
  }
)

SelectGroup.displayName = 'SelectGroup'

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectGroup
}