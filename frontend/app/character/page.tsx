'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CharacterGenerator from './components/CharacterGenerator'
import CharacterGallery from './components/CharacterGallery'

export default function CharacterPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">角色生成器</h1>
        <p className="text-gray-600">
          使用AI大模型生成完整的角色设定，包括人物信息和立绘图像
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 角色生成器 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>角色创建</CardTitle>
              <CardDescription>
                填写角色基本信息，AI将为您生成详细的角色设定和立绘
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CharacterGenerator />
            </CardContent>
          </Card>
        </div>

        {/* 角色展示区域 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>角色展示</CardTitle>
              <CardDescription>
                生成的角色信息和立绘将在这里展示
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CharacterGallery />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}