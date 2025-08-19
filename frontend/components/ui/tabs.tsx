'use client'

import * as React from 'react'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  activationMode?: 'automatic' | 'manual'
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

export interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  activationMode?: 'automatic' | 'manual'
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ 
    value,
    defaultValue = '',
    onValueChange,
    orientation = 'horizontal',
    activationMode = 'automatic',
    children,
    className = '',
    asChild = false,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    
    const isControlled = value !== undefined
    const actualValue = isControlled ? value : internalValue
    
    const handleValueChange = React.useCallback((newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }, [isControlled, onValueChange])

    const Component = asChild ? React.Fragment : 'div'
    const componentProps = asChild ? {} : { ref, className, ...props }

    return (
      <TabsContext.Provider value={{ 
        value: actualValue, 
        onValueChange: handleValueChange,
        orientation,
        activationMode
      }}>
        <Component {...componentProps}>
          {children}
        </Component>
      </TabsContext.Provider>
    )
  }
)

Tabs.displayName = 'Tabs'

export interface TabsListProps {
  children: React.ReactNode
  className?: string
  loop?: boolean
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className = '', loop = true, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error('TabsList must be used within Tabs')
    
    const listRef = React.useRef<HTMLDivElement>(null)
    const mergedRef = ref || listRef
    
    // Keyboard navigation
    React.useEffect(() => {
      const element = (mergedRef as React.RefObject<HTMLDivElement>).current
      if (!element) return
      
      const triggers = element.querySelectorAll('[role="tab"]')
      
      const handleKeyDown = (event: KeyboardEvent) => {
        const currentElement = document.activeElement
        const currentIndex = Array.from(triggers).indexOf(currentElement as Element)
        
        if (currentIndex === -1) return
        
        let nextIndex: number | null = null
        
        const isHorizontal = context.orientation === 'horizontal'
        const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown'
        const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp'
        
        switch (event.key) {
          case nextKey:
            event.preventDefault()
            nextIndex = currentIndex + 1
            if (nextIndex >= triggers.length) {
              nextIndex = loop ? 0 : triggers.length - 1
            }
            break
          case prevKey:
            event.preventDefault()
            nextIndex = currentIndex - 1
            if (nextIndex < 0) {
              nextIndex = loop ? triggers.length - 1 : 0
            }
            break
          case 'Home':
            event.preventDefault()
            nextIndex = 0
            break
          case 'End':
            event.preventDefault()
            nextIndex = triggers.length - 1
            break
        }
        
        if (nextIndex !== null) {
          const nextElement = triggers[nextIndex] as HTMLElement
          nextElement.focus()
          
          if (context.activationMode === 'automatic') {
            nextElement.click()
          }
        }
      }
      
      element.addEventListener('keydown', handleKeyDown)
      return () => element.removeEventListener('keydown', handleKeyDown)
    }, [mergedRef, context.orientation, context.activationMode, loop])
    
    const orientationStyles = context.orientation === 'vertical' 
      ? 'flex-col h-auto' 
      : 'flex-row w-full'
    
