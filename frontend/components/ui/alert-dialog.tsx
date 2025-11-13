'use client'

import React, { useState, useEffect } from 'react'
import { Button } from './button'

interface AlertDialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface AlertDialogTriggerProps {
  children: React.ReactNode
  onClick?: () => void
  asChild?: boolean
}

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
}

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
}

const AlertDialogContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {}
})

const AlertDialog: React.FC<AlertDialogProps> = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpenInternal] = useState(false)
  
  const actualIsOpen = open !== undefined ? open : isOpen
  const setIsOpen = (newOpen: boolean) => {
    if (open === undefined) {
      setIsOpenInternal(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  return (
    <AlertDialogContext.Provider value={{ isOpen: actualIsOpen, setIsOpen }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({ children, onClick, asChild }) => {
  const { setIsOpen } = React.useContext(AlertDialogContext)
  
  const handleClick = () => {
    setIsOpen(true)
    onClick?.()
  }

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, { onClick: handleClick })
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  )
}

const AlertDialogContent: React.FC<AlertDialogContentProps> = ({ children, className = '' }) => {
  const { isOpen, setIsOpen } = React.useContext(AlertDialogContext)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Content */}
      <div className={`relative bg-white rounded-lg shadow-lg border max-w-lg w-full mx-4 p-6 ${className}`}>
        {children}
      </div>
    </div>
  )
}

const AlertDialogHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}>
    {children}
  </div>
)

const AlertDialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 ${className}`}>
    {children}
  </div>
)

const AlertDialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-lg font-semibold ${className}`}>
    {children}
  </h2>
)

const AlertDialogDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
)

const AlertDialogAction: React.FC<AlertDialogActionProps> = ({ children, className = '', onClick, ...props }) => {
  const { setIsOpen } = React.useContext(AlertDialogContext)
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    setIsOpen(false)
  }

  return (
    <Button className={className} onClick={handleClick} {...props}>
      {children}
    </Button>
  )
}

const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({ children, className = '', onClick, ...props }) => {
  const { setIsOpen } = React.useContext(AlertDialogContext)
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    setIsOpen(false)
  }

  return (
    <Button variant="outline" className={className} onClick={handleClick} {...props}>
      {children}
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}