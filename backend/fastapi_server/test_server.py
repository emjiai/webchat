#!/usr/bin/env python3
"""Basic test script for the FastAPI RAG server."""

import asyncio
import aiohttp
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

async def test_health_check():
    """Test health check endpoint."""
    print("🔍 Testing health check endpoint...")
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{BASE_URL}/api/v1/health/") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Health check passed: {data['status']}")
                    print(f"   RAG Available: {data['rag_available']}")
                    return True
                else:
                    print(f"❌ Health check failed: {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False

async def test_rag_status():
    """Test RAG status endpoint."""
    print("\n🔍 Testing RAG status endpoint...")
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{BASE_URL}/api/v1/health/rag") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ RAG status: {data['status']}")
                    print(f"   Details: {data['details']}")
                    return True
                else:
                    print(f"❌ RAG status failed: {response.status}")
                    return False
        except Exception as e:
            print(f"❌ RAG status error: {e}")
            return False

async def test_chat_message():
    """Test chat message endpoint."""
    print("\n🔍 Testing chat message endpoint...")
    
    test_message = {
        "message": "What is RAG and how does it work?",
        "chatbot_id": "test_chatbot",
        "rag_enabled": True,
        "max_results": 5,
        "temperature": 0.7,
        "model": "gemini-2.5-flash"
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                f"{BASE_URL}/api/v1/chat/message",
                headers={"Content-Type": "application/json"},
                data=json.dumps(test_message)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Chat message successful")
                    print(f"   Model: {data.get('model', 'unknown')}")
                    print(f"   Content length: {len(data.get('content', ''))}")
                    print(f"   Citations: {len(data.get('citations', []))}")
                    print(f"   Processing time: {data.get('processing_time_ms')}ms")
                    return True
                else:
                    error_data = await response.json()
                    print(f"❌ Chat message failed: {response.status}")
                    print(f"   Error: {error_data}")
                    return False
        except Exception as e:
            print(f"❌ Chat message error: {e}")
            return False

async def test_chat_message_no_rag():
    """Test chat message endpoint without RAG."""
    print("\n🔍 Testing chat message without RAG...")
    
    test_message = {
        "message": "Hello, how are you?",
        "chatbot_id": "test_chatbot",
        "rag_enabled": False,
        "model": "placeholder-llm"
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                f"{BASE_URL}/api/v1/chat/message",
                headers={"Content-Type": "application/json"},
                data=json.dumps(test_message)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Chat message without RAG successful")
                    print(f"   Content: {data.get('content', '')[:100]}...")
                    print(f"   RAG enabled: {data.get('rag_enabled', False)}")
                    return True
                else:
                    error_data = await response.json()
                    print(f"❌ Chat message without RAG failed: {response.status}")
                    print(f"   Error: {error_data}")
                    return False
        except Exception as e:
            print(f"❌ Chat message without RAG error: {e}")
            return False

async def test_cors():
    """Test CORS headers."""
    print("\n🔍 Testing CORS headers...")
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.options(
                f"{BASE_URL}/api/v1/health/",
                headers={
                    "Origin": "http://localhost:3005",
                    "Access-Control-Request-Method": "GET"
                }
            ) as response:
                cors_headers = {
                    key: value for key, value in response.headers.items()
                    if key.lower().startswith("access-control")
                }
                
                if cors_headers:
                    print(f"✅ CORS headers present:")
                    for key, value in cors_headers.items():
                        print(f"   {key}: {value}")
                    return True
                else:
                    print("❌ No CORS headers found")
                    return False
        except Exception as e:
            print(f"❌ CORS test error: {e}")
            return False

async def main():
    """Run all tests."""
    print(f"🚀 Starting FastAPI RAG Server Tests")
    print(f"📅 Time: {datetime.now().isoformat()}")
    print(f"🌐 Base URL: {BASE_URL}")
    print("=" * 60)
    
    tests = [
        ("Health Check", test_health_check),
        ("RAG Status", test_rag_status),
        ("Chat Message with RAG", test_chat_message),
        ("Chat Message without RAG", test_chat_message_no_rag),
        ("CORS Headers", test_cors),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {test_name}: {status}")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 All tests passed! FastAPI server is working correctly.")
        return 0
    else:
        print("⚠️ Some tests failed. Check the server configuration and logs.")
        return 1

if __name__ == "__main__":
    import sys
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Tests crashed: {e}")
        sys.exit(1)