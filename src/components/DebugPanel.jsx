import React from 'react';

const DebugPanel = ({ gates, connections, draggedConnection, simulation }) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-md text-xs font-mono">
      <h3 className="text-sm font-bold mb-2">Debug Info</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Gates:</strong> {gates.length}
          <pre className="mt-1 text-green-400">
            {gates.map(g => `${g.type}(${g.id})`).join(', ')}
          </pre>
        </div>
        
        <div>
          <strong>Connections:</strong> {connections.length}
          <pre className="mt-1 text-blue-400">
            {connections.map(c => `${c.from}→${c.to}`).join('\n')}
          </pre>
        </div>
        
        <div>
          <strong>Dragging:</strong> {draggedConnection ? 'Yes' : 'No'}
          {draggedConnection && (
            <pre className="mt-1 text-yellow-400">
              From: {draggedConnection.from}
            </pre>
          )}
        </div>
        
        <div>
          <strong>Simulation:</strong>
          <pre className="mt-1 text-purple-400">
            {JSON.stringify(simulation, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;