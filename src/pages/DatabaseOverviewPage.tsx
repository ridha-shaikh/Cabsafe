import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Handle,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import PageContainer from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';

const TableNode = ({ data }: { data: { label: string; columns: { name: string; type: string; pk?: boolean; fk?: boolean }[] } }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm min-w-[200px] text-sm">
      <div className="bg-primary-50 px-3 py-2 border-b border-gray-300 rounded-t-lg font-bold text-primary-900 flex justify-between items-center">
        {data.label}
        <Handle type="target" position={Position.Top} className="w-2 h-2 bg-primary-500" />
      </div>
      <div className="p-2 space-y-1">
        {data.columns.map((col, idx) => (
          <div key={idx} className="flex justify-between items-center text-xs">
            <span className="font-medium text-gray-700">
              {col.pk && <span className="text-yellow-600 mr-1" title="Primary Key">🔑</span>}
              {col.fk && <span className="text-gray-400 mr-1" title="Foreign Key">🔗</span>}
              {col.name}
            </span>
            <span className="text-gray-500 font-mono text-[10px]">{col.type}</span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-primary-500" />
    </div>
  );
};

const nodeTypes = {
  tableNode: TableNode,
};

const initialNodes: Node[] = [
  {
    id: 'users',
    type: 'tableNode',
    position: { x: 400, y: 50 },
    data: {
      label: 'Users',
      columns: [
        { name: 'user_id', type: 'UUID', pk: true },
        { name: 'email', type: 'VARCHAR' },
        { name: 'role', type: 'ENUM' },
      ],
    },
  },
  {
    id: 'drivers',
    type: 'tableNode',
    position: { x: 200, y: 250 },
    data: {
      label: 'Drivers',
      columns: [
        { name: 'driver_id', type: 'UUID', pk: true },
        { name: 'user_id', type: 'UUID', fk: true },
        { name: 'license_no', type: 'VARCHAR' },
        { name: 'assigned_cab_id', type: 'UUID', fk: true },
      ],
    },
  },
  {
    id: 'passengers',
    type: 'tableNode',
    position: { x: 600, y: 250 },
    data: {
      label: 'Passengers',
      columns: [
        { name: 'passenger_id', type: 'UUID', pk: true },
        { name: 'user_id', type: 'UUID', fk: true },
      ],
    },
  },
  {
    id: 'cabs',
    type: 'tableNode',
    position: { x: 0, y: 450 },
    data: {
      label: 'Cabs',
      columns: [
        { name: 'cab_id', type: 'UUID', pk: true },
        { name: 'reg_no', type: 'VARCHAR' },
        { name: 'status', type: 'ENUM' },
      ],
    },
  },
  {
    id: 'bookings',
    type: 'tableNode',
    position: { x: 600, y: 450 },
    data: {
      label: 'Bookings',
      columns: [
        { name: 'booking_id', type: 'UUID', pk: true },
        { name: 'passenger_id', type: 'UUID', fk: true },
        { name: 'status', type: 'ENUM' },
      ],
    },
  },
  {
    id: 'trips',
    type: 'tableNode',
    position: { x: 300, y: 650 },
    data: {
      label: 'Trips',
      columns: [
        { name: 'trip_id', type: 'UUID', pk: true },
        { name: 'booking_id', type: 'UUID', fk: true },
        { name: 'cab_id', type: 'UUID', fk: true },
        { name: 'driver_id', type: 'UUID', fk: true },
      ],
    },
  },
  {
    id: 'telemetry',
    type: 'tableNode',
    position: { x: 0, y: 850 },
    data: {
      label: 'Telemetry',
      columns: [
        { name: 'telemetry_id', type: 'UUID', pk: true },
        { name: 'cab_id', type: 'UUID', fk: true },
        { name: 'speed', type: 'FLOAT' },
      ],
    },
  },
  {
    id: 'events',
    type: 'tableNode',
    position: { x: 300, y: 850 },
    data: {
      label: 'Driver_Events',
      columns: [
        { name: 'event_id', type: 'UUID', pk: true },
        { name: 'cab_id', type: 'UUID', fk: true },
        { name: 'driver_id', type: 'UUID', fk: true },
      ],
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'users', target: 'drivers', markerEnd: { type: MarkerType.ArrowClosed }, animated: true },
  { id: 'e2', source: 'users', target: 'passengers', markerEnd: { type: MarkerType.ArrowClosed }, animated: true },
  { id: 'e3', source: 'cabs', target: 'drivers', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e4', source: 'passengers', target: 'bookings', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e5', source: 'bookings', target: 'trips', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e6', source: 'cabs', target: 'trips', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e7', source: 'drivers', target: 'trips', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e8', source: 'cabs', target: 'telemetry', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e9', source: 'cabs', target: 'events', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e10', source: 'drivers', target: 'events', markerEnd: { type: MarkerType.ArrowClosed } },
];

export default function DatabaseOverviewPage() {
  const nodes = useMemo(() => initialNodes, []);
  const edges = useMemo(() => initialEdges, []);

  return (
    <PageContainer title="Database Schema Overview" description="Interactive Entity-Relationship diagram for CabSafe RDBMS">
      <Card className="h-[800px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#ccc" gap={16} />
          <Controls />
          <MiniMap nodeStrokeColor={(n) => '#3b82f6'} nodeColor={(n) => '#fff'} />
        </ReactFlow>
      </Card>
    </PageContainer>
  );
}
