'use client'

import * as React from 'react'

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  onValueCommit?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  minStepsBetweenThumbs?: number
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  inverted?: boolean
  showValue?: boolean
  showLabels?: boolean
  marks?: Array<{ value: number; label?: string }>
  className?: string
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({
    value: controlledValue,
    defaultValue = [0],
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    minStepsBetweenThumbs = 0,
    disabled = false,
    orientation = 'horizontal',
    inverted = false,
    showValue = false,
    showLabels = false,
    marks = [],
    className = '',
    id,
    name,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const [isDragging, setIsDragging] = React.useState(false)
    const [activeThumb, setActiveThumb] = React.useState<number | null>(null)
    const sliderRef = React.useRef<HTMLDivElement>(null)
    
    const isControlled = controlledValue !== undefined
    const values = isControlled ? controlledValue : internalValue
    const isMulti = values.length > 1

    // Calculate position percentage for each value
    const getPercentage = (val: number) => {
      const percentage = ((val - min) / (max - min)) * 100
      return inverted ? 100 - percentage : percentage
    }

    // Update value based on position
    const updateValue = (clientX: number, clientY: number, thumbIndex: number = 0) => {
      if (!sliderRef.current || disabled) return

      const rect = sliderRef.current.getBoundingClientRect()
      let percentage: number

      if (orientation === 'horizontal') {
        const x = clientX - rect.left
        percentage = (x / rect.width) * 100
      } else {
        const y = clientY - rect.top
        percentage = (y / rect.height) * 100
      }

      if (inverted) {
        percentage = 100 - percentage
      }

      percentage = Math.max(0, Math.min(100, percentage))
      const newValue = min + (percentage / 100) * (max - min)
      
      // Snap to step
      const steppedValue = Math.round(newValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))

      const newValues = [...values]
      newValues[thumbIndex] = clampedValue

      // Ensure minimum distance between thumbs
      if (isMulti && minStepsBetweenThumbs > 0) {
        const minDistance = minStepsBetweenThumbs * step
        for (let i = 0; i < newValues.length; i++) {
          if (i !== thumbIndex) {
            const diff = Math.abs(newValues[i] - newValues[thumbIndex])
            if (diff < minDistance) {
              return // Don't update if too close
            }
          }
        }
      }

      // Sort values to maintain order
      if (isMulti) {
        newValues.sort((a, b) => a - b)
      }

      if (!isControlled) {
        setInternalValue(newValues)
      }
      onValueChange?.(newValues)
    }

    // Mouse event handlers
    const handleMouseDown = (event: React.MouseEvent, thumbIndex: number) => {
      event.preventDefault()
      setIsDragging(true)
      setActiveThumb(thumbIndex)
      updateValue(event.clientX, event.clientY, thumbIndex)
    }

    React.useEffect(() => {
      if (!isDragging) return

      const handleMouseMove = (event: MouseEvent) => {
        if (activeThumb !== null) {
          updateValue(event.clientX, event.clientY, activeThumb)
        }
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        setActiveThumb(null)
        if (activeThumb !== null) {
          onValueCommit?.(values)
        }
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }, [isDragging, activeThumb, values])

    // Keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent, thumbIndex: number) => {
      if (disabled) return

      let newValue = values[thumbIndex]
      const bigStep = (max - min) / 10

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          event.preventDefault()
          newValue = Math.max(min, newValue - step)
          break
        case 'ArrowRight':
        case 'ArrowUp':
          event.preventDefault()
          newValue = Math.min(max, newValue + step)
          break
        case 'PageDown':
          event.preventDefault()
          newValue = Math.max(min, newValue - bigStep)
          break
        case 'PageUp':
          event.preventDefault()
          newValue = Math.min(max, newValue + bigStep)
          break
        case 'Home':
          event.preventDefault()
          newValue = min
          break
        case 'End':
          event.preventDefault()
          newValue = max
          break
        default:
          return
      }

      const newValues = [...values]
      newValues[thumbIndex] = newValue

      if (!isControlled) {
        setInternalValue(newValues)
      }
      onValueChange?.(newValues)
      onValueCommit?.(newValues)
    }

    const isVertical = orientation === 'vertical'

    return (
      <div
        ref={ref}
        className={`relative ${isVertical ? 'h-full w-5' : 'w-full h-5'} ${className}`}
        data-disabled={disabled}
        data-orientation={orientation}
      >
        {/* Labels */}
        {showLabels && (
          <div className={`absolute ${isVertical ? 'left-8' : '-top-6'} text-xs text-muted-foreground`}>
            <span>{min}</span>
            <span className={`absolute ${isVertical ? 'bottom-0' : 'right-0'}`}>{max}</span>
          </div>
        )}

        {/* Track */}
        <div
          ref={sliderRef}
          className={`
            absolute ${isVertical ? 'left-1/2 w-1 h-full -translate-x-1/2' : 'top-1/2 h-1 w-full -translate-y-1/2'}
            rounded-full bg-secondary ${disabled ? 'opacity-50' : 'cursor-pointer'}
          `}
          onClick={(e) => {
            if (!isMulti && !disabled) {
              updateValue(e.clientX, e.clientY, 0)
              onValueCommit?.(values)
            }
          }}
        >
          {/* Filled track */}
          {!isMulti && (
            <div
              className="absolute bg-primary rounded-full"
              style={
                isVertical
                  ? {
                      bottom: '0%',
                      height: `${getPercentage(values[0])}%`,
                      width: '100%',
                    }
                  : {
                      left: '0%',
                      width: `${getPercentage(values[0])}%`,
                      height: '100%',
                    }
              }
            />
          )}

          {/* Multi-thumb filled track */}
          {isMulti && (
            <div
              className="absolute bg-primary rounded-full"
              style={
                isVertical
                  ? {
                      bottom: `${getPercentage(values[0])}%`,
                      height: `${getPercentage(values[values.length - 1]) - getPercentage(values[0])}%`,
                      width: '100%',
                    }
                  : {
                      left: `${getPercentage(values[0])}%`,
                      width: `${getPercentage(values[values.length - 1]) - getPercentage(values[0])}%`,
                      height: '100%',
                    }
              }
            />
          )}

          {/* Marks */}
          {marks.map((mark) => {
            const position = getPercentage(mark.value)
            return (
              <div
                key={mark.value}
                className={`absolute ${isVertical ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'}`}
                style={isVertical ? { bottom: `${position}%` } : { left: `${position}%` }}
              >
                <div className={`${isVertical ? 'w-2 h-0.5' : 'w-0.5 h-2'} bg-border`} />
                {mark.label && (
                  <span className={`absolute text-xs text-muted-foreground ${
                    isVertical ? 'left-4 -translate-y-1/2' : 'top-4 -translate-x-1/2'
                  }`}>
                    {mark.label}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Thumbs */}
        {values.map((val, index) => {
          const position = getPercentage(val)
          return (
            <div
              key={index}
              className={`absolute ${isVertical ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'}`}
              style={isVertical ? { bottom: `${position}%` } : { left: `${position}%` }}
            >
              <button
                type="button"
                role="slider"
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={val}
                aria-disabled={disabled}
                aria-orientation={orientation}
                tabIndex={disabled ? -1 : 0}
                className={`
                  block h-5 w-5 rounded-full border-2 border-primary bg-background 
                  ring-offset-background transition-colors
                  ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  ${isDragging && activeThumb === index ? 'ring-2 ring-ring ring-offset-2' : ''}
                `}
                onMouseDown={(e) => handleMouseDown(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
              
              {/* Value display */}
              {showValue && (
                <span className={`
                  absolute text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded
                  ${isVertical ? 'left-8' : '-top-7 left-1/2 -translate-x-1/2'}
                `}>
                  {val}
                </span>
              )}
            </div>
          )
        })}

        {/* Hidden inputs for form submission */}
        {name && values.map((val, index) => (
          <input
            key={index}
            type="hidden"
            name={isMulti ? `${name}[${index}]` : name}
            value={val}
          />
        ))}
      </div>
    )
  }
)

Slider.displayName = 'Slider'

export { Slider }