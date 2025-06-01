import React, { ReactNode } from 'react';

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * StoreProvider - Zustandはプロバイダー不要だが、
 * 将来的に初期化ロジックを追加する可能性あり
 */
export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // Zustandはプロバイダー不要なので、現在はそのままchildrenを返す
  // 将来的にストアの初期化やリセットなどを追加可能
  return <>{children}</>;
};