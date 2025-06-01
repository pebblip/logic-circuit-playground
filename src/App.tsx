import React from 'react';
import { Canvas } from './components/Canvas';
import { ToolPalette } from './components/ToolPalette';
import { Header } from './components/Header';
import { PropertyPanel } from './components/PropertyPanel';
import './App.css';

export const App: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <ToolPalette />
        <Canvas />
        <PropertyPanel />
      </div>
    </div>
  );
};