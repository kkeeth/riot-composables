import { describe, it, expect, vi } from 'vitest';
import { createReactive, isReactive, toRaw } from '../../src/core/reactive';
import type { EnhancedComponent } from '../../src/types';

// Helper to create a mock component
function createMockComponent(): EnhancedComponent {
  return {
    update: vi.fn(),
    __composables__: {
      states: new Map(),
      effects: new Map(),
      watchers: new Map(),
      computed: new Map(),
      cleanups: [],
    },
  } as any;
}

describe('core/reactive', () => {
  describe('createReactive', () => {
    it('should create a reactive state object', () => {
      const component = createMockComponent();
      const state = createReactive(component, { count: 0 });

      expect(state.count).toBe(0);
    });

    it('should trigger component update on property change', () => {
      const component = createMockComponent();
      const state = createReactive(component, { count: 0 });

      state.count = 1;

      expect(component.update).toHaveBeenCalledTimes(1);
      expect(state.count).toBe(1);
    });

    it('should not trigger update if value is the same', () => {
      const component = createMockComponent();
      const state = createReactive(component, { count: 0 });

      state.count = 0;

      expect(component.update).not.toHaveBeenCalled();
    });

    it('should handle nested object properties', () => {
      const component = createMockComponent();
      const state = createReactive(component, {
        user: { name: 'John', age: 30 },
      });

      state.user.name = 'Jane';

      expect(component.update).toHaveBeenCalled();
      expect(state.user.name).toBe('Jane');
    });

    it('should trigger update on property deletion', () => {
      const component = createMockComponent();
      const state = createReactive(component, { count: 0, temp: 'value' });

      delete state.temp;

      expect(component.update).toHaveBeenCalled();
      expect(state.temp).toBeUndefined();
    });

    it('should handle multiple property changes', () => {
      const component = createMockComponent();
      const state = createReactive(component, { a: 1, b: 2, c: 3 });

      state.a = 10;
      state.b = 20;
      state.c = 30;

      expect(component.update).toHaveBeenCalledTimes(3);
    });

    it('should catch and log errors during update', () => {
      const component = createMockComponent();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      component.update = vi.fn(() => {
        throw new Error('Update error');
      });

      const state = createReactive(component, { count: 0 });
      state.count = 1;

      expect(consoleError).toHaveBeenCalledWith(
        '[riot-composables] Error during component update:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });

    it('should allow creating multiple reactive states', () => {
      const component = createMockComponent();

      const state1 = createReactive(component, { count: 0 });
      const state2 = createReactive(component, { count: 1 });

      // Both states should work independently
      expect(state1.count).toBe(0);
      expect(state2.count).toBe(1);

      state1.count = 10;
      state2.count = 20;

      expect(state1.count).toBe(10);
      expect(state2.count).toBe(20);

      // Each state change should trigger an update
      expect(component.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('isReactive', () => {
    it('should return false for non-reactive values', () => {
      expect(isReactive(null)).toBe(false);
      expect(isReactive(undefined)).toBe(false);
      expect(isReactive(42)).toBe(false);
      expect(isReactive('string')).toBe(false);
      expect(isReactive({})).toBe(false);
      expect(isReactive([])).toBe(false);
    });

    it('should return true for reactive objects created by createReactive', () => {
      const component = createMockComponent();
      const reactive = createReactive(component, { count: 0 });
      expect(isReactive(reactive)).toBe(true);
    });

    it('should return true for nested reactive objects', () => {
      const component = createMockComponent();
      const reactive = createReactive(component, { user: { name: 'John' } });
      expect(isReactive(reactive.user)).toBe(true);
    });
  });

  describe('toRaw', () => {
    it('should return primitive values as-is', () => {
      expect(toRaw(42)).toBe(42);
      expect(toRaw('string')).toBe('string');
      expect(toRaw(true)).toBe(true);
      expect(toRaw(null)).toBe(null);
      expect(toRaw(undefined)).toBe(undefined);
    });

    it('should return original object from reactive proxy', () => {
      const component = createMockComponent();
      const original = { a: 1, b: 2 };
      const reactive = createReactive(component, original);
      const raw = toRaw(reactive);

      expect(raw).toEqual(original);
      expect(raw).toBe(original); // Should be the same reference
    });

    it('should return original array from reactive proxy', () => {
      const component = createMockComponent();
      const original = [1, 2, 3];
      const reactive = createReactive(component, original);
      const raw = toRaw(reactive);

      expect(raw).toEqual(original);
      expect(raw).toBe(original); // Should be the same reference
    });

    it('should return original object for non-reactive values', () => {
      const original = { user: { name: 'John' } };
      const raw = toRaw(original);

      expect(raw).toEqual(original);
      expect(raw).toBe(original); // Should be the same reference
    });
  });
});
