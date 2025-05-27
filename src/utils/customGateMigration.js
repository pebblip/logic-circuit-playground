/**
 * Migration utility to fix existing custom gates that were saved without INPUT/OUTPUT gates
 */

import { getCustomGates } from './circuitStorage';

/**
 * Checks if a custom gate needs migration (missing INPUT/OUTPUT gates)
 */
export const needsMigration = (customGate) => {
  if (!customGate || !customGate.circuit || !customGate.circuit.gates) {
    return false;
  }
  
  const hasInputGates = customGate.circuit.gates.some(g => g.type === 'INPUT');
  const hasOutputGates = customGate.circuit.gates.some(g => g.type === 'OUTPUT');
  
  // If it has no INPUT or OUTPUT gates but has input/output definitions, it needs migration
  return !hasInputGates && !hasOutputGates && 
         customGate.inputs && customGate.inputs.length > 0 &&
         customGate.outputs && customGate.outputs.length > 0;
};

/**
 * Migrates a custom gate by reconstructing INPUT and OUTPUT gates
 */
export const migrateCustomGate = (customGate) => {
  if (!needsMigration(customGate)) {
    return customGate;
  }
  
  const migratedGate = { ...customGate };
  const newGates = [...customGate.circuit.gates];
  
  // Add INPUT gates based on input definitions
  customGate.inputs.forEach((input, index) => {
    newGates.push({
      id: input.id,
      type: 'INPUT',
      x: 100,
      y: 100 + (index * 100),
      value: false
    });
  });
  
  // Add OUTPUT gates based on output definitions
  customGate.outputs.forEach((output, index) => {
    newGates.push({
      id: output.id,
      type: 'OUTPUT',
      x: 500,
      y: 100 + (index * 100)
    });
  });
  
  migratedGate.circuit = {
    ...customGate.circuit,
    gates: newGates
  };
  
  return migratedGate;
};

/**
 * Migrates all custom gates in localStorage
 */
export const migrateAllCustomGates = () => {
  try {
    const customGates = getCustomGates();
    let migrationNeeded = false;
    const migratedGates = {};
    
    Object.entries(customGates).forEach(([name, gate]) => {
      if (needsMigration(gate)) {
        console.log(`Migrating custom gate: ${name}`);
        migratedGates[name] = migrateCustomGate(gate);
        migrationNeeded = true;
      } else {
        migratedGates[name] = gate;
      }
    });
    
    if (migrationNeeded) {
      localStorage.setItem('logicPlayground_customGates', JSON.stringify(migratedGates));
      console.log('Custom gates migration completed');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to migrate custom gates:', error);
    return false;
  }
};