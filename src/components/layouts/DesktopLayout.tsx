import React from 'react';
import { Header } from '../Header';
import { ToolPalette } from '../ToolPalette';
import { Canvas } from '../Canvas';
import { PropertyPanel } from '../PropertyPanel';
import '../../styles/desktop-layout.css';

interface DesktopLayoutProps {
  children?: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = () => {
  return (
    <div className="desktop-layout">
      <Header />
      <div className="desktop-main">
        <ToolPalette />
        <div className="desktop-canvas-container">
          <Canvas />
        </div>
        <PropertyPanel />
      </div>
    </div>
  );
};