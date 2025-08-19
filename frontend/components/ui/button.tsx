import React from 'react'

export type ButtonVariant = 'default' | 'outline'
export type ButtonSize = 'default' | 'sm' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  as?: keyof JSX.IntrinsicElements
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  as,
  children,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const variants: Record<ButtonVariant, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-input bg-transparent hover:bg-gray-100 text-gray-900'
  }
  const sizes: Record<ButtonSize, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    icon: 'h-9 w-9 p-0'
  }

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (as) {
    const AsTag: any = as
    return (
      <AsTag className={classes} {...props}>
        {children}
      </AsTag>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button