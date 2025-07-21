'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import APINode from './APINode';
import NodePalette from './NodePalette';
import { Step } from '@/lib/generateCode';

const nodeTypes = {
  apiNode: APINode,
};

interface FlowBuilderProps {
  onUpdate: (steps: Step[]) => void;
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'apiNode',
    position: { x: 100, y: 200 },
    data: {
      method: 'POST',
      url: '/oauth/token',
      expectStatusOk: true,
      expectArrayNotEmpty: false,
      saveResponseAs: 'authToken',
      requestBody: '{\n  "grant_type": "client_credentials",\n  "client_id": "your_client_id",\n  "client_secret": "your_client_secret"\n}',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      onChange: () => {},
      onDelete: () => {},
    },
  },
  {
    id: '2',
    type: 'apiNode',
    position: { x: 500, y: 200 },
    data: {
      method: 'GET',
      url: '/users',
      expectStatusOk: true,
      expectArrayNotEmpty: true,
      saveResponseAs: 'userData',
      requestBody: '',
      headers: {
        'Authorization': 'Bearer ${authToken.access_token}',
        'Accept': 'application/json'
      },
      onChange: () => {},
      onDelete: () => {},
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    animated: true,
    style: {
      stroke: '#3b82f6',
      strokeWidth: 2,
    },
    markerEnd: {
      type: 'arrowclosed',
      color: '#3b82f6',
    },
  },
];

export default function FlowBuilder({ onUpdate }: FlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('https://api.example.com');

  const onConnect = useCallback((params: Connection) => {
    const newEdge = {
      ...params,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: '#3b82f6',
        strokeWidth: 2,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#3b82f6',
      },
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  const handleNodeDataChange = useCallback((nodeId: string, newData: Partial<Node['data']>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [setNodes]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, selectedNode]);

  // Update nodes with onChange and onDelete handlers
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onChange: handleNodeDataChange,
          ...(node.type === 'apiNode' ? { onDelete: handleNodeDelete } : {}),
        },
      }))
    );
  }, [handleNodeDataChange, handleNodeDelete, setNodes]);

  // Convert nodes to steps and update parent
  useEffect(() => {
    const steps: Step[] = nodes.map((node) => ({
      method: node.data.method,
      url: node.data.url,
      expectStatusOk: node.data.expectStatusOk,
      expectArrayNotEmpty: node.data.expectArrayNotEmpty,
      saveResponseAs: node.data.saveResponseAs,
      requestBody: node.data.requestBody,
      headers: node.data.headers,
      baseUrl: baseUrl,
    }));
    onUpdate(steps);
  }, [nodes, baseUrl, onUpdate]);

  const addNewNode = useCallback((type: string, position?: { x: number; y: number }) => {
    // Determine method based on node type
    let method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET';
    let defaultHeaders: Record<string, string> = {};
    
    switch (type) {
      case 'get-api':
        method = 'GET';
        break;
      case 'post-api':
        method = 'POST';
        defaultHeaders = { 'Content-Type': 'application/json' };
        break;
      case 'put-api':
        method = 'PUT';
        defaultHeaders = { 'Content-Type': 'application/json' };
        break;
      case 'delete-api':
        method = 'DELETE';
        break;
      default:
        method = 'GET';
    }

    // Calculate position to the right of the rightmost node
    let newPosition = position;
    let rightmostNode = null;
    
    if (!position) {
      if (nodes.length > 0) {
        // Find the rightmost node
        rightmostNode = nodes.reduce((rightmost, node) => 
          node.position.x > rightmost.position.x ? node : rightmost
        );
        newPosition = { 
          x: rightmostNode.position.x + 450, // Space between nodes (400px node width + 50px gap)
          y: 200 // Keep consistent Y position
        };
      } else {
        newPosition = { x: 100, y: 200 };
      }
    }

    const newNodeId = `${nodes.length + 1}`;
    const newNode: Node = {
      id: newNodeId,
      type: 'apiNode',
      position: newPosition,
      data: {
        method,
        url: '',
        expectStatusOk: true,
        expectArrayNotEmpty: false,
        saveResponseAs: '',
        requestBody: '',
        headers: defaultHeaders,
        onChange: handleNodeDataChange,
        onDelete: handleNodeDelete,
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    // Auto-connect to the rightmost node if it exists
    if (rightmostNode) {
      const newEdge = {
        id: `e${rightmostNode.id}-${newNodeId}`,
        source: rightmostNode.id,
        target: newNodeId,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: '#3b82f6',
          strokeWidth: 2,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#3b82f6',
        },
      };
      setEdges((eds) => [...eds, newEdge]);
    }
  }, [nodes, handleNodeDataChange, handleNodeDelete, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Get saved variables from previous steps for a specific node
  const getSavedVariablesForNode = useCallback((nodeId: string) => {
    const nodeIndex = nodes.findIndex(node => node.id === nodeId);
    if (nodeIndex <= 0) return []; // First node or not found
    
    return nodes
      .slice(0, nodeIndex)
      .map(node => node.data.saveResponseAs)
      .filter((name): name is string => !!name && name.trim() !== '');
  }, [nodes]);

  return (
    <div className="h-full w-full flex">
      {/* Node Palette Sidebar */}
      <div className="w-64 bg-gray-850 border-r border-gray-700 p-4">
        <NodePalette onAddNode={addNewNode} />
      </div>

      {/* Main Flow Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Base URL Header */}
        <div className="bg-purple-900/20 border-b border-purple-600/30 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
              <label className="text-sm font-medium text-purple-300">Base URL</label>
            </div>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="flex-1 max-w-md p-2 text-white border rounded-lg focus:outline-none transition-all
                placeholder-purple-400 font-mono text-sm
                bg-purple-800/30 border-purple-600 focus:border-purple-400 focus:bg-purple-700/30"
            />
            <div className="text-xs text-purple-300">
              💡 All relative paths use this base URL
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              savedVariables: getSavedVariablesForNode(node.id),
              isSelected: node.id === selectedNode,
            }
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          className="bg-gray-900"
          defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
          minZoom={0.25}
          maxZoom={2}
          fitView={false}
          panOnScroll={true}
          panOnScrollSpeed={0.5}
          panOnDrag={true}
          selectionOnDrag={false}
          multiSelectionKeyCode="Meta"
          deleteKeyCode="Delete"
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1}
            color="#374151"
          />
          <Controls 
            className="bg-gray-800 border-gray-600 text-white [&>button]:bg-gray-700 [&>button]:border-gray-600 [&>button:hover]:bg-gray-600"
          />
        </ReactFlow>

          {/* Floating Action Button */}
          <button
            onClick={() => addNewNode('api')}
            className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center text-white text-2xl font-bold z-10"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}