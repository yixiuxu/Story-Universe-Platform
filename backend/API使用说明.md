# Story Universe Platform - API 使用说明

## 🎯 新功能概览

### 1. 分镜图片生成和视频输出
- **批量生成分镜图片**：一键生成3张分镜图片
- **视频生成**：基于首尾帧生成视频
- **使用普通密钥**：CogView-4 和 CogVideoX-3

### 2. 流式输出
- **小说生成流式输出**：实时显示生成内容
- **角色生成流式输出**：实时显示角色信息

---

## 📡 API 端点

### 分镜助手

#### 1. 批量生成分镜图片
```http
POST /api/storyboard/generate-images
Content-Type: application/json

{
  "shots": [
    {
      "shot_number": 1,
      "description": "未来城市夜景，霓虹灯闪烁",
      "composition": "广角镜头，三分法构图",
      "mood": "科幻感，神秘氛围"
    },
    {
      "shot_number": 2,
      "description": "主角李明坐在飞行汽车中",
      "composition": "中景，人物居中",
      "mood": "紧张，专注"
    },
    {
      "shot_number": 3,
      "description": "飞行汽车降落在摩天大楼停机坪",
      "composition": "俯视角度，展现建筑规模",
      "mood": "宏大，震撼"
    }
  ]
}
```

**响应示例：**
```json
{
  "success": true,
  "images": [
    {
      "shot_number": 1,
      "image_url": "https://...",
      "prompt": "未来城市夜景，霓虹灯闪烁 广角镜头，三分法构图 科幻感，神秘氛围"
    },
    {
      "shot_number": 2,
      "image_url": "https://...",
      "prompt": "主角李明坐在飞行汽车中 中景，人物居中 紧张，专注"
    },
    {
      "shot_number": 3,
      "image_url": "https://...",
      "prompt": "飞行汽车降落在摩天大楼停机坪 俯视角度，展现建筑规模 宏大，震撼"
    }
  ]
}
```

#### 2. 生成视频
```http
POST /api/storyboard/generate-video
Content-Type: application/json

{
  "images": [
    "https://image1.jpg",
    "https://image2.jpg",
    "https://image3.jpg"
  ],
  "prompt": "展现从城市全景到主角特写的镜头转换，流畅自然"
}
```

**响应示例：**
```json
{
  "success": true,
  "video_url": "https://video.mp4",
  "first_frame": "https://image1.jpg",
  "last_frame": "https://image3.jpg"
}
```

---

### 小说生成

#### 流式输出
```http
POST /api/novel/stream
Content-Type: application/json

{
  "genre": "科幻",
  "theme": "人工智能觉醒",
  "length": "medium",
  "style": "modern"
}
```

**响应：** 文本流（text/plain）

**前端使用示例：**
```javascript
const response = await fetch('/api/novel/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    genre: '科幻',
    theme: '人工智能觉醒',
    length: 'medium',
    style: 'modern'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  // 实时显示内容
  console.log(chunk);
}
```

---

### 角色生成

#### 流式输出
```http
POST /api/character/stream
Content-Type: application/json

{
  "type": "主角",
  "setting": "未来城市",
  "name": "李明",
  "description": "30岁侦探"
}
```

**响应：** 文本流（text/plain）

---

## 🔧 技术说明

### 密钥使用策略

| 功能 | 使用密钥 | 模型 | 说明 |
|------|---------|------|------|
| 小说生成 | 普通密钥 | glm-4.6 | 200万token |
| 角色生成 | 普通密钥 | glm-4.6 | 200万token |
| 剧本转换 | 普通密钥 | glm-4.6 | 200万token |
| 分镜生成 | 普通密钥 | glm-4.6 | 200万token |
| 图片生成 | 普通密钥 | cogview-4 | 按次计费 |
| 视频生成 | 普通密钥 | cogvideox-3 | 按次计费 |
| 图片分析 | MAX密钥 | glm-4v-plus | 视觉理解 |
| 视频分析 | MAX密钥 | glm-4v-plus | 视觉理解 |

### 视频生成流程

1. **创建任务**：调用 `/videos/generations` 创建视频生成任务
2. **轮询状态**：每5秒查询一次任务状态
3. **获取结果**：任务完成后返回视频URL
4. **超时处理**：最多轮询60次（5分钟）

### 流式输出实现

- 使用 Server-Sent Events (SSE) 协议
- 实时传输生成内容
- 前端可逐字显示，提升用户体验

---

## 📝 使用示例

### 完整分镜工作流

```python
import requests

# 1. 生成分镜脚本
storyboard_response = requests.post(
    'http://localhost:8000/api/storyboard/generate',
    json={
        'script': '场景：未来城市...',
        'style': 'cinematic',
        'shots': 6
    }
)
shots = storyboard_response.json()['storyboard']

# 2. 生成前3个分镜的图片
images_response = requests.post(
    'http://localhost:8000/api/storyboard/generate-images',
    json={'shots': shots[:3]}
)
images = images_response.json()['images']

# 3. 生成视频
video_response = requests.post(
    'http://localhost:8000/api/storyboard/generate-video',
    json={
        'images': [img['image_url'] for img in images],
        'prompt': '展现分镜内容的流畅转换'
    }
)
video_url = video_response.json()['video_url']

print(f'视频生成成功：{video_url}')
```

---

## ⚠️ 注意事项

1. **图片生成**：CogView-4 按次计费（约0.06元/次）
2. **视频生成**：CogVideoX-3 按次计费（约1元/次）
3. **并发限制**：V0用户5个并发
4. **视频时长**：支持5秒和10秒
5. **视频分辨率**：最高支持4K

---

## 🐛 错误处理

### 常见错误

| 错误码 | 说明 | 解决方案 |
|--------|------|---------|
| 429 | 速率限制 | 等待后重试，或升级账户等级 |
| 400 | 参数错误 | 检查请求参数格式 |
| 401 | 密钥无效 | 检查API密钥配置 |
| 403 | 无权限 | 检查模型使用权限 |
| 500 | 服务器错误 | 查看后端日志 |

---

## 📊 性能优化

1. **批量处理**：一次生成多张图片
2. **异步处理**：视频生成使用异步轮询
3. **流式输出**：减少等待时间
4. **错误重试**：自动重试失败请求

---

## 🔗 相关文档

- [智谱AI官方文档](https://open.bigmodel.cn/dev/api)
- [CogView-4文档](https://open.bigmodel.cn/dev/api#cogview-4)
- [CogVideoX-3文档](https://open.bigmodel.cn/dev/api#cogvideox-3)
