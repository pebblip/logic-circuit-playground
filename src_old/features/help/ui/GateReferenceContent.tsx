import React from 'react';
import './HelpContent.css';

export const GateReferenceContent: React.FC = () => {
  return (
    <div className="help-content">
      <h3>Logic Gate Reference</h3>
      
      <div className="gate-section">
        <h4>Basic Gates</h4>
        
        <div className="gate-item">
          <div className="gate-header">
            <span className="gate-name">AND Gate</span>
            <span className="gate-symbol">∧</span>
          </div>
          <p className="gate-description">
            Outputs 1 only when all inputs are 1.
          </p>
          <table className="truth-table">
            <thead>
              <tr>
                <th>A</th>
                <th>B</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>0</td><td>0</td><td>0</td></tr>
              <tr><td>0</td><td>1</td><td>0</td></tr>
              <tr><td>1</td><td>0</td><td>0</td></tr>
              <tr><td>1</td><td>1</td><td>1</td></tr>
            </tbody>
          </table>
        </div>

        <div className="gate-item">
          <div className="gate-header">
            <span className="gate-name">OR Gate</span>
            <span className="gate-symbol">∨</span>
          </div>
          <p className="gate-description">
            Outputs 1 when at least one input is 1.
          </p>
          <table className="truth-table">
            <thead>
              <tr>
                <th>A</th>
                <th>B</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>0</td><td>0</td><td>0</td></tr>
              <tr><td>0</td><td>1</td><td>1</td></tr>
              <tr><td>1</td><td>0</td><td>1</td></tr>
              <tr><td>1</td><td>1</td><td>1</td></tr>
            </tbody>
          </table>
        </div>

        <div className="gate-item">
          <div className="gate-header">
            <span className="gate-name">NOT Gate</span>
            <span className="gate-symbol">¬</span>
          </div>
          <p className="gate-description">
            Inverts the input signal.
          </p>
          <table className="truth-table">
            <thead>
              <tr>
                <th>Input</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>0</td><td>1</td></tr>
              <tr><td>1</td><td>0</td></tr>
            </tbody>
          </table>
        </div>

        <div className="gate-item">
          <div className="gate-header">
            <span className="gate-name">XOR Gate</span>
            <span className="gate-symbol">⊕</span>
          </div>
          <p className="gate-description">
            Outputs 1 when inputs are different.
          </p>
          <table className="truth-table">
            <thead>
              <tr>
                <th>A</th>
                <th>B</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>0</td><td>0</td><td>0</td></tr>
              <tr><td>0</td><td>1</td><td>1</td></tr>
              <tr><td>1</td><td>0</td><td>1</td></tr>
              <tr><td>1</td><td>1</td><td>0</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="gate-section">
        <h4>Compound Gates</h4>
        
        <div className="gate-item">
          <div className="gate-header">
            <span className="gate-name">NAND Gate</span>
            <span className="gate-symbol">¬∧</span>
          </div>
          <p className="gate-description">
            NOT AND - Outputs 0 only when all inputs are 1.
          </p>
          <table className="truth-table">
            <thead>
              <tr>
                <th>A</th>
                <th>B</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>0</td><td>0</td><td>1</td></tr>
              <tr><td>0</td><td>1</td><td>1</td></tr>
              <tr><td>1</td><td>0</td><td>1</td></tr>
              <tr><td>1</td><td>1</td><td>0</td></tr>
            </tbody>
          </table>
        </div>

        <div className="gate-item">
          <div className="gate-header">
            <span className="gate-name">NOR Gate</span>
            <span className="gate-symbol">¬∨</span>
          </div>
          <p className="gate-description">
            NOT OR - Outputs 1 only when all inputs are 0.
          </p>
          <table className="truth-table">
            <thead>
              <tr>
                <th>A</th>
                <th>B</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>0</td><td>0</td><td>1</td></tr>
              <tr><td>0</td><td>1</td><td>0</td></tr>
              <tr><td>1</td><td>0</td><td>0</td></tr>
              <tr><td>1</td><td>1</td><td>0</td></tr>
            </tbody>
          </table>
        </div>

        <div className="gate-item">
          <div className="gate-header">
            <span className="gate-name">XNOR Gate</span>
            <span className="gate-symbol">¬⊕</span>
          </div>
          <p className="gate-description">
            NOT XOR - Outputs 1 when inputs are the same.
          </p>
          <table className="truth-table">
            <thead>
              <tr>
                <th>A</th>
                <th>B</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>0</td><td>0</td><td>1</td></tr>
              <tr><td>0</td><td>1</td><td>0</td></tr>
              <tr><td>1</td><td>0</td><td>0</td></tr>
              <tr><td>1</td><td>1</td><td>1</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="gate-section">
        <h4>Special Components</h4>
        
        <div className="gate-item">
          <div className="gate-header">
            <span className="gate-name">Buffer</span>
          </div>
          <p className="gate-description">
            Passes the input signal through unchanged. Used for signal routing and delay.
          </p>
        </div>

        <div className="gate-item">
          <div className="gate-header">
            <span className="gate-name">Input Switch</span>
          </div>
          <p className="gate-description">
            Provides a manual input signal (0 or 1) that can be toggled by clicking.
          </p>
        </div>

        <div className="gate-item">
          <div className="gate-header">
            <span className="gate-name">Output LED</span>
          </div>
          <p className="gate-description">
            Displays the state of a signal. Green for 1 (high), gray for 0 (low).
          </p>
        </div>
      </div>
    </div>
  );
};