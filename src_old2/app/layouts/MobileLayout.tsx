import React, { ReactNode, useState } from 'react';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomSheet } from './components/MobileBottomSheet';
import { FloatingActionButtons } from './components/FloatingActionButtons';

interface MobileLayoutProps {
  children: ReactNode;
}

/**
 * モバイル用レイアウト（ボトムシートとFAB）
 */
export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-gray-950 flex flex-col">
      {/* ヘッダー */}
      <MobileHeader />
      
      {/* メインコンテンツ */}
      <main className="flex-1 relative overflow-hidden">
        {children}
        
        {/* FAB */}
        <FloatingActionButtons 
          onToolsClick={() => setIsBottomSheetOpen(true)}
        />
      </main>
      
      {/* ボトムシート */}
      <MobileBottomSheet 
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      />
    </div>
  );
};