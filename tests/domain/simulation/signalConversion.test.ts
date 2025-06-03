import { describe, it, expect, vi } from 'vitest';
import {
  booleanToDisplayState,
  displayStateToBoolean,
  booleanArrayToDisplayStates,
  displayStatesToBooleanArray,
  getGateInputValue,
  setGateInputValue,
  getGateInputsAsBoolean,
  debugSignal
} from '../../../src/domain/simulation/signalConversion';

describe('signalConversion', () => {
  describe('booleanToDisplayState', () => {
    it('converts true to "1"', () => {
      expect(booleanToDisplayState(true)).toBe('1');
    });

    it('converts false to empty string', () => {
      expect(booleanToDisplayState(false)).toBe('');
    });
  });

  describe('displayStateToBoolean', () => {
    it('converts "1" to true', () => {
      expect(displayStateToBoolean('1')).toBe(true);
    });

    it('converts empty string to false', () => {
      expect(displayStateToBoolean('')).toBe(false);
    });

    it('converts any other string to false', () => {
      expect(displayStateToBoolean('0')).toBe(false);
      expect(displayStateToBoolean('true')).toBe(false);
      expect(displayStateToBoolean('false')).toBe(false);
      expect(displayStateToBoolean('invalid')).toBe(false);
      expect(displayStateToBoolean(' ')).toBe(false);
    });
  });

  describe('booleanArrayToDisplayStates', () => {
    it('converts empty array', () => {
      expect(booleanArrayToDisplayStates([])).toEqual([]);
    });

    it('converts single element array', () => {
      expect(booleanArrayToDisplayStates([true])).toEqual(['1']);
      expect(booleanArrayToDisplayStates([false])).toEqual(['']);
    });

    it('converts mixed boolean array', () => {
      expect(booleanArrayToDisplayStates([true, false, true])).toEqual(['1', '', '1']);
    });

    it('converts array of all true values', () => {
      expect(booleanArrayToDisplayStates([true, true, true])).toEqual(['1', '1', '1']);
    });

    it('converts array of all false values', () => {
      expect(booleanArrayToDisplayStates([false, false, false])).toEqual(['', '', '']);
    });
  });

  describe('displayStatesToBooleanArray', () => {
    it('converts empty array', () => {
      expect(displayStatesToBooleanArray([])).toEqual([]);
    });

    it('converts single element array', () => {
      expect(displayStatesToBooleanArray(['1'])).toEqual([true]);
      expect(displayStatesToBooleanArray([''])).toEqual([false]);
    });

    it('converts mixed string array', () => {
      expect(displayStatesToBooleanArray(['1', '', '1'])).toEqual([true, false, true]);
    });

    it('converts array with invalid values', () => {
      expect(displayStatesToBooleanArray(['1', '0', 'invalid', ''])).toEqual([true, false, false, false]);
    });

    it('converts array of all "1" values', () => {
      expect(displayStatesToBooleanArray(['1', '1', '1'])).toEqual([true, true, true]);
    });

    it('converts array of all empty values', () => {
      expect(displayStatesToBooleanArray(['', '', ''])).toEqual([false, false, false]);
    });
  });

  describe('getGateInputValue', () => {
    it('handles boolean input correctly', () => {
      const gate = { inputs: [true, false] };
      expect(getGateInputValue(gate, 0)).toBe(true);
      expect(getGateInputValue(gate, 1)).toBe(false);
    });

    it('handles string input correctly', () => {
      const gate = { inputs: ['1', ''] };
      expect(getGateInputValue(gate, 0)).toBe(true);
      expect(getGateInputValue(gate, 1)).toBe(false);
    });

    it('handles mixed input types', () => {
      const gate = { inputs: [true, '', '1', false] };
      expect(getGateInputValue(gate, 0)).toBe(true);
      expect(getGateInputValue(gate, 1)).toBe(false);
      expect(getGateInputValue(gate, 2)).toBe(true);
      expect(getGateInputValue(gate, 3)).toBe(false);
    });

    it('handles invalid string inputs', () => {
      const gate = { inputs: ['0', 'invalid', 'true'] };
      expect(getGateInputValue(gate, 0)).toBe(false);
      expect(getGateInputValue(gate, 1)).toBe(false);
      expect(getGateInputValue(gate, 2)).toBe(false);
    });
  });

  describe('setGateInputValue', () => {
    it('sets boolean value as string', () => {
      const gate = { inputs: ['', ''] };
      setGateInputValue(gate, 0, true);
      setGateInputValue(gate, 1, false);
      
      expect(gate.inputs[0]).toBe('1');
      expect(gate.inputs[1]).toBe('');
    });

    it('overwrites existing values', () => {
      const gate = { inputs: [true, false, '1', ''] };
      setGateInputValue(gate, 0, false);
      setGateInputValue(gate, 1, true);
      setGateInputValue(gate, 2, false);
      setGateInputValue(gate, 3, true);
      
      expect(gate.inputs[0]).toBe('');
      expect(gate.inputs[1]).toBe('1');
      expect(gate.inputs[2]).toBe('');
      expect(gate.inputs[3]).toBe('1');
    });

    it('handles out of bounds index gracefully', () => {
      const gate = { inputs: [''] };
      // This should not throw, but may add undefined slots
      setGateInputValue(gate, 5, true);
      expect(gate.inputs[5]).toBe('1');
      expect(gate.inputs.length).toBe(6);
    });
  });

  describe('getGateInputsAsBoolean', () => {
    it('handles empty inputs', () => {
      const gate = { inputs: [] };
      expect(getGateInputsAsBoolean(gate)).toEqual([]);
    });

    it('converts all boolean inputs', () => {
      const gate = { inputs: [true, false, true] };
      expect(getGateInputsAsBoolean(gate)).toEqual([true, false, true]);
    });

    it('converts all string inputs', () => {
      const gate = { inputs: ['1', '', '1'] };
      expect(getGateInputsAsBoolean(gate)).toEqual([true, false, true]);
    });

    it('converts mixed input types', () => {
      const gate = { inputs: [true, '', '1', false] };
      expect(getGateInputsAsBoolean(gate)).toEqual([true, false, true, false]);
    });

    it('handles invalid string inputs', () => {
      const gate = { inputs: ['1', '0', 'invalid', true, false] };
      expect(getGateInputsAsBoolean(gate)).toEqual([true, false, false, true, false]);
    });
  });

  describe('debugSignal', () => {
    it('logs signal information for boolean values', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      debugSignal(true, 'test-context');
      
      expect(consoleSpy).toHaveBeenCalledWith('[Signal Debug] test-context:', {
        value: true,
        type: 'boolean',
        isBoolean: true,
        isString: false,
        booleanValue: true
      });

      consoleSpy.mockRestore();
    });

    it('logs signal information for string values', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      debugSignal('1', 'test-string');
      
      expect(consoleSpy).toHaveBeenCalledWith('[Signal Debug] test-string:', {
        value: '1',
        type: 'string',
        isBoolean: false,
        isString: true,
        booleanValue: true
      });

      consoleSpy.mockRestore();
    });

    it('logs signal information for other types', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      debugSignal(null, 'test-null');
      
      expect(consoleSpy).toHaveBeenCalledWith('[Signal Debug] test-null:', {
        value: null,
        type: 'object',
        isBoolean: false,
        isString: false,
        booleanValue: null
      });

      consoleSpy.mockRestore();
    });
  });

  describe('round-trip conversions', () => {
    describe('boolean → string → boolean', () => {
      it('preserves true value', () => {
        const original = true;
        const converted = displayStateToBoolean(booleanToDisplayState(original));
        expect(converted).toBe(original);
      });

      it('preserves false value', () => {
        const original = false;
        const converted = displayStateToBoolean(booleanToDisplayState(original));
        expect(converted).toBe(original);
      });
    });

    describe('string → boolean → string', () => {
      it('preserves "1" value', () => {
        const original = '1';
        const converted = booleanToDisplayState(displayStateToBoolean(original));
        expect(converted).toBe(original);
      });

      it('preserves empty string value', () => {
        const original = '';
        const converted = booleanToDisplayState(displayStateToBoolean(original));
        expect(converted).toBe(original);
      });

      it('normalizes invalid strings to empty string', () => {
        const invalid = '0';
        const converted = booleanToDisplayState(displayStateToBoolean(invalid));
        expect(converted).toBe(''); // normalized
      });
    });

    describe('array round-trip conversions', () => {
      it('preserves boolean array through string conversion', () => {
        const original = [true, false, true, false];
        const converted = displayStatesToBooleanArray(booleanArrayToDisplayStates(original));
        expect(converted).toEqual(original);
      });

      it('preserves valid string array through boolean conversion', () => {
        const original = ['1', '', '1', ''];
        const converted = booleanArrayToDisplayStates(displayStatesToBooleanArray(original));
        expect(converted).toEqual(original);
      });

      it('normalizes invalid string array', () => {
        const original = ['1', '0', 'invalid', ''];
        const converted = booleanArrayToDisplayStates(displayStatesToBooleanArray(original));
        expect(converted).toEqual(['1', '', '', '']); // normalized
      });
    });
  });

  describe('edge cases', () => {
    describe('null and undefined handling', () => {
      it('handles undefined in gate inputs', () => {
        const gate = { inputs: [undefined as any, null as any] };
        expect(getGateInputValue(gate, 0)).toBe(false);
        expect(getGateInputValue(gate, 1)).toBe(false);
      });

      it('handles getGateInputsAsBoolean with undefined/null', () => {
        const gate = { inputs: [undefined as any, null as any, true, '1'] };
        const result = getGateInputsAsBoolean(gate);
        expect(result).toEqual([false, false, true, true]);
      });
    });

    describe('type coercion edge cases', () => {
      it('handles numeric values in displayStateToBoolean', () => {
        expect(displayStateToBoolean('0' as string)).toBe(false);
        expect(displayStateToBoolean('1.0' as string)).toBe(false);
        expect(displayStateToBoolean('10' as string)).toBe(false);
      });

      it('handles whitespace in displayStateToBoolean', () => {
        expect(displayStateToBoolean(' 1 ')).toBe(false);
        expect(displayStateToBoolean('\t1\n')).toBe(false);
        expect(displayStateToBoolean('  ')).toBe(false);
      });
    });

    describe('performance with large arrays', () => {
      it('handles large boolean arrays efficiently', () => {
        const largeArray = new Array(1000).fill(true);
        const converted = booleanArrayToDisplayStates(largeArray);
        expect(converted).toHaveLength(1000);
        expect(converted.every(val => val === '1')).toBe(true);
      });

      it('handles large string arrays efficiently', () => {
        const largeArray = new Array(1000).fill('1');
        const converted = displayStatesToBooleanArray(largeArray);
        expect(converted).toHaveLength(1000);
        expect(converted.every(val => val === true)).toBe(true);
      });
    });

    describe('mixed type scenarios during migration', () => {
      it('handles gates with partially migrated inputs', () => {
        // Simulates a gate during migration where some inputs are boolean, some are string
        const gate = {
          inputs: [
            true,      // new boolean format
            '1',       // old string format (true)
            false,     // new boolean format
            '',        // old string format (false)
            'invalid', // corrupted data
            undefined  // missing data
          ] as (string | boolean)[]
        };

        const booleanInputs = getGateInputsAsBoolean(gate);
        expect(booleanInputs).toEqual([true, true, false, false, false, false]);

        // Test individual access
        expect(getGateInputValue(gate, 0)).toBe(true);
        expect(getGateInputValue(gate, 1)).toBe(true);
        expect(getGateInputValue(gate, 2)).toBe(false);
        expect(getGateInputValue(gate, 3)).toBe(false);
        expect(getGateInputValue(gate, 4)).toBe(false);
        expect(getGateInputValue(gate, 5)).toBe(false);
      });

      it('allows safe updates during migration', () => {
        const gate = {
          inputs: [true, '', '1', false] as (string | boolean)[]
        };

        // Update all to consistent format
        setGateInputValue(gate, 0, true);
        setGateInputValue(gate, 1, false);
        setGateInputValue(gate, 2, true);
        setGateInputValue(gate, 3, false);

        // All should now be strings
        expect(gate.inputs).toEqual(['1', '', '1', '']);
        expect(gate.inputs.every(input => typeof input === 'string')).toBe(true);
      });
    });
  });
});