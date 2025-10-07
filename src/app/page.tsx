'use client';

import React, { useState, useRef } from 'react';
import FlowBuilder, { FlowBuilderRef } from '@/components/FlowBuilder';
import CodeViewer from '@/components/CodeViewer';
import ResizablePanel from '@/components/ResizablePanel';
import ImportModal from '@/components/ImportModal';
import { generatePlaywrightTest, Step } from '@/lib/generateCode';
import { parsePlaywrightTest } from '@/lib/parsePlaywrightTest';

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState('');
  const flowBuilderRef = useRef<FlowBuilderRef>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // This function is called whenever the user updates the steps in DragDrop
  const handleStepsUpdate = (steps: Step[]) => {
    const code = generatePlaywrightTest(steps);
    setGeneratedCode(code);
  };

  const handleImportClick = () => {
    setIsImportModalOpen(true);
  };

  const handleTextImport = (content: string) => {
    try {
      let importedSteps: Step[] = [];

      // Try to detect if it's JSON or Playwright test code
      const trimmedContent = content.trim();
      console.log('Import content type detection:', { 
        isJSON: trimmedContent.startsWith('[') && trimmedContent.endsWith(']'),
        hasTest: trimmedContent.includes('test(') || trimmedContent.includes('test.step('),
        contentLength: trimmedContent.length 
      });
      
      if (trimmedContent.startsWith('[') && trimmedContent.endsWith(']')) {
        // Looks like JSON array
        importedSteps = JSON.parse(content);
        console.log('Parsed JSON steps:', importedSteps);
        
        if (!Array.isArray(importedSteps)) {
          throw new Error('JSON content must be an array of steps');
        }
      } else if (trimmedContent.includes('test(') || trimmedContent.includes('test.step(')) {
        // Looks like Playwright test code
        importedSteps = parsePlaywrightTest(content);
        console.log('Parsed Playwright steps:', importedSteps);
        
        if (importedSteps.length === 0) {
          throw new Error('No API calls found in the provided test code');
        }
      } else {
        throw new Error('Content does not appear to be valid Playwright test code or JSON');
      }

      // Basic validation of step structure
      for (const step of importedSteps) {
        if (!step.method || !step.url) {
          console.error('Invalid step:', step);
          throw new Error('Each step must have a method and url');
        }
      }

      console.log('About to import steps:', importedSteps);
      console.log('FlowBuilder ref current:', flowBuilderRef.current);

      // Import the steps into the flow builder
      if (flowBuilderRef.current) {
        flowBuilderRef.current.importSteps(importedSteps);
        console.log('Import steps called successfully');
      } else {
        console.error('FlowBuilder ref is null!');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Invalid content format'}`);
      throw error; // Re-throw so modal can handle it
    }
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
            <button 
              onClick={handleImportClick}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span>Import Flow</span>
            </button>
          </div>
        </div>
      </header>

      <div className="h-[calc(100vh-80px)] flex">
        {/* Left: Flow Builder */}
        <section className="flex-1 min-w-0">
          <FlowBuilder onUpdate={handleStepsUpdate} ref={flowBuilderRef} />
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

      {/* Import Modal */}
      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleTextImport}
      />
    </main>
  );
}
