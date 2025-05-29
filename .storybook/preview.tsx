import type { Preview } from '@storybook/react';
import React from 'react';
import { ThemeProvider } from '../src/design-system/themes/ThemeProvider';
import { darkTheme } from '../src/design-system/themes/dark';
import { generateGlobalStyles } from '../src/design-system/themes/ThemeProvider';

// グローバルスタイルを適用
const globalStyles = generateGlobalStyles(darkTheme);
const styleElement = document.createElement('style');
styleElement.textContent = globalStyles;
document.head.appendChild(styleElement);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0a0e27',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={darkTheme}>
        <div style={{ padding: '20px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;