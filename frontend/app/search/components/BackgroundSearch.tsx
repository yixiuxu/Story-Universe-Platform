'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading'
import { storyApi } from '@/lib/api'
import { Search, BookOpen, Clock, TrendingUp, Copy, ExternalLink } from 'lucide-react'

interface SearchResult {
  title: string
  description: string
  url?: string
  content?: string
  source?: string
  published_at?: string
}

export default function BackgroundSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'general' | 'academic' | 'creative' | 'technical'>('general')
  const [context, setContext] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [relatedTopics, setRelatedTopics] = useState<string[]>([])
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const searchTypes = [
    { value: 'general', label: '综合搜索', description: '全面的背景资料' },
    { value: 'academic', label: '学术资料', description: '专业的学术信息' },
    { value: 'creative', label: '创意灵感', description: '艺术创作相关' },
    { value: 'technical', label: '技术文档', description: '技术规范和指导' }
  ]

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      alert('请输入搜索关键词')
      return
    }

    setIsLoading(true)
    try {
      const response = await storyApi.enhancedSearch({
        query: searchQuery.trim(),
        context: context.trim() || undefined,
        search_type: searchType,
        limit: 15
      })

      if (response.success) {
        const results = response.results || []
        setSearchResults(results)
        setRelatedTopics(response.related_topics || [])
        setSummary(response.summary || '')
        
        // 自动保存到搜索历史
        saveSearchToHistory(searchQuery, searchType, results)
      } else {
        alert('搜索失败：' + response.error)
      }
    } catch (error) {
      console.error('Search error:', error)
      alert('搜索时发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSearchToHistory = (query: string, type: string, results: any[]) => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
      const newEntry = {
        id: Date.now().toString(),
        query: query,
        type: type,
        results: results,
        createdAt: new Date().toISOString()
      }

      const updatedHistory = [newEntry, ...history.slice(0, 49)]
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))
      
      // 触发自定义事件通知历史组件更新
      window.dispatchEvent(new Event('searchHistoryUpdated'))
    } catch (error) {
      console.error('Error saving to history:', error)
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    alert('已复制到剪贴板')
  }

  const openExternalLink = (url: string) => {
    window.open(url, '_blank')
  }

  const searchRelatedTopic = (topic: string) => {
    setSearchQuery(topic)
    performSearch()
  }

  const clearSearch = () => {
    setSearchQuery('')
    setContext('')
    setSearchResults([])
    setRelatedTopics([])
    setSummary('')
  }



  return (
    <div className="space-y-6">
      {/* 搜索表单 */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索背景资料，例如：中世纪欧洲历史、量子物理原理、写作技巧..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && performSearch()}
          />
          <Button onClick={performSearch} disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={clearSearch} disabled={isLoading}>
            清空
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">搜索类型</label>
            <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {searchTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {searchTypes.find(t => t.value === searchType)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">上下文（可选）</label>
            <Input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="提供相关背景信息以获得更精准的搜索结果"
            />
          </div>
        </div>
      </div>

      {/* 搜索结果摘要 */}
      {summary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2 text-lg">搜索摘要</h4>
              <p className="text-sm text-blue-800 leading-relaxed">{summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* 相关话题 */}
      {relatedTopics.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 shadow-sm border border-purple-100">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-900">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            相关话题
          </h4>
          <div className="flex flex-wrap gap-2">
            {relatedTopics.map((topic, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => searchRelatedTopic(topic)}
                className="text-xs bg-white hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-900 transition-all"
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">搜索结果 ({searchResults.length})</h3>
            </div>

            {searchResults.map((result, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-indigo-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-lg flex-1 pr-2 text-gray-900">{result.title}</h4>
                  <div className="flex gap-2">
                    {result.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openExternalLink(result.url)}
                        className="h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.content || result.description)}
                      className="h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 leading-relaxed">{result.description}</p>

                {result.content && (
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 mb-3 border border-gray-100">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result.content}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    {result.source || '网络搜索'}
                  </span>
                  {result.published_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {result.published_at}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-16 text-gray-500">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg font-semibold mb-2 text-gray-700">未找到相关结果</p>
            <p className="text-sm text-gray-500">尝试使用不同的关键词或调整搜索类型</p>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-12 w-12 text-indigo-600" />
            </div>
            <p className="text-xl font-semibold mb-2 text-gray-800">开始搜索背景资料</p>
            <p className="text-sm text-gray-600">输入关键词获取创作所需的专业资料和信息</p>
          </div>
        )}
      </div>
    </div>
  )
}