'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { storyApi } from '@/lib/api'
import { Film } from 'lucide-react'

export default function ScriptPage() {
  const [content, setContent] = useState('')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleConvert = async () => {
    if (!content.trim()) {
      alert('请输入内容')
      return
    }

    setIsLoading(true)
    try {
      const response = await storyApi.convertToScript({
        content: content.trim(),
        format: 'standard'
      })
      setResult(response.script || '转换完成')
    } catch (error: any) {
      alert('转换失败: ' + (error.response?.data?.detail || error.message))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Film className="h-8 w-8" />
        剧本转换
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>输入内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入小说内容..."
              className="min-h-[400px]"
            />
            <Button onClick={handleConvert} disabled={isLoading} className="w-full">
              {isLoading ? <LoadingSpinner size="sm" /> : '转换'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>转换结果</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={result}
              readOnly
              placeholder="结果..."
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
