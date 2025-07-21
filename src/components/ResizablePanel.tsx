'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

export default function ResizablePanel({
  children,
  defaultWidth = 384, // 24rem (w-96)
  minWidth = 280,
  maxWidth = 800,
  className = '',
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing || !panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    const newWidth = rect.right - e.clientX;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setWidth(newWidth);
    }
  }, [isResizing, minWidth, maxWidth]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';

      return () => {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isResizing, resize, stopResize]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  return (
    <>
      {/* Resize Handle */}
      <div
        ref={resizerRef}
        onMouseDown={startResize}
        className={`
          w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-all duration-200
          ${isResizing ? 'bg-blue-500 shadow-lg shadow-blue-500/20' : ''}
          relative group
        `}
      >
        {/* Resize grip indicator */}
        <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-1 h-8 bg-blue-500 rounded-full shadow-lg"></div>
        </div>
        
        {/* Collapse/Expand button */}
        <button
          onClick={toggleCollapse}
          className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full border border-gray-600 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
          title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          <svg
            className={`w-3 h-3 text-gray-300 transition-transform duration-200 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Panel */}
      <div
        ref={panelRef}
        className={`
          ${className} transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-0 opacity-0' : ''}
        `}
        style={{ 
          width: isCollapsed ? 0 : width,
          minWidth: isCollapsed ? 0 : minWidth,
          maxWidth: isCollapsed ? 0 : maxWidth,
        }}
      >
        <div className={`h-full flex flex-col ${isCollapsed ? 'overflow-hidden' : ''}`}>
          {children}
        </div>
      </div>

      {/* Collapsed state indicator */}
      {isCollapsed && (
        <div className="w-12 bg-gray-800/50 border-r border-gray-700 flex flex-col items-center py-4">
          <button
            onClick={toggleCollapse}
            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center mb-4 transition-all duration-200"
            title="Expand code panel"
          >
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="transform -rotate-90 text-gray-400 text-sm font-medium whitespace-nowrap">
            Generated Code
          </div>
        </div>
      )}
    </>
  );
}