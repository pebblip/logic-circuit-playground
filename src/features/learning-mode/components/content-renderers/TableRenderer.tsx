import React from 'react';
import type { TableContent } from '../../types/lesson-content';

interface TableRendererProps {
  content: TableContent;
}

export const TableRenderer: React.FC<TableRendererProps> = ({ content }) => {
  return (
    <table className={`truth-table ${content.className || ''}`}>
      <thead>
        <tr>
          {content.headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {content.rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};