import React from 'react';
import { BaseGate } from '../../../entities/gates/BaseGate';

interface DebugGateProps {
  gate: BaseGate;
}

export const DebugGate: React.FC<DebugGateProps> = ({ gate }) => {
  return (
    <div style={{ 
      position: 'absolute', 
      top: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: 10,
      fontSize: 12,
      fontFamily: 'monospace',
      zIndex: 1000,
      maxWidth: 300
    }}>
      <h4>Gate Debug Info</h4>
      <pre>{JSON.stringify({
        id: gate.id,
        type: gate.type,
        inputPins: gate.inputPins?.length || 0,
        outputPins: gate.outputPins?.length || 0,
        position: gate.position,
        inputs: gate.inputPins?.map(pin => ({ id: pin.id, value: pin.value })),
        outputs: gate.outputPins?.map(pin => ({ id: pin.id, value: pin.value }))
      }, null, 2)}</pre>
    </div>
  );
};