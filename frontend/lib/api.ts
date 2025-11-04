import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,  // 增加到120秒，适应AI生成时间
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API 接口定义
export const storyApi = {
  // 小说创作
  generateNovel: (data: {
    genre: string
    theme: string
    length: string
    style: string
    prompt?: string
  }) => apiClient.post('/api/novel/generate', data),

  // 大纲生成
  generateOutline: (data: {
    genre: string
    style: string
    keywords: string[]
    target_length: string
  }) => apiClient.post('/api/novel/outline', data),

  // 章节续写
  continueChapter: (data: {
    previous_content: string
    continuation_direction?: string
    target_length: number
  }) => apiClient.post('/api/novel/continue', data),

  // 风格调整
  adjustStyle: (data: {
    content: string
    target_style: string
    style_description?: string
  }) => apiClient.post('/api/novel/rewrite', data),

  // 角色生成
  generateCharacter: (data: {
    name?: string
    type: string
    setting: string
    age?: string
    gender?: string
    personality?: string
    description?: string
  }) => apiClient.post('/api/character/generate', data),

  // 角色立绘生成
  generateCharacterImage: (data: {
    character_name: string
    appearance: string
    style: string
    pose?: string
  }) => apiClient.post('/api/character/image', data),

  // 分镜生成
  generateStoryboard: (data: {
    script: string
    style: string
    shots: number
    scene_description?: string
  }) => apiClient.post('/api/storyboard/generate', data),

  // 参考图分析
  analyzeReference: (data: {
    image_url: string
    analysis_type: string
    description?: string
  }) => apiClient.post('/api/storyboard/analyze', data),

  // 视频分析
  analyzeVideo: (data: {
    video_url: string
    analysis_focus: string
    description?: string
  }) => apiClient.post('/api/storyboard/analyze-video', data),

  // 增强搜索
  enhancedSearch: (data: {
    query: string
    search_type?: string
    context?: string
    limit?: number
  }) => apiClient.post('/api/search/enhanced-search', data),

  // 热点话题
  getHotTopics: (data: {
    category?: string
    limit?: number
  }) => apiClient.post('/api/search/hot-topics', data),

  // 灵感推荐
  getInspiration: (data: {
    genre?: string
    theme?: string
    style?: string
    keywords?: string[]
  }) => apiClient.post('/api/search/inspiration', data),

  // 剧本转换
  convertToScript: (data: {
    content: string
    format: string
    characters?: string[]
  }) => apiClient.post('/api/script/convert', data),

  // 分镜生成
  generateStoryboard: (data: {
    script: string
    style: string
    shots: number
  }) => apiClient.post('/api/storyboard/generate', data),

  // 素材搜索
  searchMaterials: (data: {
    query: string
    type: 'image' | 'text' | 'video'
    limit?: number
  }) => apiClient.post('/api/search/materials', data),
}

export default apiClient