'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import BackgroundSearch from './components/BackgroundSearch'
import HotTopics from './components/HotTopics'
import InspirationRecommendations from './components/InspirationRecommendations'
import SearchHistory from './components/SearchHistory'

export default function SearchPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">素材搜索库</h1>
        <p className="text-gray-600">
          使用AI智能搜索功能，快速获取创作所需的背景资料、热点资讯和灵感推荐
        </p>
      </div>

      <Tabs defaultValue="background" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="background">背景资料</TabsTrigger>
          <TabsTrigger value="hot">热点追踪</TabsTrigger>
          <TabsTrigger value="inspiration">灵感推荐</TabsTrigger>
          <TabsTrigger value="history">搜索历史</TabsTrigger>
        </TabsList>

        <TabsContent value="background" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>背景资料搜索</CardTitle>
              <CardDescription>
                实时搜索创作相关的背景资料，包括历史、科学、文化、技术等各个领域的知识
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BackgroundSearch />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hot" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>热点追踪</CardTitle>
              <CardDescription>
                获取当前热门话题、社会现象和文化趋势，为创作提供时代背景和灵感
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HotTopics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspiration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>灵感推荐</CardTitle>
              <CardDescription>
                基于您的创作需求，AI智能推荐相关的灵感素材和创作思路
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InspirationRecommendations />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>搜索历史</CardTitle>
              <CardDescription>
                查看和管理您的搜索历史，快速访问之前找到的有用资料
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}