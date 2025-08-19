import React from 'react'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

export const Progress: React.FC<ProgressProps> = ({ value = 0, className = '', ...props }) => {
  const safe = Math.min(100, Math.max(0, value))
  return (
    <div className={`w-full h-2 bg-gray-200 rounded ${className}`} {...props}>
      <div
        className="h-2 bg-blue-600 rounded"
        style={{ width: `${safe}%` }}
      />
    </div>
  )
}

export default Progress