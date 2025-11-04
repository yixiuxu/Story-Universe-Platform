'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { storyApi } from '@/lib/api'
import { PenTool, Copy, Download } from 'lucide-react'

export default function ChapterContinuation() {
  const [previousContent, setPreviousContent] = useState('')
  const [continuationDirection, setContinuationDirection] = useState('')
  const [targetLength, setTargetLength] = useState(1000)
  const [continuedContent, setContinuedContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const continueChapter = async () => {
    if (!previousContent.trim()) {
      alert('请输入前文内容')
      return
    }

    setIsLoading(true)
    try {
      const response = await storyApi.continueChapter({
        previous_content: previousContent,
        continuation_direction: continuationDirection.trim() || undefined,
        target_length: targetLength
      })

      if (response.success) {
        setContinuedContent(response.continued_content || '')
      } else {
        alert('章节续写失败：' + response.error)
      }
    } catch (error) {
      console.error('Error continuing chapter:', error)
      alert('章节续写时发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  const downloadContent = () => {
    const fullContent = previousContent + '\n\n' + continuedContent
    const blob = new Blob([fullContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chapter_continuation_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">前文内容</CardTitle>
              <CardDescription>
                请输入需要续写的前文内容，AI将基于此内容进行续写
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={previousContent}
                onChange={(e) => setPreviousContent(e.target.value)}
                placeholder="在此输入前文内容..."
                className="min-h-[300px] resize-y"
              />
              <div className="text-xs text-gray-500 mt-2">
                字数：{previousContent.length} 字符
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">续写设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">续写方向（可选）</label>
                <Input
                  value={continuationDirection}
                  onChange={(e) => setContinuationDirection(e.target.value)}
                  placeholder="例如：主角遇到新朋友、情节发生转折等"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  目标字数：{targetLength} 字
                </label>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="100"
                  value={targetLength}
                  onChange={(e) => setTargetLength(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>200</span>
                  <span>3000</span>
                </div>
              </div>

              <Button
                onClick={continueChapter}
                disabled={isLoading || !previousContent.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    正在续写章节...
                  </>
                ) : (
                  <>
                    <PenTool className="mr-2 h-4 w-4" />
                    开始续写
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 输出区域 */}
        <div>
          {continuedContent ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">续写内容</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(continuedContent)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    复制续写部分
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(previousContent + '\n\n' + continuedContent)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    复制全文
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadContent}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    下载
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <div className="text-sm whitespace-pre-wrap font-serif leading-relaxed">
                    {continuedContent}
                  </div>
                  <div className="text-xs text-gray-500 mt-3">
                    续写字数：{continuedContent.length} 字符
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <PenTool className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>续写内容将在这里显示</p>
                  <p className="text-sm">请先输入前文内容并点击"开始续写"</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 合并预览 */}
      {continuedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">完整章节预览</CardTitle>
            <CardDescription>
              前文内容与续写内容的合并预览
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-6 rounded">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">前文：</h4>
                  <div className="text-sm whitespace-pre-wrap font-serif leading-relaxed text-gray-600">
                    {previousContent}
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-300 pt-4">
                  <h4 className="font-medium text-gray-700 mb-2">续写：</h4>
                  <div className="text-sm whitespace-pre-wrap font-serif leading-relaxed text-green-700">
                    {continuedContent}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                总字数：{(previousContent + continuedContent).length} 字符
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}