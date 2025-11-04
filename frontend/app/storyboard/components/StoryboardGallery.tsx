'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import { Camera, Download, Share2, Heart, Trash2, Eye, Film, Image as ImageIcon, Video, Loader2 } from 'lucide-react'

interface SavedStoryboard {
  id: string
  title: string
  script: string
  style: string
  shots: number
  storyboard: any[]
  createdAt: string
  isFavorite: boolean
}

export default function StoryboardGallery() {
  const [savedStoryboards, setSavedStoryboards] = useState<SavedStoryboard[]>([])
  const [filteredStoryboards, setFilteredStoryboards] = useState<SavedStoryboard[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStoryboard, setSelectedStoryboard] = useState<SavedStoryboard | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [generatingImages, setGeneratingImages] = useState<string | null>(null)
  const [generatingVideo, setGeneratingVideo] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<{ [key: string]: string[] }>({})
  const [generatedVideos, setGeneratedVideos] = useState<{ [key: string]: string }>({})

  // 从本地存储加载保存的分镜
  useEffect(() => {
    loadSavedStoryboards()
  }, [])

  useEffect(() => {
    // 根据搜索词过滤分镜
    const filtered = savedStoryboards.filter(storyboard =>
      storyboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storyboard.script.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storyboard.style.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredStoryboards(filtered)
  }, [searchTerm, savedStoryboards])

  const loadSavedStoryboards = () => {
    try {
      const saved = localStorage.getItem('savedStoryboards')
      if (saved) {
        const storyboards = JSON.parse(saved)
        setSavedStoryboards(storyboards)
      }
    } catch (error) {
      console.error('Error loading saved storyboards:', error)
    }
  }

  const deleteStoryboard = (id: string) => {
    if (confirm('确定要删除这个分镜吗？')) {
      const updatedStoryboards = savedStoryboards.filter(sb => sb.id !== id)
      setSavedStoryboards(updatedStoryboards)
      localStorage.setItem('savedStoryboards', JSON.stringify(updatedStoryboards))
      if (selectedStoryboard?.id === id) {
        setSelectedStoryboard(null)
      }
    }
  }

  const toggleFavorite = (id: string) => {
    const updatedStoryboards = savedStoryboards.map(sb =>
      sb.id === id ? { ...sb, isFavorite: !sb.isFavorite } : sb
    )
    setSavedStoryboards(updatedStoryboards)
    localStorage.setItem('savedStoryboards', JSON.stringify(updatedStoryboards))
  }

  const shareStoryboard = (storyboard: SavedStoryboard) => {
    const shareData = {
      title: `分镜脚本：${storyboard.title}`,
      text: `风格：${storyboard.style}\n镜头数：${storyboard.shots}\n\n${storyboard.script.slice(0, 200)}...`,
      url: window.location.href
    }

    if (navigator.share) {
      navigator.share(shareData)
    } else {
      // 复制到剪贴板作为备选方案
      navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}`)
      alert('分镜信息已复制到剪贴板')
    }
  }

  const generateStoryboardImages = async (storyboard: SavedStoryboard) => {
    if (storyboard.storyboard.length < 3) {
      alert('至少需要3个分镜才能生成图片')
      return
    }

    setGeneratingImages(storyboard.id)
    try {
      const response = await fetch('http://localhost:8000/api/storyboard/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shots: storyboard.storyboard.slice(0, 3) })
      })

      if (!response.ok) throw new Error('图片生成失败')

      const data = await response.json()
      const imageUrls = data.images.map((img: any) => img.image_url)
      setGeneratedImages(prev => ({ ...prev, [storyboard.id]: imageUrls }))
      alert('图片生成成功！')
    } catch (error) {
      console.error('Error generating images:', error)
      alert('图片生成失败，请重试')
    } finally {
      setGeneratingImages(null)
    }
  }

  const generateStoryboardVideo = async (storyboard: SavedStoryboard) => {
    const images = generatedImages[storyboard.id]
    if (!images || images.length < 2) {
      alert('请先生成分镜图片')
      return
    }

    if (!confirm('视频生成需要1元/次且需要较长时间（2-5分钟），确定继续？')) {
      return
    }

    setGeneratingVideo(storyboard.id)
    try {
      const response = await fetch('http://localhost:8000/api/storyboard/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: images,
          prompt: `${storyboard.style}风格的分镜视频，展现${storyboard.title}的故事内容`
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || '视频生成失败')
      }

      const data = await response.json()
      setGeneratedVideos(prev => ({ ...prev, [storyboard.id]: data.video_url }))
      alert('视频生成成功！')
    } catch (error: any) {
      console.error('Error generating video:', error)
      alert(error.message || '视频生成失败。可能原因：1) 配额不足 2) 并发超限 3) 网络问题')
    } finally {
      setGeneratingVideo(null)
    }
  }

  const downloadStoryboardData = (storyboard: SavedStoryboard) => {
    const storyboardText = `${storyboard.title}
创建时间: ${new Date(storyboard.createdAt).toLocaleString()}
风格: ${storyboard.style}
镜头数: ${storyboard.shots}

原始剧本:
${storyboard.script}

分镜脚本:
${storyboard.storyboard.map((shot: any) => (
      `镜头 ${shot.shot_number}
景别: ${shot.shot_type}
角度: ${shot.angle}
运动: ${shot.movement}
时长: ${shot.duration}
转场: ${shot.transition}

画面描述:
${shot.description}

动作指示:
${shot.action}

对话:
${shot.dialogue}

光线: ${shot.lighting}
色调: ${shot.color_tone}
构图: ${shot.composition}
氛围: ${shot.mood}
${shot.note ? `备注: ${shot.note}` : ''}
---`
    )).join('\n\n')}`

    const blob = new Blob([storyboardText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${storyboard.title.replace(/[^\w\s]/gi, '')}_storyboard.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getShotTypeColor = (shotType: string) => {
    const colors: { [key: string]: string } = {
      '全景': 'bg-blue-100 text-blue-800',
      '中景': 'bg-green-100 text-green-800',
      '近景': 'bg-yellow-100 text-yellow-800',
      '特写': 'bg-red-100 text-red-800',
      '大远景': 'bg-purple-100 text-purple-800'
    }
    return colors[shotType] || 'bg-gray-100 text-gray-800'
  }

  const renderStoryboardCard = (storyboard: SavedStoryboard) => {
    return (
      <Card
        key={storyboard.id}
        className={`h-full cursor-pointer transition-all hover:shadow-md ${
          selectedStoryboard?.id === storyboard.id ? 'ring-2 ring-indigo-500' : ''
        }`}
        onClick={() => setSelectedStoryboard(storyboard)}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Film className="h-5 w-5" />
                {storyboard.title}
                {storyboard.isFavorite && <Heart className="h-4 w-4 text-red-500 fill-current" />}
              </CardTitle>
              <CardDescription className="text-sm">
                {storyboard.style} • {storyboard.shots} 个镜头
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(storyboard.id)
                }}
                className="h-8 w-8 p-0"
              >
                <Heart className={`h-4 w-4 ${storyboard.isFavorite ? 'text-red-500 fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteStoryboard(storyboard.id)
                }}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 剧本预览 */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">剧本预览</h5>
            <p className="text-sm text-gray-600 line-clamp-3">
              {storyboard.script}
            </p>
          </div>

          {/* 镜头概览 */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">镜头概览</h5>
            <div className="flex flex-wrap gap-1">
              {storyboard.storyboard.slice(0, 6).map((shot: any, index: number) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded text-xs font-medium ${getShotTypeColor(shot.shot_type)}`}
                >
                  {shot.shot_number}
                </span>
              ))}
              {storyboard.storyboard.length > 6 && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  +{storyboard.storyboard.length - 6}
                </span>
              )}
            </div>
          </div>

          {/* 生成的图片预览 */}
          {generatedImages[storyboard.id] && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">生成的图片</h5>
              <div className="grid grid-cols-3 gap-1">
                {generatedImages[storyboard.id].map((url, idx) => (
                  <img key={idx} src={url} alt={`镜头${idx + 1}`} className="w-full h-16 object-cover rounded" />
                ))}
              </div>
            </div>
          )}

          {/* 生成的视频预览 */}
          {generatedVideos[storyboard.id] && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">生成的视频</h5>
              <video src={generatedVideos[storyboard.id]} controls className="w-full rounded" />
            </div>
          )}

          {/* 操作按钮 */}
          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  generateStoryboardImages(storyboard)
                }}
                disabled={generatingImages === storyboard.id}
                className="flex-1"
              >
                {generatingImages === storyboard.id ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <ImageIcon className="h-3 w-3 mr-1" />
                )}
                生成图片
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  generateStoryboardVideo(storyboard)
                }}
                disabled={generatingVideo === storyboard.id || !generatedImages[storyboard.id]}
                className="flex-1"
              >
                {generatingVideo === storyboard.id ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Video className="h-3 w-3 mr-1" />
                )}
                生成视频
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  downloadStoryboardData(storyboard)
                }}
                className="flex-1"
              >
                <Download className="h-3 w-3 mr-1" />
                下载
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  shareStoryboard(storyboard)
                }}
                className="flex-1"
              >
                <Share2 className="h-3 w-3 mr-1" />
                分享
              </Button>
            </div>
          </div>

          {/* 创建时间 */}
          <div className="text-xs text-gray-500 text-center">
            创建于 {formatDate(storyboard.createdAt)}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 分镜列表 */}
        <div className="lg:col-span-2">
          {/* 搜索栏 */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索分镜标题、内容或风格..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 分镜统计 */}
          {savedStoryboards.length > 0 && (
            <div className="flex gap-4 text-sm text-gray-600 mb-4">
              <span>总计：{savedStoryboards.length} 个分镜</span>
              <span>收藏：{savedStoryboards.filter(s => s.isFavorite).length} 个</span>
            </div>
          )}

          {/* 分镜列表 */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredStoryboards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStoryboards.map(renderStoryboardCard)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {savedStoryboards.length === 0 ? (
                <>
                  <p className="text-lg font-medium mb-2">还没有保存的分镜</p>
                  <p className="text-sm">创建分镜后会自动显示在这里</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">没有找到匹配的分镜</p>
                  <p className="text-sm">尝试使用不同的搜索词</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* 分镜详情 */}
        <div className="lg:col-span-1">
          {selectedStoryboard ? (
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">分镜详情</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStoryboard(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {/* 基本信息 */}
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium mb-2">{selectedStoryboard.title}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>风格：{selectedStoryboard.style}</div>
                    <div>镜头数：{selectedStoryboard.shots}</div>
                    <div>创建时间：{formatDate(selectedStoryboard.createdAt)}</div>
                  </div>
                </div>

                {/* 原始剧本 */}
                <div>
                  <h4 className="font-medium mb-2">原始剧本</h4>
                  <div className="bg-white border rounded p-3 max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-700">{selectedStoryboard.script}</p>
                  </div>
                </div>

                {/* 镜头列表 */}
                <div>
                  <h4 className="font-medium mb-2">镜头列表</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedStoryboard.storyboard.map((shot: any, index: number) => (
                      <div key={index} className="bg-white border rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">镜头 {shot.shot_number}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getShotTypeColor(shot.shot_type)}`}>
                            {shot.shot_type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{shot.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">选择一个分镜查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}