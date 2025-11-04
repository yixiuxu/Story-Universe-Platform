'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MobileCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  actions?: React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  footer?: React.ReactNode
  hover?: boolean
  compact?: boolean
}

export function MobileCard({
  children,
  className = '',
  title,
  description,
  actions,
  collapsible = false,
  defaultCollapsed = false,
  footer,
  hover = true,
  compact = false,
  ...props
}: MobileCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const CardComponent = hover ? motion.div : Card
  const cardProps = hover ? {
    whileHover: { y: -2 },
    whileTap: { scale: 0.98 }
  } : {}

  return (
    <CardComponent
      {...cardProps}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6',
        hover && 'transition-all duration-200 hover:shadow-md',
        className
      )}
      {...props}
    >
      {/* Card Header */}
      {(title || description || actions) && (
        <CardHeader className={cn(
          'pb-3 sm:pb-4',
          compact ? 'space-y-1' : 'space-y-1.5'
        )}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {title && (
                <CardTitle className={cn(
                  'text-lg sm:text-xl font-semibold leading-tight',
                  compact && 'text-base sm:text-lg'
                )}>
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className={cn(
                  'text-sm text-muted-foreground mt-1 leading-relaxed',
                  compact && 'text-xs'
                )}>
                  {description}
                </CardDescription>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {actions}
                {collapsible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-8 w-8 p-0"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      )}

      {/* Card Content */}
      <CardContent className={cn(
        'pt-0',
        compact && 'space-y-2',
        isCollapsed && 'hidden'
      )}>
        {children}
      </CardContent>

      {/* Card Footer */}
      {footer && !isCollapsed && (
        <div className={cn(
          'pt-3 sm:pt-4 mt-3 sm:mt-4 border-t',
          compact && 'pt-2 mt-2'
        )}>
          {footer}
        </div>
      )}
    </CardComponent>
  )
}

// 移动端优化的卡片网格
interface MobileCardGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
  }
}

export function MobileCardGrid({
  children,
  className = '',
  cols = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = { xs: '4', sm: '4', md: '6', lg: '6', xl: '8' }
}: MobileCardGridProps) {
  const gridClasses = [
    cols.xl ? `xl:grid-cols-${cols.xl}` : '',
    cols.lg ? `lg:grid-cols-${cols.lg}` : '',
    cols.md ? `md:grid-cols-${cols.md}` : '',
    cols.sm ? `sm:grid-cols-${cols.sm}` : '',
    cols.xs ? `grid-cols-${cols.xs}` : 'grid-cols-1'
  ].filter(Boolean).join(' ')

  const gapClasses = [
    gap.xl ? `xl:gap-${gap.xl}` : '',
    gap.lg ? `lg:gap-${gap.lg}` : '',
    gap.md ? `md:gap-${gap.md}` : '',
    gap.sm ? `sm:gap-${gap.sm}` : '',
    `gap-${gap.xs || '4'}`
  ].filter(Boolean).join(' ')

  return (
    <div className={cn('grid', gridClasses, gapClasses, className)}>
      {children}
    </div>
  )
}

// 移动端优化的功能卡片
interface MobileFeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href?: string
  onClick?: () => void
  badge?: string
  className?: string
}

export function MobileFeatureCard({
  icon,
  title,
  description,
  href,
  onClick,
  badge,
  className = ''
}: MobileFeatureCardProps) {
  const CardWrapper = href ? 'a' : 'div'
  const wrapperProps = href ? { href } : {}

  return (
    <CardWrapper
      {...wrapperProps}
      onClick={onClick}
      className={cn('block', className)}
    >
      <MobileCard
        hover
        className="h-full cursor-pointer"
        footer={
          href && (
            <Button variant="ghost" size="sm" className="w-full justify-center">
              开始使用 →
            </Button>
          )
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base sm:text-lg text-foreground">
                {title}
              </h3>
              {badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2 sm:line-clamp-3">
              {description}
            </p>
          </div>
        </div>
      </MobileCard>
    </CardWrapper>
  )
}

// 移动端统计卡片
interface MobileStatCardProps {
  value: string | number
  label: string
  change?: {
    value: string | number
    type: 'increase' | 'decrease'
  }
  icon?: React.ReactNode
  className?: string
}

export function MobileStatCard({
  value,
  label,
  change,
  icon,
  className = ''
}: MobileStatCardProps) {
  const changeColor = change?.type === 'increase' ? 'text-green-600' : 'text-red-600'

  return (
    <MobileCard compact className={className}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            {value}
          </p>
          <p className="text-sm text-muted-foreground truncate">{label}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {icon && (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center">
              {icon}
            </div>
          )}
          {change && (
            <div className={cn('text-xs font-medium flex items-center', changeColor)}>
              {change.type === 'increase' ? '↑' : '↓'} {change.value}
            </div>
          )}
        </div>
      </div>
    </MobileCard>
  )
}

// 移动端操作卡片
interface MobileActionCardProps {
  title: string
  description?: string
  primaryAction?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
  loading?: boolean
  className?: string
}

export function MobileActionCard({
  title,
  description,
  primaryAction,
  secondaryAction,
  icon,
  loading = false,
  className = ''
}: MobileActionCardProps) {
  return (
    <MobileCard className={className}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
              {description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                variant={primaryAction.variant || 'default'}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? '处理中...' : primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </MobileCard>
  )
}