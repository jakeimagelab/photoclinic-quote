#!/bin/zsh
cd "$(dirname "$0")"

NODE="/Applications/Codex.app/Contents/Resources/node"
NPM=".tools/package/bin/npm-cli.js"

if [ ! -x "$NODE" ]; then
  echo "Codex 앱의 Node 실행 파일을 찾을 수 없습니다."
  echo "Node.js LTS를 설치한 뒤 npm install, npm run dev를 실행해주세요."
  read -n 1 -s "?아무 키나 누르면 종료합니다."
  exit 1
fi

if [ ! -f "$NPM" ]; then
  mkdir -p .tools
  curl -L https://registry.npmjs.org/npm/-/npm-10.9.2.tgz -o .tools/npm.tgz
  tar -xzf .tools/npm.tgz -C .tools
fi

if [ ! -d "node_modules" ]; then
  NPM_CONFIG_CACHE=.npm-cache "$NODE" "$NPM" install
fi

if [ ! -d "node_modules/@next/swc-wasm-nodejs" ]; then
  NPM_CONFIG_CACHE=.npm-cache "$NODE" "$NPM" install @next/swc-wasm-nodejs@15.5.18
fi

NEXT_TEST_WASM_DIR="$PWD/node_modules/@next/swc-wasm-nodejs" \
NPM_CONFIG_CACHE=.npm-cache "$NODE" "$NPM" run build

echo ""
echo "사이트가 켜집니다: http://localhost:3005"
echo "이 창은 닫지 말고, 브라우저에서 위 주소를 열어주세요."
echo ""

NPM_CONFIG_CACHE=.npm-cache "$NODE" "$NPM" run start -- -p 3005
