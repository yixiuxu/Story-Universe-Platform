'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BookOpen,
  Users,
  Film,
  Camera,
  Search,
  Menu,
  X,
  Sparkles,
  Home,
  Settings,
  User,
  Moon,
  Sun,
  ChevronDown,
  Zap,
  TrendingUp,
  Lightbulb
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  description?: string
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    title: '首页',
    href: '/',
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: '小说创作',
    href: '/novel',
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: '角色生成',
    href: '/character',
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: '剧本转换',
    href: '/script',
    icon: <Film className="h-4 w-4" />,
  },
  {
    title: '分镜助手',
    href: '/storyboard',
    icon: <Camera className="h-4 w-4" />,
  },
  {
    title: '素材搜索',
    href: '/search',
    icon: <Search className="h-4 w-4" />,
  },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <motion.header
        className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              SU
            </motion.div>
            <span className="text-xl font-bold text-foreground">
              Story Universe
            </span>
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList className="hidden md:flex md:flex-row gap-1">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  {item.children ? (
                    <>
                      <NavigationMenuTrigger
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                          isActive(item.href)
                            ? 'bg-primary text-primary-foreground'
                            : ''
                        }`}
                      >
                        {item.icon}
                        <span className="ml-2">{item.title}</span>
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="p-2 w-64">
                          {item.children?.map((child) => (
                            <NavigationMenuItem key={child.href} as any>
                              <Link
                                href={child.href}
                                className={`block w-full px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                                  isActive(child.href)
                                    ? 'bg-primary text-primary-foreground'
                                    : ''
                                }`}
                              >
                                {child.icon}
                                <span className="ml-2">{child.title}</span>
                              </Link>
                            </NavigationMenuItem>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                        isActive(item.href)
                          ? 'bg-primary text-primary-foreground'
                          : ''
                      }`}
                    >
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => alert('个人资料功能开发中...')}>
                  <User className="mr-2 h-4 w-4" />
                  个人资料
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert('设置功能开发中...')}>
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation */}
      <motion.header
        className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
              SU
            </div>
            <span className="text-xl font-bold text-foreground">
              Story Universe
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Menu Items */}
        {isMenuOpen && (
          <motion.div
            className="border-b border-border bg-background"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.href}>
                  {item.children ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-3 py-2">
                        {item.icon}
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <div className="ml-8 space-y-1">
                        {item.children?.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {child.icon}
                            <span>{child.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                        isActive(item.href)
                          ? 'bg-primary text-primary-foreground'
                          : ''
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.header>
    </>
  )
}