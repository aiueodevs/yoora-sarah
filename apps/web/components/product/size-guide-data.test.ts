import { describe, expect, it } from 'vitest';

import { recommendSize, sortSizes } from './size-guide-data';

describe('size-guide-data', () => {
  describe('sortSizes', () => {
    it('orders known sizes from smallest to largest', () => {
      expect(sortSizes(['XL', 'S', 'L', 'M'])).toEqual(['S', 'M', 'L', 'XL']);
    });

    it('returns a new array without mutating the input', () => {
      const sizes = ['L', 'S', 'M'];

      const sorted = sortSizes(sizes);

      expect(sorted).toEqual(['S', 'M', 'L']);
      expect(sizes).toEqual(['L', 'S', 'M']);
    });
  });

  describe('recommendSize', () => {
    it('picks XL when the shopper crosses the high-size thresholds', () => {
      expect(recommendSize(171, 60, ['S', 'M', 'L', 'XL'])).toBe('XL');
    });

    it('falls back to the smallest available size when no threshold is met', () => {
      expect(recommendSize(150, 45, ['M', 'S'])).toBe('S');
    });
  });
});
