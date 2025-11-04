'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import { ImageDisplay } from '@/components/ui/image'
import { User, Download, Share2, Heart, Trash2, Edit, Image as ImageIcon } from 'lucide-react'

interface SavedCharacter {
  id: string
  name: string
  type: string
  setting: string
  data: any
  imageUrl?: string
  createdAt: string
  isFavorite: boolean
}

export default function CharacterGallery() {
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([])
  const [filteredCharacters, setFilteredCharacters] = useState<SavedCharacter[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 从本地存储加载保存的角色
  useEffect(() => {
    loadSavedCharacters()
  }, [])

  useEffect(() => {
    // 根据搜索词过滤角色
    const filtered = savedCharacters.filter(character =>
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.setting.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCharacters(filtered)
  }, [searchTerm, savedCharacters])

  const loadSavedCharacters = () => {
    try {
      const saved = localStorage.getItem('savedCharacters')
      if (saved) {
        const characters = JSON.parse(saved)
        setSavedCharacters(characters)
      }
    } catch (error) {
      console.error('Error loading saved characters:', error)
    }
  }

  const saveCharacterToStorage = (characterData: any, imageUrl?: string) => {
    try {
      const newCharacter: SavedCharacter = {
        id: Date.now().toString(),
        name: characterData.basic_info?.name || '未命名角色',
        type: characterData.type || '未知类型',
        setting: characterData.setting || '未知背景',
        data: characterData,
        imageUrl: imageUrl || '',
        createdAt: new Date().toISOString(),
        isFavorite: false
      }

      const updatedCharacters = [...savedCharacters, newCharacter]
      setSavedCharacters(updatedCharacters)
      localStorage.setItem('savedCharacters', JSON.stringify(updatedCharacters))

      // 显示成功消息
      alert('角色已保存到展示库！')
    } catch (error) {
      console.error('Error saving character:', error)
      alert('保存角色时发生错误')
    }
  }

  const deleteCharacter = (id: string) => {
    if (confirm('确定要删除这个角色吗？')) {
      const updatedCharacters = savedCharacters.filter(char => char.id !== id)
      setSavedCharacters(updatedCharacters)
      localStorage.setItem('savedCharacters', JSON.stringify(updatedCharacters))
    }
  }

  const toggleFavorite = (id: string) => {
    const updatedCharacters = savedCharacters.map(char =>
      char.id === id ? { ...char, isFavorite: !char.isFavorite } : char
    )
    setSavedCharacters(updatedCharacters)
    localStorage.setItem('savedCharacters', JSON.stringify(updatedCharacters))
  }

  const shareCharacter = (character: SavedCharacter) => {
    const shareData = {
      title: `角色设定：${character.name}`,
      text: `角色类型：${character.type}\n故事背景：${character.setting}`,
      url: window.location.href
    }

    if (navigator.share) {
      navigator.share(shareData)
    } else {
      // 复制到剪贴板作为备选方案
      navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}`)
      alert('角色信息已复制到剪贴板')
    }
  }

  const downloadCharacterData = (character: SavedCharacter) => {
    const dataStr = JSON.stringify(character.data, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${character.name}_character_data.json`
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
      day: 'numeric'
    })
  }

  const getCharacterCard = (character: SavedCharacter) => {
    const basicInfo = character.data.basic_info || {}
    const appearance = character.data.appearance || {}
    const personality = character.data.personality || {}

    return (
      <Card key={character.id} className="h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {character.name}
                {character.isFavorite && <Heart className="h-4 w-4 text-red-500 fill-current" />}
              </CardTitle>
              <CardDescription className="text-sm">
                {character.type} • {character.setting}
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(character.id)}
                className="h-8 w-8 p-0"
              >
                <Heart className={`h-4 w-4 ${character.isFavorite ? 'text-red-500 fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteCharacter(character.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 角色立绘 */}
          <div className="aspect-square w-full">
            <ImageDisplay
              src={character.imageUrl}
              alt={character.name}
              className="w-full"
              showDownload={true}
            />
          </div>

          {/* 基本信息 */}
          <div className="space-y-2 text-sm">
            {basicInfo.age && (
              <div className="flex justify-between">
                <span className="text-gray-600">年龄：</span>
                <span>{basicInfo.age}</span>
              </div>
            )}
            {basicInfo.gender && (
              <div className="flex justify-between">
                <span className="text-gray-600">性别：</span>
                <span>{basicInfo.gender}</span>
              </div>
            )}
            {basicInfo.occupation && (
              <div className="flex justify-between">
                <span className="text-gray-600">职业：</span>
                <span>{basicInfo.occupation}</span>
              </div>
            )}
            {appearance.height && (
              <div className="flex justify-between">
                <span className="text-gray-600">身高：</span>
                <span>{appearance.height}</span>
              </div>
            )}
            {personality.traits && (
              <div className="flex justify-between">
                <span className="text-gray-600">性格：</span>
                <span className="text-xs text-right max-w-[60%] line-clamp-2">
                  {personality.traits}
                </span>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCharacterData(character)}
              className="flex-1"
            >
              <Download className="h-3 w-3 mr-1" />
              数据
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareCharacter(character)}
              className="flex-1"
            >
              <Share2 className="h-3 w-3 mr-1" />
              分享
            </Button>
          </div>

          {/* 创建时间 */}
          <div className="text-xs text-gray-500 text-center">
            创建于 {formatDate(character.createdAt)}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 暴露给父组件的方法，用于保存角色
  if (typeof window !== 'undefined') {
    (window as any).saveCharacterToGallery = saveCharacterToStorage
  }

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索角色名称、类型或背景..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 角色统计 */}
      {savedCharacters.length > 0 && (
        <div className="flex gap-4 text-sm text-gray-600">
          <span>总计：{savedCharacters.length} 个角色</span>
          <span>收藏：{savedCharacters.filter(c => c.isFavorite).length} 个</span>
        </div>
      )}

      {/* 角色列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharacters.map(getCharacterCard)}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          {savedCharacters.length === 0 ? (
            <>
              <p className="text-lg font-medium mb-2">还没有保存的角色</p>
              <p className="text-sm">生成角色后会自动显示在这里</p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">没有找到匹配的角色</p>
              <p className="text-sm">尝试使用不同的搜索词</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}