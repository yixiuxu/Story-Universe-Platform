'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading'
import { ImageDisplay } from '@/components/ui/image'
import { storyApi } from '@/lib/api'
import { User, Search, Palette, Download, Copy, Save } from 'lucide-react'

interface CharacterData {
  basic_info?: {
    name?: string
    age?: string
    gender?: string
    occupation?: string
    nationality?: string
  }
  appearance?: {
    height?: string
    build?: string
    hair_color?: string
    eye_color?: string
    clothing_style?: string
    special_features?: string
  }
  personality?: {
    traits?: string
    strengths?: string
    weaknesses?: string
    habits?: string
    fears?: string
  }
  background?: {
    childhood?: string
    education?: string
    family?: string
    major_events?: string
  }
  skills_abilities?: {
    professional_skills?: string
    special_talents?: string
    combat_abilities?: string
    languages?: string
  }
  relationships?: {
    family_relations?: string
    friendships?: string
    romantic_interests?: string
    rivals_rivals?: string
  }
  goals_motivations?: {
    short_term_goals?: string
    long_term_goals?: string
    motivations?: string
    fears?: string
  }
  dialogue_style?: {
    speaking_manner?: string
    vocabulary?: string
    catchphrase?: string
    communication_style?: string
  }
  raw_content?: string
}

