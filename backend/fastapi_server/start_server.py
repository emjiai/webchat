#!/usr/bin/env python3
"""Development server startup script."""

import subprocess
import sys
import os
from pathlib import Path

def check_requirements():
    """Check if requirements are installed."""
    try:
        import fastapi
        import uvicorn
        import dotenv
        print("✅ Requirements check passed")
        return True
    except ImportError as e:
        print(f"❌ Missing requirement: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def check_environment():
    """Check if environment is configured."""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists():
        if env_example.exists():
            print("⚠️ .env file not found. Copying from .env.example")
            try:
                import shutil
                shutil.copy(env_example, env_file)
                print("📋 .env file created from template")
                print("⚠️ Please edit .env file with your configuration")
                return False
            except Exception as e:
                print(f"❌ Failed to copy .env.example: {e}")
                return False
        else:
            print("❌ No .env or .env.example file found")
            return False
    
    print("✅ Environment file check passed")
    return True

def start_server():
    """Start the FastAPI server."""
    print("🚀 Starting FastAPI RAG Server...")
    print("📋 Server will be available at: http://localhost:8000")
    print("📚 API docs will be available at: http://localhost:8000/docs")
    print("🔍 Health check: http://localhost:8000/api/v1/health")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        # Start uvicorn server
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload",
            "--log-level", "info"
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    return True

def main():
    """Main startup function."""
    print("🔧 FastAPI RAG Server Startup")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not Path("app").exists() or not Path("app/main.py").exists():
        print("❌ Please run this script from the fastapi_server directory")
        sys.exit(1)
    
    # Run checks
    if not check_requirements():
        sys.exit(1)
    
    if not check_environment():
        sys.exit(1)
    
    # Start server
    success = start_server()
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()