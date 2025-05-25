import React from 'react';
import './HelpContent.css';

export const OperationGuideContent: React.FC = () => {
  return (
    <div className="help-content">
      <h3>Operation Guide</h3>
      
      <div className="guide-section">
        <h4>Adding Components</h4>
        <ul className="guide-list">
          <li>
            <strong>Drag and Drop:</strong> Drag gates from the left sidebar onto the canvas
          </li>
          <li>
            <strong>Positioning:</strong> Components snap to grid for neat alignment
          </li>
          <li>
            <strong>Input/Output:</strong> Add switches for inputs and LEDs for outputs
          </li>
        </ul>
      </div>

      <div className="guide-section">
        <h4>Creating Connections</h4>
        <ul className="guide-list">
          <li>
            <strong>Start Connection:</strong> Click on an output port (right side of gate)
          </li>
          <li>
            <strong>Complete Connection:</strong> Click on an input port (left side of gate)
          </li>
          <li>
            <strong>Visual Feedback:</strong> Valid ports are highlighted when hovering
          </li>
          <li>
            <strong>Wire Colors:</strong> Green = high (1), Gray = low (0), Red = error
          </li>
        </ul>
      </div>

      <div className="guide-section">
        <h4>Component Selection</h4>
        <ul className="guide-list">
          <li>
            <strong>Single Select:</strong> Click on a component to select it
          </li>
          <li>
            <strong>Multi-Select:</strong> Hold Ctrl/Cmd and click multiple components
          </li>
          <li>
            <strong>Area Select:</strong> Click and drag to select multiple components
          </li>
          <li>
            <strong>Select All:</strong> Press Ctrl/Cmd + A
          </li>
        </ul>
      </div>

      <div className="guide-section">
        <h4>Editing Operations</h4>
        <ul className="guide-list">
          <li>
            <strong>Move:</strong> Drag selected components to new position
          </li>
          <li>
            <strong>Delete:</strong> Press Delete key or use toolbar button
          </li>
          <li>
            <strong>Copy:</strong> Ctrl/Cmd + C to copy selected components
          </li>
          <li>
            <strong>Paste:</strong> Ctrl/Cmd + V to paste at mouse position
          </li>
          <li>
            <strong>Undo/Redo:</strong> Ctrl/Cmd + Z / Ctrl/Cmd + Shift + Z
          </li>
        </ul>
      </div>

      <div className="guide-section">
        <h4>Circuit Testing</h4>
        <ul className="guide-list">
          <li>
            <strong>Toggle Switches:</strong> Click on input switches to change their state
          </li>
          <li>
            <strong>Observe Outputs:</strong> Watch LED indicators change color
          </li>
          <li>
            <strong>Signal Flow:</strong> Wires show signal propagation in real-time
          </li>
          <li>
            <strong>Truth Table:</strong> Generate truth table from Tools menu
          </li>
        </ul>
      </div>

      <div className="guide-section">
        <h4>Keyboard Shortcuts</h4>
        <table className="shortcuts-table">
          <tbody>
            <tr>
              <td><kbd>Ctrl</kbd>+<kbd>A</kbd></td>
              <td>Select All</td>
            </tr>
            <tr>
              <td><kbd>Ctrl</kbd>+<kbd>C</kbd></td>
              <td>Copy</td>
            </tr>
            <tr>
              <td><kbd>Ctrl</kbd>+<kbd>V</kbd></td>
              <td>Paste</td>
            </tr>
            <tr>
              <td><kbd>Ctrl</kbd>+<kbd>Z</kbd></td>
              <td>Undo</td>
            </tr>
            <tr>
              <td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd></td>
              <td>Redo</td>
            </tr>
            <tr>
              <td><kbd>Delete</kbd></td>
              <td>Delete Selected</td>
            </tr>
            <tr>
              <td><kbd>Escape</kbd></td>
              <td>Cancel Operation</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="guide-section">
        <h4>Tips & Tricks</h4>
        <ul className="guide-list">
          <li>
            <strong>Grid Snap:</strong> Components automatically align to grid
          </li>
          <li>
            <strong>Connection Preview:</strong> See wire preview while connecting
          </li>
          <li>
            <strong>Error Detection:</strong> Invalid connections are shown in red
          </li>
          <li>
            <strong>Auto-Save:</strong> Circuit is saved to browser storage automatically
          </li>
        </ul>
      </div>
    </div>
  );
};