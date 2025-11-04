'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { LoadingSpinner } from '@/components/ui/loading'
import { storyApi } from '@/lib/api'
import { Search, Plus, BookOpen, TrendingUp, Lightbulb, ExternalLink, Copy, X } from 'lucide-react'

interface SearchResult {
  title: string
  description: string
  url?: string
  content?: string
  source?: string
  type?: string
}

interface SearchSidebarProps {
  onInsertContent?: (content: string) => void
  trigger?: React.ReactNode
}

export function GlobalSearchSidebar({ onInsertContent, trigger }: SearchSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'general' | 'academic' | 'creative' | 'technical'>('general')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // 加载最近搜索
  useEffect(() => {
    loadRecentSearches()
  }, [])

  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('recentSearches')
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading recent searches:', error)
    }
  }

  const saveRecentSearch = (query: string) => {
    try {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10)
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving recent search:', error)
    }
  }

  const performSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/search/enhanced-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery.trim(),
          search_type: searchType,
          limit: 10
        })
      })

      const result = await response.json()
      if (result.success) {
        setSearchResults(result.results || [])
        saveRecentSearch(searchQuery.trim())
      } else {
        alert('搜索失败：' + result.error)
      }
    } catch (error) {
      console.error('Search error:', error)
      alert('搜索时发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickSearch = async (query: string, type: 'hot' | 'inspiration') => {
    setIsLoading(true)
    try {
      const endpoint = type === 'hot' ? '/api/search/hot-topics' : '/api/search/inspiration'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [type === 'hot' ? 'category' : 'keywords']: [query]
        })
      })

      const result = await response.json()
      if (result.success) {
        const data = type === 'hot' ? result.topics : result.inspirations
        const formattedResults: SearchResult[] = data.map((item: any) => ({
          title: item.title || item.description?.split('.')[0] || '搜索结果',
          description: item.description || item.content || '暂无描述',
          content: item.content || item.description || '',
          type: type
        }))
        setSearchResults(formattedResults)
      }
    } catch (error) {
      console.error('Quick search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const insertContent = (content: string) => {
    if (onInsertContent) {
      onInsertContent(content)
      setIsOpen(false)
    } else {
      // 默认复制到剪贴板
      navigator.clipboard.writeText(content)
      alert('内容已复制到剪贴板')
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    alert('已复制到剪贴板')
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  const searchTypes = [
    { value: 'general', label: '综合搜索' },
    { value: 'academic', label: '学术资料' },
    { value: 'creative', label: '创意灵感' },
    { value: 'technical', label: '技术文档' }
  ]

  const quickSearchCategories = [
    { label: '历史背景', keywords: ['古代史', '近代史', '世界历史'], icon: BookOpen },
    { label: '科技趋势', keywords: ['人工智能', '区块链', '量子计算'], icon: TrendingUp },
    { label: '创作灵感', keywords: ['写作技巧', '故事灵感', '人物设定'], icon: Lightbulb }
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50 shadow-lg px-2 sm:px-3 md:px-4">
            <Search className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">素材搜索</span>
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-[85vw] sm:w-[400px] md:w-[500px] lg:w-[540px] max-w-[90vw]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            素材搜索库
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* 搜索表单 */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索背景资料、热点话题..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && performSearch()}
              />
              <Button onClick={performSearch} disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex gap-2">
              <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <SelectTrigger className="flex-1">
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
              <Button variant="outline" size="sm" onClick={clearSearch} disabled={!searchQuery}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 快速搜索 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">快速搜索</h4>
            <div className="space-y-3">
              {quickSearchCategories.map((category) => (
                <div key={category.label}>
                  <div className="flex items-center gap-2 mb-2">
                    <category.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {category.keywords.map((keyword) => (
                      <Button
                        key={keyword}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSearch(keyword, category.label === '创作灵感' ? 'inspiration' : 'hot')}
                        className="text-xs"
                      >
                        {keyword}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 最近搜索 */}
          {recentSearches.length > 0 && !searchQuery && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">最近搜索</h4>
              <div className="flex flex-wrap gap-1">
                {recentSearches.map((query) => (
                  <Button
                    key={query}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(query)
                      performSearch()
                    }}
                    className="text-xs"
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 搜索结果 */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">搜索结果</h4>
                  <span className="text-xs text-gray-500">{searchResults.length} 条结果</span>
                </div>
                {searchResults.map((result, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h5 className="font-medium text-sm flex-1 pr-2">{result.title}</h5>
                      {result.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(result.url, '_blank')}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{result.description}</p>

                    {result.content && (
                      <div className="bg-white rounded p-2 max-h-20 overflow-y-auto">
                        <p className="text-xs text-gray-700">{result.content}</p>
                      </div>
                    )}

                    <div className="flex gap-1 pt-2 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertContent(result.content || result.description)}
                        className="text-xs flex-1"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        插入
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.content || result.description)}
                        className="text-xs"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            ) : searchQuery ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">未找到相关结果</p>
                <p className="text-xs mt-1">尝试使用不同的关键词</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">输入关键词开始搜索</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default GlobalSearchSidebar