    return (
      <div
        ref={mergedRef}
        role="tablist"
        aria-orientation={context.orientation}
        className={`
          inline-flex items-center justify-center rounded-md 
          bg-muted p-1 text-muted-foreground
          ${orientationStyles}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

TabsList.displayName = 'TabsList'

export interface TabsTriggerProps {
  value: string
  disabled?: boolean
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, disabled = false, children, className = '', asChild = false, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error('TabsTrigger must be used within Tabs')
    
    const isActive = context.value === value
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const mergedRef = ref || triggerRef
    
    const handleClick = () => {
      if (!disabled) {
        context.onValueChange(value)
      }
    }
    
    const Component = asChild ? React.Fragment : 'button'
    
    const triggerProps = {
      ref: mergedRef,
      role: 'tab',
      type: 'button' as const,
      'aria-selected': isActive,
      'aria-controls': `panel-${value}`,
      'aria-disabled': disabled,
      'data-state': isActive ? 'active' : 'inactive',
      'data-disabled': disabled ? '' : undefined,
      tabIndex: isActive ? 0 : -1,
      disabled,
      onClick: handleClick,
      className: `
        inline-flex items-center justify-center whitespace-nowrap 
        rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background 
        transition-all focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-ring focus-visible:ring-offset-2 
        disabled:pointer-events-none disabled:opacity-50
        ${isActive 
          ? 'bg-background text-foreground shadow-sm' 
          : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
        }
        ${className}
      `,
      ...props
    }
    
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, triggerProps)
    }
    
    return (
      <Component {...triggerProps}>
        {children}
      </Component>
    )
  }
)

TabsTrigger.displayName = 'TabsTrigger'

export interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
  forceMount?: boolean
  asChild?: boolean
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, className = '', forceMount = false, asChild = false, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error('TabsContent must be used within Tabs')
    
    const isActive = context.value === value
    const [hasBeenActive, setHasBeenActive] = React.useState(isActive)
    
    React.useEffect(() => {
      if (isActive) {
        setHasBeenActive(true)
      }
    }, [isActive])
    
    // Don't render if not active and not force mounted and never been active
    if (!forceMount && !isActive && !hasBeenActive) {
      return null
    }
    
    const Component = asChild ? React.Fragment : 'div'
    
    const contentProps = {
      ref,
      role: 'tabpanel',
      id: `panel-${value}`,
      'aria-labelledby': value,
      'data-state': isActive ? 'active' : 'inactive',
      hidden: !isActive && !forceMount,
      tabIndex: 0,
      className: `
        mt-2 ring-offset-background 
        focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-ring focus-visible:ring-offset-2
        ${!isActive && forceMount ? 'hidden' : ''}
        ${className}
      `,
      ...props
    }
    
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, contentProps)
    }
    
    return (
      <Component {...contentProps}>
        {children}
      </Component>
    )
  }
)

TabsContent.displayName = 'TabsContent'

// Additional styled variants
export interface StyledTabsProps extends TabsProps {
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
}

const StyledTabs = React.forwardRef<HTMLDivElement, StyledTabsProps>(
  ({ variant = 'default', size = 'md', className = '', ...props }, ref) => {
    return (
      <Tabs
        ref={ref}
        className={`tabs-${variant} tabs-${size} ${className}`}
        {...props}
      />
    )
  }
)

StyledTabs.displayName = 'StyledTabs'

export interface StyledTabsListProps extends TabsListProps {
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
}

const StyledTabsList = React.forwardRef<HTMLDivElement, StyledTabsListProps>(
  ({ variant = 'default', size = 'md', className = '', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-muted p-1 rounded-md',
      pills: 'bg-transparent p-0 gap-2',
      underline: 'bg-transparent p-0 border-b'
    }
    
    const sizeStyles = {
      sm: 'h-8',
      md: 'h-10',
      lg: 'h-12'
    }
    
    return (
      <TabsList
        ref={ref}
        className={`
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      />
    )
  }
)

StyledTabsList.displayName = 'StyledTabsList'

export interface StyledTabsTriggerProps extends TabsTriggerProps {
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
}

const StyledTabsTrigger = React.forwardRef<HTMLButtonElement, StyledTabsTriggerProps>(
  ({ variant = 'default', size = 'md', className = '', ...props }, ref) => {
    const context = React.useContext(TabsContext)
    const isActive = context?.value === props.value
    
    const variantStyles = {
      default: '',
      pills: `
        ${isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted hover:bg-muted/80'
        } rounded-md
      `,
      underline: `
        bg-transparent rounded-none border-b-2 
        ${isActive 
          ? 'border-primary text-foreground' 
          : 'border-transparent text-muted-foreground hover:text-foreground'
        }
      `
    }
    
    const sizeStyles = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base'
    }
    
    return (
      <TabsTrigger
        ref={ref}
        className={`
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      />
    )
  }
)

StyledTabsTrigger.displayName = 'StyledTabsTrigger'

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  StyledTabs,
  StyledTabsList,
  StyledTabsTrigger
}