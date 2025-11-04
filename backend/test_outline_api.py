"""测试大纲生成API"""
import requests
import json

def test_outline_api():
    url = "http://localhost:8000/api/novel/outline"
    
    data = {
        "genre": "科幻",
        "style": "modern",
        "keywords": ["AI", "未来"],
        "target_length": "medium"
    }
    
    print("发送请求到:", url)
    print("请求数据:", json.dumps(data, ensure_ascii=False, indent=2))
    print("\n等待响应...\n")
    
    try:
        response = requests.post(url, json=data, timeout=60)
        
        print(f"状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        print("\n响应内容:")
        
        if response.status_code == 200:
            result = response.json()
            print(json.dumps(result, ensure_ascii=False, indent=2))
            
            if result.get("success"):
                print("\n✅ 测试成功！")
                outline = result.get("outline", {})
                if "raw_content" in outline:
                    print(f"\n大纲内容预览:\n{outline['raw_content'][:500]}...")
                else:
                    print(f"\n大纲结构: {list(outline.keys())}")
            else:
                print(f"\n❌ API返回失败: {result.get('error')}")
        else:
            print(f"\n❌ HTTP错误: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ 请求超时")
    except requests.exceptions.ConnectionError:
        print("❌ 连接失败，请确保后端服务正在运行")
    except Exception as e:
        print(f"❌ 错误: {str(e)}")

if __name__ == "__main__":
    print("=" * 60)
    print("测试大纲生成API")
    print("=" * 60)
    test_outline_api()
