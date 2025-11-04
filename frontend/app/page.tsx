'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Film, Camera, Search } from 'lucide-react'
import {
  AnimatedSection,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard
} from '@/components/ui/animations'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <AnimatedSection variant="slideUp" delay={0.2}>
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
              故事宇宙平台
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              一站式AI创作平台：小说创作、角色生成、剧本转换、分镜助手、素材搜索
            </p>
          </header>
        </AnimatedSection>

        {/* Features Grid */}
        <AnimatedContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AnimatedItem delay={0.1}>
            <AnimatedCard className="card-hover">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>小说创作</CardTitle>
                <CardDescription>
                  使用GLM-4.6大模型进行智能小说创作，支持多种文体和风格
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/novel">
                  <Button className="w-full btn-primary">开始创作</Button>
                </Link>
              </CardContent>
            </AnimatedCard>
          </AnimatedItem>

          <AnimatedItem delay={0.2}>
            <AnimatedCard className="card-hover">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>角色生成</CardTitle>
                <CardDescription>
                  智能生成角色设定，包括外貌、性格、背景故事等
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/character">
                  <Button className="w-full btn-primary">创建角色</Button>
                </Link>
              </CardContent>
            </AnimatedCard>
          </AnimatedItem>

          <AnimatedItem delay={0.3}>
            <AnimatedCard className="card-hover">
              <CardHeader>
                <Film className="h-8 w-8 text-primary mb-2" />
                <CardTitle>剧本转换</CardTitle>
                <CardDescription>
                  将小说内容转换为专业剧本格式，支持场景分割和对话提取
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/script">
                  <Button className="w-full btn-primary">转换剧本</Button>
                </Link>
              </CardContent>
            </AnimatedCard>
          </AnimatedItem>

          <AnimatedItem delay={0.4}>
            <AnimatedCard className="card-hover">
              <CardHeader>
                <Camera className="h-8 w-8 text-primary mb-2" />
                <CardTitle>分镜助手</CardTitle>
                <CardDescription>
                  智能生成分镜脚本，支持CogView-4图像生成
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/storyboard">
                  <Button className="w-full btn-primary">生成分镜</Button>
                </Link>
              </CardContent>
            </AnimatedCard>
          </AnimatedItem>

          <AnimatedItem delay={0.5}>
            <AnimatedCard className="card-hover md:col-span-2">
              <CardHeader>
                <Search className="h-8 w-8 text-primary mb-2" />
                <CardTitle>素材搜索</CardTitle>
                <CardDescription>
                  集成联网搜索功能，快速查找创作所需的背景资料、图片素材等
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/search">
                  <Button className="w-full btn-primary">搜索素材</Button>
                </Link>
              </CardContent>
            </AnimatedCard>
          </AnimatedItem>
        </AnimatedContainer>

        {/* Tech Stack */}
        <AnimatedSection variant="fadeIn" delay={0.6}>
          <div className="card-hover bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold gradient-text mb-6 text-center">
              技术栈
            </h2>
            <AnimatedContainer className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <AnimatedItem delay={0.1}>
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">前端</h3>
                  <p className="text-sm text-muted-foreground">Next.js 14</p>
                  <p className="text-sm text-muted-foreground">React 18</p>
                  <p className="text-sm text-muted-foreground">Tailwind CSS</p>
                </div>
              </AnimatedItem>
              <AnimatedItem delay={0.2}>
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">后端</h3>
                  <p className="text-sm text-muted-foreground">Python</p>
                  <p className="text-sm text-muted-foreground">FastAPI</p>
                  <p className="text-sm text-muted-foreground">SQLite</p>
                </div>
              </AnimatedItem>
              <AnimatedItem delay={0.3}>
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">AI模型</h3>
                  <p className="text-sm text-muted-foreground">GLM-4.6</p>
                  <p className="text-sm text-muted-foreground">GLM-4.5V</p>
                  <p className="text-sm text-muted-foreground">CogView-4</p>
                </div>
              </AnimatedItem>
              <AnimatedItem delay={0.4}>
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">集成工具</h3>
                  <p className="text-sm text-muted-foreground">MCP协议</p>
                  <p className="text-sm text-muted-foreground">图片/视频理解</p>
                  <p className="text-sm text-muted-foreground">联网搜索</p>
                </div>
              </AnimatedItem>
            </AnimatedContainer>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}