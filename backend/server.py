#!/usr/bin/env python3
"""
FastAPI wrapper that spawns Node.js and proxies all requests to it.
Required because supervisor.conf uses uvicorn with server:app.
"""
import subprocess
import os
import signal
import sys
import threading
import time
import atexit

from fastapi import FastAPI, Request, Response
from starlette.background import BackgroundTask
import httpx

NODE_PORT = 8002  # Node runs internally on 8002
os.chdir('/app/backend')

# Kill any previous Node process
subprocess.run(['pkill', '-f', f'node.*server.js'], capture_output=True)
time.sleep(0.3)

# Start Node.js server on internal port
node_env = {**os.environ, 'PORT': str(NODE_PORT)}
node_proc = subprocess.Popen(
    ['node', 'server.js'],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    env=node_env
)

def stream_output(pipe, prefix):
    for line in iter(pipe.readline, b''):
        text = line.decode('utf-8', errors='replace').rstrip()
        if text:
            print(f'{text}', flush=True)

# Stream Node output to uvicorn's stdout
threading.Thread(target=stream_output, args=(node_proc.stdout, '[node]'), daemon=True).start()
threading.Thread(target=stream_output, args=(node_proc.stderr, '[node]'), daemon=True).start()

def cleanup():
    if node_proc and node_proc.poll() is None:
        node_proc.terminate()
        try:
            node_proc.wait(timeout=3)
        except:
            node_proc.kill()

atexit.register(cleanup)

# Wait a bit for Node to start
time.sleep(1.5)

app = FastAPI(title="Node.js Proxy")

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy(request: Request, path: str):
    """Proxy all requests to Node.js backend."""
    target_url = f"http://127.0.0.1:{NODE_PORT}/{path}"
    
    # Prepare headers (exclude hop-by-hop)
    headers = {}
    for key, value in request.headers.items():
        if key.lower() not in ('host', 'content-length', 'transfer-encoding', 'connection'):
            headers[key] = value
    
    body = await request.body()
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            resp = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                params=request.query_params
            )
            
            # Filter response headers
            response_headers = {}
            for key, value in resp.headers.items():
                if key.lower() not in ('content-encoding', 'content-length', 'transfer-encoding', 'connection'):
                    response_headers[key] = value
            
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                headers=response_headers,
                media_type=resp.headers.get('content-type')
            )
        except httpx.RequestError as e:
            return Response(
                content=f'{{"error": "Backend unavailable: {str(e)}"}}',
                status_code=502,
                media_type="application/json"
            )

@app.get("/")
async def root(request: Request):
    return await proxy(request, "")
