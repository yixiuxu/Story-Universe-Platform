'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading'
import { storyApi } from '@/lib/api'
import { TrendingUp, Flame, Clock, Copy, ExternalLink, RefreshCw } from 'lucide-react'

interface HotTopic {
  title: string
  heat: string
  description: string
  keywords: string[]
  trend: string
  creative_value: string
}

export default function HotTopics() {
  const [category, setCategory] = useState('social')
  const [topics, setTopics] = useState<HotTopic[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const categories = [
    { value: 'social', label: '社会热点', description: '当前热门的社会事件和话题' },
    { value: 'technology', label: '科技前沿', description: '最新的科技趋势和创新' },
    { value: 'culture', label: '文化娱乐', description: '流行文化和娱乐资讯' },
    { value: 'business', label: '商业经济', description: '商业动态和经济趋势' },
    { value: 'global', label: '国际热点', description: '全球重要新闻和事件' }
  ]

  const trendIcons = {
    '上升': '📈',
    '下降': '📉',
    '稳定': '➡️',
    '热门': '🔥',
    '新兴': '✨'
  }

  const heatColors = {
    '高': 'text-red-600 bg-red-50',
    '中': 'text-yellow-600 bg-yellow-50',
    '低': 'text-green-600 bg-green-50'
  }

  const fetchHotTopics = async () => {
    setIsLoading(true)
    try {
      const response = await storyApi.getHotTopics({
        category: category !== 'all' ? category : undefined,
        limit: 20
      })

      if (response.success) {
        setTopics(response.topics || [])
        setLastUpdated(new Date().toLocaleString())
      } else {
        alert('获取热点话题失败：' + response.error)
      }
    } catch (error) {
      console.error('Error fetching hot topics:', error)
      alert('获取热点话题时发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    alert('已复制到剪贴板')
  }

  const refreshTopics = () => {
    fetchHotTopics()
  }

  const getTopicByHeat = (heat: string) => {
    const heatOrder = ['高', '中', '低']
    return heatOrder.indexOf(heat)
  }

  // 初始加载
  useState(() => {
    fetchHotTopics()
  })

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-xs">
          <Select value={category} onValueChange={(value) => setCategory(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            {categories.find(c => c.value === category)?.description}
          </p>
        </div>

        <Button onClick={refreshTopics} disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          刷新
        </Button>
      </div>

      {/* 更新时间 */}
      {lastUpdated && (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          最后更新: {lastUpdated}
        </div>
      )}

      {/* 热点话题列表 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : topics.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-lg font-semibold">当前热点话题 ({topics.length})</h3>
            </div>

            {/* 按热度排序 */}
            {topics
              .sort((a, b) => getTopicByHeat(a.heat) - getTopicByHeat(b.heat))
              .map((topic, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-200 hover:border-orange-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-lg text-gray-900">{topic.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${heatColors[topic.heat as keyof typeof heatColors] || heatColors['中']}`}>
                          <Flame className="inline w-3 h-3 mr-1" />
                          {topic.heat}热度
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          {trendIcons[topic.trend as keyof typeof trendIcons] || '•'} {topic.trend}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{topic.description}</p>

                    {/* 关键词 */}
                    {topic.keywords && topic.keywords.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {topic.keywords.slice(0, 5).map((keyword, kidx) => (
                            <span
                              key={kidx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {keyword}
                            </span>
                          ))}
                          {topic.keywords.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                              +{topic.keywords.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 创作价值 */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-green-900 mb-1">创作价值</h5>
                          <p className="text-xs text-green-700">{topic.creative_value}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${topic.title}\n\n${topic.description}\n\n关键词：${topic.keywords.join(', ')}`)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      复制
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-12 w-12 text-orange-600" />
            </div>
            <p className="text-xl font-semibold mb-2 text-gray-700">暂无热点话题</p>
            <p className="text-sm text-gray-600">请稍后再试或选择其他分类</p>
          </div>
        )}
      </div>

      {/* 使用建议 */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5 shadow-sm">
        <h4 className="font-medium text-blue-900 mb-2">💡 使用建议</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 关注高热度话题，为创作提供时代背景</li>
          <li>• 利用关键词深入搜索相关资料</li>
          <li>• 结合话题的创意价值，寻找创作切入点</li>
          <li>• 定期查看最新热点，保持内容的时效性</li>
        </ul>
      </div>
    </div>
  )
}