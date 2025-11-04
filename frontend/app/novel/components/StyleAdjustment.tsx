'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { storyApi } from '@/lib/api'
import { Palette, Copy, Download, RotateCcw } from 'lucide-react'

export default function StyleAdjustment() {
  const [content, setContent] = useState('')
  const [targetStyle, setTargetStyle] = useState('')
  const [styleDescription, setStyleDescription] = useState('')
  const [adjustedContent, setAdjustedContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const styles = [
    { value: 'modern', label: '现代主义', description: '现代文学风格，注重内心描写和意识流' },
    { value: 'classical', label: '古典主义', description: '传统文学风格，语言典雅，结构严谨' },
    { value: 'minimalist', label: '极简主义', description: '简洁明了，用词精炼，留白较多' },
    { value: 'poetic', label: '诗意化', description: '充满诗意的表达，意象丰富，语言优美' },
    { value: 'journalistic', label: '新闻体', description: '客观写实，语言平实，注重事实' },
    { value: 'stream_of_consciousness', label: '意识流', description: '以内心独白为主，思维跳跃性强' },
    { value: 'magical_realism', label: '魔幻现实主义', description: '现实与幻想结合，超现实元素' }
  ]

  const adjustStyle = async () => {
    if (!content.trim()) {
      alert('请输入原始内容')
      return
    }

    if (!targetStyle) {
      alert('请选择目标风格')
      return
    }

    setIsLoading(true)
    try {
      const response = await storyApi.adjustStyle({
        content: content,
        target_style: targetStyle,
        style_description: styleDescription.trim() || undefined
      })

      if (response.success) {
        setAdjustedContent(response.adjusted_content || '')
      } else {
        alert('风格调整失败：' + response.error)
      }
    } catch (error) {
      console.error('Error adjusting style:', error)
      alert('风格调整时发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  const resetContent = () => {
    setContent('')
    setTargetStyle('')
    setStyleDescription('')
    setAdjustedContent('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  const downloadAdjusted = () => {
    const blob = new Blob([adjustedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const selectedStyle = styles.find(s => s.value === targetStyle)
    a.download = `style_adjusted_${selectedStyle?.label || 'unknown'}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getSelectedStyleDescription = () => {
    const style = styles.find(s => s.value === targetStyle)
    return style?.description || ''
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 原始内容区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">原始内容</CardTitle>
            <CardDescription>
              请输入需要调整风格的文本内容
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在此输入原始文本内容..."
              className="min-h-[200px] resize-y"
            />
            <div className="text-xs text-gray-500">
              字数：{content.length} 字符
            </div>
          </CardContent>
        </Card>

        {/* 风格设置区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">风格设置</CardTitle>
            <CardDescription>
              选择目标风格并设置调整要求
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">目标风格</label>
              <Select value={targetStyle} onValueChange={setTargetStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="选择目标风格" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {targetStyle && getSelectedStyleDescription() && (
                <p className="text-xs text-gray-600 mt-2 bg-blue-50 p-2 rounded">
                  {getSelectedStyleDescription()}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">风格描述（可选）</label>
              <Input
                value={styleDescription}
                onChange={(e) => setStyleDescription(e.target.value)}
                placeholder="例如：更加抒情、增加对话、简化表达等"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={adjustStyle}
                disabled={isLoading || !content.trim() || !targetStyle}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    正在调整风格...
                  </>
                ) : (
                  <>
                    <Palette className="mr-2 h-4 w-4" />
                    调整风格
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={resetContent}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 调整结果区域 */}
      {adjustedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              调整后的内容
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({styles.find(s => s.value === targetStyle)?.label})
              </span>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(adjustedContent)}
              >
                <Copy className="h-4 w-4 mr-2" />
                复制
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadAdjusted}
              >
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-6 rounded">
              <div className="text-sm whitespace-pre-wrap font-serif leading-relaxed">
                {adjustedContent}
              </div>
              <div className="text-xs text-gray-500 mt-4">
                调整后字数：{adjustedContent.length} 字符
                {content.length > 0 && (
                  <span className="ml-4">
                    原字数：{content.length} 字符
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 对比预览 */}
      {adjustedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">对比预览</CardTitle>
            <CardDescription>
              原文与调整后内容的对比
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">原始内容：</h4>
                <div className="bg-gray-50 p-4 rounded h-64 overflow-y-auto">
                  <div className="text-sm whitespace-pre-wrap font-serif leading-relaxed">
                    {content}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  调整后内容：
                </h4>
                <div className="bg-blue-50 p-4 rounded h-64 overflow-y-auto">
                  <div className="text-sm whitespace-pre-wrap font-serif leading-relaxed">
                    {adjustedContent}
                  </div>
                </div>
              </div>
            </div>

            {/* 变化统计 */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium text-gray-700 mb-3">变化统计：</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-100 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-gray-700">{content.length}</div>
                  <div className="text-gray-500">原字数</div>
                </div>
                <div className="bg-blue-100 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-blue-700">{adjustedContent.length}</div>
                  <div className="text-blue-500">调整后字数</div>
                </div>
                <div className="bg-purple-100 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-purple-700">
                    {adjustedContent.length - content.length > 0 ? '+' : ''}
                    {adjustedContent.length - content.length}
                  </div>
                  <div className="text-purple-500">字数变化</div>
                </div>
                <div className="bg-green-100 p-3 rounded text-center">
                  <div className="text-lg font-bold text-green-700 capitalize">
                    {targetStyle}
                  </div>
                  <div className="text-green-500">目标风格</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}