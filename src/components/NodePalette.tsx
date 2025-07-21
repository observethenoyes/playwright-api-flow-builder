'use client';

import React from 'react';

interface NodePaletteProps {
  onAddNode: (type: string, position?: { x: number; y: number }) => void;
}

const nodeTemplates = [
  {
    id: 'get-api',
    title: 'GET Request',
    description: 'Fetch data from an API endpoint',
    method: 'GET',
    icon: '📥',
    color: 'from-green-500 to-green-600',
    borderColor: 'border-green-500',
  },
  {
    id: 'post-api',
    title: 'POST Request',
    description: 'Create new data via API',
    method: 'POST',
    icon: '📤',
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-500',
  },
  {
    id: 'put-api',
    title: 'PUT Request',
    description: 'Update existing data',
    method: 'PUT',
    icon: '🔄',
    color: 'from-orange-500 to-orange-600',
    borderColor: 'border-orange-500',
  },
  {
    id: 'delete-api',
    title: 'DELETE Request',
    description: 'Remove data from server',
    method: 'DELETE',
    icon: '🗑️',
    color: 'from-red-500 to-red-600',
    borderColor: 'border-red-500',
  },
];

export default function NodePalette({ onAddNode }: NodePaletteProps) {
  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Node Palette</h3>
        <p className="text-sm text-gray-400">Drag nodes to the canvas to build your API flow</p>
      </div>

      <div className="space-y-3">
        {nodeTemplates.map((template) => (
          <div
            key={template.id}
            draggable
            onDragStart={(event) => handleDragStart(event, template.id)}
            onClick={() => onAddNode(template.id)}
            className={`
              p-4 rounded-xl border-2 cursor-move transition-all duration-200
              bg-gradient-to-br from-gray-800 to-gray-850
              hover:from-gray-750 hover:to-gray-800
              border-gray-600 hover:${template.borderColor}
              transform hover:scale-105 hover:shadow-lg
              group
            `}
          >
            <div className="flex items-start space-x-3">
              <div className={`
                w-10 h-10 rounded-lg bg-gradient-to-r ${template.color} 
                flex items-center justify-center text-lg
                group-hover:scale-110 transition-transform
              `}>
                {template.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm mb-1">
                  {template.title}
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {template.description}
                </p>
                <div className={`
                  inline-block mt-2 px-2 py-1 rounded-full text-xs font-bold text-white
                  bg-gradient-to-r ${template.color}
                `}>
                  {template.method}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h4 className="text-white font-medium text-sm mb-2">💡 Quick Tips</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Drag nodes from here to the canvas</li>
          <li>• Connect nodes to create data flow</li>
          <li>• Click nodes to expand details</li>
          <li>• Save responses as variables</li>
        </ul>
      </div>

    </div>
  );
}