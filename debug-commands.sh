#!/bin/bash

echo "=== Logic Circuit Playground デバッグスクリプト ==="
echo ""

echo "1. 開発サーバーを停止して再起動..."
pkill -f "node.*vite"
sleep 2

echo "2. キャッシュをクリア..."
rm -rf node_modules/.vite
rm -rf .parcel-cache

echo "3. 開発サーバーを起動..."
npm run dev &
sleep 5

echo ""
echo "=== 以下を確認してください ==="
echo "1. ブラウザでハードリロード (Ctrl+Shift+R / Cmd+Shift+R)"
echo "2. 開発者ツールのコンソールでエラー確認"
echo "3. ネットワークタブで全てのファイルが正常に読み込まれているか確認"
echo ""
echo "もし問題が続く場合は："
echo "- npm install を再実行"
echo "- ブラウザのキャッシュを完全にクリア"
echo "- 別のブラウザで確認"