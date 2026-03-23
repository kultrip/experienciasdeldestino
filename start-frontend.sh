#!/bin/bash
cd /app/frontend
exec /usr/bin/yarn vite --host 0.0.0.0 --port 3000
