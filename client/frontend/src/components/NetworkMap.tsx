import { useState, useCallback, memo } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, NodeProps, Position, Handle, Edge, Background, Controls, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import r2c2Logo from '../assets/images/R2C2.webp'

// We use React.memo for performance optimization
const ImageNode = memo(({ data }: NodeProps<{ name: string, imageUrl: string }>) => {
  return (
    <div style={{
      border: '2px solid #555',
      borderRadius: '8px',
      padding: '10px',
      background: '#fff',
      textAlign: 'center',
      width: 150
    }}>
      {/* Handles are the connection points for edges */}
      {/* Target handle on the left for the central node */}
      <Handle type="target" position={Position.Left} id="left-target" />
      {/* Target handle on the right for the central node */}
      <Handle type="target" position={Position.Right} id="right-target" />

      <img
        src={data.imageUrl}
        alt={data.name}
        style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
      />
      <h4 style={{ margin: '8px 0 0 0', padding: '0' }}>{data.name}</h4>

      {/* Source handle on the left for right-side nodes */}
      <Handle type="source" position={Position.Left} id="left-source" />
      {/* Source handle on the right for left-side nodes */}
      <Handle type="source" position={Position.Right} id="right-source" />
    </div>
  );
});

const initialNodes = [
  {
    id: 'left-1',
    type: 'imageNode',
    data: { name: 'Operator 1', imageUrl: 'https://i.pravatar.cc/150?img=1' },
    position: { x: 50, y: 50 },
  },
  // Center Node
  {
    id: 'center',
    type: 'imageNode',
    data: { name: 'R2C2', imageUrl: r2c2Logo },
    position: { x: 350, y: 150 },
  },
  // Right Nodes
  {
    id: 'right-1',
    type: 'imageNode',
    data: { name: 'PC-ABC123', imageUrl: 'https://i.pravatar.cc/150?img=4' },
    position: { x: 650, y: 50 },
  },
  {
    id: 'right-2',
    type: 'imageNode',
    data: { name: 'PC-CBA321', imageUrl: 'https://i.pravatar.cc/150?img=5' },
    position: { x: 650, y: 250 },
  },
];

const initialEdges: Edge[] = [
  // Connections from left nodes to center
  { id: 'e-left1-center', source: 'left-1', target: 'center', sourceHandle: 'right-source', targetHandle: 'left-target' },
  { id: 'e-left2-center', source: 'left-2', target: 'center', sourceHandle: 'right-source', targetHandle: 'left-target' },
  // Connections from right nodes to center
  { id: 'e-right1-center', source: 'right-1', target: 'center', sourceHandle: 'left-source', targetHandle: 'right-target' },
  { id: 'e-right2-center', source: 'right-2', target: 'center', sourceHandle: 'left-source', targetHandle: 'right-target' },
];

export default function NetworkMap() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const nodeTypes = {
    imageNode: ImageNode,
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          fitView
        />
      </ReactFlowProvider>
    </div>
  );
}
