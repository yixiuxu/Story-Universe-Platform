'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// 响应式hook
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// 响应式断点hooks
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)')
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}

export function useIsSmallMobile() {
  return useMediaQuery('(max-width: 480px)')
}

// 响应式容器组件
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ResponsiveContainer({
  children,
  className = '',
  breakpoint = 'md'
}: ResponsiveContainerProps) {
  const containerClasses = {
    sm: 'max-w-sm',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl'
  }

  return (
    <div className={cn(
      'container mx-auto px-4 sm:px-6 lg:px-8',
      containerClasses[breakpoint],
      className
    )}>
      {children}
    </div>
  )
}

// 响应式网格组件
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: {
    sm?: string
    md?: string
    lg?: string
    xl?: string
  }
}

export function ResponsiveGrid({
  children,
  className = '',
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = { sm: '4', md: '6', lg: '8', xl: '8' }
}: ResponsiveGridProps) {
  const gridCols = [
    cols.xl ? `xl:grid-cols-${cols.xl}` : '',
    cols.lg ? `lg:grid-cols-${cols.lg}` : '',
    cols.md ? `md:grid-cols-${cols.md}` : '',
    cols.sm ? `sm:grid-cols-${cols.sm}` : '',
    'grid-cols-1'
  ].filter(Boolean).join(' ')

  const gridGap = [
    gap.xl ? `xl:gap-${gap.xl}` : '',
    gap.lg ? `lg:gap-${gap.lg}` : '',
    gap.md ? `md:gap-${gap.md}` : '',
    gap.sm ? `sm:gap-${gap.sm}` : '',
    `gap-${gap.sm || '4'}`
  ].filter(Boolean).join(' ')

  return (
    <div className={cn(
      'grid',
      gridCols,
      gridGap,
      className
    )}>
      {children}
    </div>
  )
}

// 响应式文本组件
interface ResponsiveTextProps {
  children: React.ReactNode
  className?: string
  size?: {
    sm?: string
    md?: string
    lg?: string
    xl?: string
  }
  weight?: {
    sm?: string
    md?: string
    lg?: string
    xl?: string
  }
}

export function ResponsiveText({
  children,
  className = '',
  size = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' },
  weight = {}
}: ResponsiveTextProps) {
  const textSizes = [
    size.xl ? `xl:${size.xl}` : '',
    size.lg ? `lg:${size.lg}` : '',
    size.md ? `md:${size.md}` : '',
    size.sm ? `sm:${size.sm}` : '',
    size.sm || 'text-sm'
  ].filter(Boolean).join(' ')

  const textWeights = [
    weight.xl ? `xl:${weight.xl}` : '',
    weight.lg ? `lg:${weight.lg}` : '',
    weight.md ? `md:${weight.md}` : '',
    weight.sm ? `sm:${weight.sm}` : ''
  ].filter(Boolean).join(' ')

  return (
    <p className={cn(
      textSizes,
      textWeights,
      className
    )}>
      {children}
    </p>
  )
}

// 响应式间距组件
interface ResponsiveSpacingProps {
  children: React.ReactNode
  className?: string
  spacing?: {
    top?: {
      sm?: string
      md?: string
      lg?: string
      xl?: string
    }
    bottom?: {
      sm?: string
      md?: string
      lg?: string
      xl?: string
    }
    left?: {
      sm?: string
      md?: string
      lg?: string
      xl?: string
    }
    right?: {
      sm?: string
      md?: string
      lg?: string
      xl?: string
    }
  }
}

export function ResponsiveSpacing({
  children,
  className = '',
  spacing = {}
}: ResponsiveSpacingProps) {
  const spacingClasses = []

  // Top spacing
  if (spacing.top) {
    spacingClasses.push(
      spacing.top.xl ? `xl:mt-${spacing.top.xl}` : '',
      spacing.top.lg ? `lg:mt-${spacing.top.lg}` : '',
      spacing.top.md ? `md:mt-${spacing.top.md}` : '',
      spacing.top.sm ? `sm:mt-${spacing.top.sm}` : '',
      spacing.top.sm ? `mt-${spacing.top.sm}` : ''
    )
  }

  // Bottom spacing
  if (spacing.bottom) {
    spacingClasses.push(
      spacing.bottom.xl ? `xl:mb-${spacing.bottom.xl}` : '',
      spacing.bottom.lg ? `lg:mb-${spacing.bottom.lg}` : '',
      spacing.bottom.md ? `md:mb-${spacing.bottom.md}` : '',
      spacing.bottom.sm ? `sm:mb-${spacing.bottom.sm}` : '',
      spacing.bottom.sm ? `mb-${spacing.bottom.sm}` : ''
    )
  }

  // Left spacing
  if (spacing.left) {
    spacingClasses.push(
      spacing.left.xl ? `xl:ml-${spacing.left.xl}` : '',
      spacing.left.lg ? `lg:ml-${spacing.left.lg}` : '',
      spacing.left.md ? `md:ml-${spacing.left.md}` : '',
      spacing.left.sm ? `sm:ml-${spacing.left.sm}` : '',
      spacing.left.sm ? `ml-${spacing.left.sm}` : ''
    )
  }

  // Right spacing
  if (spacing.right) {
    spacingClasses.push(
      spacing.right.xl ? `xl:mr-${spacing.right.xl}` : '',
      spacing.right.lg ? `lg:mr-${spacing.right.lg}` : '',
      spacing.right.md ? `md:mr-${spacing.right.md}` : '',
      spacing.right.sm ? `sm:mr-${spacing.right.sm}` : '',
      spacing.right.sm ? `mr-${spacing.right.sm}` : ''
    )
  }

  return (
    <div className={cn(
      spacingClasses.filter(Boolean).join(' '),
      className
    )}>
      {children}
    </div>
  )
}

// 移动端优化工具函数
export function getResponsiveValue<T>(
  values: {
    sm?: T
    md?: T
    lg?: T
    xl?: T
    base: T
  }
): T {
  if (typeof window === 'undefined') return values.base

  const width = window.innerWidth

  if (width >= 1280 && values.xl !== undefined) return values.xl
  if (width >= 1024 && values.lg !== undefined) return values.lg
  if (width >= 768 && values.md !== undefined) return values.md
  if (width >= 640 && values.sm !== undefined) return values.sm

  return values.base
}

// 响应式图片组件
interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  sizes?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  priority?: boolean
}

export function ResponsiveImage({
  src,
  alt,
  className = '',
  sizes = { sm: 640, md: 768, lg: 1024, xl: 1280 },
  priority = false
}: ResponsiveImageProps) {
  const srcset = Object.entries(sizes)
    .map(([breakpoint, width]) => `${src}?w=${width} ${width}w`)
    .join(', ')

  const sizesAttr = Object.entries(sizes)
    .map(([breakpoint]) => {
      const breakpoints = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' }
      return `(min-width: ${breakpoints[breakpoint as keyof typeof breakpoints]}) ${sizes[breakpoint as keyof typeof sizes]}px`
    })
    .reverse()
    .join(', ') + ', 100vw'

  return (
    <img
      src={src}
      alt={alt}
      className={cn('w-full h-auto object-cover', className)}
      srcSet={srcset}
      sizes={sizesAttr}
      loading={priority ? 'eager' : 'lazy'}
    />
  )
}