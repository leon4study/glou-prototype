#!/bin/bash
# GLOU 프로토타입 로컬 서버 — 포트 충돌 자동 해결 후 실행
# 사용: ./serve.sh   (포트 바꾸려면: ./serve.sh 5500)
PORT=${1:-8000}
# 이미 그 포트를 잡고 있는 프로세스(멈춘 서버 등) 강제 종료
lsof -ti tcp:$PORT | xargs kill -9 2>/dev/null && echo "· 기존 포트 $PORT 정리함"
cd "$(dirname "$0")"
echo "▶ http://localhost:$PORT/   (끌 땐 Ctrl+C · Ctrl+Z 금지)"
python3 -m http.server "$PORT"