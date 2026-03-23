import subprocess
import sys
import os
import signal
import threading

# Start Node.js server in background
os.chdir('/app/backend')

node_proc = subprocess.Popen(
    ['node', 'server.js'],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

def stream_output(pipe, name):
    for line in iter(pipe.readline, b''):
        print(f'{line.decode().rstrip()}', flush=True)

threading.Thread(target=stream_output, args=(node_proc.stdout, 'stdout'), daemon=True).start()
threading.Thread(target=stream_output, args=(node_proc.stderr, 'stderr'), daemon=True).start()

def signal_handler(signum, frame):
    node_proc.terminate()
    sys.exit(0)

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

from fastapi import FastAPI, Request
import httpx

app = FastAPI()

@app.api_route('/{path:path}', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'])
async def proxy(request: Request, path: str):
    async with httpx.AsyncClient() as client:
        url = f'http://localhost:8001/{path}'
        body = await request.body()
        resp = await client.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers.items() if k.lower() != 'host'},
            content=body,
            params=request.query_params
        )
        return Response(content=resp.content, status_code=resp.status_code, headers=dict(resp.headers))
