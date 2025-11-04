import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <Loader2
      className={`animate-spin ${sizeClasses[size]} ${className}`}
    />
  )
}

interface LoadingProps {
  isLoading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Loading({ isLoading, children, fallback }: LoadingProps) {
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" className="text-primary" />
      </div>
    )
  }

  return <>{children}</>
}