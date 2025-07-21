'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeViewerProps {
  code: string;
}

export default function CodeViewer({ code }: CodeViewerProps) {
  const defaultCode = `// Generated Playwright test will appear here
// Add nodes to the flow builder to start generating code

import { test, expect } from '@playwright/test';

test('API flow test', async ({ request }) => {
  // Your API test steps will be generated here
});`;

  const displayCode = code.trim() || defaultCode;

  return (
    <div className="h-full w-full bg-gray-900 rounded-lg border border-gray-600 overflow-hidden">
      <Editor
        height="100%"
        width="100%"
        language="typescript"
        value={displayCode}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          fontSize: 13,
          lineNumbers: 'on',
          folding: true,
          renderLineHighlight: 'none',
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          overviewRulerLanes: 0,
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
            <div className="text-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading code editor...
            </div>
          </div>
        }
      />
    </div>
  );
}
