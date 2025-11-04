'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading'
import { storyApi } from '@/lib/api'
import { Lightbulb, Plus, Copy, RefreshCw, Sparkles } from 'lucide-react'

interface Inspiration {
  title: string
  description: string
  scenarios: string[]
  applications: string[]
  resources: string[]
  techniques: string[]
}

export default function InspirationRecommendations() {
  const [genre, setGenre] = useState('')
  const [theme, setTheme] = useState('')
  const [style, setStyle] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [inspirations, setInspirations] = useState<Inspiration[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const genres = [
    { value: 'scifi', label: '科幻' },
    { value: 'romance', label: '言情' },
    { value: 'mystery', label: '悬疑' },
    { value: 'fantasy', label: '奇幻' },
    { value: 'historical', label: '历史' },
    { value: 'modern', label: '现实' }
  ]

  const styles = [
    { value: 'modern', label: '现代主义' },
    { value: 'classical', label: '古典主义' },
    { value: 'minimalist', label: '极简主义' },
    { value: 'poetic', label: '诗意化' },
    { value: 'stream_of_consciousness', label: '意识流' },
    { value: 'magical_realism', label: '魔幻现实主义' }
  ]

  const addKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()])
      setCurrentKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  const getInspirations = async () => {
    setIsLoading(true)
    try {
      const response = await storyApi.getInspiration({
        genre: genre || undefined,
        theme: theme || undefined,
        style: style || undefined,
        keywords: keywords.length > 0 ? keywords : undefined
      })

      if (response.success) {
        setInspirations(response.inspirations || [])
      } else {
        alert('获取灵感推荐失败：' + response.error)
      }
    } catch (error) {
      console.error('Error getting inspirations:', error)
      alert('获取灵感推荐时发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    alert('已复制到剪贴板')
  }

  const copyFullInspiration = (inspiration: Inspiration) => {
    const fullContent = `
灵感标题：${inspiration.title}

描述：${inspiration.description}

适用场景：
${inspiration.scenarios.map(s => `• ${s}`).join('\n')}

应用建议：
${inspiration.applications.map(a => `• ${a}`).join('\n')}

相关资源：
${inspiration.resources.map(r => `• ${r}`).join('\n')}

创作技巧：
${inspiration.techniques.map(t => `• ${t}`).join('\n')}
    `.trim()

    copyToClipboard(fullContent)
  }

  const clearForm = () => {
    setGenre('')
    setTheme('')
    setStyle('')
    setKeywords([])
    setInspirations([])
  }

  return (
    <div className="space-y-6">
      {/* 配置表单 */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">创作类型（可选）</label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger>
                <SelectValue placeholder="选择创作类型" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">创作主题（可选）</label>
            <Input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="例如：成长、冒险、爱情"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">写作风格（可选）</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue placeholder="选择写作风格" />
              </SelectTrigger>
              <SelectContent>
                {styles.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">关键词</label>
            <div className="flex gap-2">
              <Input
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                placeholder="输入关键词"
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                className="flex-1"
              />
              <Button onClick={addKeyword} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="hover:text-purple-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={getInspirations} disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : <Lightbulb className="h-4 w-4 mr-2" />}
            获取灵感推荐
          </Button>
          <Button variant="outline" onClick={clearForm} disabled={isLoading}>
            清空
          </Button>
        </div>
      </div>

      {/* 灵感推荐结果 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : inspirations.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-semibold">灵感推荐 ({inspirations.length})</h3>
            </div>

            {inspirations.map((inspiration, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-xl text-purple-900 mb-3 flex items-center gap-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-purple-600" />
                      </div>
                      {inspiration.title}
                    </h4>
                    <p className="text-gray-700 text-sm">{inspiration.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* 适用场景 */}
                  <div>
                    <h5 className="font-medium text-purple-800 mb-2">适用场景</h5>
                    <ul className="space-y-1">
                      {inspiration.scenarios.slice(0, 3).map((scenario, idx) => (
                        <li key={idx} className="text-gray-700 flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          {scenario}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 应用建议 */}
                  <div>
                    <h5 className="font-medium text-purple-800 mb-2">应用建议</h5>
                    <ul className="space-y-1">
                      {inspiration.applications.slice(0, 3).map((app, idx) => (
                        <li key={idx} className="text-gray-700 flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          {app}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 资源和技巧 */}
                {(inspiration.resources.length > 0 || inspiration.techniques.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-purple-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inspiration.resources.length > 0 && (
                        <div>
                          <h5 className="font-medium text-purple-800 mb-2">相关资源</h5>
                          <ul className="space-y-1 text-xs text-gray-600">
                            {inspiration.resources.slice(0, 2).map((resource, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-purple-500 mt-0.5">▸</span>
                                {resource}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {inspiration.techniques.length > 0 && (
                        <div>
                          <h5 className="font-medium text-purple-800 mb-2">创作技巧</h5>
                          <ul className="space-y-1 text-xs text-gray-600">
                            {inspiration.techniques.slice(0, 2).map((technique, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-purple-500 mt-0.5">✓</span>
                                {technique}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-purple-300">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyFullInspiration(inspiration)}
                    className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    复制全部
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(inspiration.title + '\n\n' + inspiration.description)}
                    className="bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-300"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    复制摘要
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-12 w-12 text-purple-600" />
            </div>
            <p className="text-xl font-semibold mb-2 text-gray-800">暂无灵感推荐</p>
            <p className="text-sm mb-4 text-gray-600">请设置您的创作偏好以获取个性化灵感推荐</p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <p className="text-sm"><strong>提示：</strong></p>
              <ul className="text-xs space-y-1">
                <li>• 设置创作类型、主题、风格</li>
                <li>• 添加相关关键词</li>
                <li>• 组合不同条件获得更精准的推荐</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 使用建议 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5 shadow-sm">
        <h4 className="font-medium text-purple-900 mb-2">💡 灵感使用建议</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• 将灵感作为创作起点，结合自己的创意进行发展</li>
          <li>• 尝试多个灵感的组合，产生独特的创作方向</li>
          <li>• 关注"创作技巧"部分，提升写作质量</li>
          <li>• 定期获取新的灵感推荐，保持创作活力</li>
        </ul>
      </div>
    </div>
  )
}