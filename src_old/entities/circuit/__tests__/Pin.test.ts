import { describe, it, expect } from 'vitest';
import { Pin } from '../Pin';
import { PinType } from '@/entities/types/common';

describe('Pin', () => {
  describe('定数', () => {
    it('VISUAL_RADIUSが4である', () => {
      expect(Pin.VISUAL_RADIUS).toBe(4);
    });

    it('HIT_RADIUSが12である', () => {
      expect(Pin.HIT_RADIUS).toBe(12);
    });

    it('HIT_RADIUSがVISUAL_RADIUSの3倍である', () => {
      expect(Pin.HIT_RADIUS).toBe(Pin.VISUAL_RADIUS * 3);
    });
  });

  describe('基本機能', () => {
    it('ピンを作成できる', () => {
      const pin = new Pin('pin1', 'Input1', PinType.INPUT, { x: 0, y: 0 });
      
      expect(pin.id).toBe('pin1');
      expect(pin.name).toBe('Input1');
      expect(pin.type).toBe(PinType.INPUT);
      expect(pin.position).toEqual({ x: 0, y: 0 });
      expect(pin.value).toBe(false);
      expect(pin.connected).toBe(false);
    });
  });
});