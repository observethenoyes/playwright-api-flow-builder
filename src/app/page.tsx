'use client';

import React, { useState } from 'react';
import FlowBuilder from '@/components/FlowBuilder';
import CodeViewer from '@/components/CodeViewer';
import ResizablePanel from '@/components/ResizablePanel';
import { generatePlaywrightTest, Step } from '@/lib/generateCode';

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState('');

  // This function is called whenever the user updates the steps in DragDrop
  const handleStepsUpdate = (steps: Step[]) => {
    const code = generatePlaywrightTest(steps);
    setGeneratedCode(code);
  };

  return (
    <main className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Playwright API Flow Builder</h1>
            <p className="text-gray-400 text-sm">Visual flow builder for creating Playwright API tests</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm border border-green-700">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block mr-2"></span>
              Ready
            </div>
            <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all font-medium flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12L8 10l1.5-1.5L10 9l.5.5L12 8l-2 2 2 2-1.5 1.5L10 12z"/>
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 2v8H4V6h12z" clipRule="evenodd"/>
              </svg>
              <span>Run on Checkly</span>
            </button>
          </div>
        </div>
      </header>

      <div className="h-[calc(100vh-80px)] flex">
        {/* Left: Flow Builder */}
        <section className="flex-1 min-w-0">
          <FlowBuilder onUpdate={handleStepsUpdate} />
        </section>

        {/* Right: Resizable Code Preview */}
        <ResizablePanel 
          defaultWidth={700}
          minWidth={320}
          maxWidth={800}
          className="bg-gray-800/50 backdrop-blur-sm flex flex-col"
        >
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                Generated Test Code
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  title="Copy code to clipboard"
                >
                  Copy
                </button>
                <button
                  className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  title="Download test file"
                >
                  Download
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {generatedCode.split('\n').length} lines • Auto-updated
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <CodeViewer code={generatedCode} />
          </div>
        </ResizablePanel>
      </div>
    </main>
  );
}
