'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading'
import { storyApi } from '@/lib/api'
import { Camera, Film, Download, Copy, Save, Eye } from 'lucide-react'

interface StoryboardShot {
  shot_number: number
  shot_type: string
  angle: string
  movement: string
  description: string
  action: string
  dialogue: string
  duration: string
  transition: string
  lighting: string
  color_tone: string
  composition: string
  mood: string
  note?: string
  raw_content?: string
}

export default function TextToStoryboard() {
  const [formData, setFormData] = useState({
    script: '',
    style: 'cinematic',
    shots: 6,
    sceneDescription: ''
  })

  const [storyboard, setStoryboard] = useState<StoryboardShot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedShot, setSelectedShot] = useState<number | null>(null)

  const styles = [
    { value: 'cinematic', label: '电影感' },
    { value: 'anime', label: '动漫风格' },
    { value: 'documentary', label: '纪录片' },
    { value: 'commercial', label: '广告片' },
    { value: 'music_video', label: '音乐视频' },
    { value: 'experimental', label: '实验性' }
  ]

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateStoryboard = async () => {
    if (!formData.script.trim()) {
      alert('请输入剧本内容')
      return
    }

    setIsLoading(true)
    try {
      const response = await storyApi.generateStoryboard({
        script: formData.script,
        style: formData.style,
        shots: formData.shots,
        scene_description: formData.sceneDescription || undefined
      })

      if (response.success) {
        setStoryboard(response.storyboard || [])
      } else {
        alert('分镜生成失败：' + response.error)
      }
    } catch (error) {
      console.error('Error generating storyboard:', error)
      alert('分镜生成时发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  const downloadStoryboard = () => {
    const storyboardText = storyboard.map(shot => (
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
    )).join('\n\n')

    const blob = new Blob([storyboardText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `storyboard_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const saveToGallery = () => {
    try {
      const savedStoryboards = JSON.parse(localStorage.getItem('savedStoryboards') || '[]')
      const newStoryboard = {
        id: Date.now().toString(),
        title: `分镜_${new Date().toLocaleString()}`,
        script: formData.script,
        style: formData.style,
        shots: formData.shots,
        storyboard: storyboard,
        createdAt: new Date().toISOString()
      }

      const updatedStoryboards = [...savedStoryboards, newStoryboard]
      localStorage.setItem('savedStoryboards', JSON.stringify(updatedStoryboards))
      alert('分镜已保存到展示库！')
    } catch (error) {
      console.error('Error saving storyboard:', error)
      alert('保存失败，请重试')
    }
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

  const getAngleIcon = (angle: string) => {
    switch (angle) {
      case '俯视': return '↓'
      case '仰视': return '↑'
      case '平视': return '→'
      case '斜角': return '↗'
      default: return '•'
    }
  }

  return (
    <div className="space-y-6">
      {/* 输入表单 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">剧本内容</label>
          <Textarea
            value={formData.script}
            onChange={(e) => handleInputChange('script', e.target.value)}
            placeholder="请输入剧本内容，例如：
内景. 咖啡厅 - 白天
小明坐在窗边，看着外面的雨。服务员端来咖啡。
小明：（轻声）谢谢。
服务员：不客气，请慢用。"
            rows={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">分镜风格</label>
          <Select value={formData.style} onValueChange={(value) => handleInputChange('style', value)}>
            <SelectTrigger>
              <SelectValue placeholder="选择分镜风格" />
            </SelectTrigger>
            <SelectContent>
              {styles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            镜头数量: {formData.shots}
          </label>
          <input
            type="range"
            min="3"
            max="15"
            value={formData.shots}
            onChange={(e) => handleInputChange('shots', Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>3</span>
            <span>15</span>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">场景描述（可选）</label>
          <Input
            value={formData.sceneDescription}
            onChange={(e) => handleInputChange('sceneDescription', e.target.value)}
            placeholder="例如：现代都市咖啡厅，温暖色调，安静氛围"
          />
        </div>
      </div>

      <Button
        onClick={generateStoryboard}
        disabled={isLoading || !formData.script.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            正在生成分镜...
          </>
        ) : (
          <>
            <Film className="mr-2 h-4 w-4" />
            生成分镜
          </>
        )}
      </Button>

      {/* 分镜展示 */}
      {storyboard.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">分镜脚本</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={saveToGallery}
              >
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadStoryboard}
              >
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
            </div>
          </div>

          {/* 分镜概览 */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {storyboard.map((shot, index) => (
              <Button
                key={index}
                variant={selectedShot === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedShot(index)}
                className="flex-shrink-0"
              >
                镜头 {shot.shot_number}
              </Button>
            ))}
          </div>

          {/* 分镜详情 */}
          <div className="space-y-4">
            {storyboard.map((shot, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedShot === index
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedShot(index)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">镜头 {shot.shot_number}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getShotTypeColor(shot.shot_type)}`}>
                      {shot.shot_type}
                    </span>
                    <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium">
                      {getAngleIcon(shot.angle)} {shot.angle}
                    </span>
                    <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium">
                      {shot.movement}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{shot.duration}</span>
                    <span>→</span>
                    <span>{shot.transition}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">画面描述：</span>
                      <p className="text-gray-600 mt-1">{shot.description}</p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">动作指示：</span>
                      <p className="text-gray-600 mt-1">{shot.action}</p>
                    </div>

                    {shot.dialogue && (
                      <div>
                        <span className="font-medium text-gray-700">对话：</span>
                        <p className="text-gray-600 mt-1 italic">"{shot.dialogue}"</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">光线：</span>
                      <span className="text-gray-600">{shot.lighting}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">色调：</span>
                      <span className="text-gray-600">{shot.color_tone}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">构图：</span>
                      <span className="text-gray-600">{shot.composition}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">氛围：</span>
                      <span className="text-gray-600">{shot.mood}</span>
                    </div>
                  </div>
                </div>

                {shot.note && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                    <span className="font-medium text-yellow-800">备注：</span>
                    <span className="text-yellow-700">{shot.note}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}