/* eslint-disable no-console */
/**
 * デバッグユーティリティ
 * 開発環境でのみ動作し、本番環境ではログを無効化
 */

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

export const debug = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  error: console.error.bind(console),
  warn: console.warn.bind(console),
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
  table: (data: unknown) => {
    if (isDev) {
      console.table(data);
    }
  },
  time: (label: string) => {
    if (isDev) {
      console.time(label);
    }
  },
  timeEnd: (label: string) => {
    if (isDev) {
      console.timeEnd(label);
    }
  },
};
