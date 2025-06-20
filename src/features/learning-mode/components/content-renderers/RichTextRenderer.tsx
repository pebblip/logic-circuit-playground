import React from 'react';
import type { RichTextContent } from '../../../../types/lesson-content';

interface RichTextRendererProps {
  content: RichTextContent;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
}) => {
  return (
    <p className="explanation-paragraph">
      {content.elements.map((elem, idx) => {
        // 文字列の場合は改行文字を処理してから返す
        if (typeof elem === 'string') {
          // 改行文字を<br>タグに変換
          if (elem.includes('\n')) {
            return (
              <React.Fragment key={idx}>
                {elem.split('\n').map((line, lineIdx, arr) => (
                  <React.Fragment key={lineIdx}>
                    {line}
                    {lineIdx < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          }
          return <React.Fragment key={idx}>{elem}</React.Fragment>;
        }

        // オブジェクトの場合はスタイルを適用
        const classNames: string[] = [];

        if (elem.gate) {
          // ゲート名のスタイル（色付き）
          classNames.push('gate-name');
          // 特定のゲート名に応じた追加クラス
          const gateName = elem.text.toLowerCase();
          if (gateName === 'not') classNames.push('gate-not');
          else if (gateName === 'and') classNames.push('gate-and');
          else if (gateName === 'or') classNames.push('gate-or');
          else if (gateName === 'xor') classNames.push('gate-xor');
        }

        if (elem.bold) {
          classNames.push('bold');
        }

        if (elem.emphasis) {
          classNames.push('emphasis');
        }

        return (
          <span key={idx} className={classNames.join(' ')}>
            {elem.text}
          </span>
        );
      })}
    </p>
  );
};
