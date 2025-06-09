#\!/bin/bash

# Phase 1レッスンファイルのリスト
PHASE1_FILES=(
  "digital-basics-lesson.ts"
  "not-gate-lesson.ts"
  "and-gate-lesson.ts"
  "or-gate-lesson.ts"
  "xor-gate-lesson.ts"
  "half-adder-lesson.ts"
  "full-adder-lesson.ts"
)

# 各ファイルから\nを削除
for file in "${PHASE1_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    # '\n'を削除（前後の空白も調整）
    sed -i '' "s/'\\\\n',//g" "$file"
    sed -i '' "s/'\\\\n'//g" "$file"
    # elementsの配列内で不要な空行を削除
    sed -i '' "/^[[:space:]]*$/d" "$file"
    echo "Completed $file"
  fi
done

echo "All newline escape sequences removed from Phase 1 lessons\!"
