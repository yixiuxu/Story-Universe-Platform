"""
Final Comprehensive Testing with Analysis
"""
import asyncio
import httpx
import json
import time

BASE_URL = "http://localhost:8000"

class TestResults:
    def __init__(self):
        self.results = []
        
    def add(self, name, success, time, error=None):
        self.results.append({
            "name": name,
            "success": success,
            "time": time,
            "error": error
        })
    
    def analyze(self):
        total = len(self.results)
        passed = sum(1 for r in self.results if r["success"])
        avg_time = sum(r["time"] for r in self.results) / total if total > 0 else 0
        
        return {
            "total": total,
            "passed": passed,
            "failed": total - passed,
            "success_rate": f"{passed*100//total}%" if total > 0 else "0%",
            "avg_time": f"{avg_time:.2f}s"
        }

results = TestResults()

async def test(name, endpoint, data, timeout=60):
    print(f"\n[TEST] {name}")
    start = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(f"{BASE_URL}{endpoint}", json=data)
            elapsed = time.time() - start
            
            if response.status_code == 200:
                result = response.json()
                success = result.get("success", False)
                
                if success:
                    print(f"[OK] {elapsed:.2f}s")
                    results.add(name, True, elapsed)
                    return True
                else:
                    print(f"[FAIL] {elapsed:.2f}s - {result.get('error', 'Unknown')}")
                    results.add(name, False, elapsed, result.get('error'))
                    return False
            else:
                print(f"[FAIL] Status {response.status_code}")
                results.add(name, False, elapsed, f"HTTP {response.status_code}")
                return False
                
    except Exception as e:
        elapsed = time.time() - start
        print(f"[ERROR] {str(e)[:100]}")
        results.add(name, False, elapsed, str(e)[:100])
        return False

async def main():
    print("="*60)
    print("FINAL COMPREHENSIVE TEST")
    print("="*60)
    
    # Test 1: Novel
    await test("Novel", "/api/novel/generate", 
               {"genre": "科幻", "theme": "AI", "length": "short", "style": "modern"})
    await asyncio.sleep(15)
    
    # Test 2: Character
    await test("Character", "/api/character/generate",
               {"type": "主角", "setting": "未来", "name": "Alex"})
    await asyncio.sleep(15)
    
    # Test 3: Script
    await test("Script", "/api/script/convert",
               {"content": "Alex走进房间。", "format": "standard"})
    await asyncio.sleep(15)
    
    # Test 4: Storyboard
    await test("Storyboard", "/api/storyboard/generate",
               {"script": "场景：房间\nAlex进入。", "style": "cinematic", "shots": 3})
    await asyncio.sleep(15)
    
    # Test 5: Outline
    await test("Outline", "/api/novel/outline",
               {"genre": "科幻", "style": "modern", "keywords": ["AI"], "target_length": "medium"})
    await asyncio.sleep(15)
    
    # Test 6: Continue
    await test("Continue", "/api/novel/continue",
               {"previous_content": "故事开始。", "target_length": 500})
    await asyncio.sleep(15)
    
    # Test 7: Rewrite
    await test("Rewrite", "/api/novel/rewrite",
               {"content": "他走了。", "target_style": "诗意"})
    
    # Analysis
    print("\n" + "="*60)
    print("ANALYSIS")
    print("="*60)
    
    analysis = results.analyze()
    print(f"Total: {analysis['total']}")
    print(f"Passed: {analysis['passed']}")
    print(f"Failed: {analysis['failed']}")
    print(f"Success Rate: {analysis['success_rate']}")
    print(f"Avg Time: {analysis['avg_time']}")
    
    # Recommendations
    print("\nRECOMMENDATIONS:")
    
    if analysis['passed'] == analysis['total']:
        print("- All tests passed! System ready for production")
    elif analysis['passed'] >= analysis['total'] * 0.7:
        print("- Most tests passed. Review failed tests")
    else:
        print("- Many failures. Check backend logs")
    
    avg_time_num = float(analysis['avg_time'].replace('s', ''))
    if avg_time_num > 20:
        print("- Response time slow. Enable streaming recommended")
    elif avg_time_num > 10:
        print("- Response time acceptable. Streaming optional")
    else:
        print("- Response time good")
    
    # Save results
    with open("final_test_results.json", "w", encoding="utf-8") as f:
        json.dump({
            "analysis": analysis,
            "details": results.results
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\nResults saved to: final_test_results.json")

if __name__ == "__main__":
    asyncio.run(main())
