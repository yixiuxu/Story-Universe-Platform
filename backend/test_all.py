"""
Complete API Testing Script
Tests all backend endpoints
"""
import asyncio
import httpx
import json

BASE_URL = "http://localhost:8000"

async def test_api(name, endpoint, data, timeout=60):
    """Test single API endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"{'='*60}")
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(f"{BASE_URL}{endpoint}", json=data)
            
            if response.status_code == 200:
                result = response.json()
                print(f"[OK] SUCCESS")
                
                # Show preview
                if 'content' in result:
                    preview = result['content'][:200] if result['content'] else "EMPTY"
                    print(f"Content: {preview}...")
                elif 'character' in result:
                    print(f"Character: {str(result['character'])[:200]}...")
                elif 'script' in result:
                    print(f"Script: {result['script'][:200]}...")
                elif 'storyboard' in result:
                    print(f"Storyboard: {len(result['storyboard'])} shots")
                else:
                    print(f"Result: {str(result)[:200]}...")
                
                return True
            else:
                print(f"[FAIL] Status: {response.status_code}")
                print(f"Error: {response.text[:200]}")
                return False
                
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return False

async def main():
    print("\n" + "="*60)
    print("COMPLETE API TESTING")
    print("="*60)
    
    results = {}
    
    # Test 1: Novel Generation
    print("\n[1/8] Novel Generation")
    results["Novel"] = await test_api(
        "Novel Generation",
        "/api/novel/generate",
        {
            "genre": "科幻",
            "theme": "AI觉醒",
            "length": "short",
            "style": "modern"
        }
    )
    await asyncio.sleep(10)
    
    # Test 2: Character Generation
    print("\n[2/8] Character Generation")
    results["Character"] = await test_api(
        "Character Generation",
        "/api/character/generate",
        {
            "type": "主角",
            "setting": "未来世界",
            "name": "艾莉"
        }
    )
    await asyncio.sleep(10)
    
    # Test 3: Script Conversion
    print("\n[3/8] Script Conversion")
    results["Script"] = await test_api(
        "Script Conversion",
        "/api/script/convert",
        {
            "content": "艾莉走进实验室，看到桌上的神秘装置。",
            "format": "standard"
        }
    )
    await asyncio.sleep(10)
    
    # Test 4: Storyboard Generation
    print("\n[4/8] Storyboard Generation")
    results["Storyboard"] = await test_api(
        "Storyboard Generation",
        "/api/storyboard/generate",
        {
            "script": "场景：实验室 - 白天\n艾莉走进来，看到装置。",
            "style": "cinematic",
            "shots": 3
        }
    )
    await asyncio.sleep(10)
    
    # Test 5: Outline Generation
    print("\n[5/8] Outline Generation")
    results["Outline"] = await test_api(
        "Outline Generation",
        "/api/novel/outline",
        {
            "genre": "科幻",
            "style": "modern",
            "keywords": ["AI", "未来"],
            "target_length": "medium"
        }
    )
    await asyncio.sleep(10)
    
    # Test 6: Chapter Continue
    print("\n[6/8] Chapter Continue")
    results["Continue"] = await test_api(
        "Chapter Continue",
        "/api/novel/continue",
        {
            "previous_content": "在2050年的城市里，AI已经无处不在。",
            "target_length": 500
        }
    )
    await asyncio.sleep(10)
    
    # Test 7: Style Adjust
    print("\n[7/8] Style Adjust")
    results["Style"] = await test_api(
        "Style Adjust",
        "/api/novel/rewrite",
        {
            "content": "他走进房间。",
            "target_style": "诗意"
        }
    )
    await asyncio.sleep(10)
    
    # Test 8: Enhanced Search (may fail due to rate limit)
    print("\n[8/8] Enhanced Search (MAX key)")
    results["Search"] = await test_api(
        "Enhanced Search",
        "/api/search/enhanced-search",
        {
            "query": "人工智能",
            "search_type": "general",
            "limit": 5
        },
        timeout=120
    )
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for name, success in results.items():
        status = "[PASS]" if success else "[FAIL]"
        print(f"{name:15} {status}")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"\nTotal: {passed}/{total} passed ({passed*100//total}%)")
    
    if passed == total:
        print("\n[SUCCESS] ALL TESTS PASSED!")
    elif passed >= total * 0.75:
        print("\n[OK] MOST TESTS PASSED")
    else:
        print("\n[WARNING] MANY TESTS FAILED")

if __name__ == "__main__":
    asyncio.run(main())
