import { describe, it, expect } from 'vitest';
import { calculateFee } from '../chain';

describe('calculateFee', () => {
  it('should calculate 0.2% fee correctly', () => {
    const amount = 1000000n;
    const bps = 20;
    const fee = calculateFee(amount, bps);
    expect(fee).toBe(200n);
  });

  it('should return 0 if bps is 0', () => {
    const amount = 1000000n;
    const bps = 0;
    const fee = calculateFee(amount, bps);
    expect(fee).toBe(0n);
  });
});
