'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { storyApi } from '@/lib/api'
import { Search, Plus, X } from 'lucide-react'

interface OutlineData {
  story_summary?: string
  characters?: Array<{
    name: string
    background: string
    personality: string
    goal: string
  }>
  world_setting?: string
  story_structure?: string
  chapter_outline?: Array<{
    chapter: string
    summary: string
  }>
  main_conflicts?: string[]
  theme_and_symbols?: string
  raw_content?: string  // 添加原始内容字段
}

export default function OutlineGenerator() {
  const [genre, setGenre] = useState('')
  const [style, setStyle] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [targetLength, setTargetLength] = useState('medium')
  const [outlineData, setOutlineData] = useState<OutlineData | null>(null)
  const [backgroundMaterials, setBackgroundMaterials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const genres = [
    { value: '科幻', label: '科幻' },
    { value: '言情', label: '言情' },
    { value: '悬疑', label: '悬疑' },
    { value: '奇幻', label: '奇幻' },
    { value: '历史', label: '历史' },
    { value: '现实', label: '现实' },
    { value: '惊悚', label: '惊悚' },
    { value: '文学', label: '文学' }
  ]

  const styles = [
    { value: 'modern', label: '现代主义' },
    { value: 'classical', label: '古典主义' },
    { value: 'minimalist', label: '极简主义' },
    { value: 'poetic', label: '诗意化' },
    { value: 'journalistic', label: '新闻体' },
    { value: 'stream_of_consciousness', label: '意识流' },
    { value: 'magical_realism', label: '魔幻现实主义' }
  ]

  const lengths = [
    { value: 'short', label: '短篇' },
    { value: 'medium', label: '中篇' },
    { value: 'long', label: '长篇' }
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

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  const generateOutline = async () => {
    if (!genre || !style || keywords.length === 0) {
      alert('请填写完整信息并至少添加一个关键词')
      return
    }

    setIsLoading(true)
    try {
      console.log('发送请求:', { genre, style, keywords, target_length: targetLength })
      
      const response: any = await storyApi.generateOutline({
        genre,
        style,
        keywords,
        target_length: targetLength
      })

      if (response && response.success) {
        setOutlineData(response.outline || { raw_content: JSON.stringify(response, null, 2) })
        setBackgroundMaterials(response.background_materials || [])
      } else {
        console.error('生成失败:', response)
        alert('生成大纲失败：' + (response?.error || '未知错误'))
      }
    } catch (error: any) {
      console.error('Error generating outline:', error)
      const errorMsg = error.response?.data?.detail || error.message || '生成大纲时发生错误'
      alert('生成大纲失败：' + errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const renderOutlineData = (data: any) => {
    if (data.raw_content) {
      return (
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap text-sm">{data.raw_content}</pre>
        </div>
      )
    }

    // 支持中文键名
    const summary = data.story_summary || data['故事梗概']
    const characters = data.characters || data['主要人物设定']
    const worldSetting = data.world_setting || data['世界观设定']
    const structure = data.story_structure || data['故事结构']
    const chapters = data.chapter_outline || data['章节大纲']
    const conflicts = data.main_conflicts || data['主要冲突和转折点']
    const theme = data.theme_and_symbols || data['主题思想和象征元素']

    return (
      <div className="space-y-6">
        {summary && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
            <h4 className="text-xl font-bold text-indigo-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">📖</span>故事梗概
            </h4>
            <p className="text-base text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {characters && typeof characters === 'object' && (
          <div>
            <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">👥</span>主要人物设定
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(characters).map(([name, info]: [string, any], index) => (
                <div key={index} className="bg-blue-50 p-5 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                  <h5 className="text-lg font-bold text-blue-900 mb-3">{name}</h5>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700"><span className="font-semibold text-blue-800">背景：</span>{info['背景'] || info.background}</p>
                    <p className="text-gray-700"><span className="font-semibold text-blue-800">性格：</span>{info['性格'] || info.personality}</p>
                    <p className="text-gray-700"><span className="font-semibold text-blue-800">目标：</span>{info['目标'] || info.goal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {worldSetting && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
            <h4 className="text-xl font-bold text-purple-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">🌍</span>世界观设定
            </h4>
            <p className="text-base text-gray-700 leading-relaxed">{worldSetting}</p>
          </div>
        )}

        {structure && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100">
            <h4 className="text-xl font-bold text-green-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">🏛️</span>故事结构
            </h4>
            <p className="text-base text-gray-700 leading-relaxed">{structure}</p>
          </div>
        )}

        {chapters && Array.isArray(chapters) && chapters.length > 0 && (
          <div>
            <h4 className="text-xl font-bold text-yellow-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">📝</span>章节大纲
            </h4>
            <div className="space-y-3">
              {chapters.map((chapter: any, index: number) => (
                <div key={index} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
                  <h5 className="font-bold text-yellow-900 mb-2">{chapter['章节标题'] || chapter.chapter}</h5>
                  <p className="text-sm text-gray-700 leading-relaxed">{chapter['内容'] || chapter.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {conflicts && typeof conflicts === 'object' && (
          <div>
            <h4 className="text-xl font-bold text-red-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">⚡</span>主要冲突和转折点
            </h4>
            <div className="space-y-4">
              {conflicts['主要冲突'] && Array.isArray(conflicts['主要冲突']) && (
                <div>
                  <h5 className="font-semibold text-red-800 mb-2">主要冲突</h5>
                  <ul className="space-y-2">
                    {conflicts['主要冲突'].map((conflict: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                        {conflict}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {conflicts['转折点'] && Array.isArray(conflicts['转折点']) && (
                <div>
                  <h5 className="font-semibold text-red-800 mb-2">转折点</h5>
                  <ul className="space-y-2">
                    {conflicts['转折点'].map((turn: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400">
                        {turn}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {theme && typeof theme === 'object' && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-100">
            <h4 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎨</span>主题思想和象征元素
            </h4>
            <div className="space-y-4">
              {theme['主题思想'] && (
                <div>
                  <h5 className="font-semibold text-indigo-800 mb-2">主题思想</h5>
                  <p className="text-base text-gray-700 leading-relaxed">{theme['主题思想']}</p>
                </div>
              )}
              {theme['象征元素'] && typeof theme['象征元素'] === 'object' && (
                <div>
                  <h5 className="font-semibold text-indigo-800 mb-2">象征元素</h5>
                  <div className="space-y-2">
                    {Object.entries(theme['象征元素']).map(([key, value]: [string, any], index) => (
                      <div key={index} className="bg-white p-3 rounded border border-indigo-200">
                        <span className="font-semibold text-indigo-900">{key}：</span>
                        <span className="text-gray-700 ml-2">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">题材</label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger>
              <SelectValue placeholder="选择故事题材" />
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
          <label className="block text-sm font-medium mb-2">风格</label>
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
          <label className="block text-sm font-medium mb-2">目标长度</label>
          <Select value={targetLength} onValueChange={setTargetLength}>
            <SelectTrigger>
              <SelectValue placeholder="选择目标长度" />
            </SelectTrigger>
            <SelectContent>
              {lengths.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
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
              onKeyPress={handleKeywordKeyPress}
              placeholder="输入关键词后回车添加"
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
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={generateOutline}
        disabled={isLoading || !genre || !style || keywords.length === 0}
        className="w-full"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            正在生成大纲...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            生成故事大纲
          </>
        )}
      </Button>

      {backgroundMaterials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">背景资料</CardTitle>
            <CardDescription>
              基于关键词搜索的相关资料，为创作提供参考
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {backgroundMaterials.map((material, index) => (
                <div key={index} className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-medium text-sm">{material.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{material.description}</p>
                  {material.url && (
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                    >
                      查看原文
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {outlineData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">生成的大纲</CardTitle>
            <CardDescription>
              AI为您生成的故事大纲，可以作为创作参考
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderOutlineData(outlineData)}
          </CardContent>
        </Card>
      )}
    </div>
  )
}