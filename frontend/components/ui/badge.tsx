import React from 'react'

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'warning'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold'
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-gray-900 text-white',
    secondary: 'bg-gray-100 text-gray-900',
    outline: 'border border-gray-300 text-gray-700',
    warning: 'bg-yellow-100 text-yellow-900'
  }

  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  )
}

export default Badge