export default function CharacterGenerator() {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    setting: '',
    age: '',
    gender: '',
    personality: '',
    description: ''
  })
  const [characterData, setCharacterData] = useState<CharacterData | null>(null)
  const [backgroundMaterials, setBackgroundMaterials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  const characterTypes = [
    { value: 'protagonist', label: '主角' },
    { value: 'antagonist', label: '反派' },
    { value: 'supporting', label: '配角' },
    { value: 'mentor', label: '导师' },
    { value: 'love_interest', label: '恋爱对象' },
    { value: 'comic_relief', label: '搞笑角色' },
    { value: 'catalyst', label: '催化剂角色' },
    { value: 'narrator', label: '叙述者' }
  ]

  const ageGroups = [
    { value: 'child', label: '儿童' },
    { value: 'teenager', label: '青少年' },
    { value: 'young_adult', label: '青年' },
    { value: 'middle_aged', label: '中年' },
    { value: 'elderly', label: '老年' }
  ]

  const genders = [
    { value: 'male', label: '男性' },
    { value: 'female', label: '女性' },
    { value: 'other', label: '其他' }
  ]

  const artStyles = [
    { value: 'anime', label: '动漫风格' },
    { value: 'realistic', label: '写实风格' },
    { value: 'chinese', label: '古风风格' },
    { value: 'fantasy', label: '奇幻风格' },
    { value: 'scifi', label: '科幻风格' },
    { value: 'game', label: '游戏风格' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateCharacter = async () => {
    if (!formData.type || !formData.setting) {
      alert('请填写角色类型和故事背景')
      return
    }

    setIsLoading(true)
    try {
      const response: any = await storyApi.generateCharacter({
        name: formData.name || undefined,
        type: formData.type,
        setting: formData.setting,
        age: formData.age || undefined,
        gender: formData.gender || undefined,
        personality: formData.personality || undefined,
        description: formData.description || undefined
      })

      if (response.success) {
        setCharacterData(response.character)
        setBackgroundMaterials(response.background_materials || [])
        setImageUrl('') // 清空之前的图片
      } else {
        alert('角色生成失败：' + response.error)
      }
    } catch (error) {
      console.error('Error generating character:', error)
      alert('角色生成时发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  const generateCharacterImage = async (artStyle: string) => {
    if (!characterData) {
      alert('请先生成角色信息')
      return
    }

    const characterName = characterData.basic_info?.name || formData.name || '未命名角色'
    
    // 检查是否有appearance字段
    if (!characterData.appearance) {
      alert('角色外貌信息不完整，无法生成立绘')
      return
    }
    
    // 拼接外貌描述
    const appearanceParts = [
      characterData.appearance.height,
      characterData.appearance.build,
      characterData.appearance.hair_color,
      characterData.appearance.eye_color,
      characterData.appearance.clothing_style,
      characterData.appearance.special_features
    ].filter(part => part && part.trim() && part !== '未设置')
    
    if (appearanceParts.length < 3) {
      alert('角色外貌信息不完整，至少需要3个外貌特征。当前只有' + appearanceParts.length + '个。')
      console.log('Appearance data:', characterData.appearance)
      return
    }
    
    const appearance = appearanceParts.join(', ')

    setIsGeneratingImage(true)
    try {
      console.log('发送立绘请求:', { character_name: characterName, appearance, style: artStyle })
      
      const response: any = await storyApi.generateCharacterImage({
        character_name: characterName,
        appearance: appearance,
        style: artStyle
      })

      console.log('收到立绘响应:', response)
      console.log('响应键:', Object.keys(response))

      if (response && response.success && response.image_url) {
        console.log('立绘URL:', response.image_url)
        setImageUrl(response.image_url)
        alert('立绘生成成功！')
      } else {
        console.error('立绘生成失败:', response)
        alert('立绘生成失败：' + (response?.error || '未知错误'))
      }
    } catch (error: any) {
      console.error('Error generating image:', error)
      const errorMsg = error.response?.data?.detail || error.message || '立绘生成时发生错误'
      alert('立绘生成失败：' + errorMsg)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  const downloadCharacterData = () => {
    const dataStr = JSON.stringify(characterData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const characterName = characterData?.basic_info?.name || 'character'
    a.download = `${characterName}_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const saveToGallery = () => {
    if (characterData) {
      // 添加类型和背景信息到数据中
      const enrichedData = {
        ...characterData,
        type: formData.type,
        setting: formData.setting
      }

      if (typeof window !== 'undefined' && (window as any).saveCharacterToGallery) {
        (window as any).saveCharacterToGallery(enrichedData, imageUrl)
      } else {
        alert('保存功能暂时不可用，请刷新页面重试')
      }
    }
  }

  const renderCharacterInfo = (data: CharacterData) => {
    if (data.raw_content) {
      // 如果是原始文本内容，直接渲染
      return (
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap text-sm">{data.raw_content}</pre>
        </div>
      )
    }

    // 渲染结构化数据
    return (
      <div className="space-y-4">
        {data.basic_info && (
          <div className="bg-blue-50 p-4 rounded">
            <h4 className="font-semibold text-blue-900 mb-2">基本信息</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>姓名：</strong>{data.basic_info.name || '未设置'}</div>
              <div><strong>年龄：</strong>{data.basic_info.age || '未设置'}</div>
              <div><strong>性别：</strong>{data.basic_info.gender || '未设置'}</div>
              <div><strong>职业：</strong>{data.basic_info.occupation || '未设置'}</div>
              <div><strong>国籍：</strong>{data.basic_info.nationality || '未设置'}</div>
            </div>
          </div>
        )}

        {data.appearance && (
          <div className="bg-purple-50 p-4 rounded">
            <h4 className="font-semibold text-purple-900 mb-2">外貌特征</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>身高：</strong>{data.appearance.height || '未设置'}</div>
              <div><strong>体型：</strong>{data.appearance.build || '未设置'}</div>
              <div><strong>发色：</strong>{data.appearance.hair_color || '未设置'}</div>
              <div><strong>眼睛颜色：</strong>{data.appearance.eye_color || '未设置'}</div>
              <div><strong>服装风格：</strong>{data.appearance.clothing_style || '未设置'}</div>
              <div><strong>特殊特征：</strong>{data.appearance.special_features || '未设置'}</div>
            </div>
          </div>
        )}

        {data.personality && (
          <div className="bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-green-900 mb-2">性格特点</h4>
            <div className="space-y-2 text-sm">
              <div><strong>主要特征：</strong>{data.personality.traits || '未设置'}</div>
              <div><strong>优点：</strong>{data.personality.strengths || '未设置'}</div>
              <div><strong>缺点：</strong>{data.personality.weaknesses || '未设置'}</div>
              <div><strong>习惯：</strong>{data.personality.habits || '未设置'}</div>
              <div><strong>恐惧：</strong>{data.personality.fears || '未设置'}</div>
            </div>
          </div>
        )}

        {data.background && (
          <div className="bg-yellow-50 p-4 rounded">
            <h4 className="font-semibold text-yellow-900 mb-2">背景故事</h4>
            <div className="space-y-2 text-sm">
              <div><strong>童年：</strong>{data.background.childhood || '未设置'}</div>
              <div><strong>教育：</strong>{data.background.education || '未设置'}</div>
              <div><strong>家庭：</strong>{data.background.family || '未设置'}</div>
              <div><strong>重要经历：</strong>{data.background.major_events || '未设置'}</div>
            </div>
          </div>
        )}

        {data.skills_abilities && (
          <div className="bg-indigo-50 p-4 rounded">
            <h4 className="font-semibold text-indigo-900 mb-2">技能能力</h4>
            <div className="space-y-2 text-sm">
              <div><strong>专业技能：</strong>{data.skills_abilities.professional_skills || '未设置'}</div>
              <div><strong>特殊才能：</strong>{data.skills_abilities.special_talents || '未设置'}</div>
              <div><strong>战斗能力：</strong>{data.skills_abilities.combat_abilities || '未设置'}</div>
              <div><strong>掌握语言：</strong>{data.skills_abilities.languages || '未设置'}</div>
            </div>
          </div>
        )}

        {data.relationships && (
          <div className="bg-pink-50 p-4 rounded">
            <h4 className="font-semibold text-pink-900 mb-2">人际关系</h4>
            <div className="space-y-2 text-sm">
              <div><strong>家庭关系：</strong>{data.relationships.family_relations || '未设置'}</div>
              <div><strong>友谊：</strong>{data.relationships.friendships || '未设置'}</div>
              <div><strong>恋爱对象：</strong>{data.relationships.romantic_interests || '未设置'}</div>
              <div><strong>对手敌人：</strong>{data.relationships.rivals_rivals || '未设置'}</div>
            </div>
          </div>
        )}

        {data.goals_motivations && (
          <div className="bg-red-50 p-4 rounded">
            <h4 className="font-semibold text-red-900 mb-2">目标动机</h4>
            <div className="space-y-2 text-sm">
              <div><strong>短期目标：</strong>{data.goals_motivations.short_term_goals || '未设置'}</div>
              <div><strong>长期目标：</strong>{data.goals_motivations.long_term_goals || '未设置'}</div>
              <div><strong>内在动机：</strong>{data.goals_motivations.motivations || '未设置'}</div>
              <div><strong>恐惧担忧：</strong>{data.goals_motivations.fears || '未设置'}</div>
            </div>
          </div>
        )}

        {data.dialogue_style && (
          <div className="bg-teal-50 p-4 rounded">
            <h4 className="font-semibold text-teal-900 mb-2">对话风格</h4>
            <div className="space-y-2 text-sm">
              <div><strong>说话方式：</strong>{data.dialogue_style.speaking_manner || '未设置'}</div>
              <div><strong>词汇特点：</strong>{data.dialogue_style.vocabulary || '未设置'}</div>
              <div><strong>标志性台词：</strong>{data.dialogue_style.catchphrase || '未设置'}</div>
              <div><strong>沟通风格：</strong>{data.dialogue_style.communication_style || '未设置'}</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 输入表单 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">角色姓名（可选）</label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="给角色起个名字"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">角色类型</label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="选择角色类型" />
            </SelectTrigger>
            <SelectContent>
              {characterTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">年龄段（可选）</label>
          <Select value={formData.age} onValueChange={(value) => handleInputChange('age', value)}>
            <SelectTrigger>
              <SelectValue placeholder="选择年龄段" />
            </SelectTrigger>
            <SelectContent>
              {ageGroups.map((age) => (
                <SelectItem key={age.value} value={age.value}>
                  {age.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">性别（可选）</label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="选择性别" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((gender) => (
                <SelectItem key={gender.value} value={gender.value}>
                  {gender.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">故事背景</label>
          <Input
            value={formData.setting}
            onChange={(e) => handleInputChange('setting', e.target.value)}
            placeholder="例如：现代都市、古代江湖、未来科幻世界"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">性格特征（可选）</label>
          <Input
            value={formData.personality}
            onChange={(e) => handleInputChange('personality', e.target.value)}
            placeholder="例如：勇敢善良、冷静理智、幽默风趣"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">额外描述（可选）</label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="其他对角色的描述或特殊要求..."
            rows={3}
          />
        </div>
      </div>

      <Button
        onClick={generateCharacter}
        disabled={isLoading || !formData.type || !formData.setting}
        className="w-full"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            正在生成角色...
          </>
        ) : (
          <>
            <User className="mr-2 h-4 w-4" />
            生成角色
          </>
        )}
      </Button>

      {/* 背景资料 */}
      {backgroundMaterials.length > 0 && (
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-semibold mb-2 flex items-center">
            <Search className="mr-2 h-4 w-4" />
            角色原型参考
          </h4>
          <div className="space-y-2">
            {backgroundMaterials.map((material, index) => (
              <div key={index} className="text-sm border-l-4 border-indigo-500 pl-3">
                <div className="font-medium">{material.title}</div>
                <div className="text-gray-600">{material.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 角色信息展示 */}
      {characterData && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">角色信息</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(characterData, null, 2))}
              >
                <Copy className="h-4 w-4 mr-2" />
                复制
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCharacterData}
              >
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveToGallery}
              >
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {renderCharacterInfo(characterData)}
          </div>

          {/* 立绘生成和展示 */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-4 flex items-center">
              <Palette className="mr-2 h-4 w-4" />
              角色立绘
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 立绘生成控制 */}
              <div>
                <h5 className="text-sm font-medium mb-3">生成立绘</h5>
                <div className="flex flex-wrap gap-2 mb-4">
                  {artStyles.map((style) => (
                    <Button
                      key={style.value}
                      variant="outline"
                      size="sm"
                      onClick={() => generateCharacterImage(style.value)}
                      disabled={isGeneratingImage}
                    >
                      {isGeneratingImage ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : null}
                      {style.label}
                    </Button>
                  ))}
                </div>

                {isGeneratingImage && (
                  <div className="text-center py-4">
                    <LoadingSpinner size="md" className="mx-auto mb-2" />
                    <p className="text-sm text-gray-600">正在生成立绘，请稍候...</p>
                  </div>
                )}
              </div>

              {/* 立绘展示 */}
              <div>
                <h5 className="text-sm font-medium mb-3">立绘预览</h5>
                <ImageDisplay
                  src={imageUrl}
                  alt={`${characterData?.basic_info?.name || '角色'}立绘`}
                  className="w-full max-w-sm mx-auto"
                />
                {imageUrl && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500">点击图片可放大查看</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}