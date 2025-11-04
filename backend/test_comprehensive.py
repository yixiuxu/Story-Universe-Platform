"""
Comprehensive API Testing with Analysis
Tests all endpoints and provides detailed analysis
"""
import asyncio
import httpx
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

class TestAnalyzer:
    def __init__(self):
        self.results = []
        self.start_time = None
        
    def add_result(self, name, success, response_time, error=None, data=None):
        self.results.append({
            "name": name,
            "success": success,
            "response_time": response_time,
            "error": error,
            "data": data,
            "timestamp": datetime.now().isoformat()
        })
    
    def analyze(self):
        """Analyze test results and provide recommendations"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r["success"])
        failed = total - passed
        
        avg_time = sum(r["response_time"] for r in self.results if r["response_time"]) / total if total > 0 else 0
        
        # Categorize errors
        rate_limit_errors = sum(1 for r in self.results if r["error"] and "429" in str(r["error"]))
        timeout_errors = sum(1 for r in self.results if r["error"] and "timeout" in str(r["error"]).lower())
        other_errors = failed - rate_limit_errors - timeout_errors
        
        analysis = {
            "summary": {
                "total": total,
                "passed": passed,
                "failed": failed,
                "success_rate": f"{passed*100//total if total > 0 else 0}%",
                "avg_response_time": f"{avg_time:.2f}s"
            },
            "errors": {
                "rate_limit": rate_limit_errors,
                "timeout": timeout_errors,
                "other": other_errors
            },
            "recommendations": []
        }
        
        # Generate recommendations
        if rate_limit_errors > 0:
            analysis["recommendations"].append({
                "issue": "Rate limiting detected",
                "solution": "Increase delay between requests to 15-20 seconds",
                "priority": "HIGH"
            })
        
        if avg_time > 20:
            analysis["recommendations"].append({
                "issue": "Slow response times",
                "solution": "Enable streaming output or reduce max_tokens",
                "priority": "MEDIUM"
            })
        
        if timeout_errors > 0:
            analysis["recommendations"].append({
                "issue": "Timeout errors",
                "solution": "Increase timeout or optimize prompts",
                "priority": "HIGH"
            })
        
        if passed == total:
            analysis["recommendations"].append({
                "issue": "All tests passed",
                "solution": "Ready for production deployment",
                "priority": "INFO"
            })
        
        return analysis

analyzer = TestAnalyzer()

async def test_endpoint(name, endpoint, data, timeout=60):
    """Test single endpoint with timing"""
    print(f"\n{'='*60}")
    print(f"[TEST] {name}")
    print(f"{'='*60}")
    
    start = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(f"{BASE_URL}{endpoint}", json=data)
            elapsed = time.time() - start
            
            if response.status_code == 200:
                result = response.json()
                print(f"[OK] Success in {elapsed:.2f}s")
                
                # Show preview
                preview = None
                if 'content' in result and result['content']:
                    preview = result['content'][:100]
                    print(f"Preview: {preview}...")
                elif 'character' in result:
                    preview = str(result['character'])[:100]
                    print(f"Character: {preview}...")
                elif 'script' in result:
                    preview = result['script'][:100]
                    print(f"Script: {preview}...")
                
                analyzer.add_result(name, True, elapsed, data=preview)
                return True
            else:
                print(f"[FAIL] Status {response.status_code} in {elapsed:.2f}s")
                error_msg = response.text[:200]
                print(f"Error: {error_msg}")
                analyzer.add_result(name, False, elapsed, error=error_msg)
                return False
                
    except Exception as e:
        elapsed = time.time() - start
        error_msg = str(e)
        print(f"[ERROR] {error_msg[:200]}")
        analyzer.add_result(name, False, elapsed, error=error_msg)
        return False

async def main():
    print("\n" + "="*60)
    print("COMPREHENSIVE API TESTING")
    print("="*60)
    
    analyzer.start_time = time.time()
    
    # Test 1: Novel Generation
    print("\n[1/7] Novel Generation")
    await test_endpoint(
        "Novel Generation",
        "/api/novel/generate",
        {"genre": "科幻", "theme": "AI", "length": "short", "style": "modern"}
    )
    await asyncio.sleep(15)
    
    # Test 2: Character Generation
    print("\n[2/7] Character Generation")
    await test_endpoint(
        "Character Generation",
        "/api/character/generate",
        {"type": "主角", "setting": "未来", "name": "Alex"}
    )
    await asyncio.sleep(15)
    
    # Test 3: Script Conversion
    print("\n[3/7] Script Conversion")
    await test_endpoint(
        "Script Conversion",
        "/api/script/convert",
        {"content": "Alex走进房间。", "format": "standard"}
    )
    await asyncio.sleep(15)
    
    # Test 4: Storyboard Generation
    print("\n[4/7] Storyboard Generation")
    await test_endpoint(
        "Storyboard Generation",
        "/api/storyboard/generate",
        {"script": "场景：房间\nAlex进入。", "style": "cinematic", "shots": 3}
    )
    await asyncio.sleep(15)
    
    # Test 5: Outline Generation
    print("\n[5/7] Outline Generation")
    await test_endpoint(
        "Outline Generation",
        "/api/novel/outline",
        {"genre": "科幻", "style": "modern", "keywords": ["AI"], "target_length": "medium"}
    )
    await asyncio.sleep(15)
    
    # Test 6: Chapter Continue
    print("\n[6/7] Chapter Continue")
    await test_endpoint(
        "Chapter Continue",
        "/api/novel/continue",
        {"previous_content": "故事开始了。", "target_length": 500}
    )
    await asyncio.sleep(15)
    
    # Test 7: Style Adjust
    print("\n[7/7] Style Adjust")
    await test_endpoint(
        "Style Adjust",
        "/api/novel/rewrite",
        {"content": "他走了。", "target_style": "诗意"}
    )
    
    # Analysis
    total_time = time.time() - analyzer.start_time
    analysis = analyzer.analyze()
    
    print("\n" + "="*60)
    print("TEST ANALYSIS")
    print("="*60)
    
    print(f"\nSummary:")
    print(f"  Total Tests: {analysis['summary']['total']}")
    print(f"  Passed: {analysis['summary']['passed']}")
    print(f"  Failed: {analysis['summary']['failed']}")
    print(f"  Success Rate: {analysis['summary']['success_rate']}")
    print(f"  Avg Response Time: {analysis['summary']['avg_response_time']}")
    print(f"  Total Time: {total_time:.2f}s")
    
    print(f"\nError Breakdown:")
    print(f"  Rate Limit (429): {analysis['errors']['rate_limit']}")
    print(f"  Timeout: {analysis['errors']['timeout']}")
    print(f"  Other: {analysis['errors']['other']}")
    
    print(f"\nRecommendations:")
    for i, rec in enumerate(analysis['recommendations'], 1):
        print(f"  {i}. [{rec['priority']}] {rec['issue']}")
        print(f"     Solution: {rec['solution']}")
    
    # Save detailed results
    with open("test_results.json", "w", encoding="utf-8") as f:
        json.dump({
            "analysis": analysis,
            "detailed_results": analyzer.results,
            "total_time": total_time
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\nDetailed results saved to: test_results.json")
    
    # Return analysis for code modifications
    return analysis

if __name__ == "__main__":
    analysis = asyncio.run(main())
