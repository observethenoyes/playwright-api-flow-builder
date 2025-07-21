'use client';

import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface APINodeData {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  expectStatusOk: boolean;
  expectArrayNotEmpty: boolean;
  saveResponseAs: string;
  useVariableInUrl: {
    varName: string;
    propertyPath: string;
  };
  requestBody: string;
  headers: Record<string, string>;
  onChange: (nodeId: string, data: Partial<APINodeData>) => void;
  onDelete: (nodeId: string) => void;
  savedVariables?: string[];
  isSelected?: boolean;
}

const methodColors = {
  GET: 'from-green-500 to-green-600',
  POST: 'from-blue-500 to-blue-600',
  PUT: 'from-orange-500 to-orange-600',
  DELETE: 'from-red-500 to-red-600',
};

export default function APINode({ data, id }: NodeProps<APINodeData>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [headersInputValue, setHeadersInputValue] = useState(() => formatHeaders(data.headers));

  // Auto-expand when selected, auto-minimize when deselected
  useEffect(() => {
    if (data.isSelected && !isExpanded) {
      setIsExpanded(true);
    } else if (!data.isSelected && isExpanded) {
      setIsExpanded(false);
    }
  }, [data.isSelected, isExpanded]);

  const handleChange = (field: string, value: string | boolean | Record<string, string>) => {
    data.onChange(id, { [field]: value });
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const isValidUrl = (url: string) => {
    if (!url.trim()) return false;
    return url.startsWith('http') || /^[a-zA-Z0-9\/\-_\.]+$/.test(url);
  };

  const isValidJson = (json: string) => {
    if (!json.trim()) return true;
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  };

  function formatHeaders(headers: Record<string, string>) {
    return Object.entries(headers || {}).map(([k, v]) => `${k}:${v}`).join(';');
  }

  const parseHeaders = (headerString: string) => {
    const headers: Record<string, string> = {};
    if (headerString.trim()) {
      headerString.split(';').forEach(header => {
        const colonIndex = header.indexOf(':');
        if (colonIndex > 0) {
          const key = header.substring(0, colonIndex).trim();
          const value = header.substring(colonIndex + 1).trim();
          if (key && value) {
            headers[key] = value;
          }
        }
      });
    }
    return headers;
  };

  // Update local headers input when data changes
  useEffect(() => {
    setHeadersInputValue(formatHeaders(data.headers));
  }, [data.headers]);

  return (
    <>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      <div className={`
        relative rounded-xl shadow-2xl border-2 transition-all duration-300 min-w-[320px] max-w-[400px]
        ${data.isSelected 
          ? 'border-blue-400 shadow-blue-400/25 scale-105' 
          : 'border-gray-600 hover:border-gray-500'
        }
        bg-gradient-to-br from-gray-800 to-gray-850
      `}>
        {/* Header with Method Badge */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className={`
              px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg
              bg-gradient-to-r ${methodColors[data.method]}
            `}>
              {data.method}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete(id);
              }}
              className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-900/20"
              title="Delete node"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* URL Input */}
          <div className="mb-3">
            <input
              type="text"
              value={data.url}
              onChange={(e) => handleChange('url', e.target.value)}
              onClick={handleInputClick}
              placeholder="Enter API endpoint..."
              className={`
                w-full p-3 text-white border-2 rounded-lg focus:outline-none transition-all
                placeholder-gray-400 font-mono text-sm
                ${isValidUrl(data.url)
                  ? 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:bg-gray-600'
                  : 'bg-red-900/50 border-red-500 focus:border-red-400'
                }
              `}
            />
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2">
            {data.expectStatusOk && (
              <span className="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded-full border border-green-700">
                ✓ Status OK
              </span>
            )}
            {data.expectArrayNotEmpty && (
              <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full border border-blue-700">
                ✓ Array Not Empty
              </span>
            )}
            {data.saveResponseAs && (
              <span className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded-full border border-purple-700">
                → {data.saveResponseAs}
              </span>
            )}
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="p-4 space-y-4 bg-gray-850/50">
            {/* Method Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">HTTP Method</label>
              <select
                value={data.method}
                onChange={(e) => handleChange('method', e.target.value)}
                onClick={handleInputClick}
                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-blue-400 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.expectStatusOk}
                  onChange={(e) => handleChange('expectStatusOk', e.target.checked)}
                  onClick={handleInputClick}
                  className="mr-2"
                />
                <span className="text-sm">Expect Status OK</span>
              </label>
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.expectArrayNotEmpty}
                  onChange={(e) => handleChange('expectArrayNotEmpty', e.target.checked)}
                  onClick={handleInputClick}
                  className="mr-2"
                />
                <span className="text-sm">Expect Array Not Empty</span>
              </label>
            </div>

            {/* Save Response As */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Save Response As</label>
              <input
                type="text"
                value={data.saveResponseAs}
                onChange={(e) => handleChange('saveResponseAs', e.target.value)}
                onClick={handleInputClick}
                placeholder="Variable name"
                className="w-full p-2 bg-amber-900/30 text-white border border-amber-600 rounded focus:border-amber-400 focus:outline-none placeholder-gray-400"
              />
            </div>

            {/* Available Data Helper */}
            {data.savedVariables && data.savedVariables.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-blue-300 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Available Data
                  </h4>
                </div>
                <div className="text-xs text-blue-200 space-y-1">
                  <p className="text-blue-100 mb-1">Use these in headers or request body:</p>
                  {data.savedVariables.map(varName => (
                    <div key={varName} className="bg-blue-800/30 px-2 py-1 rounded font-mono text-xs">
                      <span className="text-blue-300">{varName}</span>
                      <span className="text-gray-400 ml-1">
                        → Use as: <code className="text-blue-200">{`\${${varName}.property}`}</code>
                      </span>
                    </div>
                  ))}
                  <p className="text-blue-200 text-xs mt-2 italic">
                    💡 Example: In headers use <code className="bg-blue-800/50 px-1 rounded">Bearer {`\${authToken.access_token}`}</code>
                  </p>
                </div>
              </div>
            )}

            {/* Request Body for POST/PUT */}
            {(data.method === 'POST' || data.method === 'PUT') && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Request Body</label>
                <textarea
                  value={data.requestBody}
                  onChange={(e) => handleChange('requestBody', e.target.value)}
                  onClick={handleInputClick}
                  placeholder='{"key": "value"}'
                  rows={3}
                  className={`
                    w-full p-2 text-white border rounded focus:outline-none resize-none font-mono text-sm
                    ${isValidJson(data.requestBody)
                      ? 'bg-blue-900/30 border-blue-600 focus:border-blue-400'
                      : 'bg-red-900/30 border-red-500 focus:border-red-400'
                    }
                  `}
                />
              </div>
            )}

            {/* Headers */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Headers</label>
              <input
                type="text"
                value={headersInputValue}
                onChange={(e) => setHeadersInputValue(e.target.value)}
                onBlur={(e) => handleChange('headers', parseHeaders(e.target.value))}
                onClick={handleInputClick}
                placeholder="Authorization:Bearer token;Content-Type:application/json"
                className="w-full p-2 bg-purple-900/30 text-white border border-purple-600 rounded focus:border-purple-400 focus:outline-none placeholder-gray-400 font-mono text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </>
  );
}