'use client';

import React, { useState } from 'react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (content: string) => void;
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!content.trim()) {
      alert('Please paste your Playwright test code');
      return;
    }

    setIsProcessing(true);
    try {
      onImport(content);
      setContent('');
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Import Playwright Test</h2>
            <p className="text-gray-400 text-sm mt-1">Paste your Playwright test code to convert it into a visual flow</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 min-h-0">
          <div className="h-full flex flex-col">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Playwright Test Code
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Paste your Playwright test code here, for example:

import { test, expect } from '@playwright/test';

const baseUrl = "https://api.example.com";

test("API test", async ({ request }) => {
  const authToken = await test.step("Login", async () => {
    const response = await request.post(\`\${baseUrl}/auth/login\`, {
      data: { username: "user", password: "pass" },
      headers: { "Content-Type": "application/json" }
    });
    await expect(response).toBeOK();
    return await response.json();
  });
  
  // Add more test steps...
});`}
              className="flex-1 p-4 bg-gray-900 text-white border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none resize-none font-mono text-sm leading-relaxed"
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            💡 Supports both JavaScript and TypeScript Playwright test files
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={isProcessing || !content.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span>Import Flow</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}