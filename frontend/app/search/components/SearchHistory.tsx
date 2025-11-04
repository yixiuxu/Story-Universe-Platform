'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { Clock, Search, Trash2, ExternalLink, Copy, Calendar } from 'lucide-react'

interface SearchHistoryEntry {
  id: string
  query: string
  type: string
  results: any[]
  createdAt: string
}

export default function SearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([])
  const [filteredHistory, setFilteredHistory] = useState<SearchHistoryEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<SearchHistoryEntry | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadSearchHistory()
    
    // 监听搜索历史更新事件
    const handleHistoryUpdate = () => {
      loadSearchHistory()
    }
    
    window.addEventListener('searchHistoryUpdated', handleHistoryUpdate)
    
    return () => {
      window.removeEventListener('searchHistoryUpdated', handleHistoryUpdate)
    }
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = searchHistory.filter(entry =>
        entry.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredHistory(filtered)
    } else {
      setFilteredHistory(searchHistory)
    }
  }, [searchTerm, searchHistory])

  const loadSearchHistory = () => {
    try {
      const saved = localStorage.getItem('searchHistory')
      if (saved) {
        const history = JSON.parse(saved)
        setSearchHistory(history)
      }
    } catch (error) {
      console.error('Error loading search history:', error)
    }
  }

  const deleteEntry = (id: string) => {
    if (confirm('确定要删除这条搜索历史吗？')) {
      const updatedHistory = searchHistory.filter(entry => entry.id !== id)
      setSearchHistory(updatedHistory)
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))
      if (selectedEntry?.id === id) {
        setSelectedEntry(null)
      }
    }
  }

  const clearAllHistory = () => {
    if (confirm('确定要清空所有搜索历史吗？此操作不可恢复。')) {
      setSearchHistory([])
      setFilteredHistory([])
      setSelectedEntry(null)
      localStorage.removeItem('searchHistory')
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    alert('已复制到剪贴板')
  }

  const repeatSearch = (query: string, type: string) => {
    // 跳转到搜索页面并填入搜索条件
    const searchParams = new URLSearchParams({
      query: query,
      type: type
    })

    // 这里可以通过路由跳转到搜索页面
    // navigate(`/search?${searchParams}`)

    // 或者触发全局搜索侧边栏
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('repeatSearch', {
        detail: { query, type }
      }))
    }

    alert('已准备搜索条件，请在搜索页面执行搜索')
  }

  const exportHistory = () => {
    const historyText = searchHistory.map(entry => (
      `搜索时间: ${new Date(entry.createdAt).toLocaleString()}
搜索类型: ${entry.type}
搜索查询: ${entry.query}
结果数量: ${entry.results?.length || 0}
${entry.results ? '搜索结果预览:\n' + entry.results.slice(0, 3).map((r, idx) => `${idx + 1}. ${r.title || r.description}`).join('\n') : ''}

---`
    )).join('\n')

    const blob = new Blob([historyText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `search_history_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'general': '综合搜索',
      'academic': '学术资料',
      'creative': '创意灵感',
      'technical': '技术文档',
      'materials': '素材搜索',
      'enhanced': '增强搜索'
    }
    return typeMap[type] || type
  }

  const getSearchTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'general': 'bg-blue-100 text-blue-800',
      'academic': 'bg-green-100 text-green-800',
      'creative': 'bg-purple-100 text-purple-800',
      'technical': 'bg-orange-100 text-orange-800',
      'materials': 'bg-yellow-100 text-yellow-800',
      'enhanced': 'bg-indigo-100 text-indigo-800'
    }
    return colorMap[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* 搜索控制 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索历史记录..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportHistory}
            disabled={searchHistory.length === 0}
          >
            导出
          </Button>
          <Button
            variant="outline"
            onClick={clearAllHistory}
            disabled={searchHistory.length === 0}
          >
            清空
          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      {searchHistory.length > 0 && (
        <div className="text-sm text-gray-600">
          共 {searchHistory.length} 条搜索记录
          {searchTerm && ` (${filteredHistory.length} 条匹配)`}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 历史列表 */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredHistory.length > 0 ? (
            <div className="space-y-3">
              {filteredHistory.map((entry) => (
                <Card
                  key={entry.id}
                  className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                    selectedEntry?.id === entry.id ? 'ring-2 ring-indigo-500 border-indigo-300' : 'border-gray-200 hover:border-indigo-200'
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{entry.query}</h4>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getSearchTypeColor(entry.type)}`}>
                            {getTypeLabel(entry.type)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(entry.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteEntry(entry.id)
                        }}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {entry.results && entry.results.length > 0 && (
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          找到 {entry.results.length} 条结果
                        </p>
                        <div className="space-y-2">
                          {entry.results.slice(0, 2).map((result, idx) => (
                            <div key={idx} className="bg-gray-50 rounded p-2">
                              <p className="text-xs text-gray-800 font-medium line-clamp-1">
                                {result.title || result.description}
                              </p>
                            </div>
                          ))}
                          {entry.results.length > 2 && (
                            <p className="text-xs text-indigo-600 font-medium">
                              +{entry.results.length - 2} 更多结果
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          repeatSearch(entry.query, entry.type)
                        }}
                        className="flex-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                      >
                        <Search className="h-3 w-3 mr-1" />
                        重新搜索
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <div className="bg-gradient-to-br from-gray-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-xl font-semibold mb-2 text-gray-700">
                {searchHistory.length === 0 ? '暂无搜索历史' : '没有找到匹配的历史记录'}
              </p>
              <p className="text-sm text-gray-600">
                {searchHistory.length === 0
                  ? '开始搜索后，历史记录会自动保存到这里'
                  : '尝试使用不同的搜索词'
                }
              </p>
            </div>
          )}
        </div>

        {/* 详情面板 */}
        <div className="lg:col-span-1">
          {selectedEntry ? (
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">搜索详情</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEntry(null)}
                    >
                      ✕
                    </Button>
                  </div>
                  <CardDescription>
                    {selectedEntry.query} • {getTypeLabel(selectedEntry.type)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">搜索时间</h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedEntry.createdAt)}
                    </p>
                  </div>

                  {selectedEntry.results && selectedEntry.results.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">搜索结果 ({selectedEntry.results.length})</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedEntry.results.map((result, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                            <div className="font-medium text-gray-800">
                              {result.title || `结果 ${index + 1}`}
                            </div>
                            <p className="text-gray-600 line-clamp-2">
                              {result.description || result.content}
                            </p>
                            {result.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(result.url, '_blank')}
                                className="text-xs mt-1 p-0 h-auto"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => repeatSearch(selectedEntry.query, selectedEntry.type)}
                      className="flex-1"
                    >
                      <Search className="h-3 w-3 mr-1" />
                      重新搜索
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedEntry.query)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">选择一条搜索记录查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}