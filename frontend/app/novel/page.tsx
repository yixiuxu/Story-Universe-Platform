'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import OutlineGenerator from './components/OutlineGenerator'
import ChapterContinuation from './components/ChapterContinuation'
import StyleAdjustment from './components/StyleAdjustment'
import { AnimatedSection } from '@/components/ui/animations'

export default function NovelPage() {
  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-4">
      <AnimatedSection variant="slideUp" delay={0.2}>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-2 sm:mb-3">
            小说创作助手
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl">
            使用AI大模型协助您进行小说创作，包括大纲生成、章节续写和风格调整
          </p>
        </div>
      </AnimatedSection>

      <Tabs defaultValue="outline" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="outline" className="text-xs sm:text-sm py-2 px-1 sm:px-2 md:px-4">
            大纲生成
          </TabsTrigger>
          <TabsTrigger value="continue" className="text-xs sm:text-sm py-2 px-1 sm:px-2 md:px-4">
            章节续写
          </TabsTrigger>
          <TabsTrigger value="rewrite" className="text-xs sm:text-sm py-2 px-1 sm:px-2 md:px-4">
            风格调整
          </TabsTrigger>
        </TabsList>

        <TabsContent value="outline" className="mt-4 sm:mt-6">
          <AnimatedSection variant="fadeIn" delay={0.3}>
            <Card className="card-hover">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl">故事大纲生成</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  输入基本信息，AI将为您生成完整的故事大纲，并搜索相关背景资料
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <OutlineGenerator />
              </CardContent>
            </Card>
          </AnimatedSection>
        </TabsContent>

        <TabsContent value="continue" className="mt-4 sm:mt-6">
          <AnimatedSection variant="fadeIn" delay={0.4}>
            <Card className="card-hover">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl">章节续写</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  基于已有内容，AI将帮助您续写后续章节，保持故事连贯性
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ChapterContinuation />
              </CardContent>
            </Card>
          </AnimatedSection>
        </TabsContent>

        <TabsContent value="rewrite" className="mt-4 sm:mt-6">
          <AnimatedSection variant="fadeIn" delay={0.5}>
            <Card className="card-hover">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl">风格调整</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  调整文本风格，让作品更符合您期望的写作风格
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <StyleAdjustment />
              </CardContent>
            </Card>
          </AnimatedSection>
        </TabsContent>
      </Tabs>
    </div>
  )
}