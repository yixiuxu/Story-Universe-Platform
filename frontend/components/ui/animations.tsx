'use client'

import { motion } from 'framer-motion'

// 动画变体定义
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export const slideDown = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export const slideLeft = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
}

export const slideRight = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
}

export const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 }
}

export const bounceIn = {
  hidden: { scale: 0.3, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

// 页面过渡动画
export const pageTransition = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

// 容器动画
export const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

// 列表项动画
export const listItem = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

// 卡片动画
export const cardHover = {
  whileHover: {
    y: -5,
    transition: { duration: 0.2 }
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
}

// 按钮动画
export const buttonPress = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 }
}

// 渐入动画组件
interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  variant?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn'
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  variant = 'fadeIn'
}: AnimatedSectionProps) {
  const variants = {
    fadeIn,
    slideUp,
    slideDown,
    slideLeft,
    slideRight,
    scaleIn
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants[variant]}
      transition={{
        duration,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

// 动画容器组件
interface AnimatedContainerProps {
  children: React.ReactNode
  className?: string
  stagger?: number
}

export function AnimatedContainer({
  children,
  className = '',
  stagger = 0.1
}: AnimatedContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={container}
      transition={{ staggerChildren: stagger }}
    >
      {children}
    </motion.div>
  )
}

// 动画列表项组件
interface AnimatedItemProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedItem({
  children,
  className = '',
  delay = 0
}: AnimatedItemProps) {
  return (
    <motion.div
      className={className}
      variants={listItem}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

// 动画卡片组件
interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function AnimatedCard({
  children,
  className = '',
  onClick
}: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={cardHover.whileHover}
      whileTap={cardHover.whileTap}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// 动画按钮组件
interface AnimatedButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function AnimatedButton({
  children,
  className = '',
  onClick,
  disabled = false
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={className}
      whileHover={!disabled ? buttonPress.whileHover : undefined}
      whileTap={!disabled ? buttonPress.whileTap : undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}