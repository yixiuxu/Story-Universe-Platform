import React, { useState } from 'react'
import { Button } from './button'
import { LoadingSpinner } from './loading'
import { Download, ZoomIn } from 'lucide-react'

interface ImageDisplayProps {
  src?: string
  alt: string
  className?: string
  showDownload?: boolean
  onDownload?: () => void
}

export function ImageDisplay({
  src,
  alt,
  className = '',
  showDownload = true,
  onDownload
}: ImageDisplayProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    } else if (src) {
      // 默认下载行为
      const link = document.createElement('a')
      link.href = src
      link.download = alt || 'character_image'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (!src) {
    return (
      <div className={`aspect-square bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
            ?
          </div>
          <p className="text-sm">暂无图片</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative group ${className}`}>
      {/* 图片容器 */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {hasError ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-sm">图片加载失败</p>
            </div>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>

      {/* 悬停时的操作按钮 */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
        {showDownload && !hasError && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className="mr-2"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}

        {!hasError && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(src, '_blank')}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}