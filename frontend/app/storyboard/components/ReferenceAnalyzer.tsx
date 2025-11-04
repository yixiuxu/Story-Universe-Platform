'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload } from '@/components/ui/file-upload'
import { ImageDisplay } from '@/components/ui/image'
import { LoadingSpinner } from '@/components/ui/loading'
import { storyApi } from '@/lib/api'
import { Upload, Image as ImageIcon, Camera, Download, Copy, Eye } from 'lucide-react'

export default function ReferenceAnalyzer() {
  const [uploadedImage, setUploadedImage] = useState<{ file_url: string; filename: string } | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [analysisType, setAnalysisType] = useState('composition')
  const [description, setDescription] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const analysisTypes = [
    { value: 'composition', label: '构图分析', description: '分析画面的构图要素和视觉结构' },
    { value: 'lighting', label: '光影分析', description: '分析光线效果和阴影运用' },
    { value: 'color', label: '色彩分析', description: '分析色彩运用和色调特征' },
    { value: 'style', label: '风格分析', description: '分析艺术风格和表现手法' }
  ]

  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/storyboard/upload-image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.success) {
        return result
      } else {
        throw new Error(result.error || '上传失败')
      }
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const handleFileUploaded = (result: { file_url: string; filename: string }) => {
    setUploadedImage(result)
    setImageUrl(result.file_url)
    setAnalysis(null)
  }

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim()) {
      setUploadedImage({
        file_url: imageUrl.trim(),
        filename: '外部图片'
      })
      setAnalysis(null)
    }
  }

  const analyzeImage = async () => {
    const currentImageUrl = uploadedImage?.file_url || imageUrl.trim()

    if (!currentImageUrl) {
      alert('请先上传或输入图片URL')
      return
    }

    setIsLoading(true)
    try {
      const response = await storyApi.analyzeReference({
        image_url: currentImageUrl,
        analysis_type: analysisType,
        description: description.trim() || undefined
      })

      if (response.success) {
        setAnalysis(response.analysis)
      } else {
        alert('图片分析失败：' + response.error)
      }
    } catch (error) {
      console.error('Error analyzing image:', error)
      alert('图片分析时发生错误')
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

    const analysisText = `图片分析报告
分析类型: ${analysisTypes.find(t => t.value === analysisType)?.label}
图片来源: ${uploadedImage?.filename || imageUrl}
${description ? `特别关注: ${description}` : ''}

分析结果:
${analysis.content || JSON.stringify(analysis, null, 2)}
`

    const blob = new Blob([analysisText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `image_analysis_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetAnalysis = () => {
    setUploadedImage(null)
    setImageUrl('')
    setAnalysis(null)
    setDescription('')
  }

  return (
    <div className="space-y-6">
      {/* 图片上传/输入 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Camera className="h-5 w-5" />
          <h3 className="text-lg font-semibold">选择参考图片</h3>
        </div>

        {/* 方式选择：上传或URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 文件上传 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">上传图片文件</label>
            <FileUpload
              accept="image/*"
              maxSize={5}
              onUpload={handleImageUpload}
              onFileUploaded={handleFileUploaded}
              type="image"
            />
          </div>

          {/* URL输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">或输入图片URL</label>
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button onClick={handleImageUrlSubmit} disabled={!imageUrl.trim()}>
                使用
              </Button>
            </div>
          </div>
        </div>

        {/* 图片预览 */}
        {uploadedImage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">图片预览</h4>
              <Button variant="ghost" size="sm" onClick={resetAnalysis}>
                更换图片
              </Button>
            </div>
            <div className="max-w-md">
              <ImageDisplay
                src={uploadedImage.file_url}
                alt={uploadedImage.filename}
                className="w-full"
              />
            </div>
            <p className="text-xs text-gray-500">{uploadedImage.filename}</p>
          </div>
        )}
      </div>

      {/* 分析设置 */}
      {uploadedImage && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5" />
            <h3 className="text-lg font-semibold">分析设置</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">分析类型</label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分析类型" />
                </SelectTrigger>
                <SelectContent>
                  {analysisTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {analysisTypes.find(t => t.value === analysisType)?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">额外描述（可选）</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例如：请特别关注人物的表情和动作..."
                rows={3}
              />
            </div>
          </div>

          <Button
            onClick={analyzeImage}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                正在分析图片...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
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

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg p-6">
            {analysis.content ? (
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {analysis.content}
                </p>
                <div className="mt-4 p-3 bg-yellow-50 rounded text-sm not-prose">
                  <p className="text-yellow-800">
                    💡 <strong>分镜建议：</strong>这个分析结果可以帮助您了解优秀作品的视觉语言技巧，并在自己的分镜创作中应用。
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