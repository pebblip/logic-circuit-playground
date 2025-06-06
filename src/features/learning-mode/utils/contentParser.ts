import type { Content, BinaryExpression } from '../../../types/lesson-content';
import type { LessonStep } from '../data/lessons';

// 2進数式のパース（例: "0+1=0" -> BinaryExpression）
const parseBinaryExpression = (expr: string): BinaryExpression | null => {
  const match = expr.match(/(\d)\s*\+\s*(\d)\s*=\s*(\d+)/);
  if (match) {
    return {
      left: match[1],
      operator: '+',
      right: match[2],
      result: match[3],
    };
  }
  return null;
};

// 既存のレッスンステップを構造化されたコンテンツに変換
export const parseExistingStep = (step: LessonStep): Content[] => {
  const content: Content[] = [];

  if (step.action.type === 'explanation' && 'content' in step.action) {
    const lines = step.action.content.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 空行
      if (!line.trim()) {
        i++;
        continue;
      }

      // 見出し（絵文字で始まる行）
      if (
        /^[🔧🎯📊💡🤔🔍🌟📝🔗🧮📐💻🚗🏠🛑💳🚨🚪🔄🔐✅➕🎮🔬]/u.test(line.trim())
      ) {
        const colonIndex = line.indexOf('：');
        if (colonIndex > -1) {
          const heading = line.substring(0, colonIndex + 1);
          const rest = line.substring(colonIndex + 1).trim();

          // 実験結果まとめの特別処理
          if (heading.includes('実験結果')) {
            const results = rest
              .split(/[、,]/)
              .map(r => r.trim())
              .filter(r => r);
            const expressions = results
              .map(r => parseBinaryExpression(r))
              .filter((e): e is BinaryExpression => e !== null);

            content.push({
              type: 'experiment-result',
              title: heading,
              results: expressions,
              note: '「+」は論理演算を表します。入力1 + 入力2 = 出力 という意味です。',
            });
            i++;
            continue;
          }
        }

        content.push({
          type: 'heading',
          text: line.trim(),
          icon: line.trim().match(/^(.*?)\s/)?.[1],
        });
        i++;
        continue;
      }

      // 比較表（AND: OR: などのパターン）
      if (
        line.includes('AND:') ||
        line.includes('OR:') ||
        line.includes('XOR:') ||
        line.includes('NOT:')
      ) {
        const comparisonLines = [];
        let j = i;

        while (j < lines.length && /^(AND|OR|XOR|NOT):/.test(lines[j].trim())) {
          comparisonLines.push(lines[j]);
          j++;
        }

        const items = comparisonLines.map(compLine => {
          const [gateType, values] = compLine.split(':').map(s => s.trim());
          const expressions = values
            .split(',')
            .map(v => v.trim())
            .filter(v => v)
            .map(v => parseBinaryExpression(v))
            .filter((e): e is BinaryExpression => e !== null);

          return {
            gateType: gateType as 'AND' | 'OR' | 'XOR' | 'NOT',
            values: expressions,
          };
        });

        content.push({
          type: 'comparison',
          items,
        });

        i = j;
        continue;
      }

      // 真理値表
      if (
        line.includes('|') &&
        i + 1 < lines.length &&
        lines[i + 1].includes('---')
      ) {
        const tableLines = [];
        let j = i;

        while (
          j < lines.length &&
          (lines[j].includes('|') || lines[j].includes('---'))
        ) {
          tableLines.push(lines[j]);
          j++;
        }

        if (tableLines.length >= 2) {
          const headers = tableLines[0]
            .split('|')
            .map(h => h.trim())
            .filter(h => h);
          const rows = tableLines.slice(2).map(line =>
            line
              .split('|')
              .map(c => c.trim())
              .filter(c => c)
          );

          content.push({
            type: 'table',
            headers,
            rows,
          });

          i = j;
          continue;
        }
      }

      // 箇条書き
      if (line.trim().startsWith('・') || line.trim().startsWith('•')) {
        const listItems = [];
        let j = i;

        while (
          j < lines.length &&
          (lines[j].trim().startsWith('・') || lines[j].trim().startsWith('•'))
        ) {
          listItems.push(lines[j].trim().substring(1).trim());
          j++;
        }

        content.push({
          type: 'list',
          ordered: false,
          items: listItems,
        });

        i = j;
        continue;
      }

      // 番号付きリスト
      if (/^\d+\./.test(line.trim())) {
        const listItems = [];
        let j = i;

        while (j < lines.length && /^\d+\./.test(lines[j].trim())) {
          listItems.push(lines[j].trim().replace(/^\d+\.\s*/, ''));
          j++;
        }

        content.push({
          type: 'list',
          ordered: true,
          items: listItems,
        });

        i = j;
        continue;
      }

      // 通常のテキスト
      content.push({
        type: 'text',
        text: line,
      });
      i++;
    }
  } else if (step.action.type === 'quiz' && 'question' in step.action) {
    content.push({
      type: 'quiz',
      question: step.action.question,
      options: step.action.options,
      correctIndex: step.action.correct,
    });
  }

  return content;
};
