'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import TextToStoryboard from './components/TextToStoryboard'
import ReferenceAnalyzer from './components/ReferenceAnalyzer'
import VideoAnalyzer from './components/VideoAnalyzer'
import StoryboardGallery from './components/StoryboardGallery'

export default function StoryboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">分镜助手</h1>
        <p className="text-gray-600">
          使用AI技术将文字转换为专业分镜，分析参考图片和视频学习分镜技巧
        </p>
      </div>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="text">文字转分镜</TabsTrigger>
          <TabsTrigger value="image">参考图分析</TabsTrigger>
          <TabsTrigger value="video">视频学习</TabsTrigger>
          <TabsTrigger value="gallery">分镜展示</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>文字转分镜</CardTitle>
              <CardDescription>
                输入剧本或文字内容，AI将自动生成分镜脚本和视觉描述
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TextToStoryboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>参考图分析</CardTitle>
              <CardDescription>
                上传参考图片，AI将分析其构图、光影、色彩等分镜要素
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReferenceAnalyzer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>视频分镜学习</CardTitle>
              <CardDescription>
                上传视频文件或链接，AI将分析视频的分镜技巧和视觉语言
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VideoAnalyzer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>分镜展示库</CardTitle>
              <CardDescription>
                查看和保存您的分镜作品
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoryboardGallery />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}