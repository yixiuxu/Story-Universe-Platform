import React, { useCallback, useState } from 'react'
import { Button } from './button'
import { Progress } from './progress'
import { Upload, X, FileText, Video, Image as ImageIcon } from 'lucide-react'

interface FileUploadProps {
  accept?: string
  maxSize?: number // in MB
  onUpload: (file: File) => Promise<{ file_url: string; filename: string }>
  onFileUploaded?: (result: { file_url: string; filename: string }) => void
  className?: string
  disabled?: boolean
  type?: 'image' | 'video' | 'general'
}

export function FileUpload({
  accept,
  maxSize = 10,
  onUpload,
  onFileUploaded,
  className = '',
  disabled = false,
  type = 'general'
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<{ file_url: string; filename: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 根据类型设置默认accept
  const getDefaultAccept = () => {
    switch (type) {
      case 'image':
        return 'image/*'
      case 'video':
        return 'video/*'
      default:
        return accept || '*/*'
    }
  }

  // 获取文件图标
  const getFileIcon = () => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-8 w-8" />
      case 'video':
        return <Video className="h-8 w-8" />
      default:
        return <FileText className="h-8 w-8" />
    }
  }

  // 验证文件
  const validateFile = (file: File): boolean => {
    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过 ${maxSize}MB`)
      return false
    }

    // 检查文件类型
    if (accept) {
      const acceptTypes = accept.split(',').map(type => type.trim())
      const isValidType = acceptTypes.some(acceptType => {
        if (acceptType.startsWith('.')) {
          return file.name.toLowerCase().endsWith(acceptType.toLowerCase())
        }
        return file.type.match(acceptType.replace('*', '.*'))
      })

      if (!isValidType) {
        setError(`不支持的文件类型。支持的格式: ${accept}`)
        return false
      }
    }

    setError(null)
    return true
  }

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    if (!validateFile(file)) return

    setIsUploading(true)
    setUploadProgress(50) // 显示50%表示正在上传
    setError(null)

    try {
      console.log('[FileUpload] Starting upload:', file.name)
      const result = await onUpload(file)
      console.log('[FileUpload] Upload complete:', result)
      
      setUploadProgress(100)
      setUploadedFile(result)
      onFileUploaded?.(result)

      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (error) {
      console.error('[FileUpload] Upload failed:', error)
      setError(error instanceof Error ? error.message : '文件上传失败，请重试')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [onUpload, onFileUploaded, maxSize])

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    // 重置input
    event.target.value = ''
  }

  // 处理拖拽
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  // 移除已上传文件
  const removeUploadedFile = () => {
    setUploadedFile(null)
    setError(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {!uploadedFile ? (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">正在上传文件...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-gray-500">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center text-gray-400">
                {getFileIcon()}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {disabled ? '上传功能已禁用' : '拖拽文件到这里或点击上传'}
                </p>
                <p className="text-xs text-gray-500">
                  最大文件大小: {maxSize}MB
                  {accept && ` • 支持格式: ${accept}`}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={disabled || isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                选择文件
              </Button>
              <input
                id="file-input"
                type="file"
                accept={getDefaultAccept()}
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || isUploading}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-gray-400">
                {getFileIcon()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {uploadedFile.filename}
                </p>
                <p className="text-xs text-gray-500">
                  上传成功
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeUploadedFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}