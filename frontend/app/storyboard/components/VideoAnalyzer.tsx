'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload } from '@/components/ui/file-upload'
import { LoadingSpinner } from '@/components/ui/loading'
import { storyApi } from '@/lib/api'
import { Upload, Video, Play, Download, Copy, Eye, Link } from 'lucide-react'

export default function VideoAnalyzer() {
  const [uploadedVideo, setUploadedVideo] = useState<{ file_url: string; filename: string } | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [analysisFocus, setAnalysisFocus] = useState('storyboard')
  const [description, setDescription] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const analysisFocuses = [
    { value: 'storyboard', label: '分镜技巧', description: '分析镜头运用、景别转换、构图设计' },
    { value: 'cinematography', label: '摄影技巧', description: '分析运镜方式、光影运用、色彩设计' },
    { value: 'editing', label: '剪辑技巧', description: '分析剪辑节奏、转场方式、叙事结构' }
  ]

  const handleVideoUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    console.log(`[INFO] Starting upload: ${file.name}, ${(file.size / 1024 / 1024).toFixed(2)}MB`)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60秒超时
      
      const response = await fetch('http://localhost:8000/api/storyboard/upload-video', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      console.log('[INFO] Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[ERROR] Response error:', errorText)
        throw new Error(`上传失败: ${response.status}`)
      }

      const result = await response.json()
      console.log('[INFO] Upload result:', result)
      
      if (!result.success) {
        throw new Error(result.error || '上传失败')
      }
      
      return result
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('上传超时，请检查后端是否运行')
      }
      throw error
    }
  }

  const handleFileUploaded = (result: { file_url: string; filename: string }) => {
    console.log('[VideoAnalyzer] File uploaded callback:', result)
    setUploadedVideo(result)
    setVideoUrl(result.file_url)
    setAnalysis(null)
  }

  const handleVideoUrlSubmit = () => {
    if (videoUrl.trim()) {
      setUploadedVideo({
        file_url: videoUrl.trim(),
        filename: '外部视频'
      })
      setAnalysis(null)
    }
  }

  const analyzeVideo = async () => {
    const currentVideoUrl = uploadedVideo?.file_url || videoUrl.trim()

    if (!currentVideoUrl) {
      alert('请先上传或输入视频URL')
      return
    }

    setIsLoading(true)
    try {
      const response = await storyApi.analyzeVideo({
        video_url: currentVideoUrl,
        analysis_focus: analysisFocus,
        description: description.trim() || undefined
      })

      if (response.success) {
        setAnalysis(response.analysis)
      } else {
        alert('视频分析失败：' + response.error)
      }
    } catch (error) {
      console.error('Error analyzing video:', error)
      alert('视频分析时发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  const downloadAnalysis = () => {
    if (!analysis) return

    const analysisText = `视频分析报告
分析重点: ${analysisFocuses.find(f => f.value === analysisFocus)?.label}
视频来源: ${uploadedVideo?.filename || videoUrl}
${description ? `特别关注: ${description}` : ''}

分析结果:
${analysis.content || JSON.stringify(analysis, null, 2)}
`

    const blob = new Blob([analysisText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `video_analysis_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetAnalysis = () => {
    setUploadedVideo(null)
    setVideoUrl('')
    setAnalysis(null)
    setDescription('')
  }

  const isVideoUrl = (url: string) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    const videoHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'bilibili.com']

    // 检查文件扩展名
    if (videoExtensions.some(ext => url.toLowerCase().includes(ext))) {
      return true
    }

    // 检查视频平台域名
    if (videoHosts.some(host => url.toLowerCase().includes(host))) {
      return true
    }

    return false
  }

  const renderVideoPlayer = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0]
      if (videoId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full rounded"
            allowFullScreen
          />
        )
      }
    } else if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      if (videoId) {
        return (
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            className="w-full h-full rounded"
            allowFullScreen
          />
        )
      }
    } else if (url.includes('bilibili.com')) {
      const bvidMatch = url.match(/BV[A-Za-z0-9]+/)
      if (bvidMatch) {
        return (
          <iframe
            src={`https://player.bilibili.com/player.html?bvid=${bvidMatch[0]}`}
            className="w-full h-full rounded"
            allowFullScreen
          />
        )
      }
    }

    return (
      <video
        key={url}
        controls
        preload="metadata"
        playsInline
        muted
        style={{ 
          width: '100%', 
          height: '100%', 
          maxHeight: '500px',
          objectFit: 'contain',
          backgroundColor: '#000'
        }}
        className="rounded"
        onError={(e) => {
          console.error('[Video] Error:', e)
          console.error('[Video] Error target:', e.currentTarget.error)
        }}
        onLoadStart={() => console.log('[Video] Load start')}
        onLoadedMetadata={(e) => {
          const video = e.currentTarget
          console.log('[Video] Metadata loaded:', {
            duration: video.duration,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState
          })
        }}
        onCanPlay={() => console.log('[Video] Can play')}
      >
        <source src={url} type="video/mp4" />
        您的浏览器不支持视频播放
      </video>
    )
  }

  return (
    <div className="space-y-6">
      {/* 视频上传/输入 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Video className="h-5 w-5" />
          <h3 className="text-lg font-semibold">选择参考视频</h3>
        </div>

        {/* 方式选择：上传或URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 文件上传 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">上传视频文件</label>
            <FileUpload
              accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,.mp4,.mov,.avi,.mkv,.webm"
              maxSize={50}
              onUpload={handleVideoUpload}
              onFileUploaded={handleFileUploaded}
              type="video"
            />
            <p className="text-xs text-gray-500">
              支持格式：MP4, MOV, AVI, MKV（最大50MB）
            </p>
          </div>

          {/* URL输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">或输入视频URL</label>
            <div className="flex gap-2">
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1"
              />
              <Button onClick={handleVideoUrlSubmit} disabled={!videoUrl.trim()}>
                <Link className="h-4 w-4 mr-2" />
                使用
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              支持YouTube、Vimeo、Bilibili等平台
            </p>
          </div>
        </div>

        {/* 视频预览 */}
        {uploadedVideo && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">视频预览</h4>
              <Button variant="ghost" size="sm" onClick={resetAnalysis}>
                更换视频
              </Button>
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-2xl">
              {renderVideoPlayer(uploadedVideo.file_url)}
            </div>
            <p className="text-xs text-gray-500">{uploadedVideo.filename}</p>
          </div>
        )}
      </div>

      {/* 分析设置 */}
      {uploadedVideo && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5" />
            <h3 className="text-lg font-semibold">分析设置</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">分析重点</label>
              <Select value={analysisFocus} onValueChange={setAnalysisFocus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分析重点" />
                </SelectTrigger>
                <SelectContent>
                  {analysisFocuses.map((focus) => (
                    <SelectItem key={focus.value} value={focus.value}>
                      {focus.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {analysisFocuses.find(f => f.value === analysisFocus)?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">额外描述（可选）</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例如：请特别关注开场镜头的运用..."
                rows={3}
              />
            </div>
          </div>

          <Button
            onClick={analyzeVideo}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                正在分析视频...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                开始分析
              </>
            )}
          </Button>
        </div>
      )}

      {/* 分析结果 */}
      {analysis && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">分析结果</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(analysis.content || JSON.stringify(analysis, null, 2))}
              >
                <Copy className="h-4 w-4 mr-2" />
                复制
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadAnalysis}
              >
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            {analysis.content ? (
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {analysis.content}
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded text-sm not-prose">
                  <p className="text-blue-800">
                    🎬 <strong>分镜学习建议：</strong>通过分析这个视频，您可以将学到的技巧应用到自己的分镜创作中，提升视觉叙事能力。
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">暂无分析结果</